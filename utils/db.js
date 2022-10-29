import mongoose from "mongoose";

export const connection = () => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    console.log("DB connected successfully");
  } catch (error) {
    console.log(error);
  }
};
