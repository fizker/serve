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
			base: await server.start(__dirname, setup),
			encodings: [],
			response: (null /*:?Response*/),
			headers: (null /*:?{[string]: string, ...}*/),
		}
	})

	describe("asking for /file", () => {
		beforeEach(async () => {
			const response = await fetch("/file", testData)
			testData.response = response
			testData.headers = getHeaders(response.headers)
		})
		it("should have the global headers", () => {
			expect(testData.headers)
				.to.have.property("x-shared-header", "global value")
			expect(testData.headers)
				.to.have.property("another-global-header", "foo")
		})
		it("should have the specific headers", () => {
			expect(testData.headers)
				.to.have.property("x-some-header", "foo")
			expect(testData.headers)
				.to.have.property("another-file-header", "foo")
		})
	})
	describe("asking for /alias", () => {
		beforeEach(async () => {
			const response = await fetch("/alias", testData)
			testData.response = response
			testData.headers = getHeaders(response.headers)
		})
		it("should have the global headers", () => {
			expect(testData.headers)
				.to.have.property("x-shared-header", "global value")
			expect(testData.headers)
				.to.have.property("another-global-header", "foo")
		})
		it("should have the specific headers of the aliased file", () => {
			expect(testData.headers)
				.to.have.property("x-some-header", "foo")
			expect(testData.headers)
				.to.have.property("another-file-header", "foo")
		})
	})
	describe("asking for unknown file", () => {
		beforeEach(async () => {
			const response = await fetch("/unknown", testData)
			testData.response = response
			testData.headers = getHeaders(response.headers)
		})
		it("should have the global headers", () => {
			expect(testData.headers)
				.to.have.property("x-shared-header", "global value")
			expect(testData.headers)
				.to.have.property("another-global-header", "foo")
		})
		it("should have the specific headers from the catchall", () => {
			expect(testData.headers)
				.to.have.property("x-header-for-catch-all", "is-set")
			expect(testData.headers)
				.to.have.property("another-catchall-header", "foo")
		})
	})
	describe("asking for /file-with-overlapping-header", () => {
		beforeEach(async () => {
			const response = await fetch("/file-with-overlapping-header", testData)
			testData.response = response
			testData.headers = getHeaders(response.headers)
		})
		it("should have overwritten the global header", () => {
			expect(testData.headers)
				.to.have.property("x-shared-header", "overwritten value")
		})
	})
})
