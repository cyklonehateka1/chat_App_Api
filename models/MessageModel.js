import mongoose from "mongoose";

const MessageSchema = mongoose.Schema(
  {
    revievers: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    text: {
      type: String,
    },
    images: {
      type: [String],
    },
    videos: {
      type: [String],
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

export default mongoose.model("message", MessageSchema);
