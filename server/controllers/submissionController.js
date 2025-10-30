import Submission from "../models/submission.js";
import Assignment from "../models/assignment.js";
import Classroom from "../models/classroom.js";

// @desc    Submit an assignment
// @route   POST /api/submissions
// @access  Private (Student only)
export const createSubmission = async (req, res) => {
  try {
    const { assignmentId, content, submissionUrl } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: "Assignment ID is required" });
    }

    // Verify assignment exists
    const assignment = await Assignment.findById(assignmentId).populate("classroom");
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if student is enrolled in the classroom
    const classroom = await Classroom.findById(assignment.classroom);
    if (!classroom.students.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not enrolled in this classroom" });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: "You have already submitted this assignment" });
    }

    // Check due date
    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);

    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({ message: "Assignment deadline has passed and late submissions are not allowed" });
    }

    // Handle file attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      content,
      submissionUrl,
      attachments,
      status: isLate ? "late" : "submitted"
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate("assignment", "title dueDate totalPoints")
      .populate("student", "name email");

    res.status(201).json({ submission: populatedSubmission });
  } catch (error) {
    console.error("Create submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all submissions for an assignment (teacher view)
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private (Teacher only)
export const getSubmissionsByAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId).populate("classroom");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if user is the teacher
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate("student", "name email")
      .sort({ submittedAt: -1 });

    // Get all students in the classroom
    const classroom = await Classroom.findById(assignment.classroom).populate("students", "name email");
    const allStudents = classroom.students;

    // Find students who haven't submitted
    const submittedStudentIds = submissions.map(s => s.student._id.toString());
    const missingSubmissions = allStudents
      .filter(student => !submittedStudentIds.includes(student._id.toString()))
      .map(student => ({
        student: {
          _id: student._id,
          name: student.name,
          email: student.email
        },
        status: "missing"
      }));

    res.json({
      submissions,
      missingSubmissions,
      stats: {
        total: allStudents.length,
        submitted: submissions.length,
        missing: missingSubmissions.length,
        graded: submissions.filter(s => s.status === "graded").length
      }
    });
  } catch (error) {
    console.error("Get submissions by assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get student's own submissions
// @route   GET /api/submissions/my-submissions
// @access  Private (Student only)
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate("assignment", "title dueDate totalPoints classroom")
      .populate({
        path: "assignment",
        populate: { path: "classroom", select: "name subject" }
      })
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (error) {
    console.error("Get my submissions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("assignment", "title description dueDate totalPoints")
      .populate("student", "name email")
      .populate("gradedBy", "name email");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Check access
    const assignment = await Assignment.findById(submission.assignment._id);
    const isTeacher = assignment.teacher.toString() === req.user._id.toString();
    const isStudent = submission.student._id.toString() === req.user._id.toString();

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ submission });
  } catch (error) {
    console.error("Get submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Grade a submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Teacher only)
export const gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;

    const submission = await Submission.findById(req.params.id).populate("assignment");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Verify teacher owns the assignment
    const assignment = await Assignment.findById(submission.assignment._id);
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to grade this submission" });
    }

    // Validate grade
    if (grade !== undefined && (grade < 0 || grade > assignment.totalPoints)) {
      return res.status(400).json({
        message: `Grade must be between 0 and ${assignment.totalPoints}`
      });
    }

    submission.grade = grade;
    submission.feedback = feedback || submission.feedback;
    submission.status = "graded";
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;

    await submission.save();

    const updatedSubmission = await Submission.findById(submission._id)
      .populate("assignment", "title totalPoints")
      .populate("student", "name email")
      .populate("gradedBy", "name email");

    res.json({ submission: updatedSubmission });
  } catch (error) {
    console.error("Grade submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update submission (resubmit)
// @route   PUT /api/submissions/:id
// @access  Private (Student only)
export const updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate("assignment");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Check if user is the student who submitted
    if (submission.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if already graded
    if (submission.status === "graded") {
      return res.status(400).json({ message: "Cannot update graded submission" });
    }

    const { content, submissionUrl } = req.body;

    submission.content = content || submission.content;
    submission.submissionUrl = submissionUrl || submission.submissionUrl;

    // Handle new file attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
      submission.attachments = [...submission.attachments, ...newAttachments];
    }

    submission.submittedAt = new Date();

    await submission.save();

    const updatedSubmission = await Submission.findById(submission._id)
      .populate("assignment", "title dueDate totalPoints")
      .populate("student", "name email");

    res.json({ submission: updatedSubmission });
  } catch (error) {
    console.error("Update submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private (Student only - own submission, or Teacher)
export const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate("assignment");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const assignment = await Assignment.findById(submission.assignment._id);
    const isTeacher = assignment.teacher.toString() === req.user._id.toString();
    const isStudent = submission.student.toString() === req.user._id.toString();

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await submission.deleteOne();

    res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.error("Delete submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get grade distribution for an assignment (MongoDB Aggregation)
// @route   GET /api/submissions/assignment/:assignmentId/distribution
// @access  Private (Teacher only)
export const getGradeDistribution = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Verify teacher owns the assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // MongoDB Aggregation Pipeline for grade distribution
    const distribution = await Submission.aggregate([
      {
        $match: {
          assignment: assignment._id,
          status: "graded",
          grade: { $exists: true, $ne: null }
        }
      },
      {
        $bucket: {
          groupBy: "$grade",
          boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, Infinity],
          default: "Other",
          output: {
            count: { $sum: 1 },
            students: {
              $push: {
                studentId: "$student",
                grade: "$grade"
              }
            }
          }
        }
      },
      {
        $project: {
          range: "$_id",
          count: 1,
          students: 1,
          _id: 0
        }
      },
      {
        $sort: { range: 1 }
      }
    ]);

    // Calculate statistics
    const stats = await Submission.aggregate([
      {
        $match: {
          assignment: assignment._id,
          status: "graded",
          grade: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgGrade: { $avg: "$grade" },
          maxGrade: { $max: "$grade" },
          minGrade: { $min: "$grade" },
          totalGraded: { $sum: 1 }
        }
      }
    ]);

    // Get total submissions (including ungraded)
    const totalSubmissions = await Submission.countDocuments({
      assignment: req.params.assignmentId
    });

    res.json({
      assignment: {
        id: assignment._id,
        title: assignment.title,
        totalPoints: assignment.totalPoints
      },
      distribution,
      statistics: stats[0] || {
        avgGrade: 0,
        maxGrade: 0,
        minGrade: 0,
        totalGraded: 0
      },
      totalSubmissions,
      totalGraded: stats[0]?.totalGraded || 0,
      totalUngraded: totalSubmissions - (stats[0]?.totalGraded || 0)
    });
  } catch (error) {
    console.error("Get grade distribution error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get grade distribution for a classroom (all assignments)
// @route   GET /api/submissions/classroom/:classroomId/distribution
// @access  Private (Teacher only)
export const getClassroomGradeDistribution = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.classroomId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Verify teacher owns the classroom
    if (classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get all assignments for this classroom
    const assignments = await Assignment.find({ classroom: req.params.classroomId });
    const assignmentIds = assignments.map(a => a._id);

    // Aggregation pipeline for classroom-wide distribution
    const distribution = await Submission.aggregate([
      {
        $match: {
          assignment: { $in: assignmentIds },
          status: "graded",
          grade: { $exists: true, $ne: null }
        }
      },
      {
        $lookup: {
          from: "assignments",
          localField: "assignment",
          foreignField: "_id",
          as: "assignmentDetails"
        }
      },
      {
        $unwind: "$assignmentDetails"
      },
      {
        $addFields: {
          percentageGrade: {
            $multiply: [
              { $divide: ["$grade", "$assignmentDetails.totalPoints"] },
              100
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: "$percentageGrade",
          boundaries: [0, 60, 70, 80, 90, 100, Infinity],
          default: "F",
          output: {
            count: { $sum: 1 },
            avgPercentage: { $avg: "$percentageGrade" }
          }
        }
      },
      {
        $project: {
          range: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "F (0-59%)" },
                { case: { $eq: ["$_id", 60] }, then: "D (60-69%)" },
                { case: { $eq: ["$_id", 70] }, then: "C (70-79%)" },
                { case: { $eq: ["$_id", 80] }, then: "B (80-89%)" },
                { case: { $eq: ["$_id", 90] }, then: "A (90-100%)" }
              ],
              default: "Other"
            }
          },
          count: 1,
          avgPercentage: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      classroom: {
        id: classroom._id,
        name: classroom.name
      },
      distribution,
      totalAssignments: assignments.length
    });
  } catch (error) {
    console.error("Get classroom grade distribution error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
