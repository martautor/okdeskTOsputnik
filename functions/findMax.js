const logToFile = require('./logToFile');
module.exports = function findMax(arr) {
    if (!Array.isArray(arr)) {
        return logToFile('[FindMaxFunc] Введенные данные не являются массивом', true)
    }
    
    if (arr.length === 0) {
        return logToFile('[FindMaxFunc] Массив пустой', true)
    }
  
    let hasNumber = false
    let maxNum = -Infinity
  
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] === 'number') {
        hasNumber = true
        if (arr[i] > maxNum) {
          maxNum = arr[i]
        }
      }
    }
  
    if (!hasNumber) {
        return logToFile('[FindMaxFunc] Данные в массиве не являются числами', true)
    }
  
    return maxNum;
  }