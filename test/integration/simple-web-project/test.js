// @flow strict

const fetch = require("../fetch")
const server = require("../server")
const setup = require("./setup")
const { it, describe, beforeEach } = require("mocha")
const { expect } = require("chai")

/*::
import { Response } from "node-fetch"
*/

function unwrap/*::<T>*/(t/*:?T*/) /*: T*/ {
	if(t == null) {
		throw new Error("Found null")
	}
	return t
}

describe("integration/simple-web-project/test.js", () => {
	let testData
	beforeEach(async () => {
		testData = {
			base: await server.start(setup),
			encodings: [],
			response: (null/*:?Response*/),
		}
	})
	describe("not accepting any encodings", () => {
		beforeEach(() => {
			testData.encodings = []
		})
		describe("asking for js file", () => {
			beforeEach(async () => {
				testData.response = await fetch("/file.js", testData)
			})
			it("should have status code 200", () => {
				expect(testData.response)
					.to.have.property("statusCode", 200)
			})
			it("should have proper mime-type", () => {
				expect(unwrap(testData.response).headers)
					.to.have.property("Content-Type", "application/javascript")
			})
			it("should return uncompressed file", async () => {
				expect(await unwrap(testData.response).text())
					.to.equal("'normal'\n")
			})
		})
		describe("asking for non-existing file", () => {
			it("should return uncompressed catchall")
		})
		describe("asking for uncompressable", () => {
			it("should return uncompressed file")
		})
	})
	describe("accepting deflate", () => {
		beforeEach(() => {
			testData.encodings = [ "deflate" ]
		})
		describe("asking for js file", () => {
			it("should return deflate file")
		})
		describe("asking for non-existing file", () => {
			it("should return uncompressed catchall")
		})
		describe("asking for uncompressable", () => {
			it("should return uncompressed file")
		})
	})
	describe("accepting gzip and deflate", () => {
		beforeEach(() => {
			testData.encodings = [ "deflate", "gzip" ]
		})
		describe("asking for js file", () => {
			it("should return gzip file because it is smallest")
		})
		describe("asking for non-existing file", () => {
			it("should return catchall as gzip")
		})
		describe("asking for uncompressable", () => {
			it("should return uncompressed file because it is smallest")
		})
	})
})
