import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../App.css'

const API_URL = 'http://localhost:5000/api'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!storedUser || !token) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(storedUser)
    setUser(userData)
    setProfileForm({
      name: userData.name,
      email: userData.email,
      password: ''
    })
    setLoading(false)
  }, [navigate])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const token = localStorage.getItem('token')
      const updateData = {
        name: profileForm.name,
        email: profileForm.email
      }

      // Only include password if it's been changed
      if (profileForm.password) {
        updateData.password = profileForm.password
      }

      const response = await axios.patch(`${API_URL}/auth/me`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Update local storage
      const updatedUser = {
        ...user,
        name: response.data.user.name,
        email: response.data.user.email
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)

      alert('Profile updated successfully!')
      setProfileForm({...profileForm, password: ''})
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  const getDashboardRoute = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'student': return '/student/dashboard'
      case 'teacher': return '/teacher/dashboard'
      case 'admin': return '/admin/dashboard'
      default: return '/'
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="app">
      <nav className="navbar">
        <h1 style={{cursor: 'pointer'}} onClick={() => navigate(getDashboardRoute())}>
          👤 My Profile
        </h1>
        <button className="btn btn-outline" onClick={() => navigate(getDashboardRoute())}>
          ← Back to Dashboard
        </button>
      </nav>

      <div className="container" style={{maxWidth: '600px', margin: '0 auto'}}>
        <div className="hero">
          <h2>Edit Profile</h2>
          <p>Update your account information</p>
        </div>

        <div className="card" style={{padding: '2rem'}}>
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
            paddingBottom: '2rem',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              color: 'white',
              margin: '0 auto 1rem',
              fontWeight: 'bold'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h3 style={{marginBottom: '0.5rem'}}>{user?.name}</h3>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 1rem',
              borderRadius: '20px',
              background: user?.role === 'admin' ? '#ef4444' : user?.role === 'teacher' ? '#6366f1' : '#10b981',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {user?.role}
            </span>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#333'
              }}>
                New Password
              </label>
              <input
                type="password"
                value={profileForm.password}
                onChange={(e) => setProfileForm({...profileForm, password: e.target.value})}
                placeholder="Leave blank to keep current password"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <p style={{color: '#999', fontSize: '0.85rem', marginTop: '0.5rem'}}>
                Only fill this if you want to change your password
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={updating}
              style={{width: '100%', padding: '1rem', fontSize: '1.1rem'}}
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        <div className="card" style={{padding: '1.5rem', marginTop: '2rem', background: '#fef3c7'}}>
          <h4 style={{marginBottom: '0.5rem', color: '#92400e'}}>📌 Account Information</h4>
          <p style={{color: '#78350f', fontSize: '0.9rem', margin: 0}}>
            <strong>Account created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Profile
