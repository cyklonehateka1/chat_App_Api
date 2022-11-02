import UserSchema from "../models/UserModel.js";
import { errorHandler } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import { emailVerified } from "../middlewares/jwtAuth.js";

export const getUser = async (req, res, next) => {
  try {
    const user = await UserSchema.findById(req.params.userId);

    if (!user) return next(errorHandler(404, "User does not exist"));
    const { password, ...otherDetails } = user._doc;

    res.status(200).json(otherDetails);
  } catch (error) {
    return next(error);
  }
};

export const getUsers = async (req, res, next) => {
  const search = req.query.q;
  const limit = req.query.limit;

  try {
    let users;

    if (search) {
      users = await UserSchema.find({
        $regex: search,
        $options: "i",
        $or: [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            username: {
              $regex: search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: search,
              $options: "i",
            },
          },
          {
            phone: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      })
        .limit(limit)
        .sort({ createdAt: -1 });
    } else {
      users = await UserSchema.find();
    }
    res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
};

export const getUserFriends = async (req, res, next) => {
  try {
    const friends = await UserSchema.find({
      friends: { $in: [req.params.userId] },
    });

    if (friends.length === 0) return res.status(404).json("You have no friend");
    res.status(200).json(friends);
  } catch (error) {
    return next(error);
  }
};

export const sendFriendRequest = async (req, res, next) => {
  try {
    const user = await UserSchema.findById(req.params.requestRecieverId);

    if (!user) return next(errorHandler(404, "User not found"));

    if (user.friends.includes(req.user.id))
      return next(
        errorHandler(409, `You are already friends with ${user.username}`)
      );

    if (user.recievedFriendRequests.includes(req.user.id))
      return next(errorHandler(409, "Friend request already sent"));

    const sendRequest = await UserSchema.findById(
      req.params.requestRecieverId,
      {
        $push: { recievedFriendRequests: req.user.id },
      },
      { new: true }
    );

    res.status(200).json("Friend request sent");
  } catch (error) {
    return next(error);
  }
};

export const cancelFriendRequest = async (req, res, next) => {
  try {
    const user = await UserSchema.findById(req.params.requestRecieverId);
    if (!user) return next(errorHandler(404, "User not found"));

    // Check if user's list of friend request recieved contains sender's id
    if (!user.recievedFriendRequests.includes(req.user.id))
      return next(errorHandler(400, "Friend request already canceled"));

    const cancelRequest = await UserSchema.findByIdAndUpdate(
      req.params.requestRecieverId,
      {
        $pull: { recievedFriendRequests: req.user.id },
      }
    );
    res.status(200).json("Friend request canceled");
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.userId)
      return next(errorHandler(403, "You are not authorized"));

    const user = await UserSchema.findByIdAndUpdate(
      req.params.userId,
      {
        name: req.body.name,
        picture: req.body.picture,
      },
      { new: true }
    );
  } catch (error) {
    return next(error);
  }
};
