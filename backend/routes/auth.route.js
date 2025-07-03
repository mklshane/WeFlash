import express from "express";
import {
  syncFirebaseUser,
  logout,
  sendVerifyOTP,
  verifyEmail,
  isAuthenticated,
  sendResetOTP,
  resetPassword,
} from "../controllers/auth.controller.js";
import firebaseAuth from "../middleware/firebaseAuth.js";

const router = express.Router();

router.post("/sync", firebaseAuth, syncFirebaseUser);
router.post("/logout", logout);
router.post("/verify/send-otp", firebaseAuth, sendVerifyOTP);
router.post("/verify/email", firebaseAuth, verifyEmail);
router.get("/auth-check", firebaseAuth, isAuthenticated);
router.post("/reset/send-otp", sendResetOTP);
router.post("/reset/confirm", resetPassword);

export default router;
