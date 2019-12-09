// @flow strict

const fetch = require("node-fetch").default

/*::
import { Response } from "node-fetch"

type Encoding = "deflate"|"brotli"|"gzip"
type Data = {
	base: string,
	encodings: $ReadOnlyArray<Encoding>,
	...
}
*/

module.exports = (file /*: string*/, data /*: Data*/) /*: Promise<Response>*/ => {
	return fetch(data.base + file, {
		headers: {
			"Accept-Encoding": data.encodings.map(x => x === "brotli" ? "br" : x).join(","),
		},
	})
}
