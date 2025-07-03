import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles/FlashcardPage.css";
import ThemeToggle from "./components/ThemeToggle";
import StudyModeMenu from "./components/StudyModeMenu";
import api from "./utils/api";

function FlashcardPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({ question: "", answer: "" });
  const [error, setError] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isHovered, setIsHovered] = useState({});
  const [deckTitle, setDeckTitle] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({ question: "", answer: "" });
  const [pdfFile, setPdfFile] = useState(null);
  const [aiInputText, setAiInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(null);
  const [isPdfJsLoaded, setIsPdfJsLoaded] = useState(false);
  const [cardDirection, setCardDirection] = useState("");
  const [answerFirstMode, setAnswerFirstMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if pdf.js is loaded and configure it
  useEffect(() => {
    const checkPdfJs = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";
        setIsPdfJsLoaded(true);
      } else {
        setTimeout(checkPdfJs, 100);
      }
    };
    checkPdfJs();
  }, []);

  useEffect(() => {
    document.body.style.overflow = showUpdateModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showUpdateModal]);

  useEffect(() => {
    if (!deckId) {
      setError("Deck not found.");
      return;
    }
    fetchDeckDetails();
    fetchFlashcards();
  }, [deckId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showUpdateModal) return;

      // Ignore all key events if focus is in an input or textarea
      const isInputField =
        e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";
      if (isInputField) return;

      // Handle navigation and toggle keys only for non-input elements
      if (e.key === " ") {
        e.preventDefault();
        setShowAnswer((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        prevCard();
      } else if (e.key === "ArrowRight") {
        nextCard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showUpdateModal, currentIndex, flashcards]);

  // Save currentIndex when it changes
  useEffect(() => {
    if (deckId && flashcards.length > 0) {
      localStorage.setItem(`lastIndex_${deckId}`, currentIndex);
    }
  }, [currentIndex, deckId, flashcards.length]);

  const fetchDeckDetails = async () => {
    try {
      const response = await api.get(`/decks/${deckId}`);
      const deck = response.data.data;
      setDeckTitle(deck?.title || "Untitled Deck");
    } catch (err) {
      console.error("Error fetching deck details:", err);
      setError("Error fetching deck details.");
    }
  };

  const fetchFlashcards = async () => {
    setLoading(true); // Start loading
    try {
      const res = await api.get(`/flashcards/deck/${deckId}`);
      const data = res.data.data;
      if (Array.isArray(data) && data.length > 0) {
        setFlashcards(data);

        const savedIndex = parseInt(
          localStorage.getItem(`lastIndex_${deckId}`),
          10
        );
        if (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < data.length) {
          setCurrentIndex(savedIndex);
        } else {
          setCurrentIndex(0);
        }

      } else {
        setFlashcards([]);
        setError("No flashcards available.");
      }
    } catch (err) {
      console.error(err);
      setFlashcards([]);
      setError("Error fetching flashcards.");
    } finally {
      setLoading(false); 
    }
  };

  const nextCard = () => {
    if (flashcards.length === 0) return;
    setShowAnswer(false);
    setCardDirection("next");
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    if (flashcards.length === 0) return;
    setShowAnswer(false);
    setCardDirection("prev");
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
  };

  const handleCreate = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      setError("Question and answer are required.");
      return;
    }
    try {
      await api.post("/flashcards", { ...formData, deck: deckId });
      setFormData({ question: "", answer: "" });
      setError(null);
      fetchFlashcards();
    } catch (err) {
      setError("Error creating flashcard.");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!flashcards[currentIndex]) return;
    try {
      const id = flashcards[currentIndex]._id;
      await api.delete(`/flashcards/${id}`);
      const updatedFlashcards = flashcards.filter((_, i) => i !== currentIndex);
      setFlashcards(updatedFlashcards);
      setShowAnswer(false);
      setCurrentIndex((prev) =>
        prev >= updatedFlashcards.length
          ? Math.max(0, updatedFlashcards.length - 1)
          : prev
      );
    } catch (err) {
      setError("Error deleting flashcard.");
      console.error(err);
    }
  };

  const handleShuffle = () => {
    if (flashcards.length <= 1) return;
    const shuffledCards = [...flashcards];
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [
        shuffledCards[j],
        shuffledCards[i],
      ];
    }
    setFlashcards(shuffledCards);
    setCurrentIndex(0);
    setShowAnswer(false);
    setCardDirection("shuffle");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPdfFile(null);
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      e.target.value = "";
      return;
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(
        "PDF file is too large. Please upload a file smaller than 10MB."
      );
      e.target.value = "";
      return;
    }
    setPdfFile(file);
    setError(null);
  };

  const handleTextChange = (e) => {
    setAiInputText(e.target.value);
    if (error && e.target.value.trim()) {
      setError(null);
    }
  };

  const extractPdfText = async (file) => {
    if (!window.pdfjsLib) {
      throw new Error("PDF.js library is not loaded.");
    }
    try {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const typedArray = new Uint8Array(reader.result);
            const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              text += content.items.map((item) => item.str).join(" ") + " ";
            }
            resolve(text.trim());
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      throw new Error("Failed to extract text from PDF: " + error.message);
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      let extractedText = aiInputText.trim();
      if (pdfFile && !extractedText) {
        if (!isPdfJsLoaded) {
          setError(
            "PDF processing library is not loaded. Please try again or paste text directly."
          );
          return;
        }
        try {
          extractedText = await extractPdfText(pdfFile);
          if (!extractedText) {
            throw new Error("No text could be extracted from the PDF");
          }
        } catch (pdfError) {
          console.error("PDF extraction error:", pdfError);
          setError(
            "Failed to extract text from PDF. Please try uploading a different file or paste text directly."
          );
          return;
        }
      }
      if (!extractedText) {
        setError("Please provide text material or upload a PDF file.");
        return;
      }
      if (extractedText.length < 50) {
        setError(
          "Please provide more text content (at least 50 characters) for better flashcard generation."
        );
        return;
      }
      if (extractedText.length > 50000) {
        setError(
          "Text is too long. Please limit to 50,000 characters to avoid high API costs."
        );
        return;
      }
      const aiRes = await api.post(
        `/ai/generate-flashcards`,
        { text: extractedText, deckId: deckId },
        { timeout: 60000 }
      );
      if (aiRes.data.success && aiRes.data.data) {
        setAiInputText("");
        setPdfFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.value = "";
        }
        const count = aiRes.data.count || aiRes.data.data.length;
        setError(null);
        setShowSuccess(`Successfully generated ${count} flashcards!`);
        await fetchFlashcards();
      } else {
        throw new Error("Invalid response from AI service");
      }
    } catch (err) {
      console.error("AI flashcard generation error:", err);
      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        setError(
          "Request timed out. Please try again with shorter text or check your connection."
        );
      } else if (err.response?.status === 402) {
        setError("AI service quota exceeded. Please try again later.");
      } else if (err.response?.status === 429) {
        setError("Too many requests. Please wait a moment and try again.");
      } else if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
            "Invalid input. Please check your text and try again."
        );
      } else if (err.response?.status === 403) {
        setError("Unauthorized access to this deck.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("AI flashcard generation failed. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const SuccessMessage = ({ message, onClose }) => (
    <div className="success-message">
      <div className="success-content">
        <svg
          className="success-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22,4 12,14.01 9,11.01" />
        </svg>
        <span>{message}</span>
      </div>
      <button
        className="success-close"
        onClick={onClose}
        aria-label="Close success message"
      >
        ×
      </button>
    </div>
  );
  
  
  const handleBack = () => navigate("/decks");

  const currentCard = useMemo(
    () => flashcards[currentIndex] || null,
    [flashcards, currentIndex]
  );

  const handleMouseEnter = (buttonName) => {
    setIsHovered((prev) => ({ ...prev, [buttonName]: true }));
  };

  const handleMouseLeave = (buttonName) => {
    setIsHovered((prev) => ({ ...prev, [buttonName]: false }));
  };

  return (
    <div className="container">
      <nav className="nav-bar">
        <button
          className={`back-button ${isHovered.back ? "hovered" : ""}`}
          onClick={handleBack}
          onMouseEnter={() => handleMouseEnter("back")}
          onMouseLeave={() => handleMouseLeave("back")}
          role="button"
          aria-label="Back to decks"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="nav-title">{deckTitle}</span>
        <ThemeToggle />
      </nav>
      <div className="content-container">
        {loading ? (
          <div className="loading">
            <div className="spinner" role="status" aria-label="Loading decks" />
            <p className="loading-text">Loading flashcards...</p>
          </div>
        ) : currentCard ? (
          <>
            <div
              className={`question-card ${cardDirection}`}
              onClick={() => setShowAnswer(!showAnswer)}
              role="button"
              tabIndex={0}
              aria-label={`Toggle flashcard: ${
                showAnswer
                  ? answerFirstMode
                    ? "Show answer"
                    : "Show question"
                  : answerFirstMode
                  ? "Show question"
                  : "Show answer"
              }`}
              onKeyDown={(e) => e.key === "Enter" && setShowAnswer(!showAnswer)}
            >
              <div className="question-counter">
                Card {currentIndex + 1} of {flashcards.length}
              </div>
              <div className="card-menu">
                <StudyModeMenu
                  answerFirstMode={answerFirstMode}
                  setAnswerFirstMode={setAnswerFirstMode}
                  setShowAnswer={setShowAnswer}
                  isHovered={isHovered}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                />
              </div>
              <div className="card-content">
                {showAnswer ? (
                  <div className="answer-text">
                    {answerFirstMode
                      ? currentCard.question
                      : currentCard.answer}
                  </div>
                ) : (
                  <div className="card-text">
                    {answerFirstMode
                      ? currentCard.answer
                      : currentCard.question}
                  </div>
                )}
              </div>
              <button
                className={`arrow-button left-arrow ${
                  isHovered.prev ? "hovered" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  prevCard();
                }}
                onMouseEnter={() => handleMouseEnter("prev")}
                onMouseLeave={() => handleMouseLeave("prev")}
                aria-label="Previous flashcard"
              >
                ⟨
              </button>
              <button
                className={`arrow-button right-arrow ${
                  isHovered.next ? "hovered" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  nextCard();
                }}
                onMouseEnter={() => handleMouseEnter("next")}
                onMouseLeave={() => handleMouseLeave("next")}
                aria-label="Next flashcard"
              >
                ⟩
              </button>
            </div>
            <div className="card-actions">
              <a
                className={`text-link ${
                  isHovered.showFlashcardsLink ? "hovered" : ""
                }`}
                onMouseEnter={() => handleMouseEnter("showFlashcardsLink")}
                onMouseLeave={() => handleMouseLeave("showFlashcardsLink")}
                onClick={() => navigate(`/allFlashcards/${deckId}`)}
                role="link"
                aria-label="View all flashcards"
              >
                View all flashcards
              </a>
              <div className="action-buttons">
                <button
                  className={`icon-button ${isHovered.update ? "hovered" : ""}`}
                  onClick={() => {
                    setUpdateData({
                      question: currentCard.question,
                      answer: currentCard.answer,
                    });
                    setShowUpdateModal(true);
                  }}
                  onMouseEnter={() => handleMouseEnter("update")}
                  onMouseLeave={() => handleMouseLeave("update")}
                  aria-label="Edit flashcard"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </button>
                <button
                  className={`icon-button ${isHovered.delete ? "hovered" : ""}`}
                  onClick={handleDelete}
                  onMouseEnter={() => handleMouseEnter("delete")}
                  onMouseLeave={() => handleMouseLeave("delete")}
                  aria-label="Delete flashcard"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </button>
                <button
                  className={`icon-button ${
                    isHovered.shuffle ? "hovered" : ""
                  }`}
                  onClick={handleShuffle}
                  onMouseEnter={() => handleMouseEnter("shuffle")}
                  onMouseLeave={() => handleMouseLeave("shuffle")}
                  aria-label="Shuffle flashcards"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m18 14 4 4-4 4" />
                    <path d="m18 2 4 4-4 4" />
                    <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" />
                    <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" />
                    <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
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
            <h3>No flashcards available</h3>
            <p>Create your first flashcard to get started</p>
          </div>
        )}
        <div className="input-container">
          <div className="section-header">
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
            <h3>Create New Flashcard</h3>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Question</label>
            <textarea
              className="input textarea"
              placeholder="Enter your question here..."
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              autoFocus
              aria-label="Question"
              aria-required="true"
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Answer</label>
            <textarea
              className="input textarea"
              placeholder="Enter the answer here..."
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              aria-label="Answer"
              aria-required="true"
            />
          </div>
          <button
            className={`button add-flashcard-button ${
              !formData.question.trim() || !formData.answer.trim()
                ? "disabled"
                : ""
            }`}
            onClick={handleCreate}
            disabled={!formData.question.trim() || !formData.answer.trim()}
            aria-label="Add flashcard"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Flashcard
          </button>
        </div>

        <div className="input-container ai-section">
          <div className="section-header ai-header">
            <div>
              <h3>Generate Flashcard</h3>
              <p className="section-subtitle">
                Generate flashcards automatically from your study material
              </p>
            </div>
          </div>
          {showSuccess && (
            <SuccessMessage
              message={showSuccess}
              onClose={() => setShowSuccess(null)}
            />
          )}
          {error && (
            <div className="error-message">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}
          <div className="input-wrapper">
            <label className="input-label">
              Text Material
              <span className="input-label-note">
                (paste study material, notes, or articles)
              </span>
            </label>
            <textarea
              className="input textarea ai-textarea"
              placeholder="Paste your study material here... (minimum 50 characters)"
              value={aiInputText}
              onChange={handleTextChange}
              maxLength={50000}
              aria-label="Text material for AI generation"
            />
            <div className="character-count">
              {aiInputText.length}/50,000 characters
            </div>
            <div className="text-progress-container">
              <div
                className="text-progress"
                style={{ width: `${(aiInputText.length / 50000) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="divider">
            <span>OR</span>
          </div>
          <div className="input-wrapper">
            <label className="input-label">
              Upload PDF File
              <span className="input-label-note">(max 10MB)</span>
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="input file-input"
              aria-label="Upload PDF file"
            />
            {pdfFile && (
              <div className="file-info">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(1)}MB)
              </div>
            )}
          </div>
          <button
            className={`button ai-generate-button ${
              isGenerating || (!aiInputText.trim() && !pdfFile)
                ? "disabled"
                : ""
            }`}
            disabled={isGenerating || (!aiInputText.trim() && !pdfFile)}
            onClick={handleGenerateFlashcards}
            aria-label="Generate"
          >
            {isGenerating ? (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="spinner"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Generate
              </>
            )}
          </button>
          <div className="ai-note">
            AI will generate 30-60 flashcards based on your content
          </div>
        </div>

        {showUpdateModal && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </div>
                <div>
                  <h2>Update Flashcard</h2>
                  <p className="modal-subtitle">Edit your flashcard content</p>
                </div>
              </div>
              <div className="modal-form">
                <div className="modal-input-group">
                  <label className="modal-label">Question</label>
                  <textarea
                    className="input textarea"
                    placeholder="Enter your question..."
                    value={updateData.question}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, question: e.target.value })
                    }
                    aria-label="Update question"
                    aria-required="true"
                  />
                </div>
                <div className="modal-input-group">
                  <label className="modal-label">Answer</label>
                  <textarea
                    className="input textarea"
                    placeholder="Enter the answer..."
                    value={updateData.answer}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, answer: e.target.value })
                    }
                    aria-label="Update answer"
                    aria-required="true"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowUpdateModal(false)}
                  aria-label="Cancel update"
                >
                  Cancel
                </button>
                <button
                  className={`button save-button ${
                    !updateData.question.trim() || !updateData.answer.trim()
                      ? "disabled"
                      : ""
                  }`}
                  onClick={async () => {
                    if (
                      !updateData.question.trim() ||
                      !updateData.answer.trim()
                    )
                      return;
                    try {
                      const id = flashcards[currentIndex]._id;
                      await api.put(`/flashcards/${id}`, {
                        question: updateData.question,
                        answer: updateData.answer,
                      });
                      setShowUpdateModal(false);
                      fetchFlashcards();
                    } catch (err) {
                      setError("Error updating flashcard.");
                      console.error(err);
                    }
                  }}
                  disabled={
                    !updateData.question.trim() || !updateData.answer.trim()
                  }
                  aria-label="Save updated flashcard"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FlashcardPage;
