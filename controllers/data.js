
const getData = async (req, res) => {
    res.status(200).json({msg:'Good'})
}


const startRender = async (error,req, res) => {
    try {
        res.status(200).json({msg:'Good'})
    } catch (error) {
        res.status(500).json({msg: error.message})
    }
    
    
}


module.exports = {getData, startRender}