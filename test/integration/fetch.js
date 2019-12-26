// @flow strict

const nodeFetch = require("node-fetch").default
const fs = require("fs")
const path = require("path")
const https = require("https")

/*::
import { Response, Headers } from "node-fetch"
import type { RequestInit } from "node-fetch"

type EncodingName = "unknown"|"identity"|"*"|"deflate"|"brotli"|"gzip"
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

const cert = fs.promises.readFile(path.join(__dirname, "cert.pem"))
const agent = cert
	.then(cert => new https.Agent({
		rejectUnauthorized: false,
		ca: cert,
	}))

async function fetch(file /*: string*/, data /*: Data*/) /*: Promise<Response>*/ {
	const options/*: RequestInit*/ = {
		headers: {
			"Accept-Encoding": data.encodings
				.map(x => typeof x === "string"
					? mapName(x)
					: `${mapName(x.name)}; q=${x.weight}`
				)
				.join(","),
		},
	}
	if(data.base.startsWith("https")) {
		options.agent = await agent
	}

	return nodeFetch(data.base + file, options)
}

function mapName(name) {
	switch(name) {
	case "brotli":
		return "br"
	default:
		return name
	}
}
