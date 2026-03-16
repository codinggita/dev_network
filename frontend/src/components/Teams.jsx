import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar/Navbar';

const Teams = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamTitle, setNewTeamTitle] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(null);
  // Leader invite by email
  const [inviteEmail, setInviteEmail] = useState({});
  const [inviting, setInviting] = useState(null);
  // Accept/reject invite loading
  const [respondingInvite, setRespondingInvite] = useState(null);
  // Leave / remove
  const [leavingTeam, setLeavingTeam] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);

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
        body: JSON.stringify({ 
          name: newTeamName, 
          title: newTeamTitle,
          description: newTeamDesc,
          email: user.email 
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('devnetwork_user', JSON.stringify(data.user));
        setUser(data.user);
        setNewTeamName('');
        setNewTeamTitle('');
        setNewTeamDesc('');
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

  // Leader sends invite to a user by email
  const handleSendInvite = async (teamName) => {
    const email = (inviteEmail[teamName] || '').trim();
    if (!email) return alert("Enter the user's email to invite");
    setInviting(teamName);
    try {
      const res = await fetch(`/api/teams/${encodeURIComponent(teamName)}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderEmail: user.email, inviteeEmail: email })
      });
      const data = await res.json();
      if (res.ok) {
        setInviteEmail(prev => ({ ...prev, [teamName]: '' }));
        fetchTeams();
        alert("Invite sent successfully!");
      } else {
        alert(data.message || "Failed to send invite");
      }
    } catch (err) {
      alert("Error reaching server");
    } finally {
      setInviting(null);
    }
  };

  // User accepts a team invite
  const handleAcceptInvite = async (teamName) => {
    setRespondingInvite(teamName + '_accept');
    try {
      const res = await fetch(`/api/teams/${encodeURIComponent(teamName)}/accept-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteeEmail: user.email })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('devnetwork_user', JSON.stringify(data.user));
        setUser(data.user);
        fetchTeams();
        alert("You have joined the team!");
      } else {
        alert(data.message || "Failed to accept invite");
      }
    } catch (err) {
      alert("Error reaching server");
    } finally {
      setRespondingInvite(null);
    }
  };

  // User rejects a team invite
  const handleRejectInvite = async (teamName) => {
    setRespondingInvite(teamName + '_reject');
    try {
      const res = await fetch(`/api/teams/${encodeURIComponent(teamName)}/reject-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteeEmail: user.email })
      });
      const data = await res.json();
      if (res.ok) {
        fetchTeams();
        alert("Invite declined.");
      } else {
        alert(data.message || "Failed to decline invite");
      }
    } catch (err) {
      alert("Error reaching server");
    } finally {
      setRespondingInvite(null);
    }
  };

  // Member leaves their team
  const handleLeaveTeam = async (teamName) => {
    if (!window.confirm(`Are you sure you want to leave team "${teamName}"?`)) return;
    setLeavingTeam(true);
    try {
      const res = await fetch(`/api/teams/${encodeURIComponent(teamName)}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('devnetwork_user', JSON.stringify(data.user));
        setUser(data.user);
        fetchTeams();
        alert("You have left the team.");
      } else {
        alert(data.message || "Failed to leave team");
      }
    } catch (err) {
      alert("Error reaching server");
    } finally {
      setLeavingTeam(false);
    }
  };

  // Leader removes a member
  const handleRemoveMember = async (teamName, memberEmail) => {
    if (!window.confirm(`Remove this member from "${teamName}"?`)) return;
    setRemovingMember(memberEmail);
    try {
      const res = await fetch(`/api/teams/${encodeURIComponent(teamName)}/remove-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderEmail: user.email, memberEmail })
      });
      const data = await res.json();
      if (res.ok) {
        fetchTeams();
        alert("Member removed.");
      } else {
        alert(data.message || "Failed to remove member");
      }
    } catch (err) {
      alert("Error reaching server");
    } finally {
      setRemovingMember(null);
    }
  };

  if (!user) return null;

  // Find all pending invites for the current user
  const pendingInvites = allTeams.filter(t =>
    (t.invites || []).includes(user.email)
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0a0a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />

      <div style={{ flex: 1, marginLeft: '220px', paddingBottom: '80px', position: 'relative' }}>

      <div style={{
        position: 'fixed', top: '10%', left: 'calc(220px + 50%)', transform: 'translateX(-50%)',
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

        {/* Pending Invites Banner */}
        {!user.teamName && pendingInvites.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            {pendingInvites.map((team, idx) => (
              <div key={idx} style={{
                background: 'linear-gradient(135deg, rgba(250,204,21,0.12) 0%, rgba(245,158,11,0.08) 100%)',
                border: '1px solid rgba(250,204,21,0.5)',
                borderRadius: '16px', padding: '20px 24px',
                maxWidth: '560px', margin: '0 auto 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                boxShadow: '0 0 24px rgba(250,204,21,0.08)'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ color: '#FACC15', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px 0' }}>
                    📨 Team Invite
                  </p>
                  <p style={{ color: '#e5e7eb', fontSize: '15px', fontWeight: '600', margin: 0 }}>
                    <span style={{ color: '#FACC15' }}>{team.name}</span> has invited you to join their team!
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleAcceptInvite(team.name)}
                    disabled={respondingInvite !== null}
                    style={{
                      background: 'linear-gradient(135deg, #FACC15, #F59E0B)', color: '#0a0a0a',
                      border: 'none', padding: '8px 18px', borderRadius: '8px',
                      fontSize: '13px', fontWeight: '700', cursor: respondingInvite ? 'not-allowed' : 'pointer',
                      opacity: respondingInvite ? 0.7 : 1
                    }}
                  >
                    {respondingInvite === team.name + '_accept' ? 'Joining...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleRejectInvite(team.name)}
                    disabled={respondingInvite !== null}
                    style={{
                      background: 'transparent', color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.5)', padding: '8px 18px', borderRadius: '8px',
                      fontSize: '13px', fontWeight: '700', cursor: respondingInvite ? 'not-allowed' : 'pointer',
                      opacity: respondingInvite ? 0.7 : 1
                    }}
                  >
                    {respondingInvite === team.name + '_reject' ? 'Declining...' : 'Decline'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Team Section */}
        {!user.teamName ? (
          <div style={{
            background: 'linear-gradient(135deg, #111 0%, #161616 100%)', border: '1px solid rgba(250,204,21,0.3)',
            borderRadius: '16px', padding: '32px', maxWidth: '500px', margin: '0 auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 }}>Create a New Team</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text" placeholder="Team Name (e.g., Code Ninjas)" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)}
                style={{
                  padding: '12px 16px', background: '#1a1a1a', border: '1px solid #2d2d2d',
                  borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none'
                }}
              />
              <input
                type="text" placeholder="Short Title (e.g., Building a web app)" value={newTeamTitle} onChange={(e) => setNewTeamTitle(e.target.value)}
                style={{
                  padding: '12px 16px', background: '#1a1a1a', border: '1px solid #2d2d2d',
                  borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none'
                }}
              />
              <textarea
                placeholder="Team Description (What are you building? Looking for specific skills?)" value={newTeamDesc} onChange={(e) => setNewTeamDesc(e.target.value)}
                style={{
                  padding: '12px 16px', background: '#1a1a1a', border: '1px solid #2d2d2d',
                  borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '80px'
                }}
              />
              <button
                onClick={handleCreateTeam} disabled={creating || user.teamName}
                style={{
                  padding: '12px 24px', background: 'linear-gradient(135deg, #FACC15, #F59E0B)', color: '#0a0a0a',
                  border: 'none', borderRadius: '8px', fontWeight: '700', cursor: creating ? 'not-allowed' : 'pointer',
                  opacity: creating ? 0.7 : 1, width: '100%', marginTop: '8px'
                }}
              >
                {creating ? "Creating..." : "Create Team"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(250, 204, 21, 0.1)', border: '1px solid #FACC15', borderRadius: '16px',
            padding: '24px', maxWidth: '500px', margin: '0 auto', color: '#FACC15', fontWeight: '600',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px'
          }}>
            <span>You are currently a proud member of Team: <span style={{ color: '#fff', fontWeight: '800' }}>{user.teamName}</span></span>
            {/* Non-leaders can Leave */}
            {allTeams.find(t => t.name === user.teamName)?.leader !== user.email && (
              <button
                onClick={() => handleLeaveTeam(user.teamName)}
                disabled={leavingTeam}
                style={{
                  background: 'transparent', color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.5)',
                  padding: '6px 14px', borderRadius: '8px',
                  fontSize: '12px', fontWeight: '700', cursor: leavingTeam ? 'not-allowed' : 'pointer',
                  opacity: leavingTeam ? 0.7 : 1, whiteSpace: 'nowrap', flexShrink: 0
                }}
              >
                {leavingTeam ? 'Leaving...' : 'Leave Team'}
              </button>
            )}
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
            {allTeams.map((team, idx) => {
              const isExpanded = expandedTeam === team.name;
              const isMyTeam = team.name === user.teamName;
              const isOtherTeam = !isMyTeam;

              return (
                <div
                  key={idx}
                  style={{
                    background: 'linear-gradient(135deg, #111 0%, #161616 100%)',
                    border: isMyTeam ? '2px solid #FACC15' : '1px solid #2d2d2d',
                    borderRadius: '16px', overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* ── Clickable Header (always visible) ── */}
                  <div
                    onClick={() => setExpandedTeam(isExpanded ? null : team.name)}
                    style={{
                      padding: '20px 24px', cursor: 'pointer', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center',
                      gap: '12px',
                      background: isExpanded ? 'rgba(250,204,21,0.05)' : 'transparent',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = isExpanded ? 'rgba(250,204,21,0.05)' : 'transparent'}
                  >
                    {/* Left info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '800', margin: 0 }}>{team.name}</h3>
                        {isMyTeam && <span style={{ background: 'rgba(250,204,21,0.2)', color: '#FACC15', padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '700' }}>Your Team</span>}
                      </div>
                      {team.title && (
                        <p style={{ color: '#FACC15', fontSize: '13px', fontWeight: '600', margin: '4px 0 2px 0', opacity: 0.9 }}>{team.title}</p>
                      )}
                      <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0 0', fontWeight: '600' }}>
                        👥 {team.members.length} / 4 Members
                        {isMyTeam && team.requestDetails?.length > 0 && (
                          <span style={{ marginLeft: '10px', color: '#FACC15' }}>• {team.requestDetails.length} pending request{team.requestDetails.length > 1 ? 's' : ''}</span>
                        )}
                      </p>
                    </div>

                    {/* Right: action badge or chevron */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      {!isMyTeam && !user.teamName && team.members.length < 4 && (
                        team.invites?.includes(user.email) ? (
                          <span style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.4)', color: '#FACC15', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Invited ✓</span>
                        ) : team.joinRequests?.includes(user.email) ? (
                          <span style={{ background: 'transparent', border: '1px solid #6b7280', color: '#6b7280', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Request Sent</span>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRequestJoin(team.name); }}
                            disabled={joining === team.name}
                            style={{
                              background: 'transparent', border: '1px solid #FACC15', color: '#FACC15',
                              padding: '5px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                              cursor: joining === team.name ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap'
                            }}
                          >
                            {joining === team.name ? 'Sending...' : 'Request to Join'}
                          </button>
                        )
                      )}
                      {!isMyTeam && team.members.length >= 4 && !user.teamName && (
                        <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '600' }}>Team Full</span>
                      )}
                      {/* Chevron */}
                      <span style={{ color: '#6b7280', fontSize: '18px', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', lineHeight: 1 }}>▾</span>
                    </div>
                  </div>

                  {/* ── Expanded Content ── */}
                  {isExpanded && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid #222' }}>

                      {/* Description */}
                      {team.description && (
                        <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.6', margin: '16px 0 20px 0' }}>
                          {team.description}
                        </p>
                      )}

                      {/* Members */}
                      <p style={{ color: '#FACC15', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0' }}>Members</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                        {team.memberDetails && team.memberDetails.map((member, mi) => (
                          <div key={mi} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {member.profilePhoto ? (
                                <img src={member.profilePhoto} alt={member.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(250,204,21,0.4)' }} />
                              ) : (
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: '700' }}>
                                  {member.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                              )}
                              <div>
                                <p style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: '600', margin: '0 0 1px 0' }}>
                                  {member.name}
                                  {team.leader === member.email && (
                                    <span style={{ marginLeft: '6px', background: 'rgba(250,204,21,0.2)', color: '#FACC15', padding: '1px 6px', borderRadius: '8px', fontSize: '9px', fontWeight: '700' }}>LEADER</span>
                                  )}
                                </p>
                                <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>@{member.username}</p>
                              </div>
                            </div>
                            {/* Remove button: only for leader on their own team */}
                            {isMyTeam && team.leader === user.email && member.email !== user.email && (
                              <button
                                onClick={() => handleRemoveMember(team.name, member.email)}
                                disabled={removingMember === member.email}
                                style={{
                                  background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)',
                                  padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                  cursor: removingMember === member.email ? 'not-allowed' : 'pointer',
                                  opacity: removingMember === member.email ? 0.6 : 1, flexShrink: 0
                                }}
                              >
                                {removingMember === member.email ? '...' : 'Remove'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* ── Own Team Only: Join Requests, Pending Invites, Invite Box ── */}
                      {isMyTeam && team.leader === user.email && (
                        <>
                          {/* Join Requests */}
                          {team.requestDetails && team.requestDetails.length > 0 && (
                            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #222' }}>
                              <p style={{ color: '#FACC15', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0' }}>Join Requests ({team.requestDetails.length})</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {team.requestDetails.map((reqUser, ri) => (
                                  <div key={ri} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(250,204,21,0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {reqUser.profilePhoto ? (
                                        <img src={reqUser.profilePhoto} alt={reqUser.name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                                      ) : (
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: '700' }}>
                                          {reqUser.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                      )}
                                      <div>
                                        <p style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: '600', margin: '0 0 1px 0' }}>{reqUser.name}</p>
                                        <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>{(reqUser.skills || []).slice(0, 2).join(', ')}</p>
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <button onClick={() => handleAcceptJoin(team.name, reqUser.email)} style={{ background: '#FACC15', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Accept</button>
                                      <button onClick={() => handleRejectJoin(team.name, reqUser.email)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Reject</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Pending Sent Invites */}
                          {team.inviteDetails && team.inviteDetails.length > 0 && (
                            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #222' }}>
                              <p style={{ color: '#9ca3af', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0' }}>Pending Invites Sent</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {team.inviteDetails.map((inv, ii) => (
                                  <div key={ii} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                    {inv.profilePhoto ? (
                                      <img src={inv.profilePhoto} alt={inv.name} style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: '700' }}>
                                        {inv.name?.charAt(0).toUpperCase() || '?'}
                                      </div>
                                    )}
                                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>{inv.name} — <em style={{ color: '#6b7280' }}>awaiting response</em></span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Invite by Email */}
                          {team.members.length < 4 && (
                            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #222' }}>
                              <p style={{ color: '#FACC15', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0' }}>Invite a Developer</p>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  type="email"
                                  placeholder="Enter their email..."
                                  value={inviteEmail[team.name] || ''}
                                  onChange={e => setInviteEmail(prev => ({ ...prev, [team.name]: e.target.value }))}
                                  style={{ flex: 1, padding: '8px 12px', background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
                                />
                                <button
                                  onClick={() => handleSendInvite(team.name)}
                                  disabled={inviting === team.name}
                                  style={{ background: 'linear-gradient(135deg, #FACC15, #F59E0B)', color: '#0a0a0a', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: inviting === team.name ? 'not-allowed' : 'pointer', opacity: inviting === team.name ? 0.7 : 1, whiteSpace: 'nowrap' }}
                                >
                                  {inviting === team.name ? 'Sending...' : 'Send Invite'}
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Team Projects */}
                      {team.projects && team.projects.length > 0 && (
                        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #222' }}>
                          <p style={{ color: '#9ca3af', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px 0' }}>Projects</p>
                          {team.projects.map((proj, pi) => (
                            <a key={pi} href={proj.startsWith('http') ? proj : `https://${proj}`} target="_blank" rel="noreferrer" style={{ display: 'block', color: '#60a5fa', textDecoration: 'none', fontSize: '13px', marginBottom: '4px' }}>
                              🔗 {proj}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px', background: '#111', borderRadius: '16px', border: '1px dashed #2d2d2d' }}>
            No teams created yet. Be the first to start a team!
          </div>
        )}
      </div>

      </div>
    </div>
  );
};

export default Teams;
