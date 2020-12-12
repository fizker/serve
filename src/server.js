// @flow strict

const http = require("http")
// $FlowFixMe[cannot-resolve-module] flow does not know what http2 is
const http2 = require("http2")
const fs = require("fs")
const path = require("path")

const assertServerSetup = require("./assertServerSetup")
const parseEncodingHeader = require("./parseEncodingHeader")
const compress = require("./compress")
const escapeRegex = require("./escapeRegex")
const { requestLogFactory } = require("./requestLog")

/*::
import type { Server as http$Server, ServerResponse, IncomingMessage } from "http"

import type { Alias, File, ServerSetup, Sizes, EnvReplacements } from "./types"
import type { Encoding } from "./parseEncodingHeader"
import type { RequestLogParameters } from "./requestLog"

export type SetupProvider = () => Promise<{ rootDir: string, setup: ServerSetup }>
export type FileProvider = (setup: ServerSetup, path: string) => Promise<?File>

type RequestLogFactory = (RequestLogParameters) => string
type Logger = ({ type: "error" | "info" | "request", message: string }) => mixed
*/

const standardErrors = {
	"404": "Not found",
	"500": "Internal server error",
}

const logger/*: Logger*/ = ({ type, message }) => {
	if(type === "request") {
		console.log(message)
	} else {
		console.error(`${type}: ${message}`)
	}
}

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
	#fileProvider/*: ?FileProvider*/
	#server/*: http$Server */
	#secureServer/*: ?http$Server */
	#cachedFiles/*: {
		[path: string]: Promise<{
			content: {
				identity: string,
				brotli: Buffer,
				gzip: Buffer,
				deflate: Buffer,
			},
			hash: string,
			envReplacements: EnvReplacements,
		}>,
		...
	}*/ = {}
	#requestLogFactory/*: RequestLogFactory*/ = requestLogFactory
	#logger/*: Logger*/ = logger

	constructor(
		rootDir/*: string*/,
		setup/*: ServerSetup*/,
		{ requestLogFactory, logger: maybeLogger, cert, key }/*: {
			requestLogFactory?: RequestLogFactory,
			logger?: Logger,
			cert?: Buffer,
			key?: Buffer,
		}*/ = {},
	) {
		this.updateSetup(rootDir, setup)
		if(requestLogFactory != null) {
			this.#requestLogFactory = requestLogFactory
		}
		if(maybeLogger != null) {
			this.#logger = maybeLogger
		}

		const logger = this.#logger

		// Preheating the env-replacements
		const her = this.#handleEnvReplacements
		Promise.all(this.#setup.files
			.map(file => her(this.#setup, file))
			.concat(her(this.#setup, this.#setup.catchAllFile))
		).catch(error => {
			// We log the error here and exists.
			logger({ type: "error", message: error.message })
			process.exit(1)
		})

		const onRequest = this.#onRequest
		this.#server = http.createServer((req, res) => {
			const startTime = new Date
			onRequest(startTime, req, res).catch(error => {
				logger({ type: "error", message: error.message })
				const writeErrorMessage = this.#writeErrorMessage
				writeErrorMessage(setup, startTime, req, res, 500)
			})
		})
		if(cert && key) {
			this.#secureServer = http2.createSecureServer({ cert, key, allowHTTP1: true }, (req, res) => {
				const startTime = new Date
				onRequest(startTime, req, res).catch(error => {
					logger({ type: "error", message: error.message })
					const writeErrorMessage = this.#writeErrorMessage
					writeErrorMessage(setup, startTime, req, res, 500)
				})
			})
		}
	}

	updateSetup(rootDir/*: string*/, setup/*: ServerSetup*/) {
		this.#setup = normalizeFolders(rootDir, assertServerSetup(setup))
		this.#cachedFiles = {}
	}

	setSetupProvider(provider/*: ?SetupProvider*/) {
		this.#setupProvider = provider
	}
	setFileProvider(provider/*: ?FileProvider*/) {
		this.#fileProvider = provider
	}

	#getSetup = async () => {
		if(this.#setupProvider == null) {
			return this.#setup
		}
		const { rootDir, setup } = await this.#setupProvider()
		return normalizeFolders(rootDir, assertServerSetup(setup))
	}

	#logRequest = (startTime/*: Date*/, req/*: IncomingMessage*/, res/*: ServerResponse*/) => {
		const parsedURL = new URL(req.url, "http://fake-base")

		const length = res.getHeader("content-length")
		const rlf = this.#requestLogFactory
		const log = rlf({
			ip: req.socket.remoteAddress || "" || "-",
			requestTime: startTime,
			path: decodeURI(parsedURL.pathname || "" || "/"),
			queryString: parsedURL.search,
			httpMethod: req.method,
			httpUser: null,
			protocol: `HTTP/${req.httpVersion}`,
			referer: req.headers.referer || null,
			userAgent: req.headers["user-agent"] || null,

			statusCode: res.statusCode,
			responseSize: length == null ? null : Number(length),
		})
		const logger = this.#logger
		logger({ type: "request", message: log })
	}

	#onRequest = async (startTime/*: Date*/, req/*: IncomingMessage*/, res/*: ServerResponse*/) => {
		const g = this.#getSetup
		const setup = await g()

		const acceptedEncodings = parseEncodingHeader(req.headers["accept-encoding"])

		const parsedURL = new URL(req.url, "http://fake-base")
		const pathname = decodeURI(parsedURL.pathname || "" || "/")

		const log = () => {
			const logRequest = this.#logRequest
			logRequest(startTime, req, res)
		}

		const getFileForPath = this.#getFileForPath
		const file = await getFileForPath(setup, pathname)

		const addHeaders = this.#addHeaders
		const writeErrorMessage = this.#writeErrorMessage
		if(file == null) {
			writeErrorMessage(setup, startTime, req, res, 404)
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

			try {
				if(this.#cachedFiles[file.path] != null) {
					const cachedFile = await this.#cachedFiles[file.path]
					res.end(cachedFile.content[smallestEncoding.name])
				} else {
					const filepath = path.join(setup.folders[smallestEncoding.name], file.path)
					await fs.promises.open(filepath).then(fd => new Promise((resolve, reject) => {
						fs.createReadStream(filepath, { fd }).pipe(res)
						.on("close", () => { fd.close(); resolve() })
						.on("error", reject)
					}))
				}
				log()
			} catch(err) {
				writeErrorMessage(setup, startTime, req, res, 500)
			}
		}
	}

	#writeErrorMessage = (setup/*: ServerSetup*/, startTime/*: Date*/, req/*: IncomingMessage*/, res/*: ServerResponse*/, status/*: 404|500*/) => {
		const message = standardErrors[status]
		const addHeaders = this.#addHeaders
		addHeaders(res, setup.globalHeaders)
		res.statusCode = status
		res.setHeader("content-length", `${message.length + 1}`)
		res.setHeader("Content-Type", "text/plain")
		res.end(message + "\n")
		const logRequest = this.#logRequest
		logRequest(startTime, req, res)
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

	#handleEnvReplacements = async (setup/*: ServerSetup*/, file/*: ?File*/) /*: Promise<?File>*/ => {
		if(file == null || file.envReplacements == null) {
			return file
		}

		const rep = file.envReplacements
		const e = Object.keys(rep).map((text) => {
			const repl = process.env[rep[text]]
			if(repl == null) {
				throw new Error(`Key ${rep[text]} is missing in environment variables`)
			}
			return { text, repl }
		})

		if(e.length === 0) {
			return file
		}

		if(this.#cachedFiles[file.path] != null) {
			const cachedFile = await this.#cachedFiles[file.path]
			if(file.hash !== cachedFile.hash) {
				delete this.#cachedFiles[file.path]
			} else {
				const fileKeys = Object.keys(rep)
				const cacheKeys = Object.keys(cachedFile.envReplacements)
				if(
					fileKeys.length != cacheKeys.length
					|| !fileKeys.every(x => cacheKeys.includes(x))
					|| !fileKeys.every(x => rep[x] === cachedFile.envReplacements[x])
				) {
					delete this.#cachedFiles[file.path]
				}
			}
		}

		if(this.#cachedFiles[file.path] == null) {
			const logger = this.#logger
			this.#cachedFiles[file.path] = fs.promises.readFile(path.join(setup.folders.identity, file.path), "utf-8")
				.then((content) => content.replace(
					new RegExp(`(${e.map(x => escapeRegex(x.text)).join("|")})`, "g"),
					(text) => {
						const c = e.find(x => x.text === text)
						if(c == null) {
							throw new Error(`Replacement for ${text} not found`)
						}
						return c.repl
					},
				))
				.then(async (identity) => {
					const [ brotli, gzip, deflate ] = await Promise.all([
						compress("brotli", identity),
						compress("gzip", identity),
						compress("deflate", identity),
					])

					return {
						hash: file.hash,
						envReplacements: rep,
						content: { identity, gzip, brotli, deflate },
					}
				})
				.then(
					(result) => {
						logger({ type: "info", message: `Replaced variables in file ${file.path}` })
						return result
					},
					(error) => {
						logger({
							type: "error",
							message: `Could not replace env-variables in file ${file.path}. Error: ${error.message}`,
						})
						throw error
					},
				)
		}

		const cachedFile = await this.#cachedFiles[file.path]

		return {
			...file,
			sizes: {
				identity: cachedFile.content.identity.length,
				brotli: cachedFile.content.brotli.length,
				deflate: cachedFile.content.deflate.length,
				gzip: cachedFile.content.gzip.length,
			},
		}
	}

	#getFileForPath = async (setup/*: ServerSetup*/, path/*: string*/) /*: Promise<?File>*/ => {
		const her = this.#handleEnvReplacements
		const p = this.#fileProvider || ((setup, path) => setup.files.find(x => path === x.path))
		const file = await p(setup, path)
		if(file != null) {
			return her(setup, file)
		}

		const getAliasForPath = this.#getAliasForPath
		const alias = getAliasForPath(setup, path)
		if(alias != null) {
			const getFileForPath = this.#getFileForPath
			return getFileForPath(setup, alias.to)
		} else {
			return her(setup, setup.catchAllFile)
		}
	}

	async listen(port/*: number*/, httpsPort/*: ?number*/) /*: Promise<{ http: number, https: ?number }>*/ {
		const s = this.#secureServer
		const [http, https ] = await Promise.all([
			new Promise((res, rej) => {
				this.#server.listen(port, (err) => { err ? rej(err) : res(port) })
			}),
			s == null || httpsPort == null ? null : new Promise((res, rej) => {
				s.listen(httpsPort, (err) => { err ? rej(err) : res(httpsPort) })
			}),
		])

		return { http, https }
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
