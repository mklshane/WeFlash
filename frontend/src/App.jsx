import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import FlashcardPage from "./FlashcardPage.jsx";
import SignIn from "./SignIn.jsx";
import Deck from "./Deck.jsx";
import Landing from "./Landing.jsx";
import Flashcards from "./Flashcards.jsx";
import PageNotFound from "./components/PageNotFound.jsx";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase.js";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken(); // ✅ auto-refreshes
        localStorage.setItem("token", token); // optional
        setUser(user);
      } else {
        setUser(null);
        localStorage.removeItem("token"); // optional: cleanup
      }
    });

    return () => unsubscribe();
  }, []);

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
