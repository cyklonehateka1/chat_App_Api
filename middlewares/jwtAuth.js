import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/errorHandler.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) return next(errorHandler(401, "You are not authenticated"));

  jwt.verify(token, process.env.JWT_SEC, (err, user) => {
    if (err) return next(errorHandler(403, "Invalid token"));
    req.user = user;
  });
  next();
};

export const emailVerified = async (req, res, next) => {
  try {
    verifyToken(req, res, () => {
      if (!req.user.confirmedEmail)
        return next(
          errorHandler(403, "Please verify your email on the login page")
        );
    });
    next();
  } catch (error) {
    return next(error);
  }
};
