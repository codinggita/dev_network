import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar/Navbar';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('devnetwork_user');
    if (data) {
      const parsedUser = JSON.parse(data);
      setUser(parsedUser);
      setForm({
        ...parsedUser,
        skills: parsedUser.skills ? parsedUser.skills.join(', ') : '',
        projects: parsedUser.projects ? parsedUser.projects.join(', ') : ''
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) return null;

  const LinkButton = ({ url, label, icon }) => {
    if (!url) return null;
    return (
      <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noreferrer"
         style={{
           display: 'inline-flex', alignItems: 'center', gap: '8px',
           padding: '8px 16px', borderRadius: '8px',
           background: '#1a1a1a', border: '1px solid #2d2d2d',
           color: '#e5e7eb', textDecoration: 'none', fontSize: '14px',
           transition: 'all 0.2s'
         }}
         onMouseEnter={e => { e.target.style.borderColor = '#FACC15'; e.target.style.color = '#FACC15'; }}
         onMouseLeave={e => { e.target.style.borderColor = '#2d2d2d'; e.target.style.color = '#e5e7eb'; }}
      >
        {icon} {label}
      </a>
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(user.email)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('devnetwork_user', JSON.stringify(data.user));
        setUser(data.user);
        setIsEditing(false);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      alert('Error connecting to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2d2d2d',
    borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontFamily: 'Inter, system-ui, sans-serif', outline: 'none', marginBottom: '12px'
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#0a0a0a', paddingBottom: '40px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />
      
      <div style={{
        position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '300px',
        background: 'radial-gradient(ellipse at center, rgba(250,204,21,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ width: '100%', maxWidth: '700px', margin: '40px auto 0', position: 'relative', zIndex: 1 }}>

        <div style={{
          background: 'linear-gradient(135deg, #111111 0%, #161616 100%)',
          border: '1px solid rgba(250,204,21,0.25)', borderRadius: '20px', padding: '40px',
          boxShadow: '0 0 60px rgba(250,204,21,0.07), 0 8px 32px rgba(0,0,0,0.8)',
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #2d2d2d', paddingBottom: '32px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <img src={form.profilePhoto || 'https://via.placeholder.com/80'} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', border: '2px dashed #FACC15' }} />
                  <input type="text" name="profilePhoto" placeholder="Profile Photo URL" value={form.profilePhoto} onChange={handleChange} style={{...inputStyle, width: '200px', padding: '6px', fontSize: '12px'}} />
                </div>
              ) : (
                user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', border: '2px solid rgba(250,204,21,0.4)', boxShadow: '0 0 24px rgba(250,204,21,0.3)' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #FACC15, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(250,204,21,0.3)', color: '#0a0a0a', fontSize: '32px', fontWeight: '800' }}>
                    {user.name?.charAt(0).toUpperCase() || 'D'}
                  </div>
                )
              )}

              <div>
                {isEditing ? (
                  <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} style={{...inputStyle, fontSize: '24px', fontWeight: '700', padding: '4px 12px', marginBottom: '8px'}} />
                ) : (
                  <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0' }}>{user.name}</h1>
                )}
                <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>@{user.username} • {user.email}</p>
              </div>
            </div>

            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={loading}
              style={{
                background: isEditing ? 'linear-gradient(135deg, #FACC15, #F59E0B)' : 'transparent',
                color: isEditing ? '#0a0a0a' : '#FACC15',
                border: isEditing ? 'none' : '1px solid #FACC15',
                padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                transition: 'all 0.2s', opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Saving...' : isEditing ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div>
              <h2 style={{ color: '#FACC15', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Personal Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ color: '#d1d5db', fontSize: '15px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', display: 'inline-block', width: '80px' }}>Team:</span> 
                  {user.teamName ? <span style={{ color: '#FACC15', fontWeight: '700' }}>{user.teamName}</span> : <span style={{ color: '#6b7280' }}>Not in a team</span>}
                </div>
                <div style={{ color: '#d1d5db', fontSize: '15px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', display: 'inline-block', width: '80px' }}>College:</span> 
                  {isEditing ? <input type="text" name="collegeName" value={form.collegeName} onChange={handleChange} style={{...inputStyle, margin: 0, flex: 1}} /> : (user.collegeName || '—')}
                </div>
                <div style={{ color: '#d1d5db', fontSize: '15px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', display: 'inline-block', width: '80px' }}>Age:</span> 
                  {isEditing ? <input type="number" name="age" value={form.age} onChange={handleChange} style={{...inputStyle, margin: 0, flex: 1}} /> : (user.age || '—')}
                </div>
                <div style={{ color: '#d1d5db', fontSize: '15px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', display: 'inline-block', width: '80px' }}>City/State:</span> 
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                      <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} style={{...inputStyle, margin: 0}} />
                      <input type="text" name="state" placeholder="State" value={form.state} onChange={handleChange} style={{...inputStyle, margin: 0}} />
                    </div>
                  ) : ([user.city, user.state].filter(Boolean).join(', ') || '—')}
                </div>
              </div>
            </div>

            <div>
              <h2 style={{ color: '#FACC15', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Technical Skills</h2>
              {isEditing ? (
                <div>
                  <input type="text" name="skills" placeholder="React, Node.js, Python (comma separated)" value={form.skills} onChange={handleChange} style={inputStyle} />
                  <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '-8px' }}>Separate skills with commas</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {user.skills && user.skills.length > 0 ? user.skills.map((skill, i) => (
                    <span key={i} style={{ background: 'rgba(250,204,21,0.1)', color: '#FACC15', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', border: '1px solid rgba(250,204,21,0.2)' }}>
                      {skill}
                    </span>
                  )) : <span style={{ color: '#6b7280', fontSize: '14px' }}>—</span>}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #2d2d2d' }}>
            <h2 style={{ color: '#FACC15', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Links & Profiles</h2>
            {isEditing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><span style={{color: '#9ca3af', fontSize: '12px'}}>GitHub</span><input type="text" name="github" value={form.github} onChange={handleChange} style={inputStyle} /></div>
                <div><span style={{color: '#9ca3af', fontSize: '12px'}}>Twitter</span><input type="text" name="twitter" value={form.twitter} onChange={handleChange} style={inputStyle} /></div>
                <div><span style={{color: '#9ca3af', fontSize: '12px'}}>LeetCode</span><input type="text" name="leetcode" value={form.leetcode} onChange={handleChange} style={inputStyle} /></div>
                <div><span style={{color: '#9ca3af', fontSize: '12px'}}>YouTube</span><input type="text" name="youtube" value={form.youtube} onChange={handleChange} style={inputStyle} /></div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <LinkButton url={user.github} label="GitHub" icon="💻" />
                <LinkButton url={user.twitter} label="Twitter / X" icon="🐦" />
                <LinkButton url={user.leetcode} label="LeetCode" icon="⚡" />
                <LinkButton url={user.youtube} label="YouTube" icon="▶️" />
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '12px' }}>Projects:</h3>
              {isEditing ? (
                 <div>
                   <input type="text" name="projects" placeholder="Project URLs (comma separated)" value={form.projects} onChange={handleChange} style={inputStyle} />
                 </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {user.projects && user.projects.length > 0 && user.projects.some(p => p.trim() !== "") ? user.projects.filter(p => p.trim()).map((proj, i) => (
                    <a key={i} href={proj.startsWith('http') ? proj : `https://${proj}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '14px' }}>
                      🔗 {proj}
                    </a>
                  )) : <span style={{ color: '#6b7280', fontSize: '14px' }}>—</span>}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
