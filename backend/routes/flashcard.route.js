import express from "express";
import {
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getID,
  getFlashcardsByDeck,
} from "../controllers/flashcard.controller.js";
import firebaseAuth from "../middleware/firebaseAuth.js";

const router = express.Router();

router.get("/deck/:deckId", firebaseAuth, getFlashcardsByDeck);
router.get("/", firebaseAuth, getFlashcards);
router.post("/", firebaseAuth, createFlashcard);
router.put("/:id", firebaseAuth, updateFlashcard);
router.delete("/:id", firebaseAuth, deleteFlashcard);
router.get("/:id", firebaseAuth, getID);

// 🔒 Add handler if needed for rating (currently empty)
router.post("/:id/rating", firebaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: "Rating not implemented." });
});

export default router;
