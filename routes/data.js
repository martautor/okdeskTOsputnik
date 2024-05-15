const express = require('express')
const router = express.Router()

const {getData, startRender} = require('../controllers/data') 

router.route('/api/getdata').get(getData)
router.route('/api/start').get(startRender)

module.exports = router