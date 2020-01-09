// @flow strict

const Server = require("./src/server")
const assertServerSetup = require("./src/assertServerSetup")

/*::
export type { Alias, Headers, Sizes, Folders, File, ServerSetup, JSONObject, EnvReplacements } from "./src/types"
export type { SetupProvider, FileProvider } from "./src/server"
*/

module.exports = {
	Server,
	assertServerSetup,
}
