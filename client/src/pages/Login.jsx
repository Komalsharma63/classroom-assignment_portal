import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../App.css'
import { API_URL, API_BASE } from '../config'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
  const response = await axios.post(`${API_URL}/auth/login`, formData)
      console.log('Login successful:', response.data)

      // Store token and user data
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Redirect based on role
      if (response.data.user.role === 'teacher') {
        navigate('/teacher/dashboard')
      } else if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h1 style={{cursor: 'pointer'}} onClick={() => navigate('/')}>📚 Classroom Assignment Portal</h1>
        <div className="nav-links">
          <button className="btn btn-outline" onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </nav>

      <div className="container">
        <div className="hero">
          <h2>Login to Your Account</h2>
          <p>Access your classroom portal</p>
        </div>

        <div style={{maxWidth: '500px', margin: '2rem auto'}}>
          <div className="card">
            <h3>Login</h3>

            {error && (
              <div className="error" style={{marginBottom: '1rem'}}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', color: '#333'}}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                  placeholder="your.email@example.com"
                />
              </div>

              <div style={{marginBottom: '1.5rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', color: '#333'}}>
                  Password
                </label>
                <div style={{position: 'relative'}}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      paddingRight: '3rem',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#666'
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{width: '100%'}}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p style={{marginTop: '1.5rem', textAlign: 'center', color: '#666'}}>
              Don't have an account?{' '}
              <span
                onClick={() => navigate('/register')}
                style={{color: '#667eea', cursor: 'pointer', textDecoration: 'underline'}}
              >
                Register here
              </span>
            </p>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>Classroom Assignment Portal © 2025</p>
      </footer>
    </div>
  )
}

export default Login
