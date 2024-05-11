const path = require('path')

// 框架集合
const frameworks = ['nuxt']

/**
 * @description 获取框架配置
 * @param {String} type 类型 build，test...
 * @param {String} framework 框架
 * @param {String} PACKAGE package
 * @returns {Object} 框架配置信息
 */
const getFrameworkConfig = (type, framework, PACKAGE) => {
	const packagePath = path.join(__dirname, `../../${framework}/`)
	process.env.PACKAGE = PACKAGE

	const config = {
		build: {
			nuxt: {
				command: 'pnpm',
				args: {
					build: ['build', packagePath, '-C'],
					preview: ['preview', packagePath, '-C'],
					generate: ['generate', '--fail-on-error', packagePath, '-C'],
					default: ['dev', packagePath, '-C'],
				},
				options: {
					cwd: path.join(__dirname, '../../nuxt'),
				},
			},
		},
	}

	return config[type][framework]
}

module.exports = {
	frameworks,
	getFrameworkConfig,
}
