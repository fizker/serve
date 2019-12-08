// @flow strict

/*::
import type { ServerSetup } from "../../src/server"
*/

const Server = require("../../src/server")

let servers = []

module.exports = {
	async start(setup/*: ServerSetup*/) /*: Promise<string>*/ {
		const server = new Server(setup)
		await server.listen(12345)
		servers.push(server)
		return "http://localhost:12345"
	}
}

afterEach(async () => {
	await Promise.all(servers.map(x => x.close()))
})
