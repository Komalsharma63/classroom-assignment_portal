import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import '../App.css'

const API_URL = 'http://localhost:5000/api'

function SubmissionQueue() {
  const navigate = useNavigate()
  const { assignmentId } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [missingSubmissions, setMissingSubmissions] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' })
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    fetchSubmissions()
    fetchAssignment()
  }, [assignmentId])

  const fetchAssignment = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAssignment(response.data.assignment || response.data)
    } catch (err) {
      console.error('Failed to fetch assignment:', err)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/submissions/assignment/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSubmissions(response.data.submissions || [])
      setMissingSubmissions(response.data.missingSubmissions || [])
      setStats(response.data.stats || null)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch submissions:', err)
      setLoading(false)
    }
  }

  const handleGradeSubmission = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/submissions/${selectedSubmission._id}/grade`, gradeForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedSubmission(null)
      setGradeForm({ grade: '', feedback: '' })
      fetchSubmissions()
      alert('Submission graded successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grade submission')
    }
  }

  const openGradeModal = async (submission) => {
    setSelectedSubmission(submission)
    setGradeForm({
      grade: submission.grade || '',
      feedback: submission.feedback || ''
    })
    await fetchComments(submission._id)
    setShowComments(false)
  }

  const fetchComments = async (submissionId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/comments/submission/${submissionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setComments(response.data || [])
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
        submissionId: selectedSubmission._id,
        text: newComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNewComment('')
      await fetchComments(selectedSubmission._id)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment')
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="app">
      <nav className="navbar">
        <h1 style={{cursor: 'pointer'}} onClick={() => navigate('/teacher/dashboard')}>
          📚 Submission Queue
        </h1>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/teacher/analytics/assignment/${assignmentId}`)}
          >
            📊 View Analytics
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/teacher/dashboard')}>
            ← Back
          </button>
        </div>
      </nav>

      <div className="container">
        {assignment && (
          <div className="hero">
            <h2>{assignment.title}</h2>
            <p>{assignment.description}</p>
            <p style={{color: '#999', marginTop: '0.5rem'}}>
              Due: {new Date(assignment.dueDate).toLocaleDateString()} |
              Total Points: {assignment.totalPoints}
            </p>
          </div>
        )}

        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div className="card" style={{textAlign: 'center', padding: '1rem'}}>
              <h3 style={{color: '#6366f1', marginBottom: '0.5rem'}}>{stats.total}</h3>
              <p style={{color: '#666'}}>Total Students</p>
            </div>
            <div className="card" style={{textAlign: 'center', padding: '1rem'}}>
              <h3 style={{color: '#10b981', marginBottom: '0.5rem'}}>{stats.submitted}</h3>
              <p style={{color: '#666'}}>Submitted</p>
            </div>
            <div className="card" style={{textAlign: 'center', padding: '1rem'}}>
              <h3 style={{color: '#f59e0b', marginBottom: '0.5rem'}}>{stats.graded}</h3>
              <p style={{color: '#666'}}>Graded</p>
            </div>
            <div className="card" style={{textAlign: 'center', padding: '1rem'}}>
              <h3 style={{color: '#ef4444', marginBottom: '0.5rem'}}>{stats.missing}</h3>
              <p style={{color: '#666'}}>Missing</p>
            </div>
          </div>
        )}

        <h3 style={{color: 'white', marginBottom: '1rem'}}>Submitted Work</h3>
        <div className="cards-grid">
          {submissions.length === 0 ? (
            <div className="card">
              <h3>No Submissions Yet</h3>
              <p>Students haven't submitted their work yet.</p>
            </div>
          ) : (
            submissions.map(submission => (
              <div key={submission._id} className="card">
                <h3>{submission.student?.name || 'Unknown Student'}</h3>
                <p style={{color: '#666', marginBottom: '0.5rem'}}>
                  <strong>Email:</strong> {submission.student?.email}
                </p>
                <p style={{color: '#666', marginBottom: '0.5rem'}}>
                  <strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}
                </p>
                <p style={{color: '#666', marginBottom: '0.5rem'}}>
                  <strong>Status:</strong>
                  <span style={{
                    marginLeft: '0.5rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: submission.status === 'graded' ? '#10b981' :
                               submission.status === 'late' ? '#f59e0b' : '#6366f1',
                    color: 'white',
                    fontSize: '0.85rem'
                  }}>
                    {submission.status.toUpperCase()}
                  </span>
                </p>
                <p style={{color: '#666', marginBottom: '0.5rem'}}>
                  <strong>Content:</strong> {submission.content || 'No content'}
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
                {submission.attachments && submission.attachments.length > 0 && (
                  <p style={{color: '#666', marginBottom: '0.5rem'}}>
                    <strong>Files:</strong> {submission.attachments.length} file(s) attached
                  </p>
                )}
                {submission.grade !== undefined && submission.grade !== null && (
                  <p style={{color: '#10b981', marginBottom: '0.5rem', fontSize: '1.1rem'}}>
                    <strong>Grade:</strong> {submission.grade}/{assignment?.totalPoints}
                  </p>
                )}
                {submission.feedback && (
                  <p style={{color: '#666', marginBottom: '1rem', fontStyle: 'italic'}}>
                    <strong>Feedback:</strong> {submission.feedback}
                  </p>
                )}
                <button
                  className="btn btn-primary"
                  style={{width: '100%'}}
                  onClick={() => openGradeModal(submission)}
                >
                  {submission.status === 'graded' ? 'Update Grade' : 'Grade Submission'}
                </button>
              </div>
            ))
          )}
        </div>

        {missingSubmissions.length > 0 && (
          <>
            <h3 style={{color: 'white', marginTop: '2rem', marginBottom: '1rem'}}>
              Missing Submissions ({missingSubmissions.length})
            </h3>
            <div className="cards-grid">
              {missingSubmissions.map((item, idx) => (
                <div key={idx} className="card" style={{borderLeft: '4px solid #ef4444'}}>
                  <h3>{item.student?.name || 'Unknown Student'}</h3>
                  <p style={{color: '#666'}}>
                    <strong>Email:</strong> {item.student?.email}
                  </p>
                  <p style={{color: '#ef4444', marginTop: '0.5rem'}}>
                    <strong>Status:</strong> Not Submitted
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Grade Modal */}
      {selectedSubmission && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={{marginBottom: '1.5rem'}}>
              Grade Submission - {selectedSubmission.student?.name}
            </h3>
            <form onSubmit={handleGradeSubmission}>
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
                  Content:
                </label>
                <p style={{
                  padding: '0.75rem',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  color: '#333',
                  minHeight: '60px'
                }}>
                  {selectedSubmission.content || 'No content provided'}
                </p>
              </div>

              {selectedSubmission.submissionUrl && (
                <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
                    Submission URL:
                  </label>
                  <a
                    href={selectedSubmission.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.75rem',
                      background: '#f3f4f6',
                      borderRadius: '8px',
                      color: '#6366f1',
                      display: 'block',
                      textDecoration: 'underline',
                      wordBreak: 'break-all'
                    }}
                  >
                    {selectedSubmission.submissionUrl}
                  </a>
                </div>
              )}

              <input
                type="number"
                placeholder={`Grade (0-${assignment?.totalPoints || 100})`}
                value={gradeForm.grade}
                onChange={(e) => setGradeForm({...gradeForm, grade: e.target.value})}
                required
                min="0"
                max={assignment?.totalPoints || 100}
                style={inputStyle}
              />
              <textarea
                placeholder="Feedback (optional)"
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm({...gradeForm, feedback: e.target.value})}
                style={{...inputStyle, minHeight: '100px', resize: 'vertical'}}
              />
              <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>
                  Submit Grade
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{flex: 1}}
                  onClick={() => setShowComments(!showComments)}
                >
                  {showComments ? 'Hide' : 'Show'} Comments ({comments.length})
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{flex: 1}}
                  onClick={() => setSelectedSubmission(null)}
                >
                  Close
                </button>
              </div>
            </form>

            {/* Comments Section */}
            {showComments && (
              <div style={{marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '1rem'}}>
                <h4 style={{marginBottom: '1rem'}}>Comments & Discussion</h4>

                {/* Comment List */}
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  marginBottom: '1rem',
                  padding: '0.5rem'
                }}>
                  {comments.length === 0 ? (
                    <p style={{color: '#999', textAlign: 'center', padding: '1rem'}}>
                      No comments yet. Start the discussion!
                    </p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment._id} style={{
                        background: '#f9fafb',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '0.75rem',
                        borderLeft: '3px solid #6366f1'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem'
                        }}>
                          <strong style={{color: '#333'}}>
                            {comment.author?.name || 'Unknown'}
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
                <form onSubmit={handleAddComment} style={{display: 'flex', gap: '0.5rem'}}>
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
                  <button type="submit" className="btn btn-primary" style={{marginBottom: '1rem'}}>
                    Send
                  </button>
                </form>
              </div>
            )}
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
  maxWidth: '600px',
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

export default SubmissionQueue
