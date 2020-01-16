// @flow strict

const path = require("path")

/*::
import type { ServerSetup } from "../../../index"
*/

module.exports = ({
	"aliases": [
		{ "from": "/alias", "to": "/file" },
	],
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
				"x-some-header": "foo",
				"another-file-header": "foo",
			},
			"envReplacements": {
			},
			"hash": "abc",
		},
		{
			"path": "/file-with-overlapping-header",
			"mime": "text/plain",
			"statusCode": 200,
			"sizes": {
				"identity": 11,
				"deflate": null,
				"gzip": null,
				"brotli": null,
			},
			"headers": {
				"x-shared-header": "overwritten value",
			},
			"envReplacements": {
			},
			"hash": "abc",
		},
	],
	"catchAllFile": {
		"path": "/catchall",
		"mime": "text/plain",
		"statusCode": 200,
		"sizes": {
			"identity": 14,
			"gzip": null,
			"deflate": null,
			"brotli": null,
		},
		"headers": {
			"x-header-for-catch-all": "is-set",
			"another-catchall-header": "foo",
		},
		"envReplacements": {
		},
		"hash": "abc",
	},
	"globalHeaders": {
		"x-shared-header": "global value",
		"another-global-header": "foo",
	},
}/*:ServerSetup*/)
