import express from "express";
import {
  register,
  confirmEmail,
  login,
  loginWithGoogle,
  logout,
} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/register", register);
router.get("/:userId/verify/:token", confirmEmail);
router.post("/login", login);
router.get("/google/oauth", loginWithGoogle);
router.post("/logout", logout);
export default router;
