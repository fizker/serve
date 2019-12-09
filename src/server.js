// @flow strict

const http = require("http")
const url = require("url")
const fs = require("fs")
const path = require("path")

const parseEncodingHeader = require("./parseEncodingHeader")

/*::
import type { Server as http$Server, ServerResponse } from "http"

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
	}
}

export type ServerSetup = {
	aliases: $ReadOnlyArray<{
		from: string,
		to: string,
	}>,
	folders: {
		identity: string,
		deflate: string,
		gzip: string,
		brotli: string,
	},
	files: $ReadOnlyArray<File>,
	catchAllFile: ?File,
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

			const file = (pathname == null
				? null
				: setup.files.find(x => pathname.startsWith(x.path))
			) || setup.catchAllFile

			if(file == null) {
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
				.sort((a, b) => a.size - b.size)
				const smallestEncoding = matchingEncodings[0]

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
