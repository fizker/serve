// @flow strict

const { describe, it, beforeEach } = require("mocha")
const { expect } = require("chai")
const { formatParams } = require("../../src/requestLog")

/*::
import type { RequestLogParameters } from "../../src/requestLog"
*/

describe("unit/requestLog.formatString.js", () => {
	let testData
	beforeEach(() => {
		testData = {
		}
	})

	const tests/*: Array<{ description: string, input: RequestLogParameters, expected: string }>*/ = [
		{
			description: "IPv4, only mandatory fields",
			input: {
				ip: "1.2.3.4",
				httpUser: null,
				requestTime: new Date("2019-12-31T12:40:15.05Z"),
				responseTime: new Date("2019-12-31T12:40:15.100Z"),
				httpMethod: "GET",
				path: "/abc",
				queryString: null,
				protocol: "HTTP/1.2",
				statusCode: 200,
				responseSize: null,
				referer: null,
				userAgent: "UA",
			},
			expected: `1.2.3.4 - - [31/Dec/2019:12:40:15 +0000] "GET /abc HTTP/1.2" 200 - - "UA" - [50 ms]`,
		},
		{
			description: "IPv4, all fields",
			input: {
				ip: "1.2.3.4",
				httpUser: "frank",
				requestTime: new Date("2019-12-31T12:40:15.05Z"),
				responseTime: new Date("2019-12-31T12:40:15.100Z"),
				httpMethod: "GET",
				path: "/abc with spaces",
				queryString: "?foo",
				protocol: "HTTP/1.2",
				statusCode: 200,
				responseSize: 1234,
				referer: "http://foo",
				userAgent: "UA",
			},
			expected: `1.2.3.4 - frank [31/Dec/2019:12:40:15 +0000] "GET /abc%20with%20spaces?foo HTTP/1.2" 200 1234 "http://foo" "UA" - [50 ms]`,
		},
	]
	for(const test of tests) {
		describe(test.description, () => {
			it("should create the log line", () => {
				const actual = formatParams(test.input)
				expect(actual).to.equal(test.expected)
			})
		})
	}
})
