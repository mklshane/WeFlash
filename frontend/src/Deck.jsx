import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Deck.css";
import { ProfileDropdown } from "./components/ProfileDropdown";
import ThemeToggle from "./components/ThemeToggle";
import logo from "./assets/WeFlashLogo.png";
import api from "./utils/api";


function DeckPage() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newDeck, setNewDeck] = useState({ title: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // 🔐 Check auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/auth/auth-check");
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("userId");
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch decks
  const fetchDecks = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/decks");
      const decksArray = res.data?.data || [];

      const decksWithCounts = await Promise.all(
        decksArray.map(async (deck) => {
          try {
            const flashRes = await api.get(`/flashcards/deck/${deck._id}`);
            const flashcards = flashRes.data?.data || [];
            return { ...deck, cardCount: flashcards.length };
          } catch (err) {
            console.error(`Error fetching flashcards for ${deck._id}:`, err);
            return { ...deck, cardCount: 0 };
          }
        })
      );

      setDecks(decksWithCounts);
    } catch (err) {
      console.error("Error fetching decks:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("userId");
        navigate("/");
      } else {
        setError("Failed to fetch decks. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteDeck = async (deckId, e) => {
    e.stopPropagation();
    try {
      if (window.confirm("Are you sure you want to delete this deck?")) {
        await api.delete(`/decks/${deckId}`);
        await fetchDecks(); // 🔁 instead of reload
      }
    } catch (err) {
      console.error("Error deleting deck:", err);
      if (err.response) {
        console.error(
          "Server responded with:",
          err.response.status,
          err.response.data
        );
      } else if (err.request) {
        console.error("Request made but no response received:", err.request);
      } else {
        console.error("Something else happened:", err.message);
      }
      alert("Failed to delete deck. Please try again.");
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const filteredDecks = decks.filter((deck) =>
    deck.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeckClick = (id) => navigate(`/decks/${id}`);

  const handleCreateDeck = (e) => {
    if (e) e.preventDefault();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewDeck({ title: "", description: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDeck((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      await api.post("/decks", newDeck);
      handleCloseModal();
      fetchDecks();
    } catch (err) {
      console.error("Error creating deck:", err);
      setError("Failed to create deck. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={`deck-container ${isDarkMode ? "dark" : ""}`}>
      <div className="nav-bar">
        <div
          className="nav-title"
          onClick={() => navigate("/decks")}
          role="button"
          aria-label="Navigate to Decks"
        >
          <div className="logo-icon">
            <img src={logo} style={{ width: "40px", height: "40px" }} />
          </div>
          <span className="logo-text">WeFlash</span>
        </div>
        <div className="nav-actions">
          <button
            onClick={handleCreateDeck}
            className="nav-button"
            role="button"
            aria-label="Create New Deck"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Deck</span>
          </button>
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      </div>

      <div className="decks-container">
        <div className="header-container">
          <div className="header-section">
            <h1 className="header">Your Decks</h1>
            <p className="header-subtitle">
              Manage and organize your flashcard collections
            </p>
          </div>
          <div className="search-container">
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search decks..."
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search decks"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner" role="status" aria-label="Loading decks" />
            <p className="loading-text">Loading your decks...</p>
          </div>
        ) : error ? (
          <div className="empty-state error-state" role="alert">
            <svg
              className="empty-state-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3>Error Loading Decks</h3>
            <p>{error}</p>
            <button
              onClick={fetchDecks}
              className="button error-button"
              role="button"
              aria-label="Retry loading decks"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              Retry
            </button>
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="empty-state">
            <svg
              className="empty-state-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 3h18v18H3z" />
              <path d="M3 9h18" />
              <path d="M9 9v12" />
            </svg>
            <h3>{searchTerm ? "No matching decks found" : "No decks yet"}</h3>
            <p>
              {searchTerm
                ? "Try adjusting your search terms"
                : "Create your first deck to get started with flashcards"}
            </p>
            <button
              onClick={handleCreateDeck}
              className="button"
              role="button"
              aria-label="Create new deck"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {decks.length === 0 ?
             " Create Your First Deck" : "Create a Deck"}
            </button>
          </div>
        ) : (
          <div className="decks-grid">
            {filteredDecks.map((deck) => (
              <div
                key={deck._id}
                className="deck-card"
                onClick={() => handleDeckClick(deck._id)}
                role="button"
                tabIndex={0}
                aria-label={`View deck: ${deck.title}`}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleDeckClick(deck._id)
                }
              >
                <div className="deck-card-header">
                  <h3 className="deck-title">{deck.title}</h3>
                  <div className="deck-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </div>
                </div>
                <p className="deck-description">
                  {deck.description || "No description provided"}
                </p>
                <div className="deck-stats">
                  <span className="stat-badge">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    {deck.cardCount || 0}{" "}
                    {deck.cardCount === 1 ? "card" : "cards"}
                  </span>
                </div>
                <button
                  className="delete-button"
                  onClick={(e) => deleteDeck(deck._id, e)}
                  title={`Delete deck: ${deck.title}`}
                  aria-label={`Delete deck: ${deck.title}`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h2>Create New Deck</h2>
                <p className="modal-subtitle">
                  Start building your flashcard collection
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Deck Title *
                </label>
                <input
                  id="title"
                  name="title"
                  placeholder="Enter a title for your deck"
                  value={newDeck.title}
                  onChange={handleInputChange}
                  required
                  className="input"
                  autoFocus
                  aria-required="true"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Add a brief description of what this deck covers"
                  value={newDeck.description}
                  onChange={handleInputChange}
                  className="input textarea"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cancel-button"
                  aria-label="Cancel deck creation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button"
                  disabled={isCreating}
                  aria-label={isCreating ? "Creating deck" : "Create deck"}
                >
                  {isCreating ? (
                    <>
                      <svg
                        className="spinner-small"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.99994L16.25 7.82837M4.92157 19.0784L7.75 16.25M4.92157 4.99994L7.75 7.82837"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Create Deck
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={handleCreateDeck}
        className="fab-button"
        role="button"
        aria-label="Create New Deck"
        title="Create New Deck"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

export default DeckPage;
