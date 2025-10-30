import Comment from "../models/comment.js";
import Submission from "../models/submission.js";
import Assignment from "../models/assignment.js";

// @desc    Add a comment to a submission
// @route   POST /api/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { submissionId, text, parentCommentId } = req.body;

    if (!submissionId || !text) {
      return res.status(400).json({ message: "Submission ID and text are required" });
    }

    // Verify submission exists
    const submission = await Submission.findById(submissionId)
      .populate("assignment")
      .populate("student");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Get assignment to check authorization
    const assignment = await Assignment.findById(submission.assignment).populate("classroom");

    // Check if user is the teacher or the student who made the submission
    const isTeacher = assignment.teacher.toString() === req.user._id.toString();
    const isStudent = submission.student._id.toString() === req.user._id.toString();

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Not authorized to comment on this submission" });
    }

    const comment = await Comment.create({
      submission: submissionId,
      author: req.user._id,
      text,
      parentComment: parentCommentId || null
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "name email role");

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all comments for a submission
// @route   GET /api/comments/submission/:submissionId
// @access  Private
export const getCommentsBySubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate("assignment")
      .populate("student");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Get assignment to check authorization
    const assignment = await Assignment.findById(submission.assignment);

    // Check if user is the teacher or the student who made the submission
    const isTeacher = assignment.teacher.toString() === req.user._id.toString();
    const isStudent = submission.student._id.toString() === req.user._id.toString();

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Not authorized to view these comments" });
    }

    const comments = await Comment.find({ submission: req.params.submissionId })
      .populate("author", "name email role")
      .populate("parentComment")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only the author can delete their comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
