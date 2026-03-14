import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const inputStyle = {
  width: '100%', padding: '11px 16px',
  background: '#1a1a1a', border: '1px solid #2d2d2d',
  borderRadius: '10px', color: '#ffffff', fontSize: '14px',
  fontFamily: 'Inter, system-ui, sans-serif', outline: 'none'
}
const labelStyle = {
  display: 'block', color: '#9ca3af', fontSize: '13px',
  fontWeight: '500', marginBottom: '7px', fontFamily: 'Inter, system-ui, sans-serif'
}

const Field = ({ label, name, type = 'text', placeholder, value, onChange }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={labelStyle}>{label}</label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} style={inputStyle}
      onFocus={e => { e.target.style.borderColor = '#FACC15'; e.target.style.boxShadow = '0 0 0 3px rgba(250,204,21,0.12)' }}
      onBlur={e => { e.target.style.borderColor = '#2d2d2d'; e.target.style.boxShadow = 'none' }}
    />
  </div>
)

const Signup = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    profilePhoto: '',
    collegeName: '', age: '', city: '', state: '',
    skills: '', github: '', twitter: '', leetcode: '', youtube: '', projects: ''
  })
  const [toast, setToast] = useState({ msg: '', type: '' })
  const [loading, setLoading] = useState(false)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: '' }), 3500)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) return showToast('Username, email & password are required.', 'error')
    if (form.password !== form.confirmPassword) return showToast('Passwords do not match!', 'error')

    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username, email: form.email, password: form.password,
          profilePhoto: form.profilePhoto,
          collegeName: form.collegeName, age: form.age, city: form.city, state: form.state,
          skills: form.skills, github: form.github, twitter: form.twitter,
          leetcode: form.leetcode, youtube: form.youtube, projects: form.projects
        })
      })
      const data = await res.json()
      if (!res.ok) return showToast(data.message || 'Signup failed.', 'error')
      showToast('Account created! Redirecting to login... 🎉', 'success')
      setTimeout(() => navigate('/login'), 1500)
    } catch {
      showToast('Could not reach server. Is the backend running?', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{
        position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '300px',
        background: 'radial-gradient(ellipse at center, rgba(250,204,21,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{
        width: '100%', maxWidth: '580px',
        background: 'linear-gradient(135deg, #111111 0%, #161616 100%)',
        border: '1px solid rgba(250,204,21,0.25)', borderRadius: '20px', padding: '40px',
        boxShadow: '0 0 60px rgba(250,204,21,0.07), 0 8px 32px rgba(0,0,0,0.8)',
        position: 'relative', zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '48px', height: '48px', borderRadius: '13px',
            background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
            marginBottom: '14px', boxShadow: '0 0 24px rgba(250,204,21,0.35)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#0a0a0a"/>
            </svg>
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', fontFamily: 'Inter, system-ui, sans-serif' }}>Join DevNetwork</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '5px', fontFamily: 'Inter, system-ui, sans-serif' }}>Create your developer profile</p>
        </div>

        {toast.msg && (
          <div style={{
            padding: '11px 16px', borderRadius: '10px', marginBottom: '18px',
            background: toast.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
            color: toast.type === 'success' ? '#34d399' : '#f87171',
            fontSize: '14px', fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center'
          }}>{toast.msg}</div>
        )}

        <form onSubmit={handleSubmit}>
          <p style={{ color: '#FACC15', fontSize: '11px', fontWeight: '700', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'Inter, system-ui, sans-serif' }}>Account Information</p>
          <Field label="Profile Photo Link" name="profilePhoto" placeholder="https://example.com/photo.jpg" value={form.profilePhoto} onChange={handleChange} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Username *" name="username" placeholder="cooldev123" value={form.username} onChange={handleChange} />
            <Field label="Email Address *" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
            <Field label="Password *" name="password" type="password" placeholder="Enter password" value={form.password} onChange={handleChange} />
            <Field label="Confirm Password *" name="confirmPassword" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
          </div>

          <div style={{ borderTop: '1px solid #222', margin: '16px 0' }} />
          <p style={{ color: '#FACC15', fontSize: '11px', fontWeight: '700', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'Inter, system-ui, sans-serif' }}>Personal Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0 16px' }}>
            <Field label="College Name" name="collegeName" placeholder="MIT" value={form.collegeName} onChange={handleChange} />
            <Field label="Age" name="age" type="number" placeholder="21" value={form.age} onChange={handleChange} />
            <Field label="City" name="city" placeholder="Mumbai" value={form.city} onChange={handleChange} />
            <Field label="State" name="state" placeholder="MH" value={form.state} onChange={handleChange} />
          </div>

          <div style={{ borderTop: '1px solid #222', margin: '16px 0' }} />
          <p style={{ color: '#FACC15', fontSize: '11px', fontWeight: '700', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'Inter, system-ui, sans-serif' }}>Skills & Links</p>
          <Field label="Skills (comma separated)" name="skills" placeholder="React, Node.js, Python..." value={form.skills} onChange={handleChange} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="GitHub URL" name="github" placeholder="https://github.com/username" value={form.github} onChange={handleChange} />
            <Field label="Twitter / X URL" name="twitter" placeholder="https://twitter.com/username" value={form.twitter} onChange={handleChange} />
            <Field label="LeetCode URL" name="leetcode" placeholder="https://leetcode.com/username" value={form.leetcode} onChange={handleChange} />
            <Field label="YouTube URL" name="youtube" placeholder="https://youtube.com/@channel" value={form.youtube} onChange={handleChange} />
          </div>
          <Field label="Project Links (comma separated)" name="projects" placeholder="https://github.com/user/proj1, https://mysite.com" value={form.projects} onChange={handleChange} />

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px', marginTop: '8px',
              background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
              color: '#0a0a0a', fontSize: '15px', fontWeight: '700',
              fontFamily: 'Inter, system-ui, sans-serif',
              border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(250,204,21,0.3)', letterSpacing: '0.3px'
            }}
            onMouseEnter={e => { if (!loading) e.target.style.opacity = '0.9' }}
            onMouseLeave={e => { e.target.style.opacity = '1' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#FACC15', fontWeight: '600', textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
