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
						weight: 1,
					},
				])
		})
	})
	const tests = [
		{
			header: "",
			description: "empty header",
			expected: [
				{
					name: "identity",
					weight: 1,
				},
			],
		},
		{
			header: "gzip",
			description: "single enc without quality",
			expected: [
				{
					name: "gzip",
					weight: 1,
				},
				{
					name: "identity",
					weight: 1,
				},
			],
		},
		{
			header: "gzip, deflate",
			description: "double enc without quality",
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
					weight: 1,
				},
			],
		},
		{
			header: "gzip, deflate;Q=0.9",
			description: "Uppercase quality",
			expected: [
				{
					name: "gzip",
					weight: 1,
				},
				{
					name: "identity",
					weight: 1,
				},
				{
					name: "deflate",
					weight: 0.9,
				},
			],
		},
		{
			header: "gzip, deflate;q=0.9",
			description: "1 enc with, 1 enc without quality",
			expected: [
				{
					name: "gzip",
					weight: 1,
				},
				{
					name: "identity",
					weight: 1,
				},
				{
					name: "deflate",
					weight: 0.9,
				},
			],
		},
		{
			header: "gzip; q=0.8, deflate;q=0.9",
			description: "highest quality below one, identity should match",
			expected: [
				{
					name: "deflate",
					weight: 0.9,
				},
				{
					name: "identity",
					weight: 0.9,
				},
				{
					name: "gzip",
					weight: 0.8,
				},
			],
		},
		{
			header: "identity;q=0, gzip, deflate;q=0.9",
			description: "identity is denied",
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
			header: "gzip, *;q=0.8",
			description: "catch-all have quality",
			expected: [
				{
					name: "gzip",
					weight: 1,
				},
				{
					name: "brotli",
					weight: 0.8,
				},
				{
					name: "deflate",
					weight: 0.8,
				},
				{
					name: "identity",
					weight: 0.8,
				},
			],
		},
		{
			header: "gzip; q=0, deflate;q=0.9, *;q=0",
			description: "catch-all is denied",
			expected: [
				{
					name: "deflate",
					weight: 0.9,
				},
			],
		},
	]
	for(const test of tests) {
		describe(`Calling with "${test.header}", ${test.description}`, () => {
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
