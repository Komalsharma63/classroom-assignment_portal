import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { API_URL, API_BASE } from '../config'
import { Users, GraduationCap, BookOpen, Settings, UserPlus, Trash2, Edit } from 'lucide-react'
import '../App.css'

// API_URL now imported from ../config

function AdminDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showUserModal, setShowUserModal] = useState(false)
  const [showClassroomModal, setShowClassroomModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedClassroomForEnroll, setSelectedClassroomForEnroll] = useState(null)

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  })

  const [classroomForm, setClassroomForm] = useState({
    name: '',
    subject: '',
    section: '',
    room: '',
    teacherId: ''
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!storedUser || !token) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(storedUser)
    if (userData.role !== 'admin') {
      navigate('/')
      return
    }

    setUser(userData)
    fetchAllData()
  }, [navigate])

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const [usersRes, classroomsRes, assignmentsRes] = await Promise.all([
        axios.get(`${API_URL}/auth/users?limit=1000`, { headers }).catch(() => ({ data: { users: [] } })),
        axios.get(`${API_URL}/classrooms?limit=1000`, { headers }).catch(() => ({ data: { classrooms: [] } })),
        axios.get(`${API_URL}/assignments?limit=1000`, { headers }).catch(() => ({ data: [] }))
      ])

      // Handle paginated response format
      setUsers(usersRes.data.users || [])
      setClassrooms(classroomsRes.data.classrooms || [])
      setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : assignmentsRes.data.assignments || [])
      setLoading(false)
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to fetch data')
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/auth/register`, userForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowUserModal(false)
      setUserForm({ name: '', email: '', password: '', role: 'student' })
      fetchAllData()
      alert('User created successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user')
    }
  }

  const handleCreateClassroom = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const payload = {
        name: classroomForm.name,
        subject: classroomForm.subject,
        section: classroomForm.section,
        room: classroomForm.room,
        teacher: classroomForm.teacherId
      }

      await axios.post(`${API_URL}/classrooms`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowClassroomModal(false)
      setClassroomForm({ name: '', subject: '', section: '', room: '', teacherId: '' })
      fetchAllData()
      alert('Classroom created successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create classroom')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchAllData()
      alert('User deleted successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleDeleteClassroom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this classroom?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/classrooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchAllData()
      alert('Classroom deleted successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete classroom')
    }
  }

  const openEnrollModal = (classroom) => {
    setSelectedClassroomForEnroll(classroom)
    setShowEnrollModal(true)
  }

  const handleRemoveStudent = async (classroomId, studentId) => {
    if (!window.confirm('Remove this student from the classroom?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/classrooms/${classroomId}/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchAllData()
      alert('Student removed successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove student')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const teachers = users.filter(u => u.role === 'teacher')
  const students = users.filter(u => u.role === 'student')
  const admins = users.filter(u => u.role === 'admin')

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="app">
      <motion.nav
        className="navbar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <h1 style={{cursor: 'pointer'}} onClick={() => navigate('/')}>
          <Settings size={28} style={{display: 'inline', marginRight: '10px', verticalAlign: 'middle'}} />
          Admin Panel
        </h1>
        <div className="nav-links">
          <div className="user-badge">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">ADMIN</span>
            </div>
          </div>
          <motion.button
            className="btn btn-outline"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </div>
      </motion.nav>

      <div className="container">
        {error && <div className="error">{error}</div>}

        {/* Tabs */}
        <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
          {['overview', 'users', 'classrooms', 'assignments'].map(tab => (
            <motion.button
              key={tab}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="hero">
              <h2>System Overview</h2>
              <p>Monitor and manage your platform</p>
            </div>

            <div className="stats-grid">
              <motion.div
                className="stat-card"
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <Users size={32} color="var(--primary)" />
                <h4>{users.length}</h4>
                <p>Total Users</p>
                <small style={{color: '#999'}}>
                  {teachers.length} Teachers • {students.length} Students • {admins.length} Admins
                </small>
              </motion.div>

              <motion.div
                className="stat-card success"
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <GraduationCap size={32} color="var(--success)" />
                <h4>{classrooms.length}</h4>
                <p>Active Classrooms</p>
              </motion.div>

              <motion.div
                className="stat-card warning"
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <BookOpen size={32} color="var(--warning)" />
                <h4>{assignments.length}</h4>
                <p>Total Assignments</p>
              </motion.div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <h2 style={{color: 'white'}}>User Management</h2>
              <motion.button
                className="btn btn-primary"
                onClick={() => setShowUserModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserPlus size={20} style={{marginRight: '0.5rem'}} />
                Create User
              </motion.button>
            </div>

            <div className="cards-grid">
              {users.map(user => (
                <motion.div
                  key={user._id || user.id}
                  className="card"
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem'}}>
                    <div>
                      <h3 style={{marginBottom: '0.5rem'}}>{user.name}</h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: user.role === 'admin' ? '#ef4444' : user.role === 'teacher' ? '#6366f1' : '#10b981',
                        color: 'white'
                      }}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p style={{color: '#666', marginBottom: '0.5rem'}}>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p style={{color: '#666', marginBottom: '1rem', fontSize: '0.85rem'}}>
                    <strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  {user.role !== 'admin' && (
                    <button
                      className="btn btn-danger"
                      style={{width: '100%'}}
                      onClick={() => handleDeleteUser(user._id || user.id)}
                    >
                      <Trash2 size={16} style={{marginRight: '0.5rem'}} />
                      Delete User
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Classrooms Tab */}
        {activeTab === 'classrooms' && (
          <>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <h2 style={{color: 'white'}}>Classroom Management</h2>
              <motion.button
                className="btn btn-primary"
                onClick={() => setShowClassroomModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                + Create Classroom
              </motion.button>
            </div>

            <div className="cards-grid">
              {classrooms.map(classroom => (
                <motion.div
                  key={classroom._id}
                  className="card"
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <h3>{classroom.name}</h3>
                  <p style={{color: '#666', marginBottom: '0.5rem'}}>
                    <strong>Subject:</strong> {classroom.subject}
                  </p>
                  <p style={{color: '#666', marginBottom: '0.5rem'}}>
                    <strong>Section:</strong> {classroom.section || 'N/A'}
                  </p>
                  <p style={{color: '#666', marginBottom: '0.5rem'}}>
                    <strong>Room:</strong> {classroom.room || 'N/A'}
                  </p>
                  <p style={{color: '#6366f1', marginBottom: '0.5rem', fontSize: '0.9rem'}}>
                    <strong>Class Code:</strong> {classroom.classCode}
                  </p>
                  <p style={{color: '#666', marginBottom: '1rem', fontSize: '0.9rem'}}>
                    <strong>Students:</strong> {classroom.students?.length || 0}
                  </p>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button
                      className="btn btn-primary"
                      style={{flex: 1}}
                      onClick={() => openEnrollModal(classroom)}
                    >
                      👥 Manage Students
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{flex: 1}}
                      onClick={() => handleDeleteClassroom(classroom._id)}
                    >
                      <Trash2 size={16} style={{marginRight: '0.5rem'}} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <>
            <h2 style={{color: 'white', marginBottom: '2rem'}}>All Assignments</h2>
            <div className="cards-grid">
              {assignments.length === 0 ? (
                <div className="card">
                  <h3>No Assignments Yet</h3>
                  <p>No assignments have been created in the system.</p>
                </div>
              ) : (
                assignments.map(assignment => (
                  <motion.div
                    key={assignment._id}
                    className="card"
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <h3>{assignment.title}</h3>
                    <p style={{color: '#666', marginBottom: '0.5rem'}}>
                      {assignment.description}
                    </p>
                    {assignment.classroom && (
                      <p style={{color: '#6366f1', marginBottom: '0.5rem'}}>
                        <strong>Classroom:</strong> {assignment.classroom.name} ({assignment.classroom.subject})
                      </p>
                    )}
                    {assignment.teacher && (
                      <p style={{color: '#666', marginBottom: '0.5rem'}}>
                        <strong>Teacher:</strong> {assignment.teacher.name}
                      </p>
                    )}
                    <p style={{color: '#666', marginBottom: '0.5rem'}}>
                      <strong>Due:</strong> {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    <p style={{color: '#666', marginBottom: '0.5rem'}}>
                      <strong>Status:</strong> <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: assignment.status === 'published' ? '#10b981' :
                                   assignment.status === 'draft' ? '#f59e0b' : '#6b7280',
                        color: 'white',
                        fontSize: '0.85rem'
                      }}>
                        {assignment.status?.toUpperCase()}
                      </span>
                    </p>
                    <p style={{color: '#666', marginBottom: '1rem'}}>
                      <strong>Total Marks:</strong> {assignment.totalPoints || assignment.totalMarks}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <motion.div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3>Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>
                  Create User
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{flex: 1}}
                  onClick={() => setShowUserModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Create Classroom Modal */}
      {showClassroomModal && (
        <div className="modal-overlay" onClick={() => setShowClassroomModal(false)}>
          <motion.div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3>Create New Classroom</h3>
            <form onSubmit={handleCreateClassroom}>
              <div className="form-group">
                <label className="form-label">Classroom Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={classroomForm.name}
                  onChange={(e) => setClassroomForm({...classroomForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  className="form-input"
                  type="text"
                  value={classroomForm.subject}
                  onChange={(e) => setClassroomForm({...classroomForm, subject: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Section</label>
                <input
                  className="form-input"
                  type="text"
                  value={classroomForm.section}
                  onChange={(e) => setClassroomForm({...classroomForm, section: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Room</label>
                <input
                  className="form-input"
                  type="text"
                  value={classroomForm.room}
                  onChange={(e) => setClassroomForm({...classroomForm, room: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Assign Teacher</label>
                <select
                  className="form-select"
                  value={classroomForm.teacherId}
                  onChange={(e) => setClassroomForm({...classroomForm, teacherId: e.target.value})}
                  required
                >
                  <option value="">Select a teacher...</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>
                  Create Classroom
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
          </motion.div>
        </div>
      )}

      {/* Enrollment Management Modal */}
      {showEnrollModal && selectedClassroomForEnroll && (
        <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <motion.div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{maxWidth: '700px'}}
          >
            <h3 style={{marginBottom: '1rem'}}>{selectedClassroomForEnroll.name} - Students</h3>
            <p style={{color: '#666', marginBottom: '1.5rem'}}>
              <strong>Class Code:</strong> {selectedClassroomForEnroll.classCode}
            </p>

            {selectedClassroomForEnroll.students && selectedClassroomForEnroll.students.length > 0 ? (
              <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                {selectedClassroomForEnroll.students.map(student => (
                  <div key={student._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <strong style={{display: 'block', marginBottom: '0.25rem'}}>
                        {student.name}
                      </strong>
                      <span style={{color: '#666', fontSize: '0.9rem'}}>
                        {student.email}
                      </span>
                    </div>
                    <button
                      className="btn btn-danger"
                      style={{padding: '0.5rem 1rem'}}
                      onClick={() => handleRemoveStudent(selectedClassroomForEnroll._id, student._id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{textAlign: 'center', color: '#999', padding: '2rem'}}>
                No students enrolled yet
              </p>
            )}

            <button
              className="btn btn-outline"
              style={{width: '100%', marginTop: '1rem'}}
              onClick={() => {
                setShowEnrollModal(false)
                setSelectedClassroomForEnroll(null)
              }}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
