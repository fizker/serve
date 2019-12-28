// @flow strict

const fs = require("fs")
const { it, describe, beforeEach } = require("mocha")
const { expect } = require("chai")

const { loadHTTPSFiles } = require("../server")
const { fetch, getHeaders, unwrap } = require("../fetch")

const { Server } = require("../../../")

const ports = {
	http: 12345,
	https: 12346,
}

/*::
import { Response, Headers } from "node-fetch"
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

		describe("then updating the server", () => {
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
	})
})}
})
