const User = require('../models/User');
const { statusCodes, StatusCodes } = require('http-status-codes');
const { BadRequestError,UnauthenticatedError  } = require('../errors');

const register = async (req,res) =>{

    const user = await User.create({...req.body});
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({user: {name:user.name},token});

};

const login = async (req,res) =>{
    const {email, password} = req.body;

    if(!email || !password){
        throw new BadRequestError('please provide email and password')
    }

    const user = await User.findOne({email});
    if(!user){
        throw new UnauthenticatedError('Invalid Credentials')
    }
    
    const isPasswordCorrenct = await user.comparePassword(password)
    if(!isPasswordCorrenct){
        throw new UnauthenticatedError('Invalid Credentials')
    }
    //compare passwortd
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({user:{name:user.name},token})

};

module.exports = {
    register,
    login
}