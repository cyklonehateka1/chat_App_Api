import mongoose from "mongoose";

const GroupSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  admins: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  groupOwner: {
    type: mongoose.Schema.Types.ObjectId,
  },
});
