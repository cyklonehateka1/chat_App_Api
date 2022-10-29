import express from "express";
import dotenv from "dotenv";
import { connection } from "./utils/db.js";

dotenv.config();

const app = express();

app.listen(8000, () => {
  connection();
  console.log("Server started on PORT 8000");
});
