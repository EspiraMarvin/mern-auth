const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema =  mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

// static signup method
userSchema.statics.signup = async function(email, password) {

    //validation
    if(!email || !password) throw Error('All fields must be filled')

    //check valid email
    if(!validator.isEmail(email))  throw Error('Email is not valid')

    // check pwd strong enough - Pwd should have atleast 8 characters, atleast one uppercase letter,one lowercase letter, one number and one special characters
    if(!validator.isStrongPassword(password)) throw Error('Password not strong enough')

    
    const exists = await this.findOne({ email }) // this keyword here refers to the model user. & this keyword only works with regular fns not arrow functions
    if (exists) {
        // we use throw error because we don't have access to the res object in requests here in this file
        throw Error('Email already in use')
    }

    // password hashing
    // bcrypt enables adding of a salt in pwds- a salt is a random string of numbers that's added to your password to add an extra layer of security
    // this means if 2 people use the same password, the salt for those 2 pwds will be different and also the resulting hash of the 2 pwds

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({email, password: hash})
    
    return user
}


// static login method
userSchema.statics.login = async function(email, password) {
    if(!email || !password) throw Error('All fields must be filled')

    if(!validator.isEmail(email))  throw Error('Email is not valid')

    const user = await this.findOne({ email }) 

    if (!user) {
        throw Error('Invalid login credentials')
    }

    // compare if password is same with hashed pwd in the db
    const match = await bcrypt.compare(password, user.password)
    
    if(!match) throw Error('Incorrect Password')

    return user
}


module.exports = mongoose.model('User', userSchema)