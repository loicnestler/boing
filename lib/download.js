const ora = require('ora')

module.exports = (url, path, checkSum = '') => {
	const spinner = ora('Downloading boilerplate').start()
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			spinner.stop()
			resolve()
		}, 2000)
	})
}
