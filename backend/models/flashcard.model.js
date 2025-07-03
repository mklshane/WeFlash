import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deck",
    required: true,
  },
});

const Flashcard = mongoose.model("Flashcard", flashcardSchema);
export default Flashcard;
