// @flow strict

const nodeFetch = require("node-fetch").default
const fs = require("fs")
const path = require("path")
const https = require("https")
// $FlowFixMe[cannot-resolve-module] flow does not know http2 module
const http2 = require("http2")

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
	http1: sendHTTP1,
	http2: sendHTTP2,
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
		keepAlive: false,
	}))

async function sendHTTP1(file /*: string*/, data /*: Data*/) /*: Promise<{ status: number, headers: Headers }>*/ {
	const options = { agent: await agent }
	const response = await new Promise((res) => {
		const req = https.request(data.base + file, options, res)
		req.end()
	})

	return {
		status: response.statusCode,
		headers: response.headers,
	}
}

async function sendHTTP2(file /*: string*/, data /*: Data*/) /*: Promise<{ status: number, headers: Headers }>*/ {
	const client = http2.connect(data.base, {
		ca: await cert,
	})

	return new Promise((res, rej) => {
		const req = client.request({ ":path": file })
		req.on("error", (e) => rej(e))
		req.on("response", (headers, flags) => {
			const response = {
				status: headers[http2.constants.HTTP2_HEADER_STATUS],
				headers,
			}
			client.close()
			res(response)
		})
		req.end()
	})
}

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
