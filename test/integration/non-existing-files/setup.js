// @flow strict

const path = require("path")

/*::
import type { ServerSetup } from "../../../src/types"
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
		},
	],
	"catchAllFile": null,
	"globalHeaders": {
	},
}/*:ServerSetup*/)
