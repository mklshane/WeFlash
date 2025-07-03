import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Deck.css";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInitial, setUserInitial] = useState("?");
  const [displayName, setDisplayName] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const name = user.displayName || "User";
      setDisplayName(name);
      setUserInitial(name.charAt(0).toUpperCase());
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("firebaseToken");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest("[data-profile-dropdown]")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="profile-dropdown-container" data-profile-dropdown>
      <div
        className="profile-circle"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-label={`Toggle profile menu for ${displayName}`}
        aria-expanded={isOpen}
      >
        {userInitial}
      </div>

      <div className={`profile-dropdown ${isOpen ? "show" : ""}`}>
        <div className="dropdown-item profile-info" role="menuitem">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {displayName}
        </div>

        <div className="dropdown-divider" />

        <div
          className="dropdown-item logout-item"
          onClick={handleLogout}
          role="menuitem"
          aria-label="Logout"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </div>
      </div>
    </div>
  );
};
