import React from "react";
import { Routes, Route } from "react-router-dom";
import FlashcardPage from "./FlashcardPage.jsx";
import SignIn from "./SignIn.jsx";
import Deck from "./Deck.jsx";
import Landing from "./Landing.jsx";
import Flashcards from "./Flashcards.jsx";
import PageNotFound from "./components/PageNotFound.jsx";

const App = () => {
 
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/decks" element={<Deck />} />
      <Route path="/decks/:deckId" element={<FlashcardPage />} />
      <Route path="/allFlashcards/:deckId?" element={<Flashcards />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default App;
