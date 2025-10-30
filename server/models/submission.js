import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    trim: true
  },
  submissionUrl: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ["submitted", "graded", "late", "missing"],
    default: "submitted"
  },
  grade: {
    type: Number,
    min: 0
  },
  feedback: {
    type: String
  },
  gradedAt: {
    type: Date
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

// Ensure one submission per student per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

// Check if submission is late
submissionSchema.virtual("isLate").get(function() {
  if (!this.assignment || !this.assignment.dueDate) return false;
  return this.submittedAt > this.assignment.dueDate;
});

// Include virtuals in JSON
submissionSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Submission", submissionSchema);
