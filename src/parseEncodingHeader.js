// @flow strict

/*::
export type Encoding = {
	weight: number,
	name: "deflate"|"gzip"|"brotli"|"identity",
}
*/

const allEncodings = [
	"deflate", "gzip"
]

module.exports = function parseEncodingHeader(encodingHeader /*: ?string*/) /*: $ReadOnlyArray<Encoding>*/ {
	if(encodingHeader == null || encodingHeader === "") {
		return [ { name: "identity", weight: 0.1 } ]
	}

	let catchAll /*: ?number*/
	let ident /*: ?Encoding*/

	const rawEncodings = encodingHeader.split(",").map(x => x.trim())
	const encodings = rawEncodings
		.map(x => {
			const [ name, ...mods ] = x.split(";").map(x => x.trim())
			const weight = mods.map(mod => {
					const [ key, val ] = mod.split("=").map(x => x.trim())
					return { key, val }
				})
				.find(x => x.key === "q") || { key: "q", val: 1 }

			switch(name) {
			case "br":
				return {
					name: "brotli",
					weight: +weight.val,
				}
			case "deflate":
			case "gzip":
				return {
					name,
					weight: +weight.val,
				}
			case "identity":
				ident = {
					name,
					weight: +weight.val,
				}
				return null
			case "*":
				catchAll = +weight.val
				return null
			default:
				return null
			}
		})
		.filter(Boolean)

	const unusedEncodings = allEncodings.filter(x => encodings.find(y => y.name === x) == null)

	if(ident == null) {
		unusedEncodings.push("identity")
	} else {
		encodings.push(ident)
	}

	if(catchAll == null) {
		if(ident == null) {
			encodings.push({ name: "identity", weight: 0.1 })
		}
	} else {
		for(const name of unusedEncodings) {
			encodings.push({ name, weight: catchAll })
		}
	}

	return sortEncodings(encodings.filter(x => x.weight > 0))
}

function sortEncodings(enc/*: $ReadOnlyArray<Encoding>*/) /*: $ReadOnlyArray<Encoding>*/ {
	return enc.slice().sort((a, b) => {
		const w = a.weight - b.weight
		if(w === 0) {
			return a.name < b.name
				? -1
				: 1
		} else {
			return -w
		}
	})
}
