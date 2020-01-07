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
			"path": "/file",
			"mime": "text/plain",
			"statusCode": 200,
			"sizes": {
				"identity": 11,
				"deflate": null,
				"gzip": null,
				"brotli": null,
			},
			"headers": {
			},
			"envReplacements": {
			},
		},
		{
			"path": "/non-existing-file",
			"mime": "text/plain",
			"statusCode": 200,
			"sizes": {
				"identity": 11,
				"deflate": null,
				"gzip": null,
				"brotli": null,
			},
			"headers": {
			},
			"envReplacements": {
			},
		},
	],
	"catchAllFile": null,
	"globalHeaders": {
	},
}/*:ServerSetup*/)
