// @flow strict

const { describe, it, beforeEach } = require("mocha")
const { expect } = require("chai")
const parseEncodingHeader = require("../../src/parseEncodingHeader")

/*::
import type { Encoding } from "../../src/parseEncodingHeader"
*/

describe("unit/parseEncodingHeader.js", () => {
	let testData
	beforeEach(() => {
		testData = {
			actual: ([]/*: $ReadOnlyArray<Encoding>*/),
		}
	})

	describe("Calling with null", () => {
		beforeEach(() => {
			testData.actual = parseEncodingHeader(null)
		})
		it("should accept identity with weight 1", () => {
			expect(testData.actual)
				.to.deep.equal([
					{
						name: "identity",
						weight: 0.1,
					},
				])
		})
	})
	const tests = [
		{
			header: "",
			expected: [
				{
					name: "identity",
					weight: 0.1,
				},
			],
		},
		{
			header: "gzip",
			expected: [
				{
					name: "gzip",
					weight: 1,
				},
				{
					name: "identity",
					weight: 0.1,
				},
			],
		},
		{
			header: "gzip, deflate",
			expected: [
				{
					name: "deflate",
					weight: 1,
				},
				{
					name: "gzip",
					weight: 1,
				},
				{
					name: "identity",
					weight: 0.1,
				},
			],
		},
		{
			header: "identity;q=0, gzip, deflate;q=0.9",
			expected: [
				{
					name: "gzip",
					weight: 1,
				},
				{
					name: "deflate",
					weight: 0.9,
				},
			],
		},
		{
			header: "gzip; q=0, deflate;q=0.9, *;q=0",
			expected: [
				{
					name: "deflate",
					weight: 0.9,
				},
			],
		}
	]
	for(const test of tests) {
		describe(`Calling with "${test.header}"`, () => {
			beforeEach(() => {
				testData.actual = parseEncodingHeader(test.header)
			})
			it("should return the expected encodings", () => {
				expect(testData.actual)
					.to.deep.equal(test.expected)
			})
		})
	}
})
