require('dotenv').config()
const httpBuildQuery = require('http-build-query');
const getCompanyId = require('./getCompanyId');
const formatDate = require('./formatDate');
const fs2 = require('fs');
const logToFile = require('./logToFile');
const getTaskComments = require('./getTaskComments');
const { error } = require('console');
const createError = require('http-errors');
const date = formatDate(new Date())
// const logTime = '['+ new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ']'
// const logToFile = msg => fs2.appendFileSync(`data/${date}log.txt`, `${logTime} - ${msg}\n`);

let msg = ''

let skippedTasks = []
let successedTasks = []

function saveInFile(arr) {
    fs2.writeFileSync(`data/sputnik/successed/nextdata.json`, JSON.stringify(arr))
    }
module.exports = async function Render(jsonF) {
    await fetch(`${process.env.fullAddress}/api/nextdatas`)
        .then(res => res.json())
        .then(data => {
    
            skippedTasks = [...data.skipped]
            successedTasks = [...data.successed]
        })
        .catch(e => error(e.message))
    const json = await jsonF
    if(json['status'].code === 'opened' || json['status'].code === 'work' || json['status'].code === 'delayed' || json['status'].code === 'reaction') {
        
        // console.log(!skippedTasks.includes(json['id']))
        if(!skippedTasks.includes(json['id'])) {
            skippedTasks.push(json['id'])
        }
        saveInFile({skipped: skippedTasks, successed: successedTasks})
        logToFile(`[LOG] Заявка не является завершенной (OkDesk ID: ${json['id']}) Пропуск...`, false, undefined, true)
        createError(404, `[LOG] Заявка не является завершенной (OkDesk ID: ${json['id']}) Пропуск...`) 
        return {skipped: skippedTasks, successed: successedTasks}
    } else {
        let index = skippedTasks.indexOf(json['id'])
        delete skippedTasks[index]
    } if (json['id'] <= 1024 || successedTasks.find((e) => e === json['id'])) {
         logToFile(`Заявка уже была ранее выгружена. (OkDesk ID: ${json['id']})`, true)
        //  delete skippedTasks[json['id']]
         saveInFile({skipped: skippedTasks, successed: successedTasks})
        return {skipped: skippedTasks, successed: successedTasks}
    } if (typeof json.errors === 'object') {
        logToFile(`${json.errors}`, true, `data/sputnik/logs/${formatDate(new Date())}.log`, true)
        saveInFile({skipped: skippedTasks, successed: successedTasks})
        return {skipped: skippedTasks, successed: successedTasks}
    } 
    if(skippedTasks.includes(null)) {
        let index = skippedTasks.indexOf(null)
        delete skippedTasks[index]
        return {skipped: skippedTasks, successed: successedTasks}
    }
    const params = {"key": process.env.SPUTNIK_API,"username": process.env.SPUTNIK_username,"password": process.env.SPUTNIK_password,"action": "insert",
        "entity_id": process.env.taskentityID, /// ID Сущности "Заявки"
        "items": {}}
    const timeParams = {"key": process.env.SPUTNIK_API,"username": process.env.SPUTNIK_username,"password": process.env.SPUTNIK_password,"action": "insert",
        "entity_id": process.env.timeentityID, /// ID Сущности "Время"
        "items": {"field_939": 15}}
    const getIt = await getCompanyId()

    if (json['company_id'] !== null && json['company_id'] !== undefined) {
        Object.keys(json).map((key) => {
            switch (key) {
                case 'company_id':  params.items.parent_item_id = getIt[`${json[key]}`]
                    break
                case 'title': params.items.field_751 = `OKID: ${json['id']}, ` +  json[key] 
                    break
                case 'description': params.items.field_754 = json[key] + `\n\n Заявка перенесена с OkDesk. [ID: ${json['id']}]`
                    break
                case 'created_at': params.items.date_added = json[key]; params.items.field_1004 = json[key]
                    break
                case 'updated_at': params.items.date_updated = json[key]
                    break
                case 'group_id': params.items.field_829 = 74
                    break
                case 'priority': params.items.field_918 = getObjValues(json[key],'priority')
                    break
                case 'status': params.items.field_784 = json['spent_time_total'] === 0 ? 343 : 344 // 
                    break
                case 'assignee': params.items.field_839 = getObjValues(json[key], 'worker');  timeParams.items.field_836 = getObjValues(json[key], 'worker')
                    break
                case 'completed_at': timeParams.items.field_842 = json[key]
                    break
                case 'spent_time_total': timeParams.items.field_837 = Math.round(json[key] * 60); 
                    break
                default: 
                    break     
            }
        })
        logToFile(`Сущность с ID: ${json['id']} обработана на сервере.`)
        logToFile(json['id'], false, `data/sputnik/successed/${formatDate(new Date())}.txt`)
        successedTasks.push(json['id'])
        startRender(params, timeParams)
        saveInFile({skipped: skippedTasks, successed: successedTasks})
        return {skipped: skippedTasks, successed: successedTasks}
    } else {
        logToFile(`Не найдено ID клиента (OkDesk ID: ${json['id']}) Пропуск...`, true)
        saveInFile({skipped: skippedTasks, successed: successedTasks})
        return {skipped: skippedTasks, successed: successedTasks}
        // new Error(`[Ошибка] Не найдено ID клиента (OkDesk ID: ${json['id']}) Пропуск...`)
    }
    async function startRender(p, tp) {
    
    fs2.writeFileSync(`data/sputnik/rendered/${date}_params.json`, JSON.stringify(p))
    fs2.writeFileSync(`data/sputnik/rendered/${date}_timeParams.json`, JSON.stringify(tp))
    // fs2.writeFileSync(`data/sputnik/rendered/${date}_timeParams.json`, JSON.stringify(cp))
    /////////////////////////////////////////////////////////////////
    //////////////////////  Создание заявки  ////////////////////////
    const taskID = await fetch(`https://${process.env.SPUTNIK_address}/api/rest.php?${httpBuildQuery(p)}`, {
        method: 'POST',
    })
        .then(response => response.json())
    // /////////////////////////////////////////////////////////////////
    tp.items.parent_item_id = await taskID.data.id
    ///////////////////////  Вставка времени  /////////////////////// 
    await fetch(`https://${process.env.SPUTNIK_address}/api/rest.php?${httpBuildQuery(tp)}`, {
        method: 'POST',
    })
        .then(response => response.json())
        .then(response => {
            logToFile(`Отправка данных в Спутник...`)
            logToFile(`task status: ${taskID.status}, task time status: ${response.status}`)
            logToFile(`SputnikTaskID: ${taskID.data.id}`)
        })
    /////////////////////////////////////////////////////////////////
    ///////////////////////  Вставка комментариев  /////////////////////// 
    // let comments = {}
    Object.keys(json).map(async key => {
        key === 'id'? data = getTaskComments(json[key])  : '';
    })
    const comments = await data
    for (ids in comments) {
        const cp = {"key": process.env.SPUTNIK_API,"username": process.env.SPUTNIK_username,"password": process.env.SPUTNIK_password,"action": "insert_comment",
        "entity_id": process.env.taskentityID, /// ID Сущности "Заявки"
        "item_id": await taskID.data.id,
        "comment_description": comments[ids].desc,
        "comment_fields": {
            "field_784": 344,
            "field_839": getObjValues(comments[ids], 'worker')
        }}
        const comFetch = await fetch(`https://${process.env.SPUTNIK_address}/api/rest.php?${httpBuildQuery(cp)}`)
            .then(response => response.json())
            .then(response => logToFile(`comment id: ${response.data.id}, task comment status: ${response.status}`))
            await comFetch
        }
        saveInFile({skipped: skippedTasks, successed: successedTasks})
        return {skipped: skippedTasks, successed: successedTasks}
    } 
}

function getObjValues(obj, who) {
    let number = 0
    if(who === 'priority') {
        switch(obj.code) {
            case 'low': number = 260
                break
            case 'normal': number = 259
                break
            case 'high': number = 258
                break
            default: null
                break
        }
        return number
    } else if (who === 'worker') {
        if(obj) {
            switch (obj.id) {
                case 7: number =  10       
                    break
                case 6: number =  11   
                    break
                case 9: number = 37
                    break
                case 1: number = 1
                    break 
                case null: number = 39
                    break
                default: number = 39
                    break
            }
            return number
        }
        return number
    }
}
