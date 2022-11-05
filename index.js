import express from "express";
import dotenv from "dotenv";
import { connection } from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  const errStatus = err.status || 500;
  const errMessage = err.message || "Something went wrong";

  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMessage,
  });
});

app.listen(8000, () => {
  connection();
  console.log("Server started on PORT 8000");
});
