// @flow strict

const path = require("path")
const fs = require("fs")
const { it, describe, beforeEach } = require("mocha")
const { expect, ...chai } = require("chai")
const fzkes = require("fzkes")
chai.use(fzkes)

const { loadHTTPSFiles } = require("../server")
const { fetch, getHeaders, unwrap } = require("../fetch")

const { Server } = require("../../../")

const ports = {
	http: 12345,
	https: 12346,
}

/*::
import { Response, Headers } from "node-fetch"
import type { File, SetupProvider, FileProvider } from "../../../index"
*/
describe("integration/programmatic-server/test.js", () => {
for(const useHTTPS of [ false, true ]) { describe(useHTTPS ? "HTTPS" : "HTTP", () => {
	let testData
	beforeEach(async () => {
		const setup = {
			"aliases": [
				{ "from": "/initial", "to": "/file.js" }
			],
			"folders": {
				"identity": "files",
				"deflate": "deflate",
				"gzip": "gzip",
				"brotli": "brotli",
			},
			"files": [
				{
					"path": "/file.js",
					"mime": "application/javascript",
					"statusCode": 200,
					"sizes": {
						"identity": 15,
						"deflate": null,
						"gzip": null,
						"brotli": null,
					},
					"headers": {},
					"envReplacements": {
					},
					"hash": "abc",
				},
				{
					"path": "/env-replacements",
					"mime": "application/javascript",
					"statusCode": 200,
					"sizes": {
						"identity": 7,
						"deflate": null,
						"gzip": null,
						"brotli": null,
					},
					"headers": {},
					"envReplacements": {
						"change": "FOO",
					},
					"hash": "abc",
				},
			],
			"catchAllFile": null,
			"globalHeaders": {
			},
		}

		process.env.FOO = "FOO2"
		process.env.BAR = "BAR2"

		const requestLogFactory = fzkes.fake("requestLogFactory").returns("request-log")
		const logger = fzkes.fake("logger")
		testData = {
			setup,
			server: new Server(__dirname, setup, { ...await loadHTTPSFiles(), requestLogFactory, logger }),
			base: `${useHTTPS ? "https:" : "http:"}//localhost:${useHTTPS ? ports.https : ports.http}`,
			encodings: [],
			response: (null /*:?Response*/),
			headers: (null /*:?{[string]: string, ...}*/),
			setupProvider: (null /*: ?SetupProvider*/),
			fileProvider: (null /*: ?FileProvider*/),
			filepath: (null /*: ?string*/),
			originalFile: (null /*: ?string*/),
			requestLogFactory,
			requestLogPromise: new Promise(res => requestLogFactory.calls(res)),
			logger,
		}

		await testData.server.listen(ports.http, ports.https)
	})
	afterEach(async () => {
		if(testData && testData.server) {
			await testData.server.close()
		}
		delete process.env.FOO
		delete process.env.BAR
	})

	describe("initial setup", () => {
		describe("asking for /initial", () => {
			beforeEach(async () => {
				testData.response = await fetch("/initial", testData)
			})

			it("should return the direct file and not the alias", async () => {
				expect(await unwrap(testData.response).text())
					.to.equal("'file content'\n")
			})
		})
		describe("asking for /other", () => {
			beforeEach(async () => {
				testData.response = await fetch("/other", testData)
			})

			it("should return 404", async () => {
				expect(await unwrap(testData.response).text())
					.to.equal("Not found\n")
			})
			it("should have status code 404", () => {
				expect(testData.response)
					.to.have.property("status", 404)
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLogFactory).to.have.been.calledWith({
					statusCode: 404,
					responseSize: 10,
					path: "/other",
					queryString: "",
				})
			})
		})
		describe("asking for /env-replacements", () => {
			beforeEach(async () => {
				const response = await fetch("/env-replacements", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})

			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "5")
			})
			it("should return the file", async () => {
				expect(await unwrap(testData.response).text())
					.to.equal("FOO2\n")
			})
		})

		describe("adding a file provider", () => {
			beforeEach(async () => {
				// We are requesting the items first, to ensure that any caches are filled
				let i = 0
				testData.requestLogPromise = new Promise(res => testData.requestLogFactory.calls(() => {
					i++
					if(i === 3) {
						res()
					}
				}))
				await Promise.all([
					fetch("/first", testData),
					fetch("/second", testData),
					fetch("/env-replacements", testData),
					testData.requestLogPromise,
				])
				testData.requestLogFactory.reset()
				testData.requestLogPromise = new Promise(res => testData.requestLogFactory.calls(res))
			})

			beforeEach(async () => {
				const filepath = path.join(__dirname, "files", testData.setup.files[1].path)
				testData.filepath = filepath
				testData.originalFile = await fs.promises.readFile(filepath, "utf8")
				await fs.promises.writeFile(filepath, "change more\n")
			})
			afterEach(async () => {
				if(testData.filepath == null || testData.originalFile == null) {
					throw new Error(`Failed to restore ${testData.filepath || "" || testData.setup.files[0].path}`)
				}
				await fs.promises.writeFile(testData.filepath, testData.originalFile)
			})

			beforeEach(() => {
				const secondFile/*: File*/ = testData.setup.files[0]
				const updatedEnvReplacements = { ...testData.setup.files[1], hash: "def" }
				updatedEnvReplacements.sizes = { ...updatedEnvReplacements.sizes, identity: 12 }
				testData.fileProvider = fzkes.fake()
					.withComplexArgs(null, { value: "/first" }).returns(Promise.resolve(null))
					.withComplexArgs(null, { value: "/second" }).returns(Promise.resolve(secondFile))
					.withComplexArgs(null, { value: "/env-replacements" }).returns(Promise.resolve(updatedEnvReplacements))
				testData.server.setFileProvider(testData.fileProvider)
			})

			describe("asking for /first", () => {
				beforeEach(async () => {
					testData.response = await fetch("/first", testData)
				})

				it("should return 404", async () => {
					expect(await unwrap(testData.response).text())
						.to.equal("Not found\n")
				})
				it("should have status code 404", () => {
					expect(testData.response)
						.to.have.property("status", 404)
				})
				it("should log appropriately", async () => {
					await testData.requestLogPromise
					expect(testData.requestLogFactory).to.have.been.calledWith({
						statusCode: 404,
						responseSize: 10,
						path: "/first",
						queryString: "",
					})
				})
			})
			describe("asking for /second", () => {
				beforeEach(async () => {
					testData.response = await fetch("/second", testData)
				})

				it("should return the file", async () => {
					expect(await unwrap(testData.response).text())
						.to.equal("'file content'\n")
				})
			})
			describe("asking for /env-replacements", () => {
				beforeEach(async () => {
					const response = await fetch("/env-replacements", testData)
					testData.response = response
					testData.headers = getHeaders(response.headers)
				})

				it("should return the expected data size", () => {
					expect(testData.headers)
						.to.have.property("content-length", "10")
				})
				it("should return the file", async () => {
					expect(await unwrap(testData.response).text())
						.to.equal("FOO2 more\n")
				})
			})
			describe("asking for file with non-existing env-replacements", () => {
				beforeEach(async () => {
					const file/*: File*/ = {
						path: "/missing-env",
						hash: "abc",
						sizes: {
							identity: 10,
							brotli: null,
							gzip: null,
							deflate: null,
						},
						statusCode: 200,
						mime: "text/plain",
						headers: {},
						envReplacements: {
							"some string": "unknown-env",
						},
					}
					if(testData.fileProvider == null) throw new Error
					testData.fileProvider
						// $FlowFixMe[prop-missing]
						.withComplexArgs(null, { value: "/missing-env" })
						.returns(Promise.resolve(file))

					const response = await fetch("/missing-env", testData)
					testData.response = response
					testData.headers = getHeaders(response.headers)
				})

				it("should have status code 500", () => {
					expect(testData.response)
						.to.have.property("status", 500)
				})
				it("should log appropriately", async () => {
					await testData.requestLogPromise
					expect(testData.requestLogFactory).to.have.been.calledWith({
						statusCode: 500,
						responseSize: 22,
						path: "/missing-env",
						queryString: "",
					})
				})
				it("should log that the env-var is missing", async () => {
					await testData.requestLogPromise
					const lastCalls = testData.logger._calls.map(x => x[0])
					const errorLog = lastCalls.find(x => x.type === "error")

					if(errorLog == null) {
						throw new Error("Error-log missing")
					}

					expect(errorLog.message)
						.to.match(/\Wenv\W/i)
					expect(errorLog.message)
						.to.include("unknown-env")
				})
			})
		})

		describe("updating the server", () => {
			beforeEach(async () => {
				// We are requesting the items first, to ensure that any caches are filled
				let i = 0
				testData.requestLogPromise = new Promise(res => testData.requestLogFactory.calls(() => {
					i++
					if(i === 3) {
						res()
					}
				}))
				await Promise.all([
					fetch("/initial", testData),
					fetch("/other", testData),
					fetch("/env-replacements", testData),
					testData.requestLogPromise,
				])
				testData.requestLogFactory.reset()
				testData.requestLogPromise = new Promise(res => testData.requestLogFactory.calls(res))
			})
			beforeEach(() => {
				const newSetup = {
					...testData.setup,
					aliases: [
						{ from: "/other", to: "/file.js" },
					],
				}

				testData.server.updateSetup(__dirname, newSetup)
			})
			describe("asking for /initial", () => {
				beforeEach(async () => {
					testData.response = await fetch("/initial", testData)
				})

				it("should return 404", async () => {
					expect(await unwrap(testData.response).text())
						.to.equal("Not found\n")
				})
				it("should have status code 404", () => {
					expect(testData.response)
						.to.have.property("status", 404)
				})
				it("should log appropriately", async () => {
					await testData.requestLogPromise
					expect(testData.requestLogFactory).to.have.been.calledWith({
						statusCode: 404,
						responseSize: 10,
						path: "/initial",
						queryString: "",
					})
				})
			})
			describe("asking for /other", () => {
				beforeEach(async () => {
					testData.response = await fetch("/other", testData)
				})

				it("should return the direct file and not the alias", async () => {
					expect(await unwrap(testData.response).text())
						.to.equal("'file content'\n")
				})
				it("should log appropriately", async () => {
					await testData.requestLogPromise
					expect(testData.requestLogFactory).to.have.been.calledWith({
						statusCode: 200,
						responseSize: 15,
						path: "/other",
						queryString: "",
					})
				})
			})
		})

		describe("adding a setup provider", () => {
			beforeEach(async () => {
				// We are requesting the items first, to ensure that any caches are filled
				let i = 0
				testData.requestLogPromise = new Promise(res => testData.requestLogFactory.calls(() => {
					i++
					if(i === 3) {
						res()
					}
				}))
				await Promise.all([
					fetch("/first", testData),
					fetch("/second", testData),
					fetch("/env-replacements", testData),
					testData.requestLogPromise,
				])
				testData.requestLogFactory.reset()
				testData.requestLogPromise = new Promise(res => testData.requestLogFactory.calls(res))
			})
			beforeEach(() => {
				// The difference is the alias and the envReplacements map
				const newSetup = {
					...testData.setup,
					files: [
						testData.setup.files[0],
						{
							...testData.setup.files[1],
							envReplacements: {
								"chan": "BAR",
							},
						},
					],
					aliases: [
						{ from: "/other", to: "/file.js" },
					],
				}

				testData.setupProvider = fzkes.fake()
					.returns(Promise.resolve({ rootDir: __dirname, setup: newSetup }))

				testData.server.setSetupProvider(testData.setupProvider)
			})
			describe("asking for /initial", () => {
				beforeEach(async () => {
					testData.response = await fetch("/initial", testData)
				})

				it("should return 404", async () => {
					expect(await unwrap(testData.response).text())
						.to.equal("Not found\n")
				})
				it("should have status code 404", () => {
					expect(testData.response)
						.to.have.property("status", 404)
				})
				it("should only invoke the provider once", () => {
					expect(testData.setupProvider)
						.to.have.been
						// $FlowFixMe[extra-arg] flow does not know we override called()
						.called(1)
				})
				it("should log appropriately", async () => {
					await testData.requestLogPromise
					expect(testData.requestLogFactory).to.have.been.calledWith({
						statusCode: 404,
						responseSize: 10,
						path: "/initial",
						queryString: "",
					})
				})

				describe("asking for /initial", () => {
					beforeEach(async () => {
						testData.response = await fetch("/initial", testData)
					})
					it("should now have invoked the provider twice", () => {
						expect(testData.setupProvider)
							.to.have.been
							// $FlowFixMe[extra-arg] flow does not know we override called()
							.called(2)
					})
					it("should log appropriately", async () => {
						await testData.requestLogPromise
						expect(testData.requestLogFactory).to.have.been.calledWith({
							statusCode: 404,
							responseSize: 10,
							path: "/initial",
							queryString: "",
						})
					})
				})
			})
			describe("asking for /other", () => {
				beforeEach(async () => {
					testData.response = await fetch("/other", testData)
				})

				it("should return the direct file and not the alias", async () => {
					expect(await unwrap(testData.response).text())
						.to.equal("'file content'\n")
				})
				it("should only invoke the provider once", () => {
					expect(testData.setupProvider)
						.to.have.been
						// $FlowFixMe[extra-arg] flow does not know we override called()
						.called(1)
				})
				it("should log appropriately", async () => {
					await testData.requestLogPromise
					expect(testData.requestLogFactory).to.have.been.calledWith({
						statusCode: 200,
						responseSize: 15,
						path: "/other",
						queryString: "",
					})
				})
			})
			describe("asking for /env-replacements", () => {
				beforeEach(async () => {
					const response = await fetch("/env-replacements", testData)
					testData.response = response
					testData.headers = getHeaders(response.headers)
				})

				it("should return the expected data size", () => {
					expect(testData.headers)
						.to.have.property("content-length", "7")
				})
				it("should return the file", async () => {
					expect(await unwrap(testData.response).text())
						.to.equal("BAR2ge\n")
				})
			})
		})
	})
})}
})
