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
module.exports.formatTime = formatTime
