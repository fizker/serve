// @flow strict

const { describe, it, beforeEach } = require("mocha")
const { expect } = require("chai")

const assertServerSetup = require("../../src/assertServerSetup")

/*::
import type { ServerSetup, JSONObject } from "../../index"
*/

describe("unit/assertServerSetup.js", () => {
	describe("invalid input", () => {
		const tests/*: Array<{ description: string, input: JSONObject }> */ = [
			{
				description: "empty object",
				input: {
				},
			},
			{
				description: "missing folders",
				input: {
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "folders as string",
				input: {
					folders: "",
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "folders as number",
				input: {
					folders: 0,
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "folders as false",
				input: {
					folders: false,
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "folders as array",
				input: {
					folders: [],
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "folders as null",
				input: {
					folders: null,
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "file path not starting with /",
				input: {
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "catch-all file path not starting with /",
				input: {
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					catchAllFile: {
						path: "min-file",
						mime: "text/plain",
						sizes: {
							identity: 123,
						},
						statusCode: 200,
					},
				},
			},
			{
				description: "file status code is 0",
				input: {
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 0,
						},
					],
				},
			},
			{
				description: "catch-all status code is 0",
				input: {
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					catchAllFile: {
						path: "/min-file",
						mime: "text/plain",
						sizes: {
							identity: 123,
						},
						statusCode: 0,
					},
				},
			},
			{
				description: "file mime type is empty",
				input: {
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "catch-all mime type is empty",
				input: {
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					catchAllFile: {
						path: "/min-file",
						mime: "",
						sizes: {
							identity: 123,
						},
						statusCode: 200,
					},
				},
			},
			{
				description: "neither file nor catch-all",
				input: {
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
				},
			},
			{
				description: "alias as false",
				input: {
					aliases: false,
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "alias as number",
				input: {
					aliases: 0,
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "alias as string",
				input: {
					aliases: "",
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "alias missing from",
				input: {
					aliases: [
						{ to: "/abc" },
					],
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "alias missing to",
				input: {
					aliases: [
						{ from: "/abc" },
					],
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "globalHeaders as string",
				input: {
					globalHeaders: "",
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "globalHeaders as number",
				input: {
					globalHeaders: 0,
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							headers: {},
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "globalHeaders as false",
				input: {
					globalHeaders: false,
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "globalHeaders as array",
				input: {
					globalHeaders: [],
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "globalHeaders with number",
				input: {
					globalHeaders: {
						"abc": 0,
					},
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "globalHeaders with null",
				input: {
					globalHeaders: {
						"abc": null,
					},
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "globalHeaders with false",
				input: {
					globalHeaders: {
						"abc": false,
					},
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "globalHeaders with array",
				input: {
					globalHeaders: {
						"abc": [],
					},
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
			{
				description: "globalHeaders with object",
				input: {
					globalHeaders: {
						"abc": {},
					},
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
			},
		]

		for(const test of tests) {
			describe(test.description, () => {
				it("should throw", () => {
					expect(() => assertServerSetup(test.input))
						.to.throw()
				})
			})
		}
	})

	describe("valid input", () => {
		const tests/*: $ReadOnlyArray<{ description: string, input: JSONObject, expected: ServerSetup }>*/ = [
			{
				description: "minimum with file",
				input: {
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
				expected: {
					aliases: [],
					globalHeaders: {},
					files: [
						{
							path: "/min-file",
							headers: {},
							mime: "text/plain",
							sizes: {
								identity: 123,
								brotli: null,
								deflate: null,
								gzip: null,
							},
							statusCode: 200,
						},
					],
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					catchAllFile: null,
				},
			},
			{
				description: "minimum with catch-all",
				input: {
					aliases: null,
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					globalHeaders: null,
					files: [],
					catchAllFile: {
						path: "/min-file",
						mime: "text/plain",
						sizes: {
							identity: 123,
						},
						statusCode: 200,
					},
				},
				expected: {
					aliases: [],
					globalHeaders: {},
					files: [],
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					catchAllFile: {
						path: "/min-file",
						headers: {},
						mime: "text/plain",
						sizes: {
							identity: 123,
							brotli: null,
							deflate: null,
							gzip: null,
						},
						statusCode: 200,
					},
				},
			},
			{
				description: "has files",
				input: {
					aliases: [],
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					files: [
						{
							path: "/min-file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
						{
							path: "/some-headers",
							headers: {
								"abc": "123",
								"def": "",
							},
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
						{
							path: "/compressed",
							headers: {},
							mime: "text/plain",
							sizes: {
								identity: 123,
								brotli: 321,
								deflate: 432,
								gzip: 12,
							},
							statusCode: 201,
						},
					],
				},
				expected: {
					aliases: [],
					globalHeaders: {},
					files: [
						{
							path: "/min-file",
							headers: {},
							mime: "text/plain",
							sizes: {
								identity: 123,
								brotli: null,
								deflate: null,
								gzip: null,
							},
							statusCode: 200,
						},
						{
							path: "/some-headers",
							headers: {
								"abc": "123",
								"def": "",
							},
							mime: "text/plain",
							sizes: {
								identity: 123,
								brotli: null,
								deflate: null,
								gzip: null,
							},
							statusCode: 200,
						},
						{
							path: "/compressed",
							headers: {},
							mime: "text/plain",
							sizes: {
								identity: 123,
								brotli: 321,
								deflate: 432,
								gzip: 12,
							},
							statusCode: 201,
						},
					],
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					catchAllFile: null,
				},
			},
			{
				description: "aliases and global headers",
				input: {
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					aliases: [
						{ from: "/foo", to: "/bar" },
						{ from: "/bar", to: "/file" },
					],
					globalHeaders: {
						"foo": "123",
						"bar": "",
					},
					files: [
						{
							path: "/file",
							mime: "text/plain",
							sizes: {
								identity: 123,
							},
							statusCode: 200,
						},
					],
				},
				expected: {
					aliases: [
						{ from: "/foo", to: "/bar" },
						{ from: "/bar", to: "/file" },
					],
					globalHeaders: {
						"foo": "123",
						"bar": "",
					},
					files: [
						{
							path: "/file",
							headers: {},
							mime: "text/plain",
							sizes: {
								identity: 123,
								brotli: null,
								deflate: null,
								gzip: null,
							},
							statusCode: 200,
						},
					],
					folders: {
						identity: "identFolder",
						brotli: "brFolder",
						gzip: "gzipFolder",
						deflate: "deflateFolder",
					},
					catchAllFile: null,
				},
			},
		]

		for(const test of tests) {
			describe(test.description, () => {
				it("should return the expected object", () => {
					expect(assertServerSetup(test.input))
						.to.deep.equal(test.expected)
				})
			})
		}
	})
})
