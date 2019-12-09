// @flow strict

const fetch = require("node-fetch").default

/*::
import { Response } from "node-fetch"

type EncodingName = "deflate"|"brotli"|"gzip"
type Encoding = EncodingName|{name: EncodingName, weight: number}
type Data = {
	base: string,
	encodings: $ReadOnlyArray<Encoding>,
	...
}
*/

module.exports = (file /*: string*/, data /*: Data*/) /*: Promise<Response>*/ => {
	return fetch(data.base + file, {
		headers: {
			"Accept-Encoding": data.encodings
				.map(x => typeof x === "string"
					? mapName(x)
					: `${mapName(x.name)}; q=${x.weight}`
				)
				.join(","),
		},
	})
}

function mapName(name) {
	switch(name) {
	case "brotli":
		return "br"
	default:
		return name
	}
}
