import UserSchema from "../models/UserModel.js";
import { errorHandler } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../service/sendEmail.js";
import googleOauthService from "../service/googleOauthService.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const { username, password, email, name } = req.body;
    if (!username || !password || !email || !name)
      return next(errorHandler(400, "Some fields are required"));

    const checkEmail = await UserSchema.findOne({ email });
    if (checkEmail) return next(errorHandler(409, "email already used"));
    const checkPhone = await UserSchema.findOne({ phone: req.body.phone });
    if (checkPhone) return next(errorHandler(409, "Phone number already used"));

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = await new UserSchema({
      ...req.body,
      password: hash,
    }).save();

    const token = jwt.sign({ id: newUser._id }, process.env.EMAIL_CON_KEY, {
      expiresIn: "1h",
    });

    const url = `${process.env.BASE_URL}/api/auth/${newUser._id}/verify/${token}`;

    sendEmail(newUser.email, "Confirm Email", `<h1>${url}</h1>`);

    res
      .status(201)
      .json("A link has been sent to you, click on it to confirm your account");
  } catch (error) {
    return next(error);
  }
};

export const confirmEmail = async (req, res, next) => {
  try {
    const user = await UserSchema.findById(req.params.userId);
    if (!user) return next(errorHandler(400, "Invalid user"));
    jwt.verify(req.params.token, process.env.EMAIL_CON_KEY, (err, response) => {
      if (err) return next(errorHandler(400, "Invalid token"));
      if (response.id !== req.params.userId)
        return next(errorHandler(403, "Invalid token"));
    });
    const updateConfirmStatus = await UserSchema.findByIdAndUpdate(
      req.params.userId,
      { $set: { confirmedEmail: true } },
      { new: true }
    );
    res.status(200).json("<h1>Your account has been verified</h1>");
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  const { emailOrUsername } = req.body;
  try {
    const user =
      (await UserSchema.findOne({ email: emailOrUsername })) ||
      (await UserSchema.findOne({ username: emailOrUsername }));
    if (!user) return next(errorHandler(404, "Invalid email or username"));

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect) return next(errorHandler(401, "Wrong password"));

    if (!user.confirmedEmail) {
      const token = jwt.sign({ id: user._id }, process.env.EMAIL_CON_KEY, {
        expiresIn: "1h",
      });

      const url = `${process.env.BASE_URL}/api/auth/${user._id}/verify/${token}`;

      sendEmail(user.email, "Confirm Email", `<h1>${url}</h1>`);

      return res
        .status(201)
        .json(
          "A link has been sent to you, click on it to confirm your account"
        );
    }

    const accessToken = jwt.sign(
      { id: user._id, confirmedEmail: user.confirmedEmail },
      process.env.JWT_SEC
    );

    const { password, ...otherDetails } = user._doc;
    res.cookie("access_token", accessToken).status(200).json(otherDetails);
  } catch (error) {
    return next(error);
  }
};

export const loginWithGoogle = async (req, res, next) => {
  const code = req.query.code;

  try {
    const { id_token, access_token } = await googleOauthService(code);

    const googleDetails = jwt.decode(id_token);

    if (!googleDetails.email_verified)
      return next(
        errorHandler(403, "Your email account is not verified on google")
      );
    const { name, email, picture, email_verified } = googleDetails;

    let user = await UserSchema.findOne({ email });

    //

    if (!user) {
      user = await new UserSchema({
        email,
        name,
        picture,
        username: email.split("@")[0],
        confirmedEmail: email_verified,
        fromGoogle: true,
      }).save();
    } else if (user && !user.fromGoogle) {
      return next(errorHandler(409, "Already signed in with different method"));
    }
    const accessToken = jwt.sign(
      { id: user._id, confirmedEmail: user.confirmedEmail },
      process.env.JWT_SEC
    );
    res.cookie("access_token", accessToken).status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  res
    .clearCookie("access_token", { sameSite: "none", secure: true })
    .status(200)
    .json("Logged out successfully");
};
