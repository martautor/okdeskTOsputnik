const {Router} = require('express')
const router = Router()

router.get('/start', async (req, res) => {
    try {
        
        res.status(200)
    } catch (e) {
        res.status(500).json({ message: 'Что-то пошло не так' })
    }
})

module.exports = router