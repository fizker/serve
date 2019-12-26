// @flow strict

const fs = require("fs")
const path = require("path")

/*::
import type { ServerSetup } from "../../src/types"
*/

const Server = require("../../src/server")

let servers = []

module.exports = {
	async start(rootDir/*: string*/, setup/*: ServerSetup*/, useHTTPS/*: boolean*/) /*: Promise<string>*/ {
		const [ cert, key ] = await Promise.all([
			fs.promises.readFile(path.join(__dirname, "cert.pem")),
			fs.promises.readFile(path.join(__dirname, "key.pem")),
		])

		const server = new Server(rootDir, setup, { key, cert })
		await server.listen(12345, 12346)
		servers.push(server)
		return useHTTPS
		? "https://localhost:12346"
		: "http://localhost:12345"
	}
}

afterEach(async () => {
	await Promise.all(servers.map(x => x.close()))
	servers = []
})
