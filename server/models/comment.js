import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Submission",
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null
  }
}, { timestamps: true });

// Index for faster queries
commentSchema.index({ submission: 1, createdAt: -1 });

export default mongoose.model("Comment", commentSchema);
