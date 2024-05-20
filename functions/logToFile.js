
const fs2 = require('fs')
const formatDate = require('./formatDate')
const createError = require('http-errors')
module.exports = function logToFile(msg, error = false, path = `data/sputnik/logs/${formatDate(new Date())}.log`) {
    const logTime = '['+ new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ']'
    // fs2.cre(`data/sputnik/logs/${date}_${logTime}.log`)
    
    if (error === true) {
        const errMsg = msg + ', пожалуйста исправьте ошибку'
        console.error(errMsg)
        fs2.appendFileSync(path, `${logTime} - ${errMsg}, пожалуйста исправьте ошибку.\n`)
        return errMsg
    } else {
        fs2.appendFileSync(path, `${logTime} - [Инфо] ${msg}\n`)
        console.log(msg)
        return msg
    }
} 