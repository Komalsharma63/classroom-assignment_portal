import express from "express";
import {
  createSubmission,
  getSubmissionsByAssignment,
  getMySubmissions,
  getSubmissionById,
  gradeSubmission,
  updateSubmission,
  deleteSubmission,
  getGradeDistribution,
  getClassroomGradeDistribution
} from "../controllers/submissionController.js";
import { protect, authorize } from "../middleware/auth.js";
import { upload, setUploadType } from "../config/multer.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student submission routes
router.post(
  "/",
  authorize("student"),
  setUploadType("submission"),
  upload.array("files", 5),
  createSubmission
);
router.get("/my-submissions", authorize("student"), getMySubmissions);
router.put(
  "/:id",
  authorize("student"),
  setUploadType("submission"),
  upload.array("files", 5),
  updateSubmission
);

// Teacher routes
router.get("/assignment/:assignmentId", authorize("teacher", "admin"), getSubmissionsByAssignment);
router.put("/:id/grade", authorize("teacher", "admin"), gradeSubmission);
router.get("/assignment/:assignmentId/distribution", authorize("teacher", "admin"), getGradeDistribution);
router.get("/classroom/:classroomId/distribution", authorize("teacher", "admin"), getClassroomGradeDistribution);

// Shared routes
router.get("/:id", getSubmissionById);
router.delete("/:id", deleteSubmission);

export default router;
