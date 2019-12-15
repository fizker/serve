// @flow strict

const { it, describe, beforeEach } = require("mocha")
const { expect } = require("chai")

const { fetch, getHeaders } = require("../fetch")
const server = require("../server")
const setup = require("./setup")

/*::
import { Response } from "node-fetch"
*/

describe("integration/simple-web-project/test.js", () => {
	let testData
	beforeEach(async () => {
		testData = {
			base: await server.start(__dirname, setup),
			encodings: [],
			response: (null /*:?Response*/),
			headers: (null /*:?{[string]: string, ...}*/),
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
		})
	})
})
