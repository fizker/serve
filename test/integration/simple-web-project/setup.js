// @flow strict

const path = require("path")

/*::
import type { ServerSetup } from "../../../src/server"
*/

module.exports = ({
	"aliases": [],
	"folders": {
		"uncompressed": path.join(__dirname, "./", "files"),
		"deflate": path.join(__dirname, "./", "deflate"),
		"gzip": path.join(__dirname, "./", "gzip"),
		"brotli": path.join(__dirname, "./", "brotli"),
	},
	"files": [
		{
			"path": "/file.js",
			"mime": "application/javascript",
			"statusCode": 200,
			"sizes": {
				"uncompressed": 36,
				"deflate": 35,
				"gzip": 32,
				"brotli": null,
			},
			"headers": {},
		},
		{
			"path": "/uncompressable.txt",
			"mime": "text/plain",
			"statusCode": 200,
			"sizes": {
				"uncompressed": 11,
				"gzip": 31,
				"deflate": 19,
				"brotli": null,
			},
			"headers": {},
		}
	],
	"catchAllFile": {
		"path": "/catchall.html",
		"mime": "text/html",
		"statusCode": 200,
		"sizes": {
			"uncompressed": 89,
			"gzip": 81,
			"deflate": null,
			"brotli": null,
		},
		"headers": {},
	}
}/*:ServerSetup*/)
