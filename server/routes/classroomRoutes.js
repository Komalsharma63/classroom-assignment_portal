import express from "express";
import {
  createClassroom,
  getClassrooms,
  getClassroomById,
  updateClassroom,
  deleteClassroom,
  joinClassroom,
  removeStudent
} from "../controllers/classroomController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Classroom CRUD
// Allow teachers OR admins to create/update/delete classrooms
router.post("/", authorize("teacher", "admin"), createClassroom);
router.get("/", getClassrooms);
router.get("/:id", getClassroomById);
router.put("/:id", authorize("teacher", "admin"), updateClassroom);
router.delete("/:id", authorize("teacher", "admin"), deleteClassroom);

// Join classroom
router.post("/join", authorize("student"), joinClassroom);

// Manage students
// Allow teacher or admin to remove a student from a classroom
router.delete("/:id/students/:studentId", authorize("teacher", "admin"), removeStudent);

export default router;
