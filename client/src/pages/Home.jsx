import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { API_BASE } from '../config'
import {  GraduationCap, BookOpen, Users, Award, TrendingUp, Clock, CheckCircle, BarChart } from 'lucide-react'
import '../App.css'

function Home() {
  const navigate = useNavigate()
  const [apiStatus, setApiStatus] = useState('Checking...')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)

      // Redirect to appropriate dashboard
      if (userData.role === 'teacher') {
        navigate('/teacher/dashboard')
      } else if (userData.role === 'student') {
        navigate('/student/dashboard')
      } else if (userData.role === 'admin') {
        navigate('/admin/dashboard')
      }
    }

    // Test backend connection
    axios.get(`${API_BASE}/`)
      .then(response => {
        setApiStatus('✅ Connected - ' + response.data.message)
        setLoading(false)
      })
      .catch(error => {
        setApiStatus('❌ Backend Offline')
        setLoading(false)
      })
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  }

  const features = [
    {
      icon: <BookOpen size={32} />,
      title: 'Smart Assignment Management',
      description: 'Create, distribute, and track assignments with intelligent deadline monitoring and late submission handling.',
      color: '#6366f1'
    },
    {
      icon: <Users size={32} />,
      title: 'Collaborative Classrooms',
      description: 'Build virtual classrooms with secure join codes, member management, and real-time collaboration features.',
      color: '#8b5cf6'
    },
    {
      icon: <Award size={32} />,
      title: 'Advanced Grading System',
      description: 'Grade submissions with detailed feedback, rubrics, and automated grade distribution analytics for teachers.',
      color: '#d946ef'
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Performance Analytics',
      description: 'Track student progress, identify at-risk students, and visualize grade distributions with interactive charts.',
      color: '#10b981'
    },
    {
      icon: <Clock size={32} />,
      title: 'Deadline Intelligence',
      description: 'Automatic late detection, deadline reminders, and flexible submission policies with teacher override options.',
      color: '#f59e0b'
    },
    {
      icon: <CheckCircle size={32} />,
      title: 'Submission Tracking',
      description: 'Support for link submissions and file uploads with status tracking, resubmission capabilities, and version history.',
      color: '#ef4444'
    }
  ]

  const stats = [
    { value: '10,000+', label: 'Active Students', icon: <Users size={24} /> },
    { value: '500+', label: 'Teachers', icon: <GraduationCap size={24} /> },
    { value: '50,000+', label: 'Assignments', icon: <BookOpen size={24} /> },
    { value: '95%', label: 'Satisfaction Rate', icon: <Award size={24} /> }
  ]

  return (
    <div className="app">
      {/* Navigation */}
      <motion.nav
        className="navbar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <motion.h1
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <GraduationCap size={28} style={{display: 'inline', marginRight: '10px', verticalAlign: 'middle'}} />
          ClassroomHub
        </motion.h1>
        <div className="nav-links">
          {user ? (
            <>
              <div className="user-badge">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
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
            </>
          ) : (
            <>
              <motion.button
                className="btn btn-primary"
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
              <motion.button
                className="btn btn-outline"
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Register
              </motion.button>
            </>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Welcome to ClassroomHub
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            The Complete Assignment Management & Grading Platform
          </motion.p>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Empowering educators and students with intelligent tools for assignment creation, submission tracking, and performance analytics
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        {/* Stats Section */}
        <motion.div
          className="stats-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card"
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <div style={{color: 'var(--primary)', marginBottom: '0.5rem'}}>
                {stat.icon}
              </div>
              <h4>{stat.value}</h4>
              <p>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="cards-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          style={{marginTop: '4rem'}}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="card"
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <motion.div
                className="card-icon"
                style={{background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}dd 100%)`}}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                {feature.icon}
              </motion.div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Role-Based Features */}
        <motion.div
          className="cards-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          style={{marginTop: '3rem'}}
        >
          {/* For Teachers */}
          <motion.div className="card" variants={itemVariants}>
            <div className="card-icon">👨‍🏫</div>
            <h3>For Teachers</h3>
            <p style={{marginBottom: '1.5rem'}}>
              Comprehensive tools to manage your classroom efficiently and effectively
            </p>
            <ul>
              <li>Create and manage multiple classrooms</li>
              <li>Design assignments with rich descriptions</li>
              <li>Set deadlines with automatic late detection</li>
              <li>Grade submissions with detailed feedback</li>
              <li>Track student progress with analytics</li>
              <li>View grade distribution charts</li>
              <li>Manage enrollment with secure class codes</li>
            </ul>
            <motion.button
              className="btn btn-primary"
              style={{width: '100%', marginTop: '1rem'}}
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started as Teacher
            </motion.button>
          </motion.div>

          {/* For Students */}
          <motion.div className="card" variants={itemVariants}>
            <div className="card-icon" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
              👨‍🎓
            </div>
            <h3>For Students</h3>
            <p style={{marginBottom: '1.5rem'}}>
              Stay organized and submit your best work on time, every time
            </p>
            <ul>
              <li>Join classrooms with secure codes</li>
              <li>View all assignments in one place</li>
              <li>Submit work via links or file uploads</li>
              <li>Track submission status and deadlines</li>
              <li>Receive grades and detailed feedback</li>
              <li>Resubmit work before deadlines</li>
              <li>Monitor your academic performance</li>
            </ul>
            <motion.button
              className="btn btn-success"
              style={{width: '100%', marginTop: '1rem'}}
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started as Student
            </motion.button>
          </motion.div>

          {/* For Admins */}
          <motion.div className="card" variants={itemVariants}>
            <div className="card-icon" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
              👨‍💼
            </div>
            <h3>For Administrators</h3>
            <p style={{marginBottom: '1.5rem'}}>
              Powerful oversight and management capabilities for your institution
            </p>
            <ul>
              <li>Manage users and role assignments</li>
              <li>Create and assign classes to teachers</li>
              <li>Enroll students in classrooms</li>
              <li>View platform-wide analytics</li>
              <li>Monitor assignment activity</li>
              <li>Access audit logs and history</li>
              <li>Configure system settings</li>
            </ul>
            <motion.button
              className="btn btn-outline"
              style={{width: '100%', marginTop: '1rem', borderColor: '#f59e0b', color: '#f59e0b'}}
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Request Admin Access
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          className="status-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3>Powered by Modern Technology</h3>
          <div className="status-grid">
            <motion.div
              className="status-item"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <h4>⚛️</h4>
              <p>React 18</p>
              <small style={{color: '#999', fontSize: '0.85rem'}}>Modern UI Framework</small>
            </motion.div>
            <motion.div
              className="status-item"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <h4>🟢</h4>
              <p>Node.js & Express</p>
              <small style={{color: '#999', fontSize: '0.85rem'}}>Robust Backend</small>
            </motion.div>
            <motion.div
              className="status-item"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <h4>🍃</h4>
              <p>MongoDB Atlas</p>
              <small style={{color: '#999', fontSize: '0.85rem'}}>Cloud Database</small>
            </motion.div>
            <motion.div
              className="status-item"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <h4>🔒</h4>
              <p>JWT Authentication</p>
              <small style={{color: '#999', fontSize: '0.85rem'}}>Secure Access</small>
            </motion.div>
            <motion.div
              className="status-item"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <h4>📊</h4>
              <p>Real-time Analytics</p>
              <small style={{color: '#999', fontSize: '0.85rem'}}>Data Insights</small>
            </motion.div>
            <motion.div
              className="status-item"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <h4>🎨</h4>
              <p>Framer Motion</p>
              <small style={{color: '#999', fontSize: '0.85rem'}}>Smooth Animations</small>
            </motion.div>
          </div>
        </motion.div>

        {/* Backend API Status */}
        <motion.div
          className="api-status"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="api-status-content">
            <h3>🚀 System Status</h3>
            <p style={{fontSize: '1.1rem', marginBottom: '1rem'}}>
              {loading ? 'Connecting to backend...' : apiStatus}
            </p>
            <p style={{opacity: 0.9, marginBottom: '2rem'}}>
              Backend URL: <code style={{background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '6px'}}>
                {API_BASE}
              </code>
            </p>
            <div className="api-features">
              <motion.div
                className="api-feature"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <strong>Authentication</strong>
                <small>JWT-based Login & Register</small>
              </motion.div>
              <motion.div
                className="api-feature"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <strong>Classrooms</strong>
                <small>Create, Join & Manage</small>
              </motion.div>
              <motion.div
                className="api-feature"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <strong>Assignments</strong>
                <small>Post & Track Work</small>
              </motion.div>
              <motion.div
                className="api-feature"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <strong>Submissions</strong>
                <small>Upload & Review</small>
              </motion.div>
              <motion.div
                className="api-feature"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <strong>Grading</strong>
                <small>Score & Feedback</small>
              </motion.div>
              <motion.div
                className="api-feature"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <strong>Analytics</strong>
                <small>Grade Distribution</small>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '24px',
            marginTop: '3rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
          }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 style={{color: 'var(--dark)', marginBottom: '1rem', fontSize: '2.5rem', fontWeight: '800'}}>
            Ready to Transform Your Classroom?
          </h2>
          <p style={{color: 'var(--gray)', fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem'}}>
            Join thousands of educators and students who are already using ClassroomHub to streamline assignment management and boost academic performance.
          </p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <motion.button
              className="btn btn-primary"
              style={{padding: '1rem 2.5rem', fontSize: '1.1rem'}}
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free
            </motion.button>
            <motion.button
              className="btn btn-outline"
              style={{padding: '1rem 2.5rem', fontSize: '1.1rem'}}
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p><strong>ClassroomHub</strong> - Assignment Portal © 2025</p>
        <p>Empowering Education Through Technology | Built with ❤️ using React, Node.js & MongoDB</p>
        <p style={{marginTop: '1rem', fontSize: '0.85rem'}}>
          <strong>Features:</strong> Role-Based Access Control | Real-time Analytics | Grade Distribution | Deadline Management | File Submissions | Automated Grading
        </p>
      </motion.footer>
    </div>
  )
}

export default Home
