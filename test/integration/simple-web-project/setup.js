// @flow strict
/*::
import type { ServerSetup } from "../../../src/server"
*/

module.exports = ({
	"aliases": [],
	"folders": {
		"uncompressed": "files",
		"deflate": "deflate",
		"gzip": "gzip",
		"brotli": "brotli",
	},
	"files": [
		{
			"path": "file.js",
			"mime": "application/javascript",
			"statusCode": 200,
			"sizes": {
				"uncompressed": 10,
				"deflate": 9,
				"gzip": 6,
				"brotli": null,
			},
			"headers": {},
		},
		{
			"path": "uncompressable.txt",
			"mime": "text/plain",
			"statusCode": 200,
			"sizes": {
				"uncompressed": 11,
				"gzip": 27,
				"deflate": null,
				"brotli": null,
			},
			"headers": {},
		}
	],
	"catchAllFile": {
		"path": "catchall.html",
		"mime": "text/html",
		"statusCode": 200,
		"sizes": {
			"uncompressed": 40,
			"gzip": 31,
			"deflate": null,
			"brotli": null,
		},
		"headers": {},
	}
}/*:ServerSetup*/)
