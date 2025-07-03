import OpenAI from "openai";
import Deck from "../models/deck.model.js";
import Flashcard from "../models/flashcard.model.js";

// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateAndSaveFlashcards = async (req, res) => {
  const { text, deckId } = req.body;

  if (!text || !deckId) {
    return res
      .status(400)
      .json({ success: false, message: "Text and deck ID are required" });
  }

  // Validate text length (optional - prevent huge API costs)
  if (text.length > 50000) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Text is too long. Please limit to 50,000 characters.",
      });
  }

  try {
    // Check if the deck belongs to the user
    const userDeck = await Deck.findOne({ _id: deckId, user: req.userId });
    if (!userDeck) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized deck access" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "system",
          content: `You are a flashcard generator. Create concise, educational flashcards from the provided text. 
          Return ONLY valid JSON in this exact format: 
          [{"question": "Clear, specific question", "answer": "Concise, accurate answer"}, ...]
          
          Guidelines:
          - Generate 30-60 flashcards depending on content length
          - Focus on key concepts, definitions, and important facts
          - Keep questions clear and specific
          - Keep answers concise but complete
          - Avoid yes/no questions`,
        },
        {
          role: "user",
          content: `Generate flashcards from this material:\n\n${text}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiOutput = response.choices[0].message.content;

    let flashcards;
    try {
      // Clean up the AI response in case it has extra text
      const jsonMatch = aiOutput.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiOutput;
      flashcards = JSON.parse(jsonString);

      // Validate flashcards structure
      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        throw new Error("Invalid flashcards format");
      }

      // Validate each flashcard
      flashcards = flashcards.filter(
        (fc) =>
          fc.question &&
          fc.answer &&
          typeof fc.question === "string" &&
          typeof fc.answer === "string"
      );

      if (flashcards.length === 0) {
        throw new Error("No valid flashcards generated");
      }
    } catch (err) {
      console.error("JSON parsing error:", err);
      return res
        .status(500)
        .json({
          success: false,
          message: "AI generated invalid response. Please try again.",
        });
    }

    // Create flashcard documents
    const flashcardDocs = flashcards.map((fc) => ({
      question: fc.question.trim(),
      answer: fc.answer.trim(),
      deck: deckId,
    }));

    const savedFlashcards = await Flashcard.insertMany(flashcardDocs);

    res.status(201).json({
      success: true,
      data: savedFlashcards,
      count: savedFlashcards.length,
    });
  } catch (error) {
    console.error("AI Flashcard Generation Error:", error.message);

    // Handle specific OpenAI errors
    if (error.code === "insufficient_quota") {
      return res.status(402).json({
        success: false,
        message: "AI service quota exceeded. Please try again later.",
      });
    }

    if (error.code === "rate_limit_exceeded") {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please wait a moment and try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "AI generation failed. Please try again.",
    });
  }
};
