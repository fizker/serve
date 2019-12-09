// @flow strict

const path = require("path")

/*::
import type { ServerSetup } from "../../../src/server"
*/

module.exports = ({
	"aliases": [],
	"folders": {
		"identity": path.join(__dirname, "./", "files"),
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
				"identity": 36,
				"deflate": 20,
				"gzip": 32,
				"brotli": 15,
			},
			"headers": {},
		},
		{
			"path": "/uncompressable.txt",
			"mime": "text/plain",
			"statusCode": 200,
			"sizes": {
				"identity": 11,
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
			"identity": 89,
			"gzip": 81,
			"deflate": null,
			"brotli": null,
		},
		"headers": {},
	}
}/*:ServerSetup*/)
