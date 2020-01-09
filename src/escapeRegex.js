// @flow strict

const matchOperatorsRegex = /[|\\{}()[\]^$+*?.-]/g

module.exports = function escapeRegex(string/*: string*/) /*: string*/ {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string')
	}

	return string.replace(matchOperatorsRegex, '\\$&')
}
