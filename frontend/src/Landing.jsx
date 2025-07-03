import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Landing.css";

const Landing = () => {
  const [isHovered, setIsHovered] = useState({});
  const navigate = useNavigate();

  const handleMouseEnter = (element) => {
    setIsHovered((prev) => ({ ...prev, [element]: true }));
  };

  const handleMouseLeave = (element) => {
    setIsHovered((prev) => ({ ...prev, [element]: false }));
  };

  return (
    <div className="landing-container">
      <div className="navbar">
        <div className="nav-logo" onClick={() => navigate("/")}>
          WeFlash
        </div>
        <div className="nav-links">
          <button
            className="cta-button primary"
            onMouseEnter={() => handleMouseEnter("signIn")}
            onMouseLeave={() => handleMouseLeave("signIn")}
            onClick={() => navigate("/signin")}
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
            </svg>
            "Learning never exhausts the mind."
          </div>

          <h1 className="hero-title">
            Master Anything with <span className="gradient-text">WeFlash</span>
          </h1>

          <p className="hero-description">
            Create, study, and share interactive flashcards to learn faster and
            smarter. Perfect for students, professionals, and lifelong learners.
          </p>

          <div className="hero-buttons">
            <button
              className="cta-button primary"
              onClick={() => {
                navigate("/signin");
              }}
            >
              Start Learning Now
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12,5 19,12 12,19" />
              </svg>
            </button>
          </div>

          {/* Hero Illustration */}
          <div className="hero-visual">
            <div className="mockup-container">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="mockup-content">
                <div className="flashcard-demo">
                  <div className="card-front">
                    <h3>What is the capital of France?</h3>
                    <div className="card-hint">Geography • Easy</div>
                  </div>
                  <div className="card-actions">
                    <button className="card-btn">Show Answer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="content-section">
        <div className="inner-content">
          <h2 className="section-heading">Why Use WeFlash?</h2>
          <p className="section-subtext">
            Powerful features to make learning engaging and effective.
          </p>
          <div className="feature-grid">
            <div className="feature-item">
              <h3 className="feature-title">Generate Flashcards</h3>
              <p className="feature-description">
                Use AI to quickly turn text or PDFs into flashcards for faster
                and smarter studying.
              </p>
            </div>
           {/*  <div className="feature-item">
              <h3 className="feature-title">Spaced Repetition</h3>
              <p className="feature-description">
                Optimize retention with our intelligent review algorithm.
              </p>
            </div>
            <div className="feature-item">
              <h3 className="feature-title">Collaborate & Share</h3>
              <p className="feature-description">
                Share decks with friends or join community-created flashcards.
              </p>
            </div> */}
          </div>
        </div>
      </div>

      {/* Call-to-Action Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2 className="section-heading">Ready to Boost Your Learning?</h2>
          <p className="section-subtext">
            Achieve you academic goals with WeFlash
          </p>
          <button
            className="cta-button primary"
            style={{ border: "1px solid white" }}
            onClick={() => navigate("/signin")}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
