import express from "express";
import passport from "passport";
import {
  register,
  confirmEmail,
  login,
} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/register", register);
router.get("/:userId/verify/:token", confirmEmail);
router.post("/login", login);
router.get(
  "/google",
  passport.authenticate(`google`, { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost3000/",
    failureRedirect: "/login",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

export default router;
