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
		uncompressed: number,
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
		uncompressed: string,
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
			const acceptedEncodings = parseEncodingHeader(req.headers["Accept-Encoding"])

			const parsedURL = url.parse(req.url)
			const pathname = parsedURL.pathname

			const file = (pathname == null
				? null
				: setup.files.find(x => pathname.startsWith(x.path))
			) || setup.catchAllFile

			if(file == null) {
				res.statusCode = 404
				res.setHeader("Content-Type", "text/plain")
				res.end("Not found")
			} else {
				const encodingNames = acceptedEncodings.map(x => {
					return x.name === "identity"
						? "uncompressed"
						: x.name
				})
				const encoding = encodingNames.find(x => file.sizes[x] != null) || "uncompressed"

				sendFile(res, file, this.#setup.folders[encoding])
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

function sendFile(res/*: ServerResponse*/, file/*: File*/, root/*: ?string*/) /*: void*/ {
	res.statusCode = file.statusCode
	res.setHeader("Content-Type", file.mime)

	const filepath = root == null ? file.path : path.join(root, file.path)
	fs.createReadStream(filepath).pipe(res)
}
