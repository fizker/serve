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
			"path": "/index.html",
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
				"Some content": "ENV_VAR",
			},
			"hash": "abc",
		},
		{
			"path": "/regex-chars.html",
			"mime": "text/html",
			"statusCode": 200,
			"sizes": {
				"identity": 54,
				"gzip": null,
				"deflate": null,
				"brotli": null,
			},
			"headers": {},
			"envReplacements": {
				"${regex key}": "ENV_VAR",
			},
			"hash": "abc",
		},
	],
	"catchAllFile": {
		"path": "/index.html",
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
			"Some content": "ENV_VAR",
		},
		"hash": "abc",
	},
	"globalHeaders": {},
}/*:ServerSetup*/)
