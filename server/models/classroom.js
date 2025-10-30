import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    trim: true,
    default: 'A'
  },
  room: {
    type: String,
    trim: true,
    default: 'TBA'
  },
  description: {
    type: String,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  classCode: {
    type: String,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Generate unique class code before saving
classroomSchema.pre("save", async function(next) {
  if (!this.classCode || this.isNew) {
    // Generate a unique 6-character code
    let code;
    let isUnique = false;

    while (!isUnique) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await mongoose.model('Classroom').findOne({ classCode: code });
      if (!existing) {
        isUnique = true;
      }
    }

    this.classCode = code;
  }
  next();
});

export default mongoose.model("Classroom", classroomSchema);
