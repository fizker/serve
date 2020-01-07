// @flow strict

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
				},
			],
			"catchAllFile": null,
			"globalHeaders": {
			},
		}

		testData = {
			setup,
			server: new Server(__dirname, setup, await loadHTTPSFiles()),
			base: `${useHTTPS ? "https:" : "http:"}//localhost:${useHTTPS ? ports.https : ports.http}`,
			encodings: [],
			response: (null /*:?Response*/),
			headers: (null /*:?{[string]: string, ...}*/),
			setupProvider: (null /*?SetupProvider*/),
			fileProvider: (null /*?FileProvider*/),
		}

		await testData.server.listen(ports.http, ports.https)
	})
	afterEach(async () => {
		await testData.server.close()
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
		})

		describe("adding a file provider", () => {
			beforeEach(() => {
				const secondFile/*: File*/ = testData.setup.files[0]
				testData.fileProvider = fzkes.fake()
					.withComplexArgs(null, { value: "/first" }).returns(Promise.resolve(null))
					.withComplexArgs(null, { value: "/second" }).returns(Promise.resolve(secondFile))
				testData.server.setFileProvider(testData.fileProvider)
			})

			describe("asking for /initial", () => {
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
			})
			describe("asking for /other", () => {
				beforeEach(async () => {
					testData.response = await fetch("/second", testData)
				})

				it("should return the file", async () => {
					expect(await unwrap(testData.response).text())
						.to.equal("'file content'\n")
				})
			})
		})

		describe("updating the server", () => {
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
			})
			describe("asking for /other", () => {
				beforeEach(async () => {
					testData.response = await fetch("/other", testData)
				})

				it("should return the direct file and not the alias", async () => {
					expect(await unwrap(testData.response).text())
						.to.equal("'file content'\n")
				})
			})
		})

		describe("adding a setup provider", () => {
			beforeEach(() => {
				const newSetup = {
					...testData.setup,
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
						// $FlowFixMe flow does not know we override called()
						.called(1)
				})

				describe("asking for /initial", () => {
					beforeEach(async () => {
						testData.response = await fetch("/initial", testData)
					})
					it("should now have invoked the provider twice", () => {
						expect(testData.setupProvider)
							.to.have.been
							// $FlowFixMe flow does not know we override called()
							.called(2)
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
						// $FlowFixMe flow does not know we override called()
						.called(1)
				})
			})
		})
	})
})}
})
