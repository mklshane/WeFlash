import { useState, useEffect } from "react";
import '../styles/FlashcardPage.css'

const StudyModeMenu = ({
  answerFirstMode,
  setAnswerFirstMode,
  setShowAnswer,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
}) => {
  const [showModeMenu, setShowModeMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showModeMenu && !e.target.closest(".card-menu")) {
        setShowModeMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showModeMenu]);

  const handleModeChange = (mode) => {
    setAnswerFirstMode(mode);
    setShowAnswer(false);
    setShowModeMenu(false);
  };

  return (
    <div className="card-menu">
      <button
        className={`menu-button ${isHovered.menu ? "hovered" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setShowModeMenu(!showModeMenu);
        }}
        onMouseEnter={() => handleMouseEnter("menu")}
        onMouseLeave={() => handleMouseLeave("menu")}
        aria-label="Study mode options"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
      {showModeMenu && (
        <div className="mode-menu">
            <p>Front</p>
          <button
            className={`mode-option ${!answerFirstMode ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleModeChange(false);
            }}
          >
            Question
          </button>
          <button
            className={`mode-option ${answerFirstMode ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleModeChange(true);
            }}
          >
            Answer
          </button>
        </div>
      )}
    </div>
  );
};

export default StudyModeMenu;
