// @flow strict

const Server = require("./src/server")
const assertServerSetup = require("./src/assertServerSetup")

/*::
import type { ServerSetup } from "./src/types"
export type { Alias, Headers, Sizes, Folders, File, ServerSetup, JSONObject } from "./src/types"
*/

module.exports = {
	Server,
	assertServerSetup,
}
