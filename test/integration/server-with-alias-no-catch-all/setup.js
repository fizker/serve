// @flow strict

/*::
import type { ServerSetup } from "../../../index"
*/

module.exports = ({
	"aliases": [
		{ from: "/alias-to-index", to: "/index.html" },
		{ from: "/alias-to-nothing", to: "/foo" },
		{ from: "/alias-to-alias", to: "/alias-to-index" },
		{ from: "/file.js", to: "/index.html" },
	],
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
				"identity": 15,
				"deflate": null,
				"gzip": null,
				"brotli": null,
			},
			"headers": {},
			"envReplacements": {
			},
			"hash": "abc",
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
			"envReplacements": {
			},
			"hash": "abc",
		}
	],
	"catchAllFile": null,
	"globalHeaders": {
		"global-header": "is-set",
		"another-global-header": "foo",
	},
}/*:ServerSetup*/)
