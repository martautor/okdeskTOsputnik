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

const skippedTasks = []
const successedTasks = [1025,1027,1028,1029,1030,1031,1032,1033,1034,1035,1037,
                        1038,1039,1040,1041,1042,1044,1045,1047,1048,1049,1050,
                        1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1062,
                        1063,1064,1065,1066,1067,1068,1069,1070,1071,1072,1073,
                        1074,1075,1076,1077,1078,1079,1080,1081,1082,1083,1084,
                        1085,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,
                        1097,1098,1099,1100,1101,1102,1103,1104,1105,1106,1107,
                        1108,1109,1110,1111,1112,1113,1114,1115,1116,1117,1118,
                        1119,1120,1121,1122,1123,1124,1125,1126,1127,1128,1129,
                        1130,1132,1133,1134,1135,1137,1138,1139,1140,1141,1142,
                        1143,1144,1145,1146,1147,1148,1149,1151,1153,1155,1156,
                        1157,1159,1160,1161,1162,1163,1164,1165,1166,1167,1168,
                        1169,1170,1171,1172,1173,1174,1175,1176,1179,1180,1181,
                        1182,1183,1184,1185,1186,1188,1189,1190,1192,1194,1195]
module.exports = async function Render(jsonF) {
    const json = await jsonF
    if(json['status'].code === 'opened' || json['status'].code === 'work') {
        logToFile(`[LOG] Заявка не является завершенной (OkDesk ID: ${json['id']}) Пропуск...`, true)
        console.log(!skippedTasks.includes(json['id']))
        if(!skippedTasks.includes(json['id'])) {
            skippedTasks.push(json['id'])
        }
        return {skipped: skippedTasks, successed: successedTasks}
    } else {
        let index = skippedTasks.indexOf(json['id'])
        delete skippedTasks[index]
    } if (json['id'] <= 1024 || successedTasks.find((e) => e === json['id'])) {
         logToFile(`Заявка уже была ранее выгружена. (OkDesk ID: ${json['id']})`, true)
         return {skipped: skippedTasks, successed: successedTasks}
    } if (typeof json.errors === 'object') {
        logToFile(`${json.errors}`, true, `data/sputnik/logs/${formatDate(new Date())}.log`, true)
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
        return {skipped: skippedTasks, successed: successedTasks}
    } else {
        logToFile(`Не найдено ID клиента (OkDesk ID: ${json['id']}) Пропуск...`, true)
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
