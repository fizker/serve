#!/usr/bin/env node
// @flow strict

if(require.main !== module) {
	throw new Error("@fizker/serve is intended to be run as a stand-alone node app")
}

const fs = require("fs")
const path = require("path")
const { Server, assertServerSetup } = require("./index")

const [ , , setupPath ] = process.argv
const port = +process.env.PORT || 8080
const httpsPort = +process.env.HTTPS_PORT || null
const certPath = process.env.HTTPS_CERT
const keyPath = process.env.HTTPS_KEY

if(setupPath == null) {
	console.log(`Usage: serve <path to setup>`)
	process.exit(1)
}

const absSetupPath = path.resolve(setupPath)

Promise.all([
	fs.promises.readFile(absSetupPath, "utf-8").then(async(raw) => {
		const o = JSON.parse(raw)
		return assertServerSetup(o)
	}),
	(() => {
		if(certPath != null && keyPath != null) {
			return Promise.all([
				fs.promises.readFile(keyPath)
					.catch(e => {
						console.log(`Could not read HTTPS key at ${keyPath}.`)
						throw e
					}),
				fs.promises.readFile(certPath)
					.catch(e => {
						console.log(`Could not read HTTPS certificate at ${certPath}.`)
						throw e
					}),
			]).then(
				([ key, cert ]) => { return { key, cert } },
				(e) => undefined,
			)
		} else {
			console.log(`HTTPS_CERT and HTTPS_KEY env vars are missing. Skipping HTTPS setup.`)
		}
	})(),
])
	.then(async ([ setup, httpsSetup ]) => {
		const server = new Server(path.dirname(absSetupPath), setup, httpsSetup)
		const { http, https } = await server.listen(port, httpsPort)

		console.log(`Server running at port ${http}.`)
		if(https != null) {
			console.log(`Server running as HTTPS on port ${https}.`)
		}

		process.on("SIGINT", () => {
			server.close()
		})
		process.on("SIGTERM", () => {
			server.close()
		})
	})
	.catch(error => {
		console.log(error.message)
		process.exit(1)
	})
