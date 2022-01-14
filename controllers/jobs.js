const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError,UnauthenticatedError,NotFoundError  } = require('../errors');

const getAllJob = async (req,res) =>{
    const jobs = await Job.find({createdBy:req.user.userId}).sort('createAt');
    res.status(StatusCodes.OK).json({jobs ,count:jobs.length});
}

const getJob = async (req,res) =>{
    const {user:{userId}, params:{id:jobId}} =  req;
    const job = await Job.findOne({
        _id:jobId,
        createdBy:userId
    })
    if(!job){
        throw new NotFoundError(`Not found the id`);
    }
    res.status(StatusCodes.OK).json({job})
}

const createJob = async (req,res) =>{
    req.body.createdBy = req.user.userId;
    const job = await Job.create(req.body);
    res.status(StatusCodes.CREATED).json({job});
}

const updateJob = async (req,res) =>{
    const {
        user:{userId}, 
        params:{id:jobId},
        body:{company,position}
    } =  req;

    if(company === '' || position === ''){
        throw new BadRequestError('Company or position cant be empty')
    }
    const job = await Job.findByIdAndUpdate(
        {_id:jobId,createdBy:userId},
        req.body,
        {new:true,runValidators:true}
    )
    if(!job){
        throw new NotFoundError(`Not found the id ${jobId}`);
    }
    res.status(StatusCodes.OK).json({job})

}

const deleteJob = async (req,res) =>{
    const {user:{userId}, params:{id:jobId}} =  req;
    const job = await Job.findByIdAndRemove({
        _id:jobId,
        createdBy:userId
    })
    if(!job){
        throw new NotFoundError(`Not found the id ${jobId}`);
    }
    
    res.status(StatusCodes.OK).send()

}

module.exports = {
    getAllJob,
    getJob,
    createJob,
    updateJob,
    deleteJob
}