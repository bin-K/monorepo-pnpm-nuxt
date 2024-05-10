const process = require('process')
const fs = require('fs')
const path = require('path')
const colors = require('colors')
const { Command } = require('commander')
const { Select } = require('enquirer')
import { frameworks } from './framework-config.cjs'

class Core {
	constructor() {
		// 框架集合，nuxt，vue，apollo...
		this._frameworkArray = frameworks
		// 选择的框架
		this._framework = ''
		// 指定框架的package集合
		this._packageArray = []
		// 选择的package
		this._package = ''
		this._program = new Command()
		// 参数集合，例如['nuxt', 'nuxt-project1']
		this._argumentArray = []
		this._colors = colors
	}

	/**
	 * @description 选择框架
	 * @returns {Promise}
	 */
	async selectFramework() {
		return new Promise((resolve, reject) => {
			// 参数携带平台
			if (this._argumentArray[0] && this._frameworkArray.includes(this._argumentArray[0])) {
				this._framework = this._argumentArray[0]
				return resolve(this._framework)
			}
			const prompt = new Select({
				name: 'frameworks',
				message: 'Please select a framework to continue',
				choices: this._frameworkArray,
			})
			prompt
				.run()
				.then((answer) => {
					this._framework = answer
					return resolve(this._framework)
				})
				.catch((error) => reject(error))
		})
	}

	/**
	 * @description 获取指定框架的package集合
	 * @returns {Promise}
	 */
	async getPackages() {
		return new Promise((resolve, reject) => {
			const packagesPath = path.join(__dirname, `../../${this._framework}/packages`)
			// 指定框架的package集合目录存在
			if (fs.existsSync(packagesPath)) {
				fs.readdir(packagesPath, { withFileTypes: true }, (error, directories) => {
					if (error) reject(error)
					this._packageArray = directories
						.filter((directory) => {
							const typeKey = Object.getOwnPropertySymbols(directory)[0]
							return directory[typeKey] === 2
						})
						.map((directory) => directory.name)
					resolve()
				})
			} else {
				reject()
			}
		})
	}

	/**
	 * @description 选择指定框架的package
	 * @returns {Promise}
	 */
	async selectPackage() {
		return new Promise((resolve, reject) => {
			let packages = JSON.parse(JSON.stringify(this._packageArray))
			// 参数携带package
			if (this._argumentArray[1] && this._packageArray.includes(this._argumentArray[1])) {
				this._package = this._argumentArray[1]
				return resolve(this._package)
			}
			const prompt = new Select({
				name: 'packages',
				message: 'Please select a package to run',
				choices: packages,
			})
			prompt
				.run()
				.then((answer) => {
					this._package = answer
					return resolve(this._package)
				})
				.catch((error) => reject(error))
		})
	}

	/**
	 * @description 注册对子进程错误进行异常处理
	 * @param {Object} spawnInstance 子进程
	 * @param {Function} callback 子进程执行完成后回调
	 * @param {Function} errorCallback 子进程执行报错后回调
	 */
	registerErrorHandler(spawnInstance, callback, errorCallback) {
		spawnInstance.on('error', (error) => {
			console.error(this._colors.red(error))
			errorCallback && errorCallback(error)
			process.exit(1)
		})

		spawnInstance.on('exit', (code) => {
			callback && callback()
			// code = 0表示流程正常
			if (code !== 0) {
				process.exit(1)
			}
		})
	}

	/**
	 * @description 初始化自定义command参数
	 * @param {Object[]} optionArray 自定义参数数组
	 * @param {String} optionArray[].short 自定义参数缩写，如 -b
	 * @param {String} optionArray[].long 自定义参数全称， 如 --build
	 * @param {String} optionArray[].description 自定义参数作用的描述
	 */
	initOption(optionArray) {
		optionArray.forEach((obj) => {
			this._program.option(`${obj.short}, ${obj.long}`, obj.description)
		})
	}

	/**
	 * @description 检测自定义的package参数是否匹配packages目录下的项目
	 */
	validatePackage() {
		let pass = true
		if (!this._packageArray.includes(this._argumentArray[0])) {
			console.error(`package param should be one of [${this._packageArray.join(',')}]`)
			pass = false
		}
		return pass
	}
}

module.exports = Core
