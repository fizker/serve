// @flow strict

const http = require("http")
// $FlowFixMe flow 0.114.0 does not know what http2 is
const http2 = require("http2")
const fs = require("fs")
const path = require("path")

const assertServerSetup = require("./assertServerSetup")
const parseEncodingHeader = require("./parseEncodingHeader")

/*::
import type { Server as http$Server, ServerResponse } from "http"

import type { Alias, File, ServerSetup, Sizes } from "./types"
import type { Encoding } from "./parseEncodingHeader"

export type SetupProvider = () => Promise<{ rootDir: string, setup: ServerSetup }>
*/

function normalizeFolders(rootDir/*: string*/, setup/*: ServerSetup*/) /*: ServerSetup*/ {
	return {
		...setup,
		folders: {
			identity: path.resolve(rootDir, setup.folders.identity),
			brotli: path.resolve(rootDir, setup.folders.brotli),
			deflate: path.resolve(rootDir, setup.folders.deflate),
			gzip: path.resolve(rootDir, setup.folders.gzip),
		},
	}
}

function getPreferredEncoding(acceptedEncodings/*: $ReadOnlyArray<Encoding>*/, sizes/*: Sizes*/) /*: { ...Encoding, size: number }*/ {
	const matchingEncodings = acceptedEncodings
	.map(x => {
		const size = sizes[x.name]
		if(size == null) {
			return null
		} else {
			return {
				...x,
				size,
			}
		}
	})
	.filter(Boolean)

	// We could have decided on a 406 Not Acceptable, but we choose to serve identity encoding instead
	if(matchingEncodings.length === 0) {
		return {
			name: "identity",
			weight: 1,
			size: sizes.identity,
		}
	}

	const biggestWeight = matchingEncodings[0].weight

	const smallestEncoding = matchingEncodings
	.filter(x => x.weight === biggestWeight)
	.sort((a, b) => a.size - b.size)[0]

	return smallestEncoding
}

module.exports = class Server {
	#setup/*: ServerSetup*/
	#setupProvider/*: ?SetupProvider*/
	#server/*: http$Server */
	#secureServer/*: ?http$Server */

	constructor(
		rootDir/*: string*/,
		setup/*: ServerSetup*/,
		{ cert, key }/*: { cert: Buffer, key: Buffer }*/ = {},
	) {
		this.updateSetup(rootDir, setup)

		this.#server = http.createServer(
			// $FlowFixMe flow does not understand that it is OK for the handler to return promise
			this.#onRequest)
		if(cert && key) {
			this.#secureServer = http2.createSecureServer({ cert, key, allowHTTP1: true }, this.#onRequest)
		}
	}

	updateSetup(rootDir/*: string*/, setup/*: ServerSetup*/) {
		this.#setup = normalizeFolders(rootDir, assertServerSetup(setup))
	}

	setSetupProvider(provider/*: ?SetupProvider*/) {
		this.#setupProvider = provider
	}

	#getSetup = async () => {
		if(this.#setupProvider == null) {
			return this.#setup
		}
		const { rootDir, setup } = await this.#setupProvider()
		return normalizeFolders(rootDir, assertServerSetup(setup))
	}

	#onRequest = async (req, res) => {
		const g = this.#getSetup
		const setup = await g()

		const acceptedEncodings = parseEncodingHeader(req.headers["accept-encoding"])

		const parsedURL = new URL(req.url, "http://fake-base")
		const pathname = decodeURI(parsedURL.pathname || "" || "/")

		const getFileForPath = this.#getFileForPath
		const file = pathname == null ? null : getFileForPath(setup, pathname)

		const addHeaders = this.#addHeaders
		const writeErrorMessage = this.#writeErrorMessage
		if(file == null) {
			return writeErrorMessage(setup, res, 404, "Not found")
		} else {
			const smallestEncoding = getPreferredEncoding(acceptedEncodings, file.sizes)

			addHeaders(res, setup.globalHeaders)
			addHeaders(res, file.headers)

			res.statusCode = file.statusCode
			res.setHeader("content-length", smallestEncoding.size.toString())
			res.setHeader("content-type", file.mime)
			if(smallestEncoding.name !== "identity") {
				res.setHeader("content-encoding", smallestEncoding.name === "brotli" ? "br" : smallestEncoding.name)
			}

			const filepath = path.join(setup.folders[smallestEncoding.name], file.path)

			fs.promises.open(filepath).then(fd => {
				fs.createReadStream(filepath, { fd }).pipe(res)
					.on("close", () => { fd.close() })
			}, (err) => {
				writeErrorMessage(setup, res, 500, "Server error")
			})
		}
	}

	#writeErrorMessage = (setup/*: ServerSetup*/, res/*: ServerResponse*/, status/*: number*/, message/*: string*/) => {
		const addHeaders = this.#addHeaders
		addHeaders(res, setup.globalHeaders)
		res.statusCode = status
		res.setHeader("content-length", `${message.length + 1}`)
		res.setHeader("Content-Type", "text/plain")
		res.end(message + "\n")
	}

	#addHeaders = (res/*: ServerResponse*/, headers/*:{[string]: string, ...}*/) => {
		Object.keys(headers).forEach(header => {
			const value = headers[header]
			res.setHeader(header, value)
		})
	}

	#getAliasForPath = (setup/*: ServerSetup*/, path/*: string*/) /*: ?Alias*/ => {
		return setup.aliases.find(x => x.from === path)
	}

	#getFileForPath = (setup/*: ServerSetup*/, path/*: string*/) /*: ?File*/ => {
		const file = setup.files.find(x => path === x.path)
		if(file != null) {
			return file
		}

		const getAliasForPath = this.#getAliasForPath
		const alias = getAliasForPath(setup, path)
		if(alias != null) {
			const getFileForPath = this.#getFileForPath
			return getFileForPath(setup, alias.to)
		} else {
			return setup.catchAllFile
		}
	}

	async listen(port/*: number*/, httpsPort/*: ?number*/) /*: Promise<void>*/ {
		const s = this.#secureServer
		await Promise.all([
			new Promise((res, rej) => {
				this.#server.listen(port, (err) => { err ? rej(err) : res() })
			}),
			s && httpsPort != null && new Promise((res, rej) => {
				s.listen(httpsPort, (err) => { err ? rej(err) : res() })
			}),
		])
	}
	async close() /*: Promise<void>*/ {
		const s = this.#secureServer
		await Promise.all([
			new Promise((res, rej) => {
				this.#server.close((err) => { err ? rej(err) : res() })
			}),
			s && new Promise((res, rej) => {
				s.close((err) => { err ? rej(err) : res() })
			}),
		])
	}
}
