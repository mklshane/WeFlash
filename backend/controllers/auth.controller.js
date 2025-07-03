import User from "../models/user.model.js";
import transporter from "../config/node.mailer.js";

// Sync Firebase user info into MongoDB (create or update)
export const syncFirebaseUser = async (req, res) => {
  try {
    const { name, email, image } = req.body;
    const firebaseUid = req.userId;

    if (!firebaseUid || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Firebase UID or email." });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { $set: { name, email, image } },
      { upsert: true, new: true }
    );

    return res.json({ success: true, message: "User synced", user });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Logout (just clear any cookies if used — optional for Firebase)
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged out." });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Send verify email OTP (Firebase handles email verification, but if needed)
export const sendVerifyOTP = async (req, res) => {
  try {
    const firebaseUid = req.userId;
    const user = await User.findOne({ firebaseUid });

    if (!user) return res.json({ success: false, message: "User not found." });
    if (user.isVerified)
      return res.json({ success: false, message: "Account already verified." });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. Verify your account using this OTP.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Verification OTP sent to email." });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const firebaseUid = req.userId;

  if (!firebaseUid || !otp) {
    return res.json({
      success: false,
      message: "Missing OTP or Firebase UID.",
    });
  }

  try {
    const user = await User.findOne({ firebaseUid });
    if (!user) return res.json({ success: false, message: "User not found." });

    if (!user.verifyOtp || user.verifyOtp.trim() !== otp.trim()) {
      return res.json({ success: false, message: "Invalid OTP." });
    }

    if (user.verifyOtpExpiresAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired." });
    }

    user.isVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiresAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Auth check (client must send a valid Firebase token in headers)
export const isAuthenticated = async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Send password reset OTP (only if managing passwords manually, but Firebase has built-in flow)
export const sendResetOTP = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.json({ success: false, message: "Email is required." });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found." });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for resetting your password is ${otp}.`,
    };

    await transporter.sendMail(mailOption);
    return res.json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Reset password (only valid if you manually handle passwords)
import bcrypt from "bcryptjs";

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Missing details." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found." });

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP." });
    }

    if (user.resetOtpExpiresAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiresAt = 0;
    await user.save();

    return res.json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
