// @flow strict

/*::
export type RequestLogParameters = {
	ip: string,
	httpUser: ?string,
	requestTime: Date,
	responseTime?: Date,
	httpMethod: string,
	path: string,
	queryString: ?string,
	protocol: string,
	statusCode: number,
	responseSize: ?number,
	referer: ?string,
	userAgent: string,
}
*/

module.exports = function requestLog(params/*: RequestLogParameters*/) {
	console.log(formatParams(params))
}

function formatParams({
	ip,
	httpUser,
	requestTime,
	responseTime = new Date,
	httpMethod,
	path,
	queryString,
	protocol,
	statusCode,
	responseSize,
	referer,
	userAgent,
}/*: RequestLogParameters*/) /*: string*/ {
	const log = [
		// Converting from IPv6 variant of IPv4 to pure IPv4
		ip.replace(/^::ffff:((\d+\.){3}\d+)$/, "$1"),
		"-",
		httpUser || "" || "-",
		formatTime(requestTime),
		`"${httpMethod} ${encodeURI(path)}${queryString || ""} ${protocol}"`,
		statusCode.toString(),
		responseSize == null ? "-" : responseSize.toString(),
		referer == null ? "-" : `"${referer}"`,
		userAgent == null ? "-" : `"${userAgent}"`,
		"-", // accepts header
		`[${responseTime - requestTime} ms]`,
	]
	return log.join(" ")
}

function formatTime(time/*: Date*/) /*: string*/ {
	// [day/month/year:hour:minute:second zone]
	return `[${padNumber(time.getUTCDate(), 2)}/${getMonthName(time.getUTCMonth())}/${padNumber(time.getUTCFullYear(), 4)}:${padNumber(time.getUTCHours(), 2)}:${padNumber(time.getUTCMinutes(), 2)}:${padNumber(time.getUTCSeconds(), 2)} +0000]`
}

function padNumber(number/*:number*/, digits/*: 2|4*/ = 2) /*: string*/ {
	return `000${number}`.slice(-digits)
}

const months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
function getMonthName(month/*: number*/) /*: string*/ {
	return months[month] || "Jan"
}

// Exposed for testing
module.exports.formatParams = formatParams
module.exports.formatTime = formatTime
