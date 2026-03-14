import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar/Navbar';

const Teams = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('devnetwork_user');
    if (data) {
      setUser(JSON.parse(data));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams');
      if (res.ok) {
        const data = await res.json();
        setAllTeams(data);
      }
    } catch (err) {
      console.error("Failed to fetch teams", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return alert("Enter a team name");
    setCreating(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName, email: user.email })
      });
      const data = await res.json();
      if (res.ok) {
        // Update user in local storage
        localStorage.setItem('devnetwork_user', JSON.stringify(data.user));
        setUser(data.user);
        setNewTeamName('');
        fetchTeams();
        alert("Team created successfully!");
      } else {
        alert(data.message || "Failed to create team");
      }
    } catch (err) {
      alert("Error reaching server");
    } finally {
      setCreating(false);
    }
  };

  const handleRequestJoin = async (teamName) => {
    setJoining(teamName);
    try {
      const res = await fetch(`/api/teams/${encodeURIComponent(teamName)}/request-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      if (res.ok) {
        fetchTeams();
        alert("Join request sent successfully!");
      } else {
        alert(data.message || "Failed to send join request");
      }
    } catch (err) {
      alert("Error reaching server");
    } finally {
      setJoining(null);
    }
  };

  const handleAcceptJoin = async (teamName, requesterEmail) => {
    try {
      const res = await fetch(`/api/teams/${encodeURIComponent(teamName)}/accept-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderEmail: user.email, requesterEmail })
      });
      const data = await res.json();
      if (res.ok) {
        fetchTeams();
        alert("Request accepted!");
      } else {
        alert(data.message || "Failed to accept request");
      }
    } catch (err) {
      alert("Error reaching server");
    }
  };

  const handleRejectJoin = async (teamName, requesterEmail) => {
    try {
      const res = await fetch(`/api/teams/${encodeURIComponent(teamName)}/reject-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderEmail: user.email, requesterEmail })
      });
      const data = await res.json();
      if (res.ok) {
        fetchTeams();
        alert("Request rejected!");
      } else {
        alert(data.message || "Failed to reject request");
      }
    } catch (err) {
      alert("Error reaching server");
    }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: '80px' }}>
      <Navbar />

      <div style={{
        position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '350px',
        background: 'radial-gradient(ellipse at center, rgba(250,204,21,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '60px 20px 40px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#ffffff', fontSize: '48px', fontWeight: '800', letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.2 }}>
          Developer <span style={{ color: '#FACC15' }}>Teams</span>
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '18px', marginBottom: '40px', lineHeight: 1.6 }}>
          Join forces with other engineers. Create your own team of 4, or join an existing one to collaborate and build amazing projects together.
        </p>

        {/* Create Team Section */}
        {!user.teamName ? (
          <div style={{
            background: 'linear-gradient(135deg, #111 0%, #161616 100%)', border: '1px solid rgba(250,204,21,0.3)',
            borderRadius: '16px', padding: '32px', maxWidth: '500px', margin: '0 auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 }}>Create a New Team</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" placeholder="Enter awesome team name..." value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)}
                style={{
                  flex: 1, padding: '12px 16px', background: '#1a1a1a', border: '1px solid #2d2d2d',
                  borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none'
                }}
              />
              <button 
                onClick={handleCreateTeam} disabled={creating || user.teamName}
                style={{
                  padding: '0 24px', background: 'linear-gradient(135deg, #FACC15, #F59E0B)', color: '#0a0a0a',
                  border: 'none', borderRadius: '8px', fontWeight: '700', cursor: creating ? 'not-allowed' : 'pointer',
                  opacity: creating ? 0.7 : 1
                }}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(250, 204, 21, 0.1)', border: '1px solid #FACC15', borderRadius: '16px',
            padding: '24px', maxWidth: '500px', margin: '0 auto', color: '#FACC15', fontWeight: '600'
          }}>
            You are currently a proud member of Team: <span style={{ color: '#fff', fontWeight: '800' }}>{user.teamName}</span>
          </div>
        )}
      </div>

      {/* Teams Grid */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ color: '#FACC15', fontSize: '14px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ height: '1px', background: 'rgba(250,204,21,0.3)', flex: 1 }}></span>
          Discover Teams
          <span style={{ height: '1px', background: 'rgba(250,204,21,0.3)', flex: 1 }}></span>
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Loading teams...</div>
        ) : allTeams.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {allTeams.map((team, idx) => (
              <div key={idx} style={{
                background: 'linear-gradient(135deg, #111 0%, #161616 100%)',
                border: team.name === user.teamName ? '2px solid #FACC15' : '1px solid #2d2d2d',
                borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)', transition: 'transform 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #222', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>{team.name}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>{team.members.length} / 4 Members</p>
                  </div>
                  {team.name === user.teamName ? (
                    <span style={{ background: 'rgba(250,204,21,0.2)', color: '#FACC15', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>Your Team</span>
                  ) : !user.teamName && team.members.length < 4 ? (
                    team.joinRequests?.includes(user.email) ? (
                      <span style={{ background: 'transparent', border: '1px solid #6b7280', color: '#6b7280', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>Request Sent</span>
                    ) : (
                      <button 
                        onClick={() => handleRequestJoin(team.name)}
                        disabled={joining === team.name}
                        style={{
                          background: 'transparent', border: '1px solid #FACC15', color: '#FACC15',
                          padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                          cursor: joining === team.name ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {joining === team.name ? 'Sending...' : 'Request to Join'}
                      </button>
                    )
                  ) : team.members.length >= 4 && !user.teamName ? (
                    <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600' }}>Team Full</span>
                  ) : null}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ color: '#FACC15', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>Members:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {team.memberDetails && team.memberDetails.map((member, mi) => (
                      <div key={mi} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {member.profilePhoto ? (
                          <img src={member.profilePhoto} alt={member.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(250,204,21,0.5)' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '700' }}>
                            {member.name?.charAt(0).toUpperCase() || 'D'}
                          </div>
                        )}
                        <div>
                          <p style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: '600', margin: '0 0 2px 0' }}>{member.name}</p>
                          <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>@{member.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manage Requests (Only for Leader) */}
                {team.leader === user.email && team.requestDetails && team.requestDetails.length > 0 && (
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #222' }}>
                    <p style={{ color: '#FACC15', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>Join Requests:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {team.requestDetails.map((reqUser, ri) => (
                        <div key={ri} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {reqUser.profilePhoto ? (
                              <img src={reqUser.profilePhoto} alt={reqUser.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '700' }}>
                                {reqUser.name?.charAt(0).toUpperCase() || 'D'}
                              </div>
                            )}
                            <div>
                              <p style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: '600', margin: '0 0 2px 0' }}>{reqUser.name}</p>
                              <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>@{reqUser.username}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleAcceptJoin(team.name, reqUser.email)} style={{ background: '#FACC15', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Accept</button>
                            <button onClick={() => handleRejectJoin(team.name, reqUser.email)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.5)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Projects (Mocked/Combined for now since we just set them up) */}
                {team.projects && team.projects.length > 0 && (
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #222' }}>
                    <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>Team Projects:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {team.projects.map((proj, pi) => (
                        <a key={pi} href={proj.startsWith('http') ? proj : `https://${proj}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '13px' }}>
                          🔗 {proj}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px', background: '#111', borderRadius: '16px', border: '1px dashed #2d2d2d' }}>
            No teams created yet. Be the first to start a team!
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;
