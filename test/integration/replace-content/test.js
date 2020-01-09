// @flow strict

const { it, describe, beforeEach } = require("mocha")
const { expect } = require("chai")

const { fetch, getHeaders, http1, http2 } = require("../fetch")
const server = require("../server")
const setup = require("./setup")

/*::
import { Response } from "node-fetch"
*/

function createTestData(baseURL/*: string*/) {
	return {
		base: baseURL,
		encodings: [ "deflate", "gzip" ],
		response: (null /*:?Response*/),
		headers: (null /*:?{[string]: string, ...}*/),
		status: (null/*: ?number*/),
	}
}

describe(`integration/replace-content/test.js`, () => {
for(const useHTTPS of [ false, true ]) { describe(useHTTPS ? "HTTPS" : "HTTP", () => {
	let testData

	describe("with ENV_VAR not set", () => {
		describe("creating the server", () => {
			it("should throw", async () => {
				let error
				try {
					await server.start(__dirname, setup, useHTTPS)
				} catch(e) {
					error = e
				}

				expect(() => {
					if(error) {
						throw error
					}
				}).to.throw()
			})
		})
	})

	describe("with ENV_VAR set", () => {
		beforeEach(async () => {
			process.env.ENV_VAR = "some new value"
			testData = createTestData(await server.start(__dirname, setup, useHTTPS))
		})
		afterEach(() => {
			delete process.env.ENV_VAR
		})

		describe("asking for index.html file, accepting gzip and deflate", () => {
			beforeEach(async () => {
				const response = await fetch("/index.html", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "text/html")
			})
			it("should not gzip the file", () => {
				expect(testData.headers)
					.to.have.property("content-encoding", "deflate")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "70")
			})
			it("should return the expected data", async () => {
				const response = testData.response
				if(response == null) {
					throw new Error("Response not set")
				}

				expect(await response.text())
					.to.equal(
`<!doctype html>

<h1>Catchall page</h1>

<div>some new value</div>
<div>some new value</div>
`
					)
			})
		})

		describe("asking for unknown file, accepting only brotli", () => {
			beforeEach(async () => {
				testData.encodings = [ "brotli" ]
				const response = await fetch("/unknown", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "text/html")
			})
			it("should brotli encode the file", () => {
				expect(testData.headers)
					.to.have.property("content-encoding", "br")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "67")
			})
			it("should return the expected data", async () => {
				const response = testData.response
				if(response == null) {
					throw new Error("Response not set")
				}

				expect(await response.text())
					.to.equal(
`<!doctype html>

<h1>Catchall page</h1>

<div>some new value</div>
<div>some new value</div>
`
					)
			})
		})

		describe("asking for unknown file, accepting gzip and deflate", () => {
			beforeEach(async () => {
				const response = await fetch("/unknown", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "text/html")
			})
			it("should gzip the file", () => {
				expect(testData.headers)
					.to.have.property("content-encoding", "deflate")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "70")
			})
			it("should return the expected data", async () => {
				const response = testData.response
				if(response == null) {
					throw new Error("Response not set")
				}

				expect(await response.text())
					.to.equal(
`<!doctype html>

<h1>Catchall page</h1>

<div>some new value</div>
<div>some new value</div>
`
					)
			})
		})

		describe("asking for regex-chars.html file, accepting identity only", () => {
			beforeEach(async () => {
				testData.encodings = []
				const response = await fetch("/regex-chars.html", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "text/html")
			})
			it("should not gzip the file", () => {
				expect(testData.headers)
					.to.not.have.property("content-encoding")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "56")
			})
			it("should return the expected data", async () => {
				const response = testData.response
				if(response == null) {
					throw new Error("Response not set")
				}

				expect(await response.text())
					.to.equal(
`<!doctype html>

<h1>Catchall page</h1>

some new value
`
					)
			})
		})
	})
})}
})
