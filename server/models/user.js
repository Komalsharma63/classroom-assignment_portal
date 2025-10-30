
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["student","teacher","admin"], default: "student" },
  profile: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model("User", userSchema);

