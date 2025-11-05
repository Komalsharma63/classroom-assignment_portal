import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../App.css'
import { API_URL, API_BASE } from '../config'

function StudentDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [classrooms, setClassrooms] = useState([])
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState(null)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [classCode, setClassCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [submissionForm, setSubmissionForm] = useState({
    content: '',
    submissionUrl: ''
  })
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [viewingComments, setViewingComments] = useState(null)
  const [editingSubmission, setEditingSubmission] = useState(null)
  const [editForm, setEditForm] = useState({ content: '', submissionUrl: '' })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!storedUser || !token) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(storedUser)
    if (userData.role !== 'student') {
      navigate('/')
      return
    }

    setUser(userData)
    fetchClassrooms()
  }, [navigate])

  const fetchClassrooms = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/classrooms?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Handle paginated response
      const classroomsData = response.data.classrooms || response.data
      setClassrooms(Array.isArray(classroomsData) ? classroomsData : [])
      setLoading(false)
    } catch (err) {
      console.error('Fetch classrooms error:', err)
      setError('Failed to fetch classrooms')
      setLoading(false)
    }
  }

  const fetchAssignments = async (classroomId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/assignments/classroom/${classroomId}?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Handle paginated response
      const assignmentsData = response.data.assignments || response.data
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
    } catch (err) {
      console.error('Fetch assignments error:', err)
      setError('Failed to fetch assignments')
    }
  }

  const fetchSubmissions = async (assignmentId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/submissions/assignment/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSubmissions(response.data)
    } catch (err) {
      console.error('Failed to fetch submissions')
    }
  }

  const handleJoinClassroom = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/classrooms/join`, { classCode }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowJoinModal(false)
      setClassCode('')
      fetchClassrooms()
      alert('Successfully joined classroom!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join classroom')
    }
  }

  const handleLeaveClassroom = async (id) => {
    if (!window.confirm('Are you sure you want to leave this classroom?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/classrooms/${id}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchClassrooms()
      alert('Successfully left classroom!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave classroom')
    }
  }

  const handleSubmitAssignment = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/submissions`, {
        assignmentId: selectedAssignment._id,
        ...submissionForm
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowSubmitModal(false)
      setSubmissionForm({ content: '', submissionUrl: '' })
      fetchSubmissions(selectedAssignment._id)
      alert('Assignment submitted successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit assignment')
    }
  }

  const handleDeleteSubmission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/submissions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (selectedAssignment) {
        fetchSubmissions(selectedAssignment._id)
      }
      alert('Submission deleted successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete submission')
    }
  }

  const fetchComments = async (submissionId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/comments/submission/${submissionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setComments(response.data || [])
      setViewingComments(submissionId)
    } catch (err) {
      console.error('Failed to fetch comments:', err)
      setComments([])
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/comments`, {
        submissionId: viewingComments,
        text: newComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNewComment('')
      await fetchComments(viewingComments)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment')
    }
  }

  const openEditModal = (submission) => {
    setEditingSubmission(submission)
    setEditForm({
      content: submission.content || '',
      submissionUrl: submission.submissionUrl || ''
    })
  }

  const handleUpdateSubmission = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/submissions/${editingSubmission._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEditingSubmission(null)
      setEditForm({ content: '', submissionUrl: '' })
      if (selectedAssignment) {
        fetchSubmissions(selectedAssignment._id)
      }
      alert('Submission updated successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update submission')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleViewClassroom = (classroom) => {
    setSelectedClassroom(classroom)
    fetchAssignments(classroom._id)
  }

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment)
    fetchSubmissions(assignment._id)
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="app">
      <nav className="navbar">
        <h1 style={{cursor: 'pointer'}} onClick={() => navigate('/')}>📚 Student Dashboard</h1>
        <div className="nav-links">
          <span style={{marginRight: '1rem', color: '#333'}}>
            Welcome, {user?.name}
          </span>
          <button className="btn btn-outline" style={{marginRight: '0.5rem'}} onClick={() => navigate('/profile')}>
            👤 Profile
          </button>
          <button className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container">
        {error && <div className="error">{error}</div>}

        {!selectedClassroom ? (
          <>
            <div className="hero">
              <h2>My Classrooms</h2>
              <p>View your enrolled classes and assignments</p>
            </div>

            <button
              className="btn btn-primary"
              style={{marginBottom: '2rem'}}
              onClick={() => setShowJoinModal(true)}
            >
              + Join Classroom
            </button>

            <div className="cards-grid">
              {classrooms.length === 0 ? (
                <div className="card">
                  <h3>No Classrooms Yet</h3>
                  <p>Join your first classroom to get started!</p>
                </div>
              ) : (
                classrooms.map(classroom => (
                  <div key={classroom._id} className="card">
                    <h3>{classroom.name}</h3>
                    <p style={{color: '#666', marginBottom: '0.5rem'}}>
                      <strong>Subject:</strong> {classroom.subject}
                    </p>
                    <p style={{color: '#666', marginBottom: '0.5rem'}}>
                      <strong>Section:</strong> {classroom.section}
                    </p>
                    <p style={{color: '#666', marginBottom: '1rem'}}>
                      <strong>Room:</strong> {classroom.room}
                    </p>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button
                        className="btn btn-primary"
                        style={{flex: 1}}
                        onClick={() => handleViewClassroom(classroom)}
                      >
                        View Assignments
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{flex: 1, borderColor: '#ef4444', color: '#ef4444'}}
                        onClick={() => handleLeaveClassroom(classroom._id)}
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : !selectedAssignment ? (
          <>
            <button
              className="btn btn-outline"
              style={{marginBottom: '1rem'}}
              onClick={() => {
                setSelectedClassroom(null)
                setAssignments([])
              }}
            >
              ← Back to Classrooms
            </button>

            <div className="hero">
              <h2>{selectedClassroom.name}</h2>
              <p>{selectedClassroom.subject} - {selectedClassroom.section}</p>
            </div>

            <div className="cards-grid">
              {assignments.length === 0 ? (
                <div className="card">
                  <h3>No Assignments Yet</h3>
                  <p>Your teacher hasn't posted any assignments yet.</p>
                </div>
              ) : (
                assignments.map(assignment => (
                  <div key={assignment._id} className="card">
                    <h3>{assignment.title}</h3>
                    <p style={{color: '#666', marginBottom: '0.5rem'}}>
                      {assignment.description}
                    </p>
                    <p style={{color: '#666', marginBottom: '0.5rem'}}>
                      <strong>Due:</strong> {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    <p style={{color: '#666', marginBottom: '1rem'}}>
                      <strong>Total Marks:</strong> {assignment.totalMarks}
                    </p>
                    <button
                      className="btn btn-primary"
                      style={{width: '100%'}}
                      onClick={() => handleViewAssignment(assignment)}
                    >
                      View & Submit
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <button
              className="btn btn-outline"
              style={{marginBottom: '1rem'}}
              onClick={() => {
                setSelectedAssignment(null)
                setSubmissions([])
              }}
            >
              ← Back to Assignments
            </button>

            <div className="hero">
              <h2>{selectedAssignment.title}</h2>
              <p>{selectedAssignment.description}</p>
            </div>

            <button
              className="btn btn-primary"
              style={{marginBottom: '2rem'}}
              onClick={() => setShowSubmitModal(true)}
            >
              + Submit Assignment
            </button>

            <h3 style={{color: 'white', marginBottom: '1rem'}}>My Submissions</h3>
            <div className="cards-grid">
              {submissions.filter(s => s.student._id === user._id).length === 0 ? (
                <div className="card">
                  <h3>No Submissions Yet</h3>
                  <p>Submit your work for this assignment!</p>
                </div>
              ) : (
                submissions.filter(s => s.student._id === user._id).map(submission => (
                  <div key={submission._id} className="card">
                    <p style={{color: '#666', marginBottom: '0.5rem'}}>
                      <strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                    <p style={{color: '#666', marginBottom: '0.5rem'}}>
                      <strong>Content:</strong> {submission.content}
                    </p>
                    {submission.submissionUrl && (
                      <p style={{color: '#666', marginBottom: '0.5rem'}}>
                        <strong>Submission URL:</strong>{' '}
                        <a
                          href={submission.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{color: '#6366f1', textDecoration: 'underline'}}
                        >
                          {submission.submissionUrl}
                        </a>
                      </p>
                    )}
                    {submission.grade !== undefined && (
                      <p style={{color: '#10b981', marginBottom: '1rem'}}>
                        <strong>Grade:</strong> {submission.grade}/{selectedAssignment.totalMarks}
                      </p>
                    )}
                    {submission.feedback && (
                      <p style={{color: '#666', marginBottom: '1rem', fontStyle: 'italic'}}>
                        <strong>Feedback:</strong> {submission.feedback}
                      </p>
                    )}
                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                      <button
                        className="btn btn-primary"
                        style={{flex: 1, minWidth: '120px'}}
                        onClick={() => fetchComments(submission._id)}
                      >
                        💬 Comments
                      </button>
                      {submission.status !== 'graded' && (
                        <button
                          className="btn btn-outline"
                          style={{flex: 1, minWidth: '120px', borderColor: '#6366f1', color: '#6366f1'}}
                          onClick={() => openEditModal(submission)}
                        >
                          ✏️ Edit
                        </button>
                      )}
                      <button
                        className="btn btn-outline"
                        style={{flex: 1, minWidth: '120px', borderColor: '#ef4444', color: '#ef4444'}}
                        onClick={() => handleDeleteSubmission(submission._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Join Classroom Modal */}
      {showJoinModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={{marginBottom: '1.5rem'}}>Join Classroom</h3>
            <form onSubmit={handleJoinClassroom}>
              <input
                type="text"
                placeholder="Enter Class Code"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                required
                style={inputStyle}
              />
              <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>
                  Join
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{flex: 1}}
                  onClick={() => setShowJoinModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {showSubmitModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={{marginBottom: '1.5rem'}}>Submit Assignment</h3>
            <form onSubmit={handleSubmitAssignment}>
              <textarea
                placeholder="Your answer/content"
                value={submissionForm.content}
                onChange={(e) => setSubmissionForm({...submissionForm, content: e.target.value})}
                required
                style={{...inputStyle, minHeight: '150px', resize: 'vertical'}}
              />
              <input
                type="url"
                placeholder="Submission URL (optional - e.g., GitHub, Google Drive)"
                value={submissionForm.submissionUrl}
                onChange={(e) => setSubmissionForm({...submissionForm, submissionUrl: e.target.value})}
                style={inputStyle}
              />
              <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{flex: 1}}
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {viewingComments && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={{marginBottom: '1.5rem'}}>Comments & Discussion</h3>

            {/* Comment List */}
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              marginBottom: '1rem',
              padding: '0.5rem'
            }}>
              {comments.length === 0 ? (
                <p style={{color: '#999', textAlign: 'center', padding: '2rem'}}>
                  No comments yet
                </p>
              ) : (
                comments.map(comment => (
                  <div key={comment._id} style={{
                    background: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    borderLeft: comment.author?.role === 'teacher' ? '3px solid #6366f1' : '3px solid #10b981'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <strong style={{color: '#333'}}>
                        {comment.author?.name || 'Unknown'}
                        {comment.author?.role === 'teacher' && (
                          <span style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.75rem',
                            color: '#6366f1'
                          }}>
                            (Teacher)
                          </span>
                        )}
                      </strong>
                      <span style={{color: '#999', fontSize: '0.85rem'}}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{color: '#666', margin: 0}}>{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{
                  ...inputStyle,
                  marginBottom: 0,
                  flex: 1
                }}
              />
              <button type="submit" className="btn btn-primary">
                Send
              </button>
            </form>

            <button
              className="btn btn-outline"
              style={{width: '100%'}}
              onClick={() => {
                setViewingComments(null)
                setComments([])
                setNewComment('')
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Submission Modal */}
      {editingSubmission && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={{marginBottom: '1.5rem'}}>Edit Submission</h3>
            <form onSubmit={handleUpdateSubmission}>
              <textarea
                placeholder="Your updated answer/content"
                value={editForm.content}
                onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                required
                style={{...inputStyle, minHeight: '150px', resize: 'vertical'}}
              />
              <input
                type="url"
                placeholder="Submission URL (optional - e.g., GitHub, Google Drive)"
                value={editForm.submissionUrl}
                onChange={(e) => setEditForm({...editForm, submissionUrl: e.target.value})}
                style={inputStyle}
              />
              <p style={{color: '#999', fontSize: '0.85rem', marginBottom: '1rem'}}>
                Note: You can only edit submissions before they are graded.
              </p>
              <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>
                  Update Submission
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{flex: 1}}
                  onClick={() => {
                    setEditingSubmission(null)
                    setEditForm({ content: '', submissionUrl: '' })
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
}

const modalStyle = {
  background: 'white',
  padding: '2rem',
  borderRadius: '16px',
  maxWidth: '500px',
  width: '90%',
  maxHeight: '90vh',
  overflow: 'auto'
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '1rem'
}

export default StudentDashboard
