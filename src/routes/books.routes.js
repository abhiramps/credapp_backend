import { Router } from "express";
import { verifyAuth } from "../services/verify.auth.js";

const routes = new Router();

const books = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee' },
];

routes.get('/',verifyAuth,(req,res)=>{
    // console.log("req",req.json())
    res.json(books) 
})

export default routes