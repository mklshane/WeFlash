// models/deck.model.js
import mongoose from "mongoose";

const deckSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    user: { type: String, required: true }, // ✅ Store Firebase UID directly
  },
  {
    timestamps: true, // optional but useful
  }
);

const Deck = mongoose.model("Deck", deckSchema);
export default Deck;
