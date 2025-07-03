import express from "express";
import { getUserData } from "../controllers/user.controller.js";
import firebaseAuth from "../middleware/firebaseAuth.js"; // <-- use Firebase now

const router = express.Router();

router.get("/data", firebaseAuth, getUserData); // <-- middleware changed

export default router;
