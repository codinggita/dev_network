import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './navbar/Navbar'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    age: '', city: '', state: '', skills: '', college: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [myTeam, setMyTeam] = useState(null) // the team where current user is leader
  const [invitingUser, setInvitingUser] = useState(null) // email being invited

  useEffect(() => {
    const data = localStorage.getItem('devnetwork_user');
    if (data) {
      setUser(JSON.parse(data));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const fetchedUsers = await res.json();
          setAllUsers(fetchedUsers.filter(u => u.email !== JSON.parse(localStorage.getItem('devnetwork_user'))?.email));
        } else {
          const fallbackRes = await fetch('/users');
          if (fallbackRes.ok) {
            const fetchedUsers = await fallbackRes.json();
            setAllUsers(fetchedUsers.filter(u => u.email !== JSON.parse(localStorage.getItem('devnetwork_user'))?.email));
          }
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();

    // Fetch teams to check if the current user is a leader
    const fetchTeams = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('devnetwork_user'));
        const res = await fetch('/api/teams');
        if (res.ok) {
          const teams = await res.json();
          const led = teams.find(t => t.leader === currentUser?.email);
          setMyTeam(led || null);
        }
      } catch (err) {
        console.error("Failed to fetch teams", err);
      }
    };
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
        // Refresh myTeam so the button reflects new invites
        const teamsRes = await fetch('/api/teams');
        if (teamsRes.ok) {
          const teams = await teamsRes.json();
          const led = teams.find(t => t.leader === user.email);
          setMyTeam(led || null);
        }
        alert('Invite sent successfully!');
      } else {
        alert(data.message || 'Failed to send invite');
      }
    } catch (err) {
      alert('Error reaching server');
    } finally {
      setInvitingUser(null);
    }
  };

  const filteredUsers = allUsers.filter(u => {
    // Text search query
    const query = searchQuery.toLowerCase();
    const matchesQuery = query === '' || (
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.username && u.username.toLowerCase().includes(query)) ||
      (u.skills && Array.isArray(u.skills) && u.skills.some(s => s && typeof s === 'string' && s.toLowerCase().includes(query)))
    );

    // Advanced filters
    const matchesAge = !filters.age || (u.age && u.age.toString() === filters.age);
    const matchesCity = !filters.city || (u.city && u.city.toLowerCase().includes(filters.city.toLowerCase()));
    const matchesState = !filters.state || (u.state && u.state.toLowerCase().includes(filters.state.toLowerCase()));
    const matchesCollege = !filters.college || (u.collegeName && u.collegeName.toLowerCase().includes(filters.college.toLowerCase()));
    const matchesSkills = !filters.skills || (u.skills && Array.isArray(u.skills) && filters.skills.split(',').every(fSkill => 
      u.skills.some(uSkill => uSkill && typeof uSkill === 'string' && uSkill.toLowerCase().includes(fSkill.trim().toLowerCase()))
    ));

    return matchesQuery && matchesAge && matchesCity && matchesState && matchesCollege && matchesSkills;
  });

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0a0a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />

      <div style={{ flex: 1, marginLeft: '220px', position: 'relative' }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '10%', left: 'calc(220px + 50%)', transform: 'translateX(-50%)',
        width: '700px', height: '350px',
        background: 'radial-gradient(ellipse at center, rgba(250,204,21,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* Navbar / Top Bar */}

      {/* Hero Section */}
      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        padding: '80px 20px', maxWidth: '800px', margin: '0 auto'
      }}>
        <h1 style={{ color: '#ffffff', fontSize: '48px', fontWeight: '800', letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.2 }}>
          Connect with the <span style={{ color: '#FACC15' }}>Top Developers</span>
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '18px', marginBottom: '32px', lineHeight: 1.6 }}>
          Welcome back, {user.name}. Discover fellow engineers, browse their projects, explore their skills, and expand your professional network on DevNetwork.
        </p>
        
        {/* Search Bar & Filter Toggle */}
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              placeholder="Search developers by name, username, or skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '16px 24px 16px 48px',
                background: '#1a1a1a', border: '1px solid #2d2d2d',
                borderRadius: '30px', color: '#ffffff', fontSize: '15px',
                outline: 'none', transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
              onFocus={e => { e.target.style.borderColor = '#FACC15'; e.target.style.boxShadow = '0 0 0 3px rgba(250,204,21,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#2d2d2d'; e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)'; }}
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }}>
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#9ca3af"/>
            </svg>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '0 24px', background: showFilters ? 'rgba(250,204,21,0.1)' : '#1a1a1a', 
              border: `1px solid ${showFilters ? '#FACC15' : '#2d2d2d'}`,
              borderRadius: '30px', color: showFilters ? '#FACC15' : '#ffffff', fontSize: '15px',
              fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" fill="currentColor"/>
            </svg>
            Filters
          </button>
        </div>

        {/* Expandable Advanced Filters */}
        {showFilters && (
          <div style={{
            maxWidth: '600px', margin: '16px auto 0', padding: '24px',
            background: 'linear-gradient(135deg, #111 0%, #161616 100%)',
            border: '1px solid rgba(250,204,21,0.25)', borderRadius: '20px',
            textAlign: 'left', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <h3 style={{ color: '#ffffff', fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0' }}>Advanced Filters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>City</label>
                <input type="text" name="city" value={filters.city} onChange={handleFilterChange} placeholder="e.g. Mumbai" style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>State</label>
                <input type="text" name="state" value={filters.state} onChange={handleFilterChange} placeholder="e.g. MH" style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>College</label>
                <input type="text" name="college" value={filters.college} onChange={handleFilterChange} placeholder="e.g. MIT" style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>Exact Age</label>
                <input type="number" name="age" value={filters.age} onChange={handleFilterChange} placeholder="e.g. 21" style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>Must have Skills (comma separated)</label>
                <input type="text" name="skills" value={filters.skills} onChange={handleFilterChange} placeholder="React, Node.js" style={{ width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                onClick={() => setFilters({ age: '', city: '', state: '', skills: '', college: '' })}
                style={{ background: 'transparent', border: '1px solid #FACC15', color: '#FACC15', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Grid Section */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ color: '#FACC15', fontSize: '14px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ height: '1px', background: 'rgba(250,204,21,0.3)', flex: 1 }}></span>
          Explore Developers
          <span style={{ height: '1px', background: 'rgba(250,204,21,0.3)', flex: 1 }}></span>
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Loading developers...</div>
        ) : filteredUsers.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {filteredUsers.map((u, i) => (
              <div key={i} style={{
                background: 'linear-gradient(135deg, #111 0%, #161616 100%)',
                border: '1px solid #2d2d2d', borderRadius: '16px', padding: '24px',
                transition: 'transform 0.2s, borderColor 0.2s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(250,204,21,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#2d2d2d'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  {u.profilePhoto ? (
                    <img src={u.profilePhoto} alt={u.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(250,204,21,0.4)' }} />
                  ) : (
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#0a0a0a', fontSize: '24px', fontWeight: '800',
                      border: '2px solid rgba(250,204,21,0.4)'
                    }}>
                      {u.name?.charAt(0).toUpperCase() || 'D'}
                    </div>
                  )}
                  <div>
                    <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>{u.name}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>@{u.username}</p>
                    {u.collegeName && <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>🎓 {u.collegeName}</p>}
                    {/* In Team Status */}
                    <div style={{ marginTop: '6px' }}>
                      {u.teamName ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: 'rgba(250,204,21,0.12)', color: '#FACC15',
                          border: '1px solid rgba(250,204,21,0.3)',
                          padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700'
                        }}>
                          👥 {u.teamName}
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: 'rgba(107,114,128,0.12)', color: '#6b7280',
                          border: '1px solid rgba(107,114,128,0.3)',
                          padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600'
                        }}>
                          No Team
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {u.skills && u.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {u.skills.slice(0, 4).map((skill, si) => (
                      <span key={si} style={{
                        background: 'rgba(250,204,21,0.08)', color: '#FACC15',
                        padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600'
                      }}>
                        {skill}
                      </span>
                    ))}
                    {u.skills.length > 4 && <span style={{ color: '#6b7280', fontSize: '11px', padding: '4px' }}>+{u.skills.length - 4} more</span>}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #222', flexWrap: 'wrap', alignItems: 'center' }}>
                  {u.github && <a href={u.github.startsWith('http') ? u.github : `https://${u.github}`} target="_blank" rel="noreferrer" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>💻 GitHub</a>}
                  {u.twitter && <a href={u.twitter.startsWith('http') ? u.twitter : `https://${u.twitter}`} target="_blank" rel="noreferrer" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>🐦 Twitter</a>}
                  {u.leetcode && <a href={u.leetcode.startsWith('http') ? u.leetcode : `https://${u.leetcode}`} target="_blank" rel="noreferrer" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>⚡ LeetCode</a>}
                  {/* Invite button: shown only to team leaders, for users not already in a team */}
                  {myTeam && !u.teamName && myTeam.members.length < 4 && (
                    (myTeam.invites || []).includes(u.email) ? (
                      <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '11px', fontWeight: '600', border: '1px solid #2d2d2d', padding: '4px 10px', borderRadius: '6px' }}>Invite Sent ✓</span>
                    ) : (
                      <button
                        onClick={() => handleInviteUser(u.email)}
                        disabled={invitingUser === u.email}
                        style={{
                          marginLeft: 'auto', background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
                          color: '#0a0a0a', border: 'none', padding: '5px 12px', borderRadius: '6px',
                          fontSize: '11px', fontWeight: '700', cursor: invitingUser === u.email ? 'not-allowed' : 'pointer',
                          opacity: invitingUser === u.email ? 0.7 : 1
                        }}
                      >
                        {invitingUser === u.email ? 'Inviting...' : '+ Invite to My Team'}
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px', background: '#111', borderRadius: '16px', border: '1px dashed #2d2d2d' }}>
            No other developers found on the network yet. Only you are here!
          </div>
        )}
      </div>

      </div>
    </div>
  )
}

export default Dashboard
