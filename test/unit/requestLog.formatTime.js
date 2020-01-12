// @flow strict

const { describe, it, beforeEach } = require("mocha")
const { expect } = require("chai")
const { formatTime } = require("../../src/requestLog")

/*::
import type { RequestLogParameters } from "../../src/requestLog"
*/

describe("unit/requestLog.formatTime.js", () => {
	let testData
	beforeEach(() => {
		testData = {
		}
	})

	const tests = [
		{
			input: "0019-03-02T02:04:05Z",
			expected: "[02/Mar/0019:02:04:05 +0000]",
		},
		{
			input: "2019-01-02T02:04:05Z",
			expected: "[02/Jan/2019:02:04:05 +0000]",
		},
		{
			input: "2019-01-02T02:04:05+02:00",
			expected: "[02/Jan/2019:00:04:05 +0000]",
		},
	]
	for(const test of tests) {
		describe(`Formatting ${test.input}`, () => {
			it("should format correctly", () => {
				const date = new Date(test.input)
				const actual = formatTime(date)
				expect(actual).to.equal(test.expected)
			})
		})
	}
})
