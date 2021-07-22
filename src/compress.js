// @flow strict

const zlib = require("zlib")
const util = require("util")

const brotli = util.promisify(zlib.brotliCompress)
const gzip = util.promisify(zlib.gzip)
const deflate = util.promisify(zlib.deflate)

module.exports = async function compress(
	type/*: "brotli"|"gzip"|"deflate"*/,
	identity/*: string*/,
) /*: Promise<Buffer> */ {
	switch(type) {
	case "brotli":
		return brotli(identity)
	case "gzip":
		return gzip(identity)
	case "deflate":
		return deflate(identity)
	default:
		throw new Error(`Unknown compressor type: ${type}`)
	}
}
