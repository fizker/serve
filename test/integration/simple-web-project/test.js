// @flow strict

const { it, describe, beforeEach } = require("mocha")
const { expect, ...chai } = require("chai")
const fzkes = require("fzkes")

const { fetch, getHeaders, http1, http2 } = require("../fetch")
const server = require("../server")
const setup = require("./setup")

chai.use(fzkes)

/*::
import { Response } from "node-fetch"
*/

describe(`integration/simple-web-project/test.js`, () => {
for(const useHTTPS of [ false, true ]) { describe(useHTTPS ? "HTTPS" : "HTTP", () => {
	let testData
	beforeEach(async () => {
		const requestLog = fzkes.fake("requestLog")
		testData = {
			base: await server.start(__dirname, setup, useHTTPS, requestLog),
			encodings: [],
			response: (null /*:?Response*/),
			headers: (null /*:?{[string]: string, ...}*/),
			status: (null/*: ?number*/),
			requestLog,
			requestLogPromise: new Promise((res) => requestLog.calls(res)),
		}
	})
	describe("not accepting any encodings", () => {
		beforeEach(() => {
			testData.encodings = []
		})
		describe("asking for js file", () => {
			beforeEach(async () => {
				const response = await fetch("/file.js", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "application/javascript")
			})
			it("should not compress the file", () => {
				expect(testData.headers)
					.to.not.have.property("content-encoding")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "36")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 36,
					path: "/file.js",
					queryString: "",
				})
			})
		})
		if(useHTTPS) {
			describe("asking for js file using HTTP/1", () => {
				beforeEach(async () => {
					const { headers, status } = await http1("/file.js", testData)
					testData.status = status
					testData.headers = headers
				})
				it("should have status code 200", () => {
					expect(testData.status)
						.to.equal(200)
				})
				it("should have proper mime-type", () => {
					expect(testData.headers)
						.to.have.property("content-type", "application/javascript")
				})
				it("should not compress the file", () => {
					expect(testData.headers)
						.to.not.have.property("content-encoding")
				})
				it("should return the expected data size", () => {
					expect(testData.headers)
						.to.have.property("content-length", "36")
				})
				it("should log appropriately", async () => {
					await testData.requestLogPromise
					expect(testData.requestLog).to.have.been.calledWith({
						statusCode: 200,
						responseSize: 36,
						path: "/file.js",
						protocol: "HTTP/1.1",
					})
				})
			})
			describe("asking for js file using HTTP/2", () => {
				beforeEach(async () => {
					const { headers, status } = await http2("/file.js", testData)
					testData.status = status
					testData.headers = headers
				})
				it("should have status code 200", () => {
					expect(testData.status)
						.to.equal(200)
				})
				it("should have proper mime-type", () => {
					expect(testData.headers)
						.to.have.property("content-type", "application/javascript")
				})
				it("should not compress the file", () => {
					expect(testData.headers)
						.to.not.have.property("content-encoding")
				})
				it("should return the expected data size", () => {
					expect(testData.headers)
						.to.have.property("content-length", "36")
				})
				it("should log appropriately", async () => {
					await testData.requestLogPromise
					expect(testData.requestLog).to.have.been.calledWith({
						statusCode: 200,
						responseSize: 36,
						path: "/file.js",
						protocol: "HTTP/2.0",
					})
				})
			})
		}
		describe("asking for js file with query-string", () => {
			beforeEach(async () => {
				const response = await fetch("/file.js?foo", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "application/javascript")
			})
			it("should not compress the file", () => {
				expect(testData.headers)
					.to.not.have.property("content-encoding")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "36")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 36,
					path: "/file.js",
					queryString: "?foo",
				})
			})
		})
		describe("asking for non-existing file", () => {
			beforeEach(async () => {
				const response = await fetch("/non-existing.js", testData)
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
			it("should not compress the file", () => {
				expect(testData.headers)
					.to.not.have.property("content-encoding")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "89")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 89,
					path: "/non-existing.js",
				})
			})
		})
		describe("asking for uncompressable", () => {
			beforeEach(async () => {
				const response = await fetch("/uncompressable.txt", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "text/plain")
			})
			it("should not compress the file", () => {
				expect(testData.headers)
					.to.not.have.property("content-encoding")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "11")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 11,
					path: "/uncompressable.txt",
				})
			})
		})
		describe("asking for file with spaces", () => {
			beforeEach(async () => {
				const response = await fetch("/file with spaces.txt", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "5")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 5,
					path: "/file with spaces.txt",
				})
			})
		})
	})
	describe("accepting deflate", () => {
		beforeEach(() => {
			testData.encodings = [ "deflate" ]
		})
		describe("asking for js file", () => {
			beforeEach(async () => {
				const response = await fetch("/file.js", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "application/javascript")
			})
			it("should not compress the file", () => {
				expect(testData.headers)
					.to.have.property("content-encoding", "deflate")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "20")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 20,
					path: "/file.js",
				})
			})
		})
		describe("asking for non-existing file", () => {
			beforeEach(async () => {
				const response = await fetch("/non-existing.js", testData)
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
			it("should not compress the file", () => {
				expect(testData.headers)
					.to.not.have.property("content-encoding")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "89")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 89,
					path: "/non-existing.js",
				})
			})
		})
		describe("asking for uncompressable", () => {
			beforeEach(async () => {
				const response = await fetch("/uncompressable.txt", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "text/plain")
			})
			it("should not compress the file", () => {
				expect(testData.headers)
					.to.not.have.property("content-encoding")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "11")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 11,
					path: "/uncompressable.txt",
				})
			})
		})
	})
	describe("accepting gzip and deflate", () => {
		beforeEach(() => {
			testData.encodings = [ "deflate", "gzip" ]
		})
		describe("asking for js file", () => {
			beforeEach(async () => {
				const response = await fetch("/file.js", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "application/javascript")
			})
			it("should compress to deflate, which is smallest", () => {
				expect(testData.headers)
					.to.have.property("content-encoding", "deflate")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "20")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 20,
					path: "/file.js",
				})
			})
		})
		describe("asking for non-existing file", () => {
			beforeEach(async () => {
				const response = await fetch("/non-existing.js", testData)
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
					.to.have.property("content-encoding", "gzip")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "81")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 81,
					path: "/non-existing.js",
				})
			})
		})
		describe("asking for root file", () => {
			beforeEach(async () => {
				const response = await fetch("/", testData)
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
					.to.have.property("content-encoding", "gzip")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "81")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 81,
					path: "/",
				})
			})
		})
		describe("asking for uncompressable", () => {
			beforeEach(async () => {
				const response = await fetch("/uncompressable.txt", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "text/plain")
			})
			it("should not compress the file because it is smallest", () => {
				expect(testData.headers)
					.to.not.have.property("content-encoding")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "11")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 11,
					path: "/uncompressable.txt",
				})
			})
		})
	})
	describe("accepting brotli, gzip and deflate", () => {
		beforeEach(() => {
			testData.encodings = [ "brotli", "deflate", "gzip" ]
		})
		describe("asking for js file", () => {
			beforeEach(async () => {
				const response = await fetch("/file.js", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "application/javascript")
			})
			it("should compress to br, which is smallest", () => {
				expect(testData.headers)
					.to.have.property("content-encoding", "br")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "15")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 15,
					path: "/file.js",
				})
			})
		})
	})
	describe("accepting brotli least, gzip most and deflate in the middle", () => {
		beforeEach(() => {
			testData.encodings = [ { name: "brotli", weight: 0.2 }, { name: "deflate", weight: 0.5 }, { name: "gzip", weight: 1 } ]
		})
		describe("asking for js file", () => {
			beforeEach(async () => {
				const response = await fetch("/file.js", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "application/javascript")
			})
			it("should compress to gzip", () => {
				expect(testData.headers)
					.to.have.property("content-encoding", "gzip")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "32")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 32,
					path: "/file.js",
				})
			})
		})
	})
	describe("accepting no known encodings", () => {
		beforeEach(() => {
			testData.encodings = [ { name: "unknown", weight: 1 }, { name: "identity", weight: 0 } ]
		})
		describe("asking for js file", () => {
			beforeEach(async () => {
				const response = await fetch("/file.js", testData)
				testData.response = response
				testData.headers = getHeaders(response.headers)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("status", 200)
			})
			it("should have proper mime-type", () => {
				expect(testData.headers)
					.to.have.property("content-type", "application/javascript")
			})
			it("should not compress the file", () => {
				expect(testData.headers)
					.to.not.have.property("content-encoding")
			})
			it("should return the expected data size", () => {
				expect(testData.headers)
					.to.have.property("content-length", "36")
			})
			it("should log appropriately", async () => {
				await testData.requestLogPromise
				expect(testData.requestLog).to.have.been.calledWith({
					statusCode: 200,
					responseSize: 36,
					path: "/file.js",
				})
			})
		})
	})
})}
})
