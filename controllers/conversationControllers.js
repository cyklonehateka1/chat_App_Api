import { errorHandler } from "../utils/errorHandler";
import ConversationSchema from "../models/ConversationModel";

export const createConversation = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const conversation = await new ConversationSchema({
      members: [req.body.members],
    }).save();
    res.status(201).json(conversation);
  } catch (error) {
    return next(error);
  }
};

export const getUserConversations = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const conversations = await ConversationSchema.find({
      members: { $in: [mmongoose.Types.ObjectId(req.user.id)] },
    });
    if (conversations.length === 0)
      return res.status(404).json("You have no Chats");
    res.status(200).json(conversations);
  } catch (error) {
    return next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const conversation = await ConversationSchema.findOne({
      members: {
        $in: [mongoose.Types.ObjectId(req.user.id), req.params.friendId],
      },
    });
  } catch (error) {
    return next(error);
  }
};
