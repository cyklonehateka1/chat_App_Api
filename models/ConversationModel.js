import mongoose from "mongoose";

const ConversationSchema = mongoose.Schema(
  {
    members: {
      type: [mongoose.Schema.Types.ObjectId],
    },
  },
  { timestamps: true }
);

export default mongoose.model("conversation", ConversationSchema);
