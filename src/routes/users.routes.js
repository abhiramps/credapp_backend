import { Router } from "express"; 
import { verifyAuth } from "../services/verify.auth.js";
import { validate ,ValidationError} from 'express-validation';

import * as  UserController from '../controllers/userController.js'

const routes=new Router();

//GET
routes.get('/userDetails',verifyAuth,(req,res,next)=>{
    res.status(200).json('success')
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