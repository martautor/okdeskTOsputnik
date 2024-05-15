require('dotenv').config()
const httpBuildQuery = require('http-build-query');
const getCompanyId = require('./getCompanyId');
const formatDate = require('./formatDate');
const fs2 = require('fs');
const logToFile = require('./logToFile');

const date = formatDate(new Date())
// const logTime = '['+ new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ']'
// const logToFile = msg => fs2.appendFileSync(`data/${date}log.txt`, `${logTime} - ${msg}\n`);

let msg = ''

module.exports = async function Render(jsonF) {
    const json = await jsonF
    
    const params = {"key": process.env.SPUTNIK_API,"username": process.env.SPUTNIK_username,"password": process.env.SPUTNIK_password,"action": "insert",
        "entity_id": process.env.taskentityID, /// ID Сущности "Заявки"
        "items": {}}
    const timeParams = {"key": process.env.SPUTNIK_API,"username": process.env.SPUTNIK_username,"password": process.env.SPUTNIK_password,"action": "insert",
        "entity_id": process.env.timeentityID, /// ID Сущности "Время"
        "items": {"field_939": 15}}
    const getIt = await getCompanyId()
    if(json['id'] === undefined) {
        logToFile(`[Ошибка] Записи с данным OkDeskID не существует. Пропуск...`)
        return new Error('OkDesk ID is undefined.')
    } else if(json['company_id'] !== null && json['company_id'] !== undefined) {
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
              return params, timeParams   
        })
        logToFile(`Сущность с ID: ${json['id']} обработана на сервере.`)
        return startRender(params, timeParams)
    } else {
        return logToFile(`[Ошибка] Не найдено ID клиента (OkDesk ID: ${json['id']}) Пропуск...`)
    }
    async function startRender(p, tp) {
    
    fs2.writeFileSync(`data/sputnik/rendered/${date}_params.json`, JSON.stringify(p))
    fs2.writeFileSync(`data/sputnik/rendered/${date}_timeParams.json`, JSON.stringify(tp))
    /////////////////////////////////////////////////////////////////
    //////////////////////  Создание заявки  ////////////////////////
    const taskID = await fetch(`https://${process.env.SPUTNIK_address}/api/rest.php?${httpBuildQuery(p)}`, {
        method: 'POST',
    })
        .then(response => response.json())
    // /////////////////////////////////////////////////////////////////
    tp.items.parent_item_id = await taskID.data.id
    ///////////////////////  Вставка времени  /////////////////////// 
    return await fetch(`https://${process.env.SPUTNIK_address}/api/rest.php?${httpBuildQuery(tp)}`, {
        method: 'POST',
    })
        .then(response => response.json())
        .then(response => {
            logToFile(`Отправка данных в Спутник...`)
            logToFile(`task status: ${taskID.status}, task time status: ${response.status}`)
            logToFile(`SputnikTaskID: ${taskID.data.id}`)
        })
    /////////////////////////////////////////////////////////////////
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
                case null: number = null
                    break
                default: null
                    break
            }
            return number
        }
        return number
    }
}
