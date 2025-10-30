import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();
const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "API is working" });
});

// Debug route: list registered routes (temporary)
app.get('/__routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // routes registered directly on the app
      const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase()).join(',');
      routes.push(`${methods} ${middleware.route.path}`);
    } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
      // routes added as router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).map(m => m.toUpperCase()).join(',');
          // include the mount path if available
          routes.push(`${methods} ${handler.route.path}`);
        }
      });
    }
  });
  res.json(routes);
});

// Import routes
import authRoutes from "./routes/authRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

// Temporary debug-only endpoint (unprotected) to list users from DB
import User from './models/user.js';
app.get('/debug-users', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/comments", commentRoutes);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
