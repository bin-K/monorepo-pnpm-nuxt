import { defineNuxtConfig } from 'nuxt/config'
const PACKAGE = process.env.PACKAGE || 'nuxt-project1'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	extends: [`./packages/${PACKAGE}`],
	devServer: {
		port: 80,
		host: '0.0.0.0',
	},
	devtools: { enabled: true },
})
