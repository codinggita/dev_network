import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './navbar/Navbar'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ age: '', city: '', state: '', skills: '', college: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [myTeam, setMyTeam] = useState(null)
  const [invitingUser, setInvitingUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null) // for profile modal

  useEffect(() => {
    const data = localStorage.getItem('devnetwork_user');
    if (data) { setUser(JSON.parse(data)); } else { navigate('/login'); }
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const fetchedUsers = await res.json();
          setAllUsers(fetchedUsers.filter(u => u.email !== JSON.parse(localStorage.getItem('devnetwork_user'))?.email));
        }
      } catch (err) { console.error("Failed to fetch users", err); }
      finally { setLoading(false); }
    };
    const fetchTeams = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('devnetwork_user'));
        const res = await fetch('/api/teams');
        if (res.ok) {
          const teams = await res.json();
          setMyTeam(teams.find(t => t.leader === currentUser?.email) || null);
        }
      } catch (err) { console.error("Failed to fetch teams", err); }
    };
    fetchUsers();
    fetchTeams();
  }, []);

  const handleInviteUser = async (inviteeEmail) => {
    if (!myTeam) return;
    setInvitingUser(inviteeEmail);
    try {
      const res = await fetch(`/api/teams/${encodeURIComponent(myTeam.name)}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderEmail: user.email, inviteeEmail })
      });
      const data = await res.json();
      if (res.ok) {
        const teamsRes = await fetch('/api/teams');
        if (teamsRes.ok) {
          const teams = await teamsRes.json();
          setMyTeam(teams.find(t => t.leader === user.email) || null);
        }
        alert('Invite sent!');
      } else { alert(data.message || 'Failed to send invite'); }
    } catch { alert('Error reaching server'); }
    finally { setInvitingUser(null); }
  };

  const filteredUsers = allUsers.filter(u => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = query === '' || (
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.username && u.username.toLowerCase().includes(query)) ||
      (u.skills && u.skills.some(s => s && s.toLowerCase().includes(query)))
    );
    const matchesAge = !filters.age || u.age?.toString() === filters.age;
    const matchesCity = !filters.city || u.city?.toLowerCase().includes(filters.city.toLowerCase());
    const matchesState = !filters.state || u.state?.toLowerCase().includes(filters.state.toLowerCase());
    const matchesCollege = !filters.college || u.collegeName?.toLowerCase().includes(filters.college.toLowerCase());
    const matchesSkills = !filters.skills || filters.skills.split(',').every(fSkill =>
      u.skills?.some(uSkill => uSkill?.toLowerCase().includes(fSkill.trim().toLowerCase()))
    );
    return matchesQuery && matchesAge && matchesCity && matchesState && matchesCollege && matchesSkills;
  });

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0a0a', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar />

      <div style={{ flex: 1, marginLeft: '220px', position: 'relative' }}>
        {/* Background glow */}
        <div style={{
          position: 'fixed', top: '10%', left: 'calc(220px + 50%)', transform: 'translateX(-50%)',
          width: '700px', height: '350px',
          background: 'radial-gradient(ellipse at center, rgba(250,204,21,0.08) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0
        }} />

        {/* Hero */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '72px 20px 40px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', borderRadius: '30px', padding: '4px 16px', marginBottom: '20px' }}>
            <span style={{ color: '#FACC15', fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Developer Network</span>
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '46px', fontWeight: '800', letterSpacing: '-1.5px', marginBottom: '14px', lineHeight: 1.15 }}>
            Connect with <span style={{ color: '#FACC15' }}>Top Builders</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '32px', lineHeight: 1.65 }}>
            Welcome back, <span style={{ color: '#fff', fontWeight: '600' }}>{user.name}</span>. Discover engineers, browse their projects, and grow your network.
          </p>

          {/* Search + Filters */}
          <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search by name, username, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '14px 24px 14px 48px',
                  background: '#141414', border: '1px solid #2d2d2d',
                  borderRadius: '30px', color: '#ffffff', fontSize: '14px',
                  outline: 'none', transition: 'all 0.2s',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                }}
                onFocus={e => { e.target.style.borderColor = '#FACC15'; e.target.style.boxShadow = '0 0 0 3px rgba(250,204,21,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#2d2d2d'; e.target.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; }}
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }}>
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#6b7280" />
              </svg>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '0 20px', background: showFilters ? 'rgba(250,204,21,0.1)' : '#141414',
                border: `1px solid ${showFilters ? '#FACC15' : '#2d2d2d'}`,
                borderRadius: '30px', color: showFilters ? '#FACC15' : '#9ca3af', fontSize: '14px',
                fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" fill="currentColor" />
              </svg>
              Filters
            </button>
          </div>

          {showFilters && (
            <div style={{
              maxWidth: '600px', margin: '16px auto 0', padding: '24px',
              background: 'linear-gradient(135deg, #111 0%, #161616 100%)',
              border: '1px solid rgba(250,204,21,0.2)', borderRadius: '20px',
              textAlign: 'left', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <h3 style={{ color: '#ffffff', fontSize: '14px', fontWeight: '700', margin: '0 0 16px 0' }}>Advanced Filters</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'City', name: 'city', placeholder: 'e.g. Mumbai' },
                  { label: 'State', name: 'state', placeholder: 'e.g. MH' },
                  { label: 'College', name: 'college', placeholder: 'e.g. MIT' },
                  { label: 'Age', name: 'age', placeholder: 'e.g. 21', type: 'number' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ display: 'block', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{f.label}</label>
                    <input type={f.type || 'text'} name={f.name} value={filters[f.name]} onChange={handleFilterChange} placeholder={f.placeholder}
                      style={{ width: '100%', padding: '9px 13px', background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Skills (comma separated)</label>
                  <input type="text" name="skills" value={filters.skills} onChange={handleFilterChange} placeholder="React, Node.js"
                    style={{ width: '100%', padding: '9px 13px', background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button onClick={() => setFilters({ age: '', city: '', state: '', skills: '', college: '' })}
                  style={{ background: 'transparent', border: '1px solid rgba(250,204,21,0.4)', color: '#FACC15', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dev Grid */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{ height: '1px', background: 'rgba(250,204,21,0.2)', flex: 1 }} />
            <span style={{ color: '#FACC15', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {filteredUsers.length} Developer{filteredUsers.length !== 1 ? 's' : ''}
            </span>
            <div style={{ height: '1px', background: 'rgba(250,204,21,0.2)', flex: 1 }} />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '60px', fontSize: '15px' }}>Loading developers...</div>
          ) : filteredUsers.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {filteredUsers.map((u, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedUser(u)}
                  style={{
                    background: 'linear-gradient(145deg, #111 0%, #161616 100%)',
                    border: '1px solid #1f1f1f', borderRadius: '18px', padding: '22px',
                    cursor: 'pointer', transition: 'all 0.22s ease',
                    boxShadow: '0 2px 14px rgba(0,0,0,0.4)',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = 'rgba(250,204,21,0.35)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(250,204,21,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#1f1f1f';
                    e.currentTarget.style.boxShadow = '0 2px 14px rgba(0,0,0,0.4)';
                  }}
                >
                  {/* Top glow accent */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: u.teamName ? 'linear-gradient(90deg, #FACC15, #F59E0B)' : 'linear-gradient(90deg, #2d2d2d, #2d2d2d)', borderRadius: '18px 18px 0 0' }} />

                  {/* Avatar + Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    {u.profilePhoto ? (
                      <img src={u.profilePhoto} alt={u.name} style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(250,204,21,0.3)', flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: '58px', height: '58px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#0a0a0a', fontSize: '22px', fontWeight: '800',
                        border: '2px solid rgba(250,204,21,0.3)'
                      }}>
                        {u.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</h3>
                      <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 6px 0' }}>@{u.username}</p>
                      {u.teamName ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(250,204,21,0.1)', color: '#FACC15', border: '1px solid rgba(250,204,21,0.25)', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700' }}>
                          👥 {u.teamName}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.04)', color: '#4b5563', border: '1px solid rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600' }}>
                          No Team
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {u.skills && u.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                      {u.skills.slice(0, 4).map((skill, si) => (
                        <span key={si} style={{ background: 'rgba(250,204,21,0.07)', color: '#FACC15', padding: '3px 9px', borderRadius: '5px', fontSize: '10px', fontWeight: '600', border: '1px solid rgba(250,204,21,0.12)' }}>
                          {skill}
                        </span>
                      ))}
                      {u.skills.length > 4 && <span style={{ color: '#4b5563', fontSize: '10px', padding: '3px 6px' }}>+{u.skills.length - 4} more</span>}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: 'flex', gap: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: '#374151', fontSize: '11px', fontWeight: '500' }}>
                      {u.city || u.collegeName ? `📍 ${u.city || u.collegeName}` : ''}
                    </span>

                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
                      {u.github && <a href={u.github.startsWith('http') ? u.github : `https://${u.github}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px' }} title="GitHub">💻</a>}
                      {u.twitter && <a href={u.twitter.startsWith('http') ? u.twitter : `https://${u.twitter}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px' }} title="Twitter">🐦</a>}
                      {u.leetcode && <a href={u.leetcode.startsWith('http') ? u.leetcode : `https://${u.leetcode}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px' }} title="LeetCode">⚡</a>}

                      {myTeam && !u.teamName && myTeam.members.length < 4 && (
                        (myTeam.invites || []).includes(u.email) ? (
                          <span style={{ color: '#4b5563', fontSize: '10px', fontWeight: '600', border: '1px solid #2d2d2d', padding: '3px 8px', borderRadius: '5px' }}>Invited ✓</span>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); handleInviteUser(u.email); }}
                            disabled={invitingUser === u.email}
                            style={{
                              background: invitingUser === u.email ? '#1a1a1a' : 'linear-gradient(135deg, #FACC15, #F59E0B)',
                              color: invitingUser === u.email ? '#6b7280' : '#0a0a0a',
                              border: 'none', padding: '4px 10px', borderRadius: '6px',
                              fontSize: '10px', fontWeight: '700', cursor: invitingUser === u.email ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {invitingUser === u.email ? 'Inviting...' : '+ Invite'}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Click hint */}
                  <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', opacity: 0, transition: 'opacity 0.2s' }} className="view-hint">
                    <span style={{ color: '#FACC15', fontSize: '10px' }}>View Profile →</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '60px', background: '#111', borderRadius: '18px', border: '1px dashed #2d2d2d' }}>
              No developers found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* ── Profile Modal ── */}
      {selectedUser && (
        <div
          onClick={() => setSelectedUser(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, #111 0%, #161616 100%)',
              border: '1px solid rgba(250,204,21,0.25)', borderRadius: '24px',
              width: '100%', maxWidth: '560px', maxHeight: '85vh',
              overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
              position: 'relative',
            }}
          >
            {/* Gold top bar */}
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #FACC15, #F59E0B)', borderRadius: '24px 24px 0 0' }} />

            {/* Close btn */}
            <button
              onClick={() => setSelectedUser(null)}
              style={{
                position: 'absolute', top: '18px', right: '18px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#9ca3af', width: '32px', height: '32px', borderRadius: '50%',
                cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>

            {/* Header */}
            <div style={{ padding: '28px 28px 20px', display: 'flex', gap: '18px', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {selectedUser.profilePhoto ? (
                <img src={selectedUser.profilePhoto} alt={selectedUser.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(250,204,21,0.5)', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #FACC15, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0a', fontSize: '32px', fontWeight: '800', flexShrink: 0 }}>
                  {selectedUser.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>{selectedUser.name}</h2>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 10px' }}>@{selectedUser.username}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedUser.teamName && (
                    <span style={{ background: 'rgba(250,204,21,0.12)', color: '#FACC15', border: '1px solid rgba(250,204,21,0.3)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                      👥 {selectedUser.teamName}
                    </span>
                  )}
                  {selectedUser.age && <span style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', padding: '3px 10px', borderRadius: '20px', fontSize: '11px' }}>🎂 {selectedUser.age} yrs</span>}
                  {selectedUser.city && <span style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', padding: '3px 10px', borderRadius: '20px', fontSize: '11px' }}>📍 {selectedUser.city}{selectedUser.state ? `, ${selectedUser.state}` : ''}</span>}
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* College */}
              {selectedUser.collegeName && (
                <div>
                  <p style={{ color: '#4b5563', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>Education</p>
                  <p style={{ color: '#e5e7eb', fontSize: '14px', margin: 0 }}>🎓 {selectedUser.collegeName}</p>
                </div>
              )}

              {/* Skills */}
              {selectedUser.skills && selectedUser.skills.length > 0 && (
                <div>
                  <p style={{ color: '#4b5563', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Skills</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedUser.skills.map((skill, si) => (
                      <span key={si} style={{ background: 'rgba(250,204,21,0.08)', color: '#FACC15', border: '1px solid rgba(250,204,21,0.15)', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {selectedUser.projects && selectedUser.projects.length > 0 && (
                <div>
                  <p style={{ color: '#4b5563', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Projects</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedUser.projects.filter(p => p).map((proj, pi) => (
                      <a key={pi} href={proj.startsWith('http') ? proj : `https://${proj}`} target="_blank" rel="noreferrer"
                        style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                        🔗 {proj}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(selectedUser.github || selectedUser.twitter || selectedUser.leetcode || selectedUser.youtube) && (
                <div>
                  <p style={{ color: '#4b5563', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>Links</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { key: 'github', label: '💻 GitHub', color: '#e5e7eb' },
                      { key: 'twitter', label: '🐦 Twitter', color: '#1d9bf0' },
                      { key: 'leetcode', label: '⚡ LeetCode', color: '#ffa116' },
                      { key: 'youtube', label: '▶ YouTube', color: '#ff0000' },
                    ].map(({ key, label, color }) => selectedUser[key] ? (
                      <a key={key} href={selectedUser[key].startsWith('http') ? selectedUser[key] : `https://${selectedUser[key]}`}
                        target="_blank" rel="noreferrer"
                        style={{ color, textDecoration: 'none', fontSize: '12px', fontWeight: '600', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '7px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {label}
                      </a>
                    ) : null)}
                  </div>
                </div>
              )}

              {/* Invite Button */}
              {myTeam && !selectedUser.teamName && myTeam.members.length < 4 && (
                <div style={{ paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  {(myTeam.invites || []).includes(selectedUser.email) ? (
                    <span style={{ display: 'block', textAlign: 'center', color: '#6b7280', fontSize: '13px', fontWeight: '600', padding: '10px', border: '1px solid #2d2d2d', borderRadius: '10px' }}>Invite Already Sent ✓</span>
                  ) : (
                    <button
                      onClick={() => handleInviteUser(selectedUser.email)}
                      disabled={invitingUser === selectedUser.email}
                      style={{
                        width: '100%', padding: '12px', background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
                        color: '#0a0a0a', border: 'none', borderRadius: '10px', fontSize: '14px',
                        fontWeight: '700', cursor: invitingUser === selectedUser.email ? 'not-allowed' : 'pointer',
                        opacity: invitingUser === selectedUser.email ? 0.7 : 1,
                      }}
                    >
                      {invitingUser === selectedUser.email ? 'Sending Invite...' : `+ Invite ${selectedUser.name?.split(' ')[0]} to My Team`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
