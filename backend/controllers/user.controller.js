import User from "../models/user.model.js";

export const getUserData = async (req, res) => {
  try {
    const firebaseUid = req.userId || req.headers["x-user-id"]; // from firebaseAuth middleware

    if (!firebaseUid) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not logged in.",
      });
    }

    // Search by firebaseUid instead of _id
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error getting user data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
