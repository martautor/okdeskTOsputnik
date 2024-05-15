


require('dotenv').config();
module.exports = async function getData(id) {
    const data = await fetch(`https://${process.env.OKDESK_address}/api/v1/issues/${id}?api_token=${process.env.OKDESK_API}`)
        .then(response => response.json())
    return await data
}