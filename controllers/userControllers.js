import UserSchema from "../models/UserModel.js";
import mongoose from "mongoose";
import { errorHandler } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import { emailVerified } from "../middlewares/jwtAuth.js";

export const getUser = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
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
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
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
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const user = await UserSchema.findById(req.params.userId);
    const friends = await Promise.all(
      user.friends.map((friend) => {
        return UserSchema.find({ _id: friend });
      })
    );
    if (friends.length === 0) return res.status(404).json("You have no friend");
    res.status(200).json(friends);
  } catch (error) {
    return next(error);
  }
};

export const sendFriendRequest = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const user = await UserSchema.findById(req.params.requestRecieverId);

    if (!user) return next(errorHandler(404, "User not found"));

    if (user.friends.includes(req.user.id))
      return next(
        errorHandler(409, `You are already friends with ${user.username}`)
      );

    if (user.recievedFriendRequests.includes(req.user.id))
      return next(errorHandler(409, "Friend request already sent"));

    await UserSchema.findByIdAndUpdate(
      req.params.requestRecieverId,
      {
        $push: { recievedFriendRequests: req.user.id },
      },
      { new: true }
    );

    await UserSchema.findByIdAndUpdate(
      req.user.id,
      {
        $push: { sentFriendRequests: req.params.requestRecieverId },
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
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const user = await UserSchema.findById(req.params.requestRecieverId);
    if (!user) return next(errorHandler(404, "User not found"));

    // Check if user's list of friend request recieved contains sender's id
    if (
      !user.recievedFriendRequests.includes(req.user.id) &&
      !user.friends.includes(req.user.id)
    )
      return next(errorHandler(400, "Friend request already cancelled"));

    await UserSchema.findByIdAndUpdate(req.params.requestRecieverId, {
      $pull: {
        recievedFriendRequests: mongoose.Types.ObjectId(req.user.id),
      },
    });

    await UserSchema.findByIdAndUpdate(req.user.id, {
      $pull: { sentFriendRequests: req.params.requestRecieverId },
    });
    res.status(200).json("Friend request cancelled");
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    if (req.user.id !== req.params.userId)
      return next(errorHandler(403, "You are not authorized"));

    let user = await UserSchema.findById(req.params.userId);

    if (user.fromGoogle)
      return next(
        errorHandler(
          400,
          "You have to update your credentials from Google because you signed in with Google"
        )
      );

    user = await UserSchema.findByIdAndUpdate(
      req.params.userId,
      {
        name: req.body.name,
        picture: req.body.picture,
      },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

export const acceptFriendRequest = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const user = await UserSchema.findById(req.user.id);

    if (!user.recievedFriendRequests.includes(req.params.senderId))
      return next(errorHandler(400, "Friend request not found"));
    const acceptRequest = await UserSchema.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { recievedFriendRequests: req.params.senderId },
        $push: { friends: req.params.senderId },
      },
      { new: true }
    );

    if (!acceptRequest)
      return next(errorHandler(400, "Friend request not found"));

    await UserSchema.findByIdAndUpdate(
      req.params.senderId,
      {
        $pull: {
          sentFriendRequests: mongoose.Types.ObjectId(req.user.id),
        },
        $push: { friends: mongoose.Types.ObjectId(req.user.id) },
      },
      { new: true }
    );

    res.status(200).json("Friend request accepted");
  } catch (error) {
    return next(error);
  }
};

export const rejectFriendRequest = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));

    await UserSchema.findByIdAndUpdate(
      req.user.id,
      {
        recievedFriendRequests: { $pull: [req.params.senderId] },
      },
      { new: true }
    );

    await UserSchema.findByIdAndUpdate(
      req.params.senderId,
      {
        sentFriendRequests: { $pull: [req.user.id] },
      },
      { new: true }
    );
  } catch (error) {}
};
