// @flow strict

/*::
import type { Server as http$Server, ServerResponse } from "http"

export type File = {
	path: string,
	mime: string,
	sizes: {
		uncompressed: number,
		deflate: ?number,
		gzip: ?number,
		brotli: ?number,
	},
	statusCode: number,
	headers: {
		[string]: string,
	}
}

export type ServerSetup = {
	aliases: $ReadOnlyArray<{
		from: string,
		to: string,
	}>,
	folders: {
		uncompressed: string,
		deflate: string,
		gzip: string,
		brotli: string,
	},
	files: $ReadOnlyArray<File>,
	catchAllFile: ?File,
}
*/

module.exports = class Server {
	#setup/*: ServerSetup*/
	#server/*: http$Server */

	constructor(setup/*: ServerSetup*/) {
	}

	async listen(port/*: number*/) /*: Promise<void>*/ {
	}
	async close() /*: Promise<void>*/ {
	}
}
