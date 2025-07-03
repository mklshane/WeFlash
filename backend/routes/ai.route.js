import express from "express";
import { generateAndSaveFlashcards } from "../controllers/ai.controller.js";
import firebaseAuth from "../middleware/firebaseAuth.js";

const router = express.Router();

router.post("/generate-flashcards", firebaseAuth, generateAndSaveFlashcards);

export default router;
