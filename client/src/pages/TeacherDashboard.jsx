import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../App.css'

const API_URL = 'http://localhost:5000/api'

function TeacherDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [classrooms, setClassrooms] = useState([])
  const [assignments, setAssignments] = useState([])
  const [showClassroomModal, setShowClassroomModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [classroomForm, setClassroomForm] = useState({
    name: '',
    section: '',
    subject: '',
    room: ''
  })

  const [assignmentForm, setAssignmentForm] = useState({
    classroomId: '',
    title: '',
    description: '',
    dueDate: '',
    totalMarks: 100
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!storedUser || !token) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(storedUser)
    if (userData.role !== 'teacher') {
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

  const handleCreateClassroom = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/classrooms`, classroomForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowClassroomModal(false)
      setClassroomForm({ name: '', section: '', subject: '', room: '' })
      fetchClassrooms()
      alert('Classroom created successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create classroom')
    }
  }

  const handleDeleteClassroom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this classroom?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/classrooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchClassrooms()
      alert('Classroom deleted successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete classroom')
    }
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/assignments`, assignmentForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowAssignmentModal(false)
      setAssignmentForm({ classroomId: '', title: '', description: '', dueDate: '', totalMarks: 100 })
      if (selectedClassroom) {
        fetchAssignments(selectedClassroom._id)
      }
      alert('Assignment created successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assignment')
    }
  }

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/assignments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (selectedClassroom) {
        fetchAssignments(selectedClassroom._id)
      }
      alert('Assignment deleted successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete assignment')
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

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="app">
      <nav className="navbar">
        <h1 style={{cursor: 'pointer'}} onClick={() => navigate('/')}>📚 Teacher Dashboard</h1>
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
              <p>Manage your classes and assignments</p>
            </div>

            <button
              className="btn btn-primary"
              style={{marginBottom: '2rem'}}
              onClick={() => setShowClassroomModal(true)}
            >
              + Create New Classroom
            </button>

            <div className="cards-grid">
              {classrooms.length === 0 ? (
                <div className="card">
                  <h3>No Classrooms Yet</h3>
                  <p>Create your first classroom to get started!</p>
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
                    <p style={{color: '#6366f1', marginBottom: '1rem', fontSize: '0.9rem'}}>
                      <strong>Class Code:</strong> {classroom.classCode}
                    </p>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button
                        className="btn btn-primary"
                        style={{flex: 1}}
                        onClick={() => handleViewClassroom(classroom)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{flex: 1, borderColor: '#ef4444', color: '#ef4444'}}
                        onClick={() => handleDeleteClassroom(classroom._id)}
                      >
                        Delete
                      </button>
                    </div>
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

            <button
              className="btn btn-primary"
              style={{marginBottom: '2rem'}}
              onClick={() => {
                setAssignmentForm({ ...assignmentForm, classroomId: selectedClassroom._id })
                setShowAssignmentModal(true)
              }}
            >
              + Create New Assignment
            </button>

            <div className="cards-grid">
              {assignments.length === 0 ? (
                <div className="card">
                  <h3>No Assignments Yet</h3>
                  <p>Create your first assignment for this classroom!</p>
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
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button
                        className="btn btn-primary"
                        style={{flex: 1}}
                        onClick={() => navigate(`/teacher/submissions/${assignment._id}`)}
                      >
                        View Submissions
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{flex: 1, borderColor: '#ef4444', color: '#ef4444'}}
                        onClick={() => handleDeleteAssignment(assignment._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Classroom Modal */}
      {showClassroomModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={{marginBottom: '1.5rem'}}>Create New Classroom</h3>
            <form onSubmit={handleCreateClassroom}>
              <input
                type="text"
                placeholder="Classroom Name"
                value={classroomForm.name}
                onChange={(e) => setClassroomForm({...classroomForm, name: e.target.value})}
                required
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Subject"
                value={classroomForm.subject}
                onChange={(e) => setClassroomForm({...classroomForm, subject: e.target.value})}
                required
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Section"
                value={classroomForm.section}
                onChange={(e) => setClassroomForm({...classroomForm, section: e.target.value})}
                required
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Room"
                value={classroomForm.room}
                onChange={(e) => setClassroomForm({...classroomForm, room: e.target.value})}
                required
                style={inputStyle}
              />
              <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>
                  Create
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{flex: 1}}
                  onClick={() => setShowClassroomModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showAssignmentModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={{marginBottom: '1.5rem'}}>Create New Assignment</h3>
            <form onSubmit={handleCreateAssignment}>
              <input
                type="text"
                placeholder="Assignment Title"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                required
                style={inputStyle}
              />
              <textarea
                placeholder="Description"
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                required
                style={{...inputStyle, minHeight: '100px', resize: 'vertical'}}
              />
              <input
                type="date"
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                required
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Total Marks"
                value={assignmentForm.totalMarks}
                onChange={(e) => setAssignmentForm({...assignmentForm, totalMarks: e.target.value})}
                required
                style={inputStyle}
              />
              <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>
                  Create
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{flex: 1}}
                  onClick={() => setShowAssignmentModal(false)}
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

export default TeacherDashboard
