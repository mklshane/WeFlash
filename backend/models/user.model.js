// models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String }, // optional, if using Firebase only
  image: { type: String }, // URL or path to uploaded image
  isVerified: { type: Boolean, default: false },
});

export default mongoose.model("User", userSchema);
