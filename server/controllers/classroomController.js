import Classroom from "../models/classroom.js";
import User from "../models/user.js";

// @desc    Create a new classroom
// @route   POST /api/classrooms
// @access  Private (Teacher only)
export const createClassroom = async (req, res) => {
  try {
    const { name, subject, section, room, description } = req.body;

    if (!name || !subject) {
      return res.status(400).json({ message: "Name and subject are required" });
    }

    const classroom = await Classroom.create({
      name,
      subject,
      section: section || 'A',
      room: room || 'TBA',
      description,
      teacher: req.user._id
    });

    res.status(201).json(classroom);
  } catch (error) {
    console.error("Create classroom error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all classrooms (teacher gets their classrooms, student gets enrolled classrooms)
// @route   GET /api/classrooms?page=1&limit=10&q=search
// @access  Private
export const getClassrooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, q = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } }
      ];
    }

    let classrooms;
    let total;

    if (req.user.role === "teacher" || req.user.role === "admin") {
      if (req.user.role === "teacher") {
        query.teacher = req.user._id;
      }
      total = await Classroom.countDocuments(query);
      classrooms = await Classroom.find(query)
        .populate("teacher", "name email")
        .populate("students", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
    } else {
      query.students = req.user._id;
      total = await Classroom.countDocuments(query);
      classrooms = await Classroom.find(query)
        .populate("teacher", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
    }

    res.json({
      classrooms,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    console.error("Get classrooms error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single classroom by ID
// @route   GET /api/classrooms/:id
// @access  Private
export const getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate("teacher", "name email")
      .populate("students", "name email");

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Check if user has access
    const isTeacher = classroom.teacher._id.toString() === req.user._id.toString();
    const isStudent = classroom.students.some(s => s._id.toString() === req.user._id.toString());

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ classroom });
  } catch (error) {
    console.error("Get classroom error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update classroom
// @route   PUT /api/classrooms/:id
// @access  Private (Teacher only)
export const updateClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Check if user is the teacher
    if (classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { name, subject, description, isActive } = req.body;

    classroom.name = name || classroom.name;
    classroom.subject = subject || classroom.subject;
    classroom.description = description || classroom.description;
    classroom.isActive = isActive !== undefined ? isActive : classroom.isActive;

    await classroom.save();

    res.json({ classroom });
  } catch (error) {
    console.error("Update classroom error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete classroom
// @route   DELETE /api/classrooms/:id
// @access  Private (Teacher only)
export const deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Check if user is the teacher
    if (classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await classroom.deleteOne();

    res.json({ message: "Classroom deleted successfully" });
  } catch (error) {
    console.error("Delete classroom error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Join classroom with class code
// @route   POST /api/classrooms/join
// @access  Private (Student only)
export const joinClassroom = async (req, res) => {
  try {
    const { classCode } = req.body;

    if (!classCode) {
      return res.status(400).json({ message: "Class code is required" });
    }

    const classroom = await Classroom.findOne({ classCode: classCode.toUpperCase() });

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found with this code" });
    }

    // Check if already enrolled
    if (classroom.students.includes(req.user._id)) {
      return res.status(400).json({ message: "Already enrolled in this classroom" });
    }

    classroom.students.push(req.user._id);
    await classroom.save();

    res.json({ message: "Successfully joined classroom", classroom });
  } catch (error) {
    console.error("Join classroom error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Leave classroom (student self-remove)
// @route   POST /api/classrooms/:id/leave
// @access  Private (Student only)
export const leaveClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Check if student is enrolled
    if (!classroom.students.includes(req.user._id)) {
      return res.status(400).json({ message: "You are not enrolled in this classroom" });
    }

    classroom.students = classroom.students.filter(
      s => s.toString() !== req.user._id.toString()
    );

    await classroom.save();

    res.json({ message: "Successfully left classroom" });
  } catch (error) {
    console.error("Leave classroom error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove student from classroom
// @route   DELETE /api/classrooms/:id/students/:studentId
// @access  Private (Teacher only)
export const removeStudent = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Check if user is the teacher
    if (classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    classroom.students = classroom.students.filter(
      s => s.toString() !== req.params.studentId
    );

    await classroom.save();

    res.json({ message: "Student removed successfully" });
  } catch (error) {
    console.error("Remove student error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
