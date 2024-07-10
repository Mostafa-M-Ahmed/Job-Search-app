import jwt from "jsonwebtoken";
import User from "../../DB/models/user.model.js";
import { ErrorClass } from "../utils/error-class.utils.js";

/**
 * @returns {function} return middleware function
 * @description Check if the user is authenticated or not
 */
export const auth = () => {
  return async (req, res, next) => {
    // destruct token from headers
    const authHeader = req.headers.authorization;

    // check if token exists
    if (!authHeader) {
      return next(
        new ErrorClass("Token is required", 404, "Token is required", "authentication.Middleware.auth")
      );
    }

    // Check if the Authorization header starts with "Bearer"
    if (!authHeader.startsWith(process.env.PREFIX_SECRET)) {
      return next(new ErrorClass("Invalid token format", 400, "Invalid token format", "authentication.Middleware.PREFIX"));
    }

    // retrieve original token after the prefix
    const originalToken = authHeader.split(" ")[1];

    try {
      // verify token
      const data = jwt.verify(originalToken, process.env.LOGIN_SECRET);

      // check if token payload has userId
      if (!data?.userId) {
        return next(
          new ErrorClass("Invalid token payload", 400, "Invalid token payload", "authentication.Middleware.hasUserId")
        );
      }

      // find user by userId
      const isUserExists = await User.findById(data.userId);
      if (!isUserExists) {
        return next(new ErrorClass("User not found", 404, "User not found", "authentication.Middleware.isUserExists"));
      }

      // add the user data in req object
      req.authUser = isUserExists;
      next();
    } catch (err) {
      return next(new ErrorClass("Invalid token", 400, "Invalid token", "authentication.Middleware"));
    }
  };
};
