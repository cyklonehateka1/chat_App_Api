import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    picture: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    twofaActive: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
    },
    confirmedEmail: {
      type: Boolean,
      default: false,
    },
    friends: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    fromGoogle: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export default mongoose.model("user", UserSchema);
