import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./config/firebase";
import "./styles/SignIn.css";

// --- Component ---
function SignIn() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseToken = await result.user.getIdToken();
      localStorage.setItem("firebaseToken", firebaseToken);
      navigate("/decks");
    } catch (err) {
      console.error(err);
      setError("Google Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="navbar">
        <div className="nav-logo" onClick={() => navigate("/")}>
          WeFlash
        </div>
      </div>

      <div className="signin-content">
        <div className="signin-card">
          <h2 className="signin-title">Welcome to WeFlash</h2>
          <p className="signin-subtitle">
            Sign in with your Google account to continue
          </p>

          {error && <div className="signin-error">{error}</div>}

          <button
            className={`cta-button primary ${loading ? "loading" : ""}`}
            onClick={handleGoogleLogin}
            disabled={loading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="google-logo">
              <svg width="20" height="20" viewBox="0 0 533.5 544.3">
                <path
                  fill="#4285F4"
                  d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.3h147.4c-6.4 34.8-25.6 64.3-54.5 84.2v69.8h87.9c51.4-47.3 80.7-117 80.7-198.9z"
                />
                <path
                  fill="#34A853"
                  d="M272 544.3c73.8 0 135.7-24.5 180.9-66.6l-87.9-69.8c-24.4 16.3-55.5 25.9-92.9 25.9-71.5 0-132-48.2-153.7-112.9H27.6v70.9c45.2 89.2 137.5 152.5 244.4 152.5z"
                />
                <path
                  fill="#FBBC04"
                  d="M118.3 320.9c-10.2-30.2-10.2-62.6 0-92.8V157.2H27.6c-40.6 80.4-40.6 176.3 0 256.7l90.7-70.9z"
                />
                <path
                  fill="#EA4335"
                  d="M272 107.6c39.9 0 75.8 13.8 104.1 40.8l78-78C404.3 25.3 343.5 0 272 0 165.1 0 72.8 63.3 27.6 152.5l90.7 70.9C140 155.8 200.5 107.6 272 107.6z"
                />
              </svg>
            </span>
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
