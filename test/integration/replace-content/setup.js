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
	},
	"globalHeaders": {},
}/*:ServerSetup*/)
