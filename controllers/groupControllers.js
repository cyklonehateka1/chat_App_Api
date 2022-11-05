import mongoose from "mongoose";
import GroupSchema from "../models/GroupModel.js";
import { errorHandler } from "../utils/errorHandler.js";

export const createGroup = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const group = await new GroupSchema(req.body).save();
    res.status(200).json(group);
  } catch (error) {
    return next(error);
  }
};

export const addMembers = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const userIsGroupAdmin = await GroupSchema.findById(req.params.groupId);
    if (
      !userIsGroupAdmin.members.includes(mongoose.Types.ObjectId(req.user.id))
    )
      return next(errorHandler(403, "Please you are not a group admin"));
    const newMembers = await GroupSchema.findByIdAndUpdate(
      req.params.groupId,
      { members: { $push: [req.body.members] } },
      { new: true }
    );
    res.status(200).json(newMembers);
  } catch (error) {
    return next(error);
  }
};

export const joinGroup = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const join = await GroupSchema.findByIdAndUpdate(
      req.params.groupId,
      {
        members: { $push: [mongoose.Types.ObjectId(req.user.id)] },
      },
      { new: true }
    );
    res.status(200).json("Group joined successfully");
  } catch (error) {
    return next(error);
  }
};

export const leaveGroup = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const exitGroup = await GroupSchema.findByIdAndUpdate(
      req.params.groupId,
      {
        members: { $pull: [mongoose.Types.ObjectId(req.user.id)] },
      },
      { new: true }
    );
    res.status(200).json("Exited group successfully");
  } catch (error) {
    return next(error);
  }
};

export const removeMember = async (req, res, next) => {
  const { members } = req.body;
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    // checks to see if user is an admin or the list of members to be removed includes the group owner
    const userIsAuthorized = await GroupSchema.findById(req.params.groupId);
    if (
      !userIsAuthorized.members.includes(mongoose.Types.ObjectId(req.user.id))
    )
      return next(errorHandler(403, "Please you are not a group admin"));
    if (members.includes(userIsAuthorized.groupOwner))
      return next(errorHandler(403, "You cannot remove group creator"));

    const removedMembers = await GroupSchema.findByIdAndUpdate(
      req.params.groupId,
      {
        members: { $pull: [members] },
      },
      { new: true }
    );
    res.status(200).json("Members removed");
  } catch (error) {
    return next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    // checks to see if user is an admin or the list of members to be removed includes the group owner
    const userIsAuthorized = await GroupSchema.findById(req.params.groupId);
    if (
      !userIsAuthorized.members.includes(mongoose.Types.ObjectId(req.user.id))
    )
      return next(errorHandler(403, "Please you are not a group admin"));
    const modifiedGroup = await GroupSchema.findByIdAndUpdate(
      req.params.groupId,
      {
        title: req.body.title,
      },
      { new: true }
    );
    res.status(200).json(modifiedGroup);
  } catch (error) {
    return next(error);
  }
};

export const makeAdmin = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    // checks to see if user is an admin or the list of members to be removed includes the group owner
    const userIsAuthorized = await GroupSchema.findById(req.params.groupId);
    if (
      !userIsAuthorized.members.includes(mongoose.Types.ObjectId(req.user.id))
    )
      return next(errorHandler(403, "Please you are not a group admin"));
    // const newAdmin
  } catch (error) {
    return next(error);
  }
};
export const unmakeAdmin = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    // checks to see if user is an admin or the list of members to be removed includes the group owner
    const userIsAuthorized = await GroupSchema.findById(req.params.groupId);
    if (
      !userIsAuthorized.members.includes(mongoose.Types.ObjectId(req.user.id))
    )
      return next(errorHandler(403, "Please you are not a group admin"));
    // const newAdmin
  } catch (error) {
    return next(error);
  }
};
export const deleteGroup = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    // checks to see if user is an admin or the list of members to be removed includes the group owner
    const userIsAuthorized = await GroupSchema.findById(req.params.groupId);
    if (!userIsAuthorized.groupOwner !== mongoose.Types.ObjectId(req.user.id))
      return next(errorHandler(403, "Please you're not the group owner"));
    // const newAdmin
  } catch (error) {
    return next(error);
  }
};
