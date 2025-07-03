import express from "express";
import {
  createDeck,
  getDecks,
  deleteDeck,
  getDeckDetails,
} from "../controllers/deck.controller.js";
import firebaseAuth from "../middleware/firebaseAuth.js";

const router = express.Router();

router.post("/", firebaseAuth, createDeck);
router.get("/", firebaseAuth, getDecks);
router.delete("/:deckID", firebaseAuth, deleteDeck);
router.get("/:deckId", firebaseAuth, getDeckDetails);

export default router;
