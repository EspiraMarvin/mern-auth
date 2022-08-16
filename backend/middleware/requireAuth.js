const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const requireAuth = async (req, res, next) => {
    
    // verify use is authenticated
    const { authorization } = req.headers

    // check if header has authorization key
    if(!authorization) return res.status(401).json({error: 'Authorization token required'})

    // eg 'Bearer sdhbkadsyvua8fsdfdfsfdsdfasdsdfsdgdfklsdf'
    // split string to get token - authorization.split(' ')[1] from the Bearer - authorization.split(' ')[0]

    const token = authorization.split(' ')[1]

    try {
      const {_id} = jwt.verify(token, process.env.SECRET)  // destructure id from the token
      
      req.user = await User.findOne({ _id }).select('_id') // find user by id and get the id
      next()

    } catch(error) {
        console.log('error', error)
        res.status(401).json({error: 'Request is not authorized'})
    }

}

module.exports = requireAuth