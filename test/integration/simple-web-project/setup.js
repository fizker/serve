// @flow strict

/*::
import type { ServerSetup } from "../../../index"
*/

module.exports = ({
	"aliases": [],
	"folders": {
		"identity": "files",
		"deflate": "deflate",
		"gzip": "gzip",
		"brotli": "brotli",
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
			"envReplacements": {
			},
			"hash": "abc",
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
			"envReplacements": {
			},
			"hash": "abc",
		},
		{
			"path": "/file with spaces.txt",
			"mime": "text/plain",
			"statusCode": 200,
			"sizes": {
				"identity": 5,
				"gzip": null,
				"deflate": null,
				"brotli": null,
			},
			"headers": {},
			"envReplacements": {
			},
			"hash": "abc",
		},
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
		"envReplacements": {
		},
		"hash": "abc",
	},
	"globalHeaders": {},
}/*:ServerSetup*/)
