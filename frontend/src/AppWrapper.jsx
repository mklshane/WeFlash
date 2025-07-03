// AppWrapper.jsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import App from "./App";

const AppWrapper = () => {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authReady) return <div>Loading...</div>;

  return <App />;
};

export default AppWrapper;
