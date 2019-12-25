// @flow strict

const http = require("http")
const url = require("url")
const fs = require("fs")
const path = require("path")

const parseEncodingHeader = require("./parseEncodingHeader")

/*::
import type { Server as http$Server, ServerResponse } from "http"

import type { Alias, File, ServerSetup, Sizes } from "./types"
import type { Encoding } from "./parseEncodingHeader"
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
	#server/*: http$Server */

	constructor(rootDir/*: string*/, setup/*: ServerSetup*/) {
		this.#setup = normalizeFolders(rootDir, setup)

		this.#server = http.createServer((req, res) => {
			const acceptedEncodings = parseEncodingHeader(req.headers["accept-encoding"])

			const parsedURL = url.parse(req.url)
			const pathname = decodeURI(parsedURL.pathname || "" || "/")

			const getFileForPath = this.#getFileForPath
			const file = pathname == null ? null : getFileForPath(pathname)

			const addHeaders = this.#addHeaders
			const writeErrorMessage = this.#writeErrorMessage
			if(file == null) {
				return writeErrorMessage(res, 404, "Not found")
			} else {
				const smallestEncoding = getPreferredEncoding(acceptedEncodings, file.sizes)

				addHeaders(res, this.#setup.globalHeaders)
				addHeaders(res, file.headers)

				res.statusCode = file.statusCode
				res.setHeader("content-length", smallestEncoding.size.toString())
				res.setHeader("content-type", file.mime)
				if(smallestEncoding.name !== "identity") {
					res.setHeader("content-encoding", smallestEncoding.name === "brotli" ? "br" : smallestEncoding.name)
				}

				const filepath = path.join(this.#setup.folders[smallestEncoding.name], file.path)

				fs.promises.open(filepath).then(fd => {
					fs.createReadStream(filepath, { fd }).pipe(res)
						.on("close", () => { fd.close() })
				}, (err) => {
					writeErrorMessage(res, 500, "Server error")
				})
			}
		})
	}

	#writeErrorMessage = (res/*: ServerResponse*/, status/*: number*/, message/*: string*/) => {
		const addHeaders = this.#addHeaders
		addHeaders(res, this.#setup.globalHeaders)
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

	#getAliasForPath = (path/*: string*/) /*: ?Alias*/ => {
		return this.#setup.aliases.find(x => x.from === path)
	}

	#getFileForPath = (path/*: string*/) /*: ?File*/ => {
		const file = this.#setup.files.find(x => path === x.path)
		if(file != null) {
			return file
		}

		const getAliasForPath = this.#getAliasForPath
		const alias = getAliasForPath(path)
		if(alias != null) {
			const getFileForPath = this.#getFileForPath
			return getFileForPath(alias.to)
		} else {
			return this.#setup.catchAllFile
		}
	}

	async listen(port/*: number*/) /*: Promise<void>*/ {
		await new Promise((res, rej) => {
			this.#server.listen(port, (err) => { err ? rej(err) : res() })
		})
	}
	async close() /*: Promise<void>*/ {
		await new Promise((res, rej) => {
			this.#server.close((err) => { err ? rej(err) : res() })
		})
	}
}
