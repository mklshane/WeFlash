// middleware/firebaseAuth.js
import admin from "../firebaseAdmin.js"; // Firebase Admin SDK

const firebaseAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid;
    next();
  } catch (err) {
    console.error("Firebase token verification failed:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid Firebase token" });
  }
};

export default firebaseAuth;
