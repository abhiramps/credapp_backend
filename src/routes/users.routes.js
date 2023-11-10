import { Router } from "express"; 
import { verifyAuth } from "../services/verify.auth.js";
import { validate ,ValidationError} from 'express-validation';

import * as  UserController from '../controllers/userController.js'
import User from "../models/user.model.js";

const routes=new Router();

//GET
routes.get('/userDetails',verifyAuth,async(req,res,next)=>{
    const {userId}=req.body;
    // console.log("req",req.user)
    const user=await User.findOne({_id:userId},{password:0,__v:0}).lean()

    res.status(200).json(user)
})

routes.get('/userList',verifyAuth,async(req,res,next)=>{
    const {skip,limit,sort}=req.body;
    const users=await User.find({},{password:0,__v:0,jwt:0})
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean()
    res.status(200).json(users)
})

//POST
routes.post(
    '/signup',
    validate(UserController.validation.create,{},{}),
    UserController.createUser,
);

routes.post(
    '/login',
    validate(UserController.validation.login),
    // verifyAuth,
    UserController.Login,
);

routes.use((err, req, res, next)=> {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json(err)
    }
    return res.status(500).json(err)
})

export default routes