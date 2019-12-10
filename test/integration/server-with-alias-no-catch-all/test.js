// @flow strict

const { it, describe, beforeEach } = require("mocha")
const { expect } = require("chai")

const { fetch, getHeaders, unwrap } = require("../fetch")
const server = require("../server")
const setup = require("./setup")

/*::
import { Response, Headers } from "node-fetch"
*/

describe("integration/server-with-alias-no-catch-all/test.js", () => {
	let testData
	beforeEach(async () => {
		testData = {
			base: await server.start(setup),
			encodings: [],
			response: (null /*:?Response*/),
			headers: (null /*:?{[string]: string, ...}*/),
		}
	})
	describe("asking for index.html", () => {
		beforeEach(async () => {
			testData.response = await fetch("/index.html", testData)
		})

		it("should return index.html", async () => {
			expect(await unwrap(testData.response).text())
				.to.equal("<!doctype html>\n")
		})
	})
	describe("asking for alias of index.html", () => {
		beforeEach(async () => {
			testData.response = await fetch("/alias-to-index", testData)
		})

		it("should return index.html", async () => {
			expect(await unwrap(testData.response).text())
				.to.equal("<!doctype html>\n")
		})
	})
	describe("asking for alias of unknown file", () => {
		beforeEach(async () => {
			testData.response = await fetch("/alias-to-nothing", testData)
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
	describe("asking for alias to an alias", () => {
		beforeEach(async () => {
			testData.response = await fetch("/alias-to-alias", testData)
		})

		it("should follow and return the result of the last alias", async () => {
			expect(await unwrap(testData.response).text())
				.to.equal("<!doctype html>\n")
		})
	})
	describe("asking for unknown path", () => {
		beforeEach(async () => {
			const response = await fetch("/not found", testData)
			testData.response = response
			testData.headers = getHeaders(response.headers)
		})

		it("should return 404", async () => {
			expect(await unwrap(testData.response).text())
				.to.equal("Not found\n")
		})
		it("should have status code 404", () => {
			expect(testData.response)
				.to.have.property("status", 404)
		})
		it("should have global headers on default 404", () => {
			expect(testData.headers)
				.to.have.property("global-header", "is-set")
			expect(testData.headers)
				.to.have.property("another-global-header", "foo")
		})
	})
	describe("asking for file.js", () => {
		beforeEach(async () => {
			testData.response = await fetch("/file.js", testData)
		})

		it("should return the direct file and not the alias", async () => {
			expect(await unwrap(testData.response).text())
				.to.equal("'file content'\n")
		})
	})
})
