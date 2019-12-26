#!/usr/bin/env node
// @flow strict

const fs = require("fs")
const path = require("path")
const Server = require("./src/server")
const assertServerSetup = require("./src/assertServerSetup")

/*::
import type { ServerSetup } from "./src/types"
*/

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
	fs.promises.readFile(absSetupPath, "utf-8")
		.then(JSON.parse)
		.then(assertServerSetup),
	certPath != null && keyPath != null
	? Promise.all([
		fs.promises.readFile(keyPath),
		fs.promises.readFile(certPath),
	])
		.then(
			([ key, cert ]) => { return { key, cert } },
			(e) => undefined,
		)
	: undefined,
])
	.then(([ setup, https ]) => {
		const server = new Server(path.dirname(absSetupPath), setup, https)
		return server.listen(port, httpsPort)
	})
	.then(() => {
		console.log(`Server running at port ${port}`)
		if(httpsPort != null && keyPath != null && certPath != null) {
			console.log(`Server running as HTTPS on port ${httpsPort}`)
		}
	})
	.catch(error => {
		console.error(error.message)
		process.exit(1)
	})
