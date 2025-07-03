// Import required modules
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import flashcardRoutes from "./routes/flashcard.route.js";
import deckRoutes from "./routes/deck.route.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import aiRoutes from "./routes/ai.route.js";


// Load environment variables from .env file
dotenv.config({ path: "./.env" });

// Initialize Express application
const app = express();

// Set the server port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Middleware Configuration

// Parse incoming requests with JSON payloads
app.use(express.json());

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5177",
  "https://weflash-1.onrender.com",
];


app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin like mobile apps or curl
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
// Route Configuration

// Deck routes - handles all deck-related operations
app.use("/api/decks", deckRoutes);

// Flashcard routes - handles all flashcard-related operations
app.use("/api/flashcards", flashcardRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/ai", aiRoutes);

// Server Initialization

// Start the server after establishing database connection
app.listen(PORT, '0.0.0.0', () => {
  // Connect to MongoDB database
  connectDB();

  // Log server start information
  console.log(`Server started at http://localhost:${PORT}`);
});
