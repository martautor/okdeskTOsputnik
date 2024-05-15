
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