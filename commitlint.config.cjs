const fs = require('fs')
const path = require('path')
const { frameworks } = require('./scripts/build/framework-config.cjs')

let packages = []

frameworks.forEach((framework) => {
	const packagesPath = path.join(__dirname, './', framework, './packages')

	if (fs.existsSync(packagesPath)) {
		packages = packages.concat([...fs.readdirSync(packagesPath)])
	}
})

module.exports = {
	extends: ['monorepo'],
	// 定义规则类型
	rules: {
		'header-max-length': [0, 'always'],
		//  scope 不允许为空，保证CHANGELOG正常写入，release的命名格式为xxx-tagname，tagname和scope保持一致
		'scope-empty': [2, 'never'],
		'scope-enum': [2, 'always', [...new Set(packages), 'mono', ...frameworks]],
		'type-enum': [2, 'always', ['build', 'ci', 'chore', 'feat', 'fix', 'refactor', 'style', 'test', 'config', 'docs']],
		'close-issue-needed': [2, 'always'],
	},
	plugins: [
		{
			rules: {
				'close-issue-needed': (msg) => {
					const ISSUES_CLOSED = 'ISSUES CLOSED:'
					return [msg.raw.includes(ISSUES_CLOSED), 'Your commit message must contain ISSUES message']
				},
			},
		},
	],
}
