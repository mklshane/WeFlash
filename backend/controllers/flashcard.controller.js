import Flashcard from "../models/flashcard.model.js";
import mongoose from "mongoose";
import Deck from "../models/deck.model.js";

// Get all flashcards (owned by user)
export const getFlashcards = async (req, res) => {
  try {
    // Find decks owned by user
    const decks = await Deck.find({ user: req.userId }).select("_id");
    const deckIds = decks.map((d) => d._id);

    // Find flashcards in those decks
    const flashcards = await Flashcard.find({
      deck: { $in: deckIds },
    }).populate("deck", "title");

    res.status(200).json({ success: true, data: flashcards });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch flashcards",
    });
  }
};

// Get flashcards by deck ID (only if user owns the deck)
export const getFlashcardsByDeck = async (req, res) => {
  const { deckId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(deckId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid deck ID format",
    });
  }

  // Check deck ownership
  const userDeck = await Deck.findOne({ _id: deckId, user: req.userId });
  if (!userDeck) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: You do not own this deck",
    });
  }

  try {
    const flashcards = await Flashcard.find({ deck: deckId });
    res.status(200).json({ success: true, data: flashcards });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch flashcards for this deck",
    });
  }
};

// Create a new flashcard (only in user-owned decks)
export const createFlashcard = async (req, res) => {
  const { question, answer, deck } = req.body;

  if (!question || !answer || !deck) {
    return res.status(400).json({
      success: false,
      message: "Question, answer, and deck ID are required",
    });
  }

  // Check deck ownership
  const userDeck = await Deck.findOne({ _id: deck, user: req.userId });
  if (!userDeck) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: You do not own this deck",
    });
  }

  try {
    const newFlashcard = new Flashcard({ question, answer, deck });
    await newFlashcard.save();
    res.status(201).json({ success: true, data: newFlashcard });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error creating flashcard",
    });
  }
};

// Update a flashcard by ID (only if user owns the deck)
export const updateFlashcard = async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid flashcard ID format",
    });
  }

  const flashcard = await Flashcard.findById(id);
  if (!flashcard) {
    return res.status(404).json({
      success: false,
      message: "Flashcard not found",
    });
  }

  // Verify ownership of the deck the flashcard belongs to
  const userDeck = await Deck.findOne({
    _id: flashcard.deck,
    user: req.userId,
  });
  if (!userDeck) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: You do not own this deck",
    });
  }

  try {
    const updatedFlashcard = await Flashcard.findByIdAndUpdate(
      id,
      { question, answer },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedFlashcard });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Error updating flashcard",
    });
  }
};

// Delete a flashcard by ID (only if user owns the deck)
export const deleteFlashcard = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid flashcard ID format",
    });
  }

  const flashcard = await Flashcard.findById(id);
  if (!flashcard) {
    return res.status(404).json({
      success: false,
      message: "Flashcard not found",
    });
  }

  // Verify ownership
  const userDeck = await Deck.findOne({
    _id: flashcard.deck,
    user: req.userId,
  });
  if (!userDeck) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: You do not own this deck",
    });
  }

  try {
    await Flashcard.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Flashcard deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error deleting flashcard",
    });
  }
};

// Get flashcard by its own ID (only if user owns deck)
export const getID = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid flashcard ID format",
    });
  }

  const flashcard = await Flashcard.findById(id).populate("deck", "title");
  if (!flashcard) {
    return res.status(404).json({
      success: false,
      message: "Flashcard not found",
    });
  }

  // Check ownership of deck
  const userDeck = await Deck.findOne({
    _id: flashcard.deck._id,
    user: req.userId,
  });
  if (!userDeck) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: You do not own this deck",
    });
  }

  try {
    res.status(200).json({ success: true, data: flashcard });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
