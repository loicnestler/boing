const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const ora = require('ora')
const axios = require('axios')
const uuid = require('uuid/v4')

const k = require('kleur')

const download = require('../download')

module.exports = {
	name        : 'new',
	description : 'Creates a new project from a boilerplate',
	args        : {
		dir         : { required: true, description: 'The directory you want to create a new project in' },
		boilerplate : { required: false, description: 'The boilerplate you want to use' }
	},
	handler     : async function(args) {
		if (args['--help']) {
			console.group('')
			console.group(`${k.underline('Description')}:`)
			console.log(this.description)
			console.log()
			console.group(`${k.underline('Usage')}:`)
			console.groupEnd(`${k.underline('Usage')}:`)

			console.groupEnd(`${k.underline('Description')}:`)
			console.groupEnd('')
			process.exit(0)
		}

		if (!args._[0]) {
			console.log(`${k.red('Error')}: missing param: ${k.bold('<dir>')}`)
			process.exit(1)
		}

		const dir = args._[0]

		if (fs.pathExistsSync(path.join(dir)) && !args['--force']) {
			console.log(`${k.red('Error')}: directory ${fs.realpathSync(dir)} already exists. Try using the --force flag`)
			process.exit(1)
		}

		const spinner = ora('Creating directory').start()
		fs.mkdirp(dir).then(() => {
			if (!args._[1]) {
				console.log('stoppping')
				spinner.stop()
				//TODO: run npm init in dir
			}

			const boilerplate = args._[1]
			const tmpPath = path.join(os.tmpdir(), `boing-tmp-${uuid().slice(1, 6)}-${boilerplate}`)

			spinner.text = 'Searching boilerplate (npm)'

			let url, shasum

			axios
				.get(`https://registry.npmjs.org/${boilerplate}`)
				.then((res) => res.data)
				.then((data) => {
					const latest = Object.keys(data.versions).pop()
					const { shasum, tarball } = data.versions[latest].dist

					// spinner.stop()
					// download(tarball, tmpPath, shasum)
					url = tarball
					shasum = shasum
				})
				.catch((err) => {
					spinner.text = 'Searching boilerplate (GitHub)'
					axios
						.get(`https://api.github.com/search/repositories?q=${boilerplate}`)
						.then((res) => res.data)
						.then((data) => {
							if (data.items.length === 0 || data.items[0].name.toLowerCase() !== boilerplate) {
								spinner.stop()
								console.log(
									`${k.red(
										'Error'
									)}: Boilerplate ${boilerplate} couldn't be found. Please check your spelling and try again`
								)
								process.exit(1)
							}

							data = data.items[0]

							const username = data.owner.login
							const repo = data.name

							// spinner.stop()
							// download(`https://api.github.com/repos/${username}/${repo}/tarball/master`, tmpPath)
							url = `https://api.github.com/repos/${username}/${repo}/tarball/master`
						})
				})
				.then(() => {
					spinner.stop()
					//TODO: wait for github request
					download(url, tmpPath, shasum).then(() => {
						//TODO: move file from tmppath to $dir
					})
				})
		})
	}
}
