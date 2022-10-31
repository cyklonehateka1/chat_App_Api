import express from "express";
import dotenv from "dotenv";
import { connection } from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import "./utils/passport.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET, POST, DELETE, PUT",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);

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
