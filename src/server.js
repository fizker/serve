// @flow strict

const http = require("http")
const url = require("url")
const fs = require("fs")
const path = require("path")

const parseEncodingHeader = require("./parseEncodingHeader")

/*::
import type { Server as http$Server, ServerResponse } from "http"

export type Alias = {
	from: string,
	to: string,
}

export type File = {
	path: string,
	mime: string,
	sizes: {
		identity: number,
		deflate: ?number,
		gzip: ?number,
		brotli: ?number,
	},
	statusCode: number,
	headers: {
		[string]: string,
		...
	}
}

export type ServerSetup = {
	aliases: $ReadOnlyArray<Alias>,
	folders: {
		identity: string,
		deflate: string,
		gzip: string,
		brotli: string,
	},
	files: $ReadOnlyArray<File>,
	catchAllFile: ?File,
	globalHeaders: {
		[string]: string,
		...
	},
}
*/

module.exports = class Server {
	#setup/*: ServerSetup*/
	#server/*: http$Server */

	constructor(setup/*: ServerSetup*/) {
		this.#setup = setup

		this.#server = http.createServer((req, res) => {
			const acceptedEncodings = parseEncodingHeader(req.headers["accept-encoding"])

			const parsedURL = url.parse(req.url)
			const pathname = parsedURL.pathname

			const getFileForPath = this.#getFileForPath
			const file = pathname == null ? null : getFileForPath(pathname)

			const addHeaders = this.#addHeaders
			if(file == null) {
				addHeaders(res, this.#setup.globalHeaders)
				res.statusCode = 404
				res.setHeader("content-length", "10")
				res.setHeader("Content-Type", "text/plain")
				res.end("Not found\n")
			} else {
				const matchingEncodings = acceptedEncodings
				.map(x => {
					const size = file.sizes[x.name]
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
				const biggestWeight = matchingEncodings[0].weight

				const smallestEncoding = matchingEncodings
				.filter(x => x.weight === biggestWeight)
				.sort((a, b) => a.size - b.size)[0]

				addHeaders(res, this.#setup.globalHeaders)
				addHeaders(res, file.headers)

				res.statusCode = file.statusCode
				res.setHeader("content-length", smallestEncoding.size.toString())
				res.setHeader("content-type", file.mime)
				if(smallestEncoding.name !== "identity") {
					res.setHeader("content-encoding", smallestEncoding.name === "brotli" ? "br" : smallestEncoding.name)
				}

				const filepath = path.join(this.#setup.folders[smallestEncoding.name], file.path)
				fs.createReadStream(filepath).pipe(res)
			}
		})
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
