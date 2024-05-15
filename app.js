// const config = require('config')
require('dotenv').config()
const getData = require('./functions/getData')
const Render = require('./functions/render')

const fs1 = require('fs/promises')
const fs2 = require('fs')
const {constants} = require('fs')
const logToFile = require('./functions/logToFile')

const express = require('express')
const app = express()

const datas_routes = require('./routes/data')
const cors = require("cors");

app.use(cors());
app.get('/api/getdata', (req, res) => {
    // start()
    res.json({
        message: "Im a genius"
    })
})
app.use("/api/getdata", datas_routes)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server is started on PORT ${PORT}`)
})

app.post('/api/start', async (req, res) => {
    const params = req.query
    if(params.firstId > params.lastId) {
        return res.json({
            message: 'Первое число не может быть больше второго.'
        })
    } else {
        try {
            await start(params.firstId, parseInt(params.lastId))
                .then(data => console.log(data))
                .catch(e => console.error(e.message))
            res.json({
                message: 'Данные переданы на сервер.',
                requestBody: [params],
                log: `${params}: Данные переданы на сервер.`
            })
        } catch (e) {
            e => e.message
            res.json({
                message: 'Ошибка, проверьте локальные логи.',
                requestBody: [params],
                log: `${params}: ${e.message}`
            })
        }
    }
})
app.use("/api/start", datas_routes)

async function start(firstID, lastID) {
    async function active(bool = false) {
        for (let i = firstID; i < lastID+1; i++) {
            if(bool === true) {
                return data.push(await getData(i))
            }
            return await Render(await getData(i))
                .then(data => data === undefined ? new Error('data is undefined') : data)      
        }
    }    
    logToFile(process.env.config)
    /////Проверка наличия файла, если файл есть - то ничего не делаем
    fs1.access(`data/okdesk/${firstID}-${lastID}data.json`, constants.F_OK).then(async (d) => {
        logToFile(`[OkDesk] Файл: '${firstID}-${lastID}data.json' - уже существует в 'data/okdesk'`)  
        return await active(d)
    }).catch(async () => {
        const data = [] 
        ///////Наполнение данных с запроса///////
        logToFile('Начало загрузки локальных данных.')
        const jsonData = JSON.stringify(data)
        logToFile('Начало обмена данными между OkDesk и Спутник.')
        /////////////Создание файла//////////////
        fs2.writeFileSync(`data/okdesk/${firstID}-${lastID}data.json`, jsonData)
        logToFile('Загрузка локальных данных закончена.')
        logToFile('Обмен данными между OkDesk и Спутник завершен.')
        return await active(false)
    })
}

// start(1024, 1034)



// const data = async () => { 
//     return await fetch('https://kassa26.okdesk.ru/api/v1/issues/1044?api_token=0f955aaaa73e9d6bf01d258d7b5bbb5eb5ffaa52', {
//         method: 'get',
//         // body: data,
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//         }
//     })
//         .then(response => response.json())
// }