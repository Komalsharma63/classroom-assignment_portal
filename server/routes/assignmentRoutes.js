import express from "express";
import {
  createAssignment,
  getAssignments,
  getAssignmentsByClassroom,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
} from "../controllers/assignmentController.js";
import { protect, authorize } from "../middleware/auth.js";
import { upload, setUploadType } from "../config/multer.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Assignment CRUD
// Allow teachers OR admins to create/update/delete assignments
router.post(
  "/",
  authorize("teacher", "admin"),
  setUploadType("assignment"),
  upload.array("files", 5),
  createAssignment
);
router.get("/", getAssignments);
router.get("/classroom/:classroomId", getAssignmentsByClassroom);
router.get("/:id", getAssignmentById);
router.put(
  "/:id",
  authorize("teacher", "admin"),
  setUploadType("assignment"),
  upload.array("files", 5),
  updateAssignment
);
router.delete("/:id", authorize("teacher", "admin"), deleteAssignment);

export default router;
