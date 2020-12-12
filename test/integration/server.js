// @flow strict

const fs = require("fs")
const path = require("path")

/*::
import type { ServerSetup } from "../../index"
import type { RequestLogParameters } from "../../src/requestLog"
*/

const { Server } = require("../../index")

let singletonServer

async function loadHTTPSFiles() /*: Promise<{cert: Buffer, key: Buffer }> */ {
	const [ cert, key ] = await Promise.all([
		fs.promises.readFile(path.join(__dirname, "cert.pem")),
		fs.promises.readFile(path.join(__dirname, "key.pem")),
	])

	return { cert, key }
}

module.exports = {
	loadHTTPSFiles,

	async start(
		rootDir/*: string*/,
		setup/*: ServerSetup*/,
		useHTTPS/*: boolean*/,
		requestLogFactory/*: (RequestLogParameters) => string*/ = () => "",
	) /*: Promise<string>*/ {
		if(singletonServer != null) {
			throw new Error("Server already running")
		}

		const server = new Server(rootDir, setup, {
			...await loadHTTPSFiles(),
			requestLogFactory,
			logger: () => {},
		})
		singletonServer = server
		await server.listen(12345, 12346)

		return useHTTPS
		? "https://localhost:12346"
		: "http://localhost:12345"
	},
}

afterEach(async () => {
	if(singletonServer == null) {
		return
	}

	await singletonServer.close()
	singletonServer = null
})
