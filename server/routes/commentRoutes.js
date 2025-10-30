import express from "express";
import { addComment, getCommentsBySubmission, deleteComment } from "../controllers/commentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, addComment);
router.get("/submission/:submissionId", protect, getCommentsBySubmission);
router.delete("/:id", protect, deleteComment);

export default router;
