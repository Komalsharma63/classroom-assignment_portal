import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import '../App.css'

import { API_URL, API_BASE } from '../config'

const COLORS = ['#ef4444', '#f59e0b', '#fbbf24', '#84cc16', '#22c55e', '#10b981']

function GradeAnalytics() {
  const navigate = useNavigate()
  const { type, id } = useParams() // type: 'assignment' or 'classroom'
  const [distribution, setDistribution] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGradeDistribution()
  }, [type, id])

  const fetchGradeDistribution = async () => {
    try {
      const token = localStorage.getItem('token')
      let response

      if (type === 'assignment') {
        response = await axios.get(`${API_URL}/submissions/assignment/${id}/distribution`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setTitle(response.data.assignment?.title || 'Assignment')
        setStatistics(response.data.statistics)
      } else if (type === 'classroom') {
        response = await axios.get(`${API_URL}/submissions/classroom/${id}/distribution`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setTitle(response.data.classroom?.name || 'Classroom')
      }

      // Format distribution data for charts
      const formattedData = response.data.distribution.map(item => ({
        range: item.range || `${item._id}-${item._id + 10}`,
        count: item.count,
        avgPercentage: item.avgPercentage
      }))

      setDistribution(formattedData)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch grade distribution:', err)
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="app">
      <nav className="navbar">
        <h1 style={{cursor: 'pointer'}} onClick={() => navigate('/teacher/dashboard')}>
          📊 Grade Analytics
        </h1>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </nav>

      <div className="container">
        <div className="hero">
          <h2>{title}</h2>
          <p>Grade distribution and statistics</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '3rem'
          }}>
            <div className="card" style={{textAlign: 'center', padding: '1.5rem'}}>
              <h4 style={{color: '#999', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Average Grade</h4>
              <h2 style={{color: '#6366f1', marginBottom: 0}}>
                {statistics.avgGrade?.toFixed(1) || 0}%
              </h2>
            </div>
            <div className="card" style={{textAlign: 'center', padding: '1.5rem'}}>
              <h4 style={{color: '#999', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Highest Grade</h4>
              <h2 style={{color: '#10b981', marginBottom: 0}}>
                {statistics.maxGrade || 0}%
              </h2>
            </div>
            <div className="card" style={{textAlign: 'center', padding: '1.5rem'}}>
              <h4 style={{color: '#999', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Lowest Grade</h4>
              <h2 style={{color: '#ef4444', marginBottom: 0}}>
                {statistics.minGrade || 0}%
              </h2>
            </div>
            <div className="card" style={{textAlign: 'center', padding: '1.5rem'}}>
              <h4 style={{color: '#999', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Total Graded</h4>
              <h2 style={{color: '#f59e0b', marginBottom: 0}}>
                {statistics.totalGraded || 0}
              </h2>
            </div>
          </div>
        )}

        {/* Bar Chart */}
        <div className="card" style={{padding: '2rem', marginBottom: '2rem'}}>
          <h3 style={{marginBottom: '2rem'}}>Grade Distribution</h3>
          {distribution.length === 0 ? (
            <p style={{textAlign: 'center', color: '#999', padding: '2rem'}}>
              No graded submissions yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#6366f1" name="Number of Students" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        {distribution.length > 0 && (
          <div className="card" style={{padding: '2rem'}}>
            <h3 style={{marginBottom: '2rem'}}>Grade Distribution (Pie Chart)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({range, count}) => `${range}: ${count}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Data Table */}
        {distribution.length > 0 && (
          <div className="card" style={{padding: '2rem', marginTop: '2rem'}}>
            <h3 style={{marginBottom: '1.5rem'}}>Detailed Breakdown</h3>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '2px solid #e5e7eb'}}>
                  <th style={{padding: '1rem', textAlign: 'left', color: '#666'}}>Range</th>
                  <th style={{padding: '1rem', textAlign: 'center', color: '#666'}}>Count</th>
                  {statistics && (
                    <th style={{padding: '1rem', textAlign: 'center', color: '#666'}}>Percentage</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {distribution.map((item, idx) => (
                  <tr key={idx} style={{borderBottom: '1px solid #f3f4f6'}}>
                    <td style={{padding: '1rem', fontWeight: 'bold'}}>{item.range}</td>
                    <td style={{padding: '1rem', textAlign: 'center'}}>{item.count}</td>
                    {statistics && (
                      <td style={{padding: '1rem', textAlign: 'center'}}>
                        {((item.count / statistics.totalGraded) * 100).toFixed(1)}%
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default GradeAnalytics
