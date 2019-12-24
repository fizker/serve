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
const port = +process.env.PORT || 12345

if(setupPath == null) {
	console.log(`Usage: serve <path to setup>`)
	process.exit(1)
}

const absSetupPath = path.resolve(setupPath)

fs.promises.readFile(absSetupPath, "utf-8")
	.then(JSON.parse)
	.then(assertServerSetup)
	.then((setup/*: ServerSetup*/) => {
		const server = new Server(path.dirname(absSetupPath), setup)
		return server.listen(port)
	})
	.then(() => console.log(`Server running at port ${port}`))
	.catch(error => {
		console.error(error.message)
		process.exit(1)
	})
