import { Joi } from "express-validation";
import User from "../models/user.model.js";
import HTTPStatus from "http-status";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
/**
 * Generate a jwt token for authentication
 *
 * @public
 * @returns {String} token - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
    },
    process.env.SECRET_KEY,
    { expiresIn: "240h" }
  );
};

export const validation = {
  create: {
    body: Joi.object({
      email: Joi.string().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      userName: Joi.string().min(3).max(20).required(),
      gender: Joi.string().required(),
      password: Joi.string()
        .min(6)
        .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/)
        .required(),
    }),
  },
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string()
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
    }),
  },
};

export const createUser = async (req, res, next) => {
  try {
    const isUser = await User.findOne({ email: req.body.email }, { email: 1 });
    if (isUser){
      res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "user already there" });
        return next();
    }
    // Encrypt password
    let hashPassword = await bcrypt.hash(req.body.password, 12);
    req.body.password = hashPassword;

    const result = await User.create(req.body);
    if (!result){
      res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json("Unable to create user");
        return next();
    }

    res
      .status(HTTPStatus.CREATED)
      .json({ message: "User created successfully!!" });
  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    console.log("createUser Error", e);
    return next(e);
  }
};

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("req",req.body)
    const user = await User.findOne(
      { email },
      { email: 1, password: 1, firstName: 1 }
    );

    if(!user){
       res
      .status(HTTPStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "User Not found !!" });
      return next();
    }

    // validate the password
    const match = await bcrypt.compare(password, user.password);

    // If password is incorrect
    if (match) {
      // Generate token for the user
      const token = generateToken(user);

      if (!token)
        res
          .status(HTTPStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error generating token" });

      const updateUser = await User.updateOne({_id:user._id},{$push:{jwt:token}});

      if (!updateUser) {
        res
          .status(HTTPStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error Creating session" });
          return next();
      }

      res.status(200).json({ token });
      return next();
    } else {
      res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Wrong credentials !!" });
        return next();
    }
  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    console.log("Login Error", e);
    return next(e);
  }
};

export const Logout = async (req, res, next) => {
  try {
    const updateUser = await User.updateOne({jwt:req.user.token},{$pull:{jwt:req.user.token}});
    if(updateUser.modifiedCount<1){
       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Unable to logout User!!" });
       return next();
    }
    res.status(200).json({ message: "User logged out successfully !!" });

  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    console.log("Logout Error", e);
    return next(e);
  }
};
