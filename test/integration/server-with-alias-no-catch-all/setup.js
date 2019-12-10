// @flow strict

const path = require("path")

/*::
import type { ServerSetup } from "../../../src/server"
*/

module.exports = ({
	"aliases": [
		{ from: "/alias-to-index", to: "/index.html" },
		{ from: "/alias-to-nothing", to: "/foo" },
		{ from: "/alias-to-alias", to: "/alias-to-index" },
		{ from: "/file.js", to: "/index.html" },
	],
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
				"identity": 15,
				"deflate": null,
				"gzip": null,
				"brotli": null,
			},
			"headers": {},
		},
		{
			"path": "/index.html",
			"mime": "text/html",
			"statusCode": 200,
			"sizes": {
				"identity": 16,
				"gzip": null,
				"deflate": null,
				"brotli": null,
			},
			"headers": {},
		}
	],
	"catchAllFile": null
}/*:ServerSetup*/)
