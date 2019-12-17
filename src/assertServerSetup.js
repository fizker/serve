// @flow strict

/*::
import type { Alias, Headers, File, ServerSetup, JSONObject } from "./types"
*/

module.exports = assertServerSetup
function assertServerSetup(input/*: JSONObject*/) /*: ServerSetup*/ {
	const { aliases, folders, files, catchAllFile, globalHeaders } = input

	if(folders == null || typeof folders !== "object" || Array.isArray(folders)) {
		throw new Error("Folders are required")
	}

	const output = {
		aliases: assertAliases(aliases),
		folders: {
			identity: assertString(folders.identity, "identity folder"),
			deflate: assertString(folders.deflate, "deflate folder"),
			gzip: assertString(folders.gzip, "gzip folder"),
			brotli: assertString(folders.brotli, "brotli folder"),
		},
		files: assertFiles(files),
		globalHeaders: assertHeaders(globalHeaders),
		catchAllFile: catchAllFile == null ? null : assertFile(catchAllFile),
	}

	if(output.files.length === 0 && output.catchAllFile == null) {
		throw new Error("Setup must contain at least one file")
	}

	return output
}

function assertFile(val/*: mixed*/) /*: File*/ {
	if(val == null || typeof val !== "object") {
		throw new Error("File must be object")
	}

	const { path, mime, statusCode, headers, sizes } = val

	const p = assertString(path, "path")
	if(p[0] !== "/") {
		throw new Error("File paths must start with a `/`")
	}

	if(sizes == null || typeof sizes !== "object" || Array.isArray(sizes)) {
		throw new Error
	}

	const m = assertString(mime, "mime")
	if(m === "") {
		throw new Error("mime must have a value")
	}

	const s = assertInt(statusCode, "statusCode")
	if(s <= 0) {
		throw new Error("statusCode must be a valid status code")
	}

	return {
		path: p,
		mime: m,
		statusCode: s,
		headers: assertHeaders(headers),
		sizes: {
			identity: assertInt(sizes.identity, "sizes.identity"),
			brotli: assertIntOrNull(sizes.brotli, "sizes.brotli"),
			gzip: assertIntOrNull(sizes.gzip, "sizes.gzip"),
			deflate: assertIntOrNull(sizes.deflate, "sizes.deflate"),
		},
	}
}

function assertFiles(val/*: mixed*/) /*: $ReadOnlyArray<File>*/ {
	if(val == null) {
		return []
	}

	if(typeof val !== "object" || !Array.isArray(val)) {
		throw new Error("Files must be a list of file objects")
	}

	return val.map(assertFile)
}

function assertHeaders(val/*: mixed*/) /*: Headers*/ {
	if(val == null) {
		return {}
	}

	if(typeof val !== "object" || Array.isArray(val)) {
		throw new Error("Headers must be a string-string dictionary")
	}

	return Object.keys(val).reduce((o, key) => {
		const v = val[key]
		if(typeof v !== "string") {
			throw new Error("Headers must be a string-string dictionary")
		}

		o[key] = v
		return o
	}, {})
}

function assertAliases(val/*: mixed*/) /*: $ReadOnlyArray<Alias>*/ {
	if(val == null) {
		return []
	}

	if(!Array.isArray(val)) {
		throw new Error("Aliases must be an array")
	}

	return val.map(x => {
		if(x == null || typeof x !== "object" || Array.isArray(x)) {
			throw new Error("Alias objects must contain to and from strings")
		}

		const { to, from } = x

		if(typeof to !== "string" || typeof from !== "string") {
			throw new Error("Alias objects must contain to and from strings")
		}

		return { to, from }
	})
}

function assertInt(val/*: mixed*/, message/*: string*/) /*: number*/ {
	if(typeof val === "number" && val === Math.floor(val)) {
		return val
	}

	throw new Error(`${message} must be an integer`)
}

function assertIntOrNull(val/*: mixed*/, message/*: string*/) /*: number|null*/ {
	if(val == null) {
		return null
	}

	return assertInt(val, message)
}

function assertString(val/*: mixed*/, message/*: string*/) /*: string*/ {
	if(typeof val === "string") {
		return val
	}

	throw new Error(`${message} must be string`)
}
