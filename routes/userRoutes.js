import express from "express";
import { verifyToken, emailVerified } from "../middlewares/jwtAuth.js";
import {
  getUser,
  getUsers,
  getUserFriends,
  sendFriendRequest,
  cancelFriendRequest,
  updateUser,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../controllers/userControllers.js";

const router = express.Router();

router.get("/user/:userId", verifyToken, getUser);
router.get("/", verifyToken, getUsers);
router.get("/:userId/friends", verifyToken, getUserFriends);
router.post(
  "/friends/requests/send/:requestRecieverId",
  verifyToken,
  sendFriendRequest
);
router.post(
  "/friends/requests/cancel/:requestRecieverId",
  verifyToken,
  cancelFriendRequest
);
router.post(
  "/friends/requests/accept/:senderId",
  verifyToken,
  acceptFriendRequest
);

router.put("/update/:userId", verifyToken, updateUser);

export default router;
