const process = require('process')
const { spawn } = require('child_process')
const core = require('./core.cjs')
const { getFrameworkConfig } = require('./framework-config.cjs')

class buildCore extends core {
	constructor(optionArray = []) {
		super()
		this.initOption(optionArray)
		this.start()
	}

	/**
	 * @description 执行构建流程
	 */
	async start() {
		this._argumentArray = this._program.parse(process.argv).args
		try {
			await this.selectFramework()
		} catch (error) {
			console.error(this._colors.red('a framework must be selected!'))
			return
		}
		try {
			await this.getPackages()
		} catch (error) {
			console.error(this._colors.red('failed to get the packages of the specified framework!'))
			return
		}
		try {
			await this.selectPackage()
		} catch (error) {
			console.error(this._colors.red('a package must be selected!'))
			return
		}
		process.env.FRAMEWORK = this._framework
		process.env.PACKAGE = this._package
		this.initBuildSpawn()
	}

	/**
	 * @description 初始化构建流程
	 */
	initBuildSpawn() {
		const frameworkConfig = getFrameworkConfig('build', this._framework, this._package)
		let args
		switch (true) {
			case this._program.parse(process.argv).build:
				args = frameworkConfig.args.build
				break
			case this._program.parse(process.argv).start:
				args = frameworkConfig.args.start
				break
			case this._program.parse(process.argv).generate:
				args = frameworkConfig.args.generate
				break
			case this._program.parse(process.argv).preview:
				args = frameworkConfig.args.preview
				break
			default:
				args = frameworkConfig.args.default
				break
		}
		try {
			const spawnInstance = spawn(frameworkConfig.command, args, { ...frameworkConfig.options, stdio: 'inherit', shell: true })
			this.registerErrorHandler(spawnInstance)
		} catch (error) {
			console.error(this._colors.red(error))
		}
	}
}

new buildCore([
	{
		short: '-b',
		long: '--build',
		description: 'build package',
	},
	{
		short: '-p',
		long: '--preview',
		description: 'preview package',
	},
	{
		short: '-g',
		long: '--generate',
		description: 'generate package',
	},
])
