# Classroom Assignment Portal - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include JWT token in header:
```
Authorization: Bearer <token>
```

---

## 📌 Authentication Routes (`/api/auth`)

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" // or "teacher"
}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "jwt_token_here"
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

---

## 🏫 Classroom Routes (`/api/classrooms`)

### Create Classroom (Teacher Only)
**POST** `/classrooms`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Mathematics 101",
  "subject": "Mathematics",
  "description": "Advanced calculus course"
}
```

**Response:**
```json
{
  "classroom": {
    "_id": "...",
    "name": "Mathematics 101",
    "subject": "Mathematics",
    "classCode": "ABC123",
    "teacher": {...},
    "students": []
  }
}
```

### Get All Classrooms
**GET** `/classrooms`

**Headers:** `Authorization: Bearer <token>`

**Response:**
- Teachers: Get classrooms they created
- Students: Get classrooms they're enrolled in

### Get Classroom by ID
**GET** `/classrooms/:id`

### Update Classroom (Teacher Only)
**PUT** `/classrooms/:id`

**Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "isActive": true
}
```

### Delete Classroom (Teacher Only)
**DELETE** `/classrooms/:id`

### Join Classroom (Student Only)
**POST** `/classrooms/join`

**Body:**
```json
{
  "classCode": "ABC123"
}
```

### Remove Student from Classroom (Teacher Only)
**DELETE** `/classrooms/:id/students/:studentId`

---

## 📝 Assignment Routes (`/api/assignments`)

### Create Assignment (Teacher Only)
**POST** `/assignments`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (FormData):**
```
title: "Assignment 1"
description: "Complete chapters 1-3"
classroom: "classroom_id"
dueDate: "2025-11-15T23:59:59"
totalPoints: 100
status: "published" // or "draft"
allowLateSubmission: false
files: [file1, file2] // optional attachments
```

### Get All Assignments
**GET** `/assignments`

**Headers:** `Authorization: Bearer <token>`

**Response:**
- Teachers: Assignments they created
- Students: Published assignments from enrolled classrooms

### Get Assignments by Classroom
**GET** `/assignments/classroom/:classroomId`

### Get Assignment by ID
**GET** `/assignments/:id`

**Response:**
```json
{
  "assignment": {
    "_id": "...",
    "title": "Assignment 1",
    "description": "...",
    "dueDate": "...",
    "totalPoints": 100,
    "attachments": [...]
  },
  "submission": {...} // if student has submitted
}
```

### Update Assignment (Teacher Only)
**PUT** `/assignments/:id`

**Body (FormData):** Same as create

### Delete Assignment (Teacher Only)
**DELETE** `/assignments/:id`

---

## 📤 Submission Routes (`/api/submissions`)

### Submit Assignment (Student Only)
**POST** `/submissions`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (FormData):**
```
assignmentId: "assignment_id"
content: "My submission text"
files: [file1, file2] // optional attachments
```

### Get My Submissions (Student Only)
**GET** `/submissions/my-submissions`

**Response:**
```json
{
  "submissions": [
    {
      "_id": "...",
      "assignment": {...},
      "submittedAt": "...",
      "status": "graded",
      "grade": 85,
      "feedback": "Good work!"
    }
  ]
}
```

### Get Submissions by Assignment (Teacher Only)
**GET** `/submissions/assignment/:assignmentId`

**Response:**
```json
{
  "submissions": [...],
  "missingSubmissions": [...],
  "stats": {
    "total": 30,
    "submitted": 25,
    "missing": 5,
    "graded": 20
  }
}
```

### Get Submission by ID
**GET** `/submissions/:id`

### Grade Submission (Teacher Only)
**PUT** `/submissions/:id/grade`

**Body:**
```json
{
  "grade": 85,
  "feedback": "Excellent work! Well done."
}
```

### Update Submission (Student Only - Resubmit)
**PUT** `/submissions/:id`

**Body (FormData):**
```
content: "Updated submission"
files: [new_file]
```

### Delete Submission
**DELETE** `/submissions/:id`

---

## 📁 File Upload

### Upload Limits
- Max file size: 10MB
- Max files per upload: 5

### Allowed File Types
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
- Images: JPEG, PNG, JPG
- Archives: ZIP

### Access Uploaded Files
**GET** `/uploads/<folder>/<filename>`

Example: `http://localhost:5000/uploads/submission/12345-document.pdf`

---

## 🔒 Role-Based Access Control

### Roles
- **student**: Can join classrooms, view/submit assignments, view their grades
- **teacher**: Can create classrooms/assignments, grade submissions
- **admin**: Full access (not implemented in current version)

### Protected Routes
- Routes with `authorize("teacher")` - Only teachers can access
- Routes with `authorize("student")` - Only students can access
- Routes with `protect` only - Any authenticated user

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "message": "User role 'student' is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "message": "Server error"
}
```
