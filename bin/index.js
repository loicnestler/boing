#!/usr/bin/env node

const k = require('kleur')

const arg = require('arg')

const options = {
	'--help'    : Boolean,
	'--version' : Boolean,
	'--verbose' : Boolean,

	'-v'        : '--verbose',
	'-V'        : '--version',
	'-h'        : '--help'
}

const args = arg(options, { permissive: true })

const commands = {
	new : require('../lib/modules/new')
}

if (args['--version']) {
	console.log(`boing-cli version 0.1.0`)
	process.exit(0)
}

const foundCommand = Boolean(commands[args._[0]])

if (!foundCommand && args['--help']) {
	console.group('')
	console.group(`${k.underline('Usage')}:`)
	console.log(`$ boing ${k.bold('<command>')}`)
	console.log()
	console.group(`${k.underline('Available commands')}:`)

	Object.keys(commands).forEach((name) => {
		console.group(`${name} - ${commands[name].description}`)
		console.log(
			`${commands[name].args
				? Object.keys(commands[name].args)
						.map(
							(arg) =>
								`${commands[name].args[arg].required ? `<${k.bold(`${arg}`)}>` : `[${arg}]`}${' '.repeat(
									12 - arg.length
								)}- ${commands[name].args[arg].description}`
						)
						.join('\n')
				: ''}`
		)
		console.groupEnd(`${name} - ${commands[name].description}`)
	})

	console.groupEnd(`${k.underline('Available commands')}:`)
	console.log()
	console.group(`${k.underline('Options')}:`)
	Object.keys(options).forEach((name) => {
		if (!name.startsWith('--')) return
		const aliases = Object.keys(options).filter((_name) => options[_name] === name)
		console.log(`${name}${aliases.length > 0 ? ', ' + aliases.join(', ') : ' '}`)
	})
	console.groupEnd(`${k.underline('Options')}:`)

	console.groupEnd(`${k.underline('Usage')}:`)
	console.groupEnd('')
	console.log()
	process.exit(0)
}

if (args['--verbose']) {
	process.env.DEBUG = true
}

if (!args._[0]) {
	//TODO: start interactive
	return
}

let commandRan = false

Object.keys(commands).forEach(async (name) => {
	if (name.toLowerCase() === args._[0].toLowerCase()) {
		const command = args._.shift()
		commands[command].handler(args)
		commandRan = true
	}
})

if (!commandRan) {
	console.log(`${k.red('Error')}: Command not found: ${args._[0]}`)
	process.exit(1)
}
