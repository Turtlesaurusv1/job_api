const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserScheme = new mongoose.Schema({
    name:{
        type:String,
        require:[true,'please provide name'],
        minLength:3,
        maxLength:50
    },
    email:{
        type:String,
        require:[true,'please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
          ],
        unique: true
    },
    password:{
        type:String,
        require:[true,'please provide password'],
        minLength:6
    },
})


UserScheme.pre('save',async function(next){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password , salt);
    next();
})

UserScheme.methods.createJWT = function(){
    return jwt.sign({userId:this._id,name:this.name},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_LIFETIME
    })
}

UserScheme.methods.comparePassword = async function(pd){
   const isMatch = await bcrypt.compare(pd, this.password);
   return isMatch;
}

module.exports = mongoose.model('user',UserScheme);