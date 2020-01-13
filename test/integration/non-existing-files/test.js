// @flow strict

const { it, describe, beforeEach } = require("mocha")
const { expect, ...chai } = require("chai")
const fzkes = require("fzkes")

const { fetch, getHeaders, unwrap } = require("../fetch")
const server = require("../server")
const setup = require("./setup")

chai.use(fzkes)

/*::
import { Response, Headers } from "node-fetch"
*/

describe("integration/non-existing-files/test.js", () => {
for(const useHTTPS of [ false, true ]) { describe(useHTTPS ? "HTTPS" : "HTTP", () => {
	let testData
	beforeEach(async () => {
		const requestLog = fzkes.fake("requestLog")
		testData = {
			base: await server.start(__dirname, setup, useHTTPS, requestLog),
			encodings: [],
			response: (null /*:?Response*/),
			headers: (null /*:?{[string]: string, ...}*/),
			requestLog,
			requestLogPromise: new Promise((res) => requestLog.calls(res)),
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
		it("should log that the server reported an error", async () => {
			await testData.requestLogPromise
			expect(testData.requestLog).to.have.been.calledWith({
				statusCode: 500,
				path: "/non-existing-file",
			})
		})

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
