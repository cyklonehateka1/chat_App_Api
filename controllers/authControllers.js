import UserSchema from "../models/UserModel.js";
import { errorHandler } from "../utils/errorHandler.js";

export const register = async (req, res, next) => {
  try {
    const checkEmail = await UserSchema.findOne({ email: req.body.email });
    if (email) return next(errorHandler(409, "email already used"));
    const checkPhone = await UserSchema.findOne({ phone: req.body.phone });
    if (phone) return next(errorHandler(409, "Phone number already used"));
    const url = "";
    const newUser = await new UserSchema(req.body).save();
  } catch (error) {}
};
