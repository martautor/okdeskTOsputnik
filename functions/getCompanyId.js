

module.exports = async function getCompanyId(element = null) {
    let param = {}
    await fetch(`https://${process.env.OKDESK_address}/api/v1/companies/list?api_token=${process.env.OKDESK_API}`)
        .then(response => response.json()) 
        .then(response => Object.keys(response).map(key => {
            // keys[response[key].id] = response[key].name
            response[key].parameters[1].value !== '' ? param[response[key].id] = 
            parseInt(response[key].parameters[1].value) : ''
            // console.log(response[key].name)
        })) 
    
    
    if(element !== null) {
        const finded = find(key => param.id = key)
        return finded
    }
    return param
}


/*const logToFile = require('./logToFile');
module.exports = async function getCompanyId(element = null) {
    let param = {}
    await fetch(`https://${process.env.OKDESK_address}/api/v1/companies/list?api_token=${process.env.OKDESK_API}`)
        .then(response => response.json()) 
        .then(response => Object.keys(response).map(key => {
            // keys[response[key].id] = response[key].name
            response[key].parameters[1].value !== '' ? param[response[key].id] = 
            parseInt(response[key].parameters[1].value) : ''
            // console.log(response[key].name)
        })) 
    console.log(param) // общий массив
	console.log(element) // Ключ элемента
	
	if(element == null) {
		return params
	}
	if (param[element] === undefined) {
		throw new Error("Не найдено ID заявки!")
	} else {
		console.log("GET" + param[element]) // Найденное значение елемента
		return param[element]
	}
	return param[element]
}*/