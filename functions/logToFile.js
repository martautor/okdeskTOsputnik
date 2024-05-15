
const fs2 = require('fs')
const formatDate = require('./formatDate')
module.exports = function logToFile(msg, error = false) {
    const date = formatDate(new Date())
    const logTime = '['+ new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ']'
    fs2.appendFileSync(`data/sputnik/logs/${date}.log`, `${logTime} - ${msg}\n`)
    error === false ? console.log(msg) : console.error(msg)
}