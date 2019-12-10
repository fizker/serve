// @flow strict

const nodeFetch = require("node-fetch").default

/*::
import { Response, Headers } from "node-fetch"

type EncodingName = "deflate"|"brotli"|"gzip"
type Encoding = EncodingName|{name: EncodingName, weight: number}
type Data = {
	base: string,
	encodings: $ReadOnlyArray<Encoding>,
	...
}
*/

module.exports = {
	fetch,
	getHeaders,
	unwrap,
}

function unwrap/*::<T>*/(t/*:?T*/) /*: T*/ {
	if(t == null) {
		throw new Error("Could not unwrap")
	}
	return t
}

function getHeaders(headers /*: Headers*/) /*: {[string]: string, ...}*/ {
	return Object.fromEntries(headers.entries())
}

function fetch(file /*: string*/, data /*: Data*/) /*: Promise<Response>*/ {
	return nodeFetch(data.base + file, {
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
