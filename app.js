// const config = require('config')
require('dotenv').config()
const getData = require('./functions/getData')
const Render = require('./functions/render')
const createError = require('http-errors')
const fs1 = require('fs/promises')
const fs2 = require('fs')
const {constants} = require('fs')
const logToFile = require('./functions/logToFile')
const cron = require('node-cron');
const express = require('express')
const app = express()
const path = require('path');
const datas_routes = require('./routes/data')
const cors = require("cors");
const { error } = require('console')

let nextData = undefined

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

app.get('/api/test', async (req, res) => {
    res.json({
        message: 'Готов',
        clr: 'gray'
    })
})

app.use('/api/test', datas_routes)
app.post('/api/start', async (req, res, next) => {
    const params = req.query
    let msg = '[Ошибка] '
    if(parseInt(params.firstId) > parseInt(params.lastId)) {
        msg += 'Первое число не может быть больше второго.'
        
        res.json({
            message: msg,
            color: 'red'
        })
    } else {
        try {
            console.log(parseInt(params.firstId), parseInt(params.lastId))
            await start(parseInt(params.firstId), parseInt(params.lastId))
            res.status(200)
            res.json({
                message: 'Данные переданы на сервер.',
                color: 'green',
            })
        } catch (e) {
            res.status(500)
            res.json({
                message: e.message,
                color: 'red',
                requestBody: [params]
            })
        }
    }
})
app.use("/api/start", datas_routes)
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        message: error.message
    })
})
async function start(firstID, lastID) {

    async function active(bool = true) {
        
        const data = []
        
        for (let i = firstID; i < lastID+1; i++) {
            errorHandler = await getData(i)
            if(errorHandler.errors !== undefined) {
                logToFile(errorHandler.errors, true)
                throw createError(400, '[Ошибка] ' + errorHandler.errors)
            }
            if(bool === false) {
                data.push(await getData(i))
                const jsonData = JSON.stringify(data)
                fs2.writeFileSync(`data/okdesk/${firstID}-${lastID}data.json`, jsonData)
            }
            await Render(await getData(i))
                .then(data => { 
                if (data === undefined) throw createError(404, 'data is undefined');
                nextData = data
                })
                .catch(e => {logToFile(e.message); throw createError(404, e.message)})
        }
    }    
    logToFile(process.env.config)
    /////Проверка наличия файла, если файл есть - то ничего не делаем
    let status = ''
    await fs1.access(`data/okdesk/${firstID}-${lastID}data.json`, constants.F_OK).then(async (d) => {
        logToFile(`[OkDesk] Файл: '${firstID}-${lastID}data.json' - уже существует в 'data/okdesk'`)  
        await active(true)

    }).catch(async (e) => {
        await active(false) 
    })
    
    return status
}

app.get('/api/nextdata', async (req, res) => {
    res.json(nextData)
})

app.use('/api/successIds', datas_routes)

// cron.schedule('* * * * *', async function() {
//     let fids = nextData.skipped
//     let lids = nextData.successed.at(-1)
//     console.log(fids, lids+10)
//     for (id in fids) {
//         await start(fids[id], fids[id])
//         .catch(e => {throw createError(400, e.message)})
//     }
//     for (id in fids) {
//         await start(lids+1, lids+6)
//         .catch(e => {throw createError(400, e.message)})

//     }
// });

const jsonFilePath = path.join(__dirname, 'data/sputnik/successed/nextdata.json')

app.get('/api/nextdatas', (req, res) => {
    res.sendFile(jsonFilePath)
})

cron.schedule('* * * * *', async function() {
    let fids = nextData.skipped
    let lids = nextData.successed.at(-1)
    if(lids === undefined || fids === undefined)
    {
        await fetch(`${process.env.fullAddress}/api/nextdatas`)
        .then(res => res.json())
        .then(data => {
            lids = [...data.skipped]
            lids = data.successed.at(-1)
        })
        .catch(e => error(e.message))
    } 
    logToFile('Начало автоматической выгрузки данных')

    await start(lids+1, lids+6)
    for (id in fids) {
        await start(fids[id], fids[id])
        // .catch(e => {throw createError(400, e.message)})
    }
});