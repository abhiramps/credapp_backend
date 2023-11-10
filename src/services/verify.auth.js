import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Sessions from "../models/sessions.model.js";

export const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // Bearer ....
    const bearer = authHeader.split("Bearer ")[1];
    const token = bearer.replace('"', "");

    if (token) {
      try {
        // Verify Token ....
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
        if (!verifyToken) {
          res.status(401).send("Invalid/Expired token");
        }

        // Verify the user ....
        const user = await User.findOne(
          { _id: verifyToken.id, jwt: token },
          { jwt: 0 }
        );
        if (!user) res.status(401).send("Invalid User");

        user.token = token;
        next();
      } catch (err) {
        res.status(401).send("Invalid/Expired token");
      }
    }
  }
  else{
    res.status(500).send("token not found");
  }
};
