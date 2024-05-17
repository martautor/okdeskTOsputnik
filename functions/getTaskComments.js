
module.exports = async function getCompanyId(tid) {
    const data = {}
    await fetch(`https://${process.env.OKDESK_address}/api/v1/issues/${tid}/comments?api_token=${process.env.OKDESK_API}`)
        .then(response => response.json()) 
        .then(clist => Object.keys(clist).map(key => data[key] = {id: clist[key].author.id, desc: clist[key].content}))
    return data 
}