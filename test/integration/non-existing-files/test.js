// @flow strict

const { it, describe, beforeEach } = require("mocha")
const { expect } = require("chai")

const { fetch, getHeaders, unwrap } = require("../fetch")
const server = require("../server")
const setup = require("./setup")

/*::
import { Response, Headers } from "node-fetch"
*/

describe("integration/non-existing-files/test.js", () => {
for(const useHTTPS of [ false, true ]) { describe(useHTTPS ? "HTTPS" : "HTTP", () => {
	let testData
	beforeEach(async () => {
		testData = {
			base: await server.start(__dirname, setup, useHTTPS),
			encodings: [],
			response: (null /*:?Response*/),
			headers: (null /*:?{[string]: string, ...}*/),
		}
	})
	describe("asking for missing file", () => {
		beforeEach(async () => {
			testData.response = await fetch("/non-existing-file", testData)
		})

		it("should return status 500", () => {
			expect(testData.response)
				.to.have.property("status", 500)
		})
		it("should log that the server reported an error")

		describe("then asking for existing file for missing file", () => {
			beforeEach(async () => {
				testData.response = await fetch("/file", testData)
			})
			it("should return the file", async () => {
				expect(await unwrap(testData.response).text())
					.to.equal("plain file\n")
			})
		})
	})
})}
})
