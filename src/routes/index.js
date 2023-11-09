import { Router } from "express";
import BooksRoutes from './books.routes.js'
import UsersRoutes from './users.routes.js'

const routes = new Router();

routes.use("/books",BooksRoutes);
routes.use("/users",UsersRoutes);

export default routes