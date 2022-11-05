import { errorHandler } from "../utils/errorHandler";
import MessageSchema from "../models/ConversationModel";
import ConversationSchema from "../models/ConversationModel";

export const sendMessage = async (req, res, next) => {
  const { text, videos, images } = req.body;
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const message = await new MessageSchema({
      sender: mongoose.Types.ObjectId(req.user.id),
      text,
      videos,
      images,
      conversationId: req.params.conversationId,
      group: req.body.group,
    }).save();
    res.status(201).json(message);
  } catch (error) {
    return next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const message = await MessageSchema.findByIdAndDelete(req.params.messageId);
    if (!message) return next(errorHandler(404, "Message not found"));
    res.status(200).json("Message deleted");
  } catch (error) {
    return next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    if (!req.user.confirmedEmail)
      return next(errorHandler(403, "Please confirm your email first"));
    const messages = await MessageSchema.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (error) {
    return next(error);
  }
};
