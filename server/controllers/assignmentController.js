import Assignment from "../models/assignment.js";
import Classroom from "../models/classroom.js";
import Submission from "../models/submission.js";

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (Teacher only)
export const createAssignment = async (req, res) => {
  try {
    const { title, description, classroomId, classroom, dueDate, totalPoints, totalMarks, status, allowLateSubmission } = req.body;

    // Support both classroomId and classroom field names
    const classId = classroomId || classroom;
    const points = totalMarks || totalPoints || 100;

    if (!title || !description || !classId || !dueDate) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Verify classroom exists and user is the teacher
    const classroomDoc = await Classroom.findById(classId);
    if (!classroomDoc) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (classroomDoc.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to create assignment in this classroom" });
    }

    // Handle file attachments if any
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
    }

    const assignment = await Assignment.create({
      title,
      description,
      classroom: classId,
      teacher: req.user._id,
      dueDate,
      totalPoints: points,
      status: status || "published",
      allowLateSubmission: allowLateSubmission || false,
      attachments
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate("classroom", "name subject")
      .populate("teacher", "name email");

    // Return with totalMarks for frontend compatibility
    const result = populatedAssignment.toObject();
    result.totalMarks = result.totalPoints;

    res.status(201).json(result);
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all assignments (filtered by user role)
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res) => {
  try {
    let assignments;

    if (req.user.role === "admin") {
      // Admin can see all assignments
      assignments = await Assignment.find({})
        .populate("classroom", "name subject")
        .populate("teacher", "name email")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "teacher") {
      // Get assignments created by teacher
      assignments = await Assignment.find({ teacher: req.user._id })
        .populate("classroom", "name subject")
        .sort({ createdAt: -1 });
    } else {
      // Get assignments for student's enrolled classrooms
      const classrooms = await Classroom.find({ students: req.user._id }).select("_id");
      const classroomIds = classrooms.map(c => c._id);

      assignments = await Assignment.find({
        classroom: { $in: classroomIds },
        status: "published"
      })
        .populate("classroom", "name subject")
        .populate("teacher", "name email")
        .sort({ dueDate: 1 });
    }

    // Add totalMarks field for frontend compatibility
    const formattedAssignments = assignments.map(a => {
      const obj = a.toObject();
      obj.totalMarks = obj.totalPoints;
      return obj;
    });

    res.json(formattedAssignments);
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get assignments by classroom with pagination and filters
// @route   GET /api/assignments/classroom/:classroomId?page=1&limit=10&q=search&status=published
// @access  Private
export const getAssignmentsByClassroom = async (req, res) => {
  try {
    const { page = 1, limit = 10, q = '', status, upcoming, overdue } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const classroom = await Classroom.findById(req.params.classroomId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Check access
    const isTeacher = classroom.teacher.toString() === req.user._id.toString();
    const isStudent = classroom.students.some(s => s.toString() === req.user._id.toString());

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Access denied" });
    }

    const query = { classroom: req.params.classroomId };

    // Search by title or description
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    } else if (!isTeacher) {
      query.status = "published";
    }

    // Date filters
    const now = new Date();
    if (upcoming === 'true') {
      query.dueDate = { $gt: now };
    }
    if (overdue === 'true') {
      query.dueDate = { $lt: now };
    }

    const total = await Assignment.countDocuments(query);
    const assignments = await Assignment.find(query)
      .populate("teacher", "name email")
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limitNum);

    // Add totalMarks field for frontend compatibility
    const formattedAssignments = assignments.map(a => {
      const obj = a.toObject();
      obj.totalMarks = obj.totalPoints;
      return obj;
    });

    res.json({
      assignments: formattedAssignments,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    console.error("Get classroom assignments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("classroom", "name subject students")
      .populate("teacher", "name email");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check access
    const isTeacher = assignment.teacher._id.toString() === req.user._id.toString();
    const isStudent = assignment.classroom.students.some(s => s.toString() === req.user._id.toString());

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Access denied" });
    }

    // If student, check if they have submitted
    let submission = null;
    if (req.user.role === "student") {
      submission = await Submission.findOne({
        assignment: assignment._id,
        student: req.user._id
      });
    }

    res.json({ assignment, submission });
  } catch (error) {
    console.error("Get assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Teacher only)
export const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if user is the teacher
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, dueDate, totalPoints, status, allowLateSubmission } = req.body;

    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;
    assignment.totalPoints = totalPoints !== undefined ? totalPoints : assignment.totalPoints;
    assignment.status = status || assignment.status;
    assignment.allowLateSubmission = allowLateSubmission !== undefined ? allowLateSubmission : assignment.allowLateSubmission;

    // Handle new file attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
      assignment.attachments = [...assignment.attachments, ...newAttachments];
    }

    await assignment.save();

    const updatedAssignment = await Assignment.findById(assignment._id)
      .populate("classroom", "name subject")
      .populate("teacher", "name email");

    res.json({ assignment: updatedAssignment });
  } catch (error) {
    console.error("Update assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher only)
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if user is the teacher
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete all submissions for this assignment
    await Submission.deleteMany({ assignment: assignment._id });

    await assignment.deleteOne();

    res.json({ message: "Assignment and all submissions deleted successfully" });
  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
