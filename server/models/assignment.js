import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalPoints: {
    type: Number,
    default: 100
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ["draft", "published", "closed"],
    default: "published"
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for faster queries
assignmentSchema.index({ classroom: 1, createdAt: -1 });
assignmentSchema.index({ teacher: 1 });

export default mongoose.model("Assignment", assignmentSchema);
