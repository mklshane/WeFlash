import Deck from "../models/deck.model.js";
import Flashcard from "../models/flashcard.model.js";
import { v4 as uuidv4 } from "uuid";


export const createDeck = async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }

  try {
    // Attach the authenticated user's ID to the deck
    const newDeck = new Deck({ title, description, user: req.userId });
    await newDeck.save();
    res.status(201).json({ success: true, data: newDeck });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create deck" });
  }
};

export const getDecks = async (req, res) => {
  try {
    const decks = await Deck.find({ user: req.userId }); // filter by user
    res.status(200).json({ success: true, data: decks });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch decks" });
  }
};

export const deleteDeck = async (req, res) => {
  const { deckID } = req.params;

  try {
    // Find the deck by ID and user to ensure authorization
    const deck = await Deck.findOne({
      _id: deckID,
      user: req.userId,
    });

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: "Deck not found or not authorized",
      });
    }

    // Delete all flashcards associated with the deck
    await Flashcard.deleteMany({ deck: deckID });

    // Delete the deck
    await Deck.deleteOne({ _id: deckID });

    return res.status(200).json({
      success: true,
      message: "Deck and associated flashcards deleted successfully",
      data: deck,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid deck ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to delete deck and flashcards",
      error: error.message,
    });
  }
};

export const getDeckDetails = async (req, res) => {
  const { deckId } = req.params;

  try {
    const deck = await Deck.findOne({
      _id: deckId,
      user: req.userId,
    }).select("title description _id");

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: "Deck not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      data: deck,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid deck ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch deck details",
    });
  }
};
