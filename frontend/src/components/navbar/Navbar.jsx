import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('devnetwork_user');
    navigate('/login');
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '24px 48px', position: 'relative', zIndex: 10,
      borderBottom: '1px solid rgba(250,204,21,0.1)',
      background: '#0a0a0a', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div 
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
          boxShadow: '0 0 16px rgba(250,204,21,0.3)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#0a0a0a"/>
          </svg>
        </div>
        <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>DevNetwork</span>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 24px', background: 'transparent',
            color: location.pathname === '/dashboard' ? '#FACC15' : '#e5e7eb',
            fontSize: '14px', fontWeight: '600',
            border: location.pathname === '/dashboard' ? '1px solid rgba(250,204,21,0.4)' : '1px solid transparent', 
            borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.target.style.color = '#FACC15'}
          onMouseLeave={e => e.target.style.color = location.pathname === '/dashboard' ? '#FACC15' : '#e5e7eb'}
        >
          Search Profiles
        </button>

        <button
          onClick={() => navigate('/teams')}
          style={{
            padding: '10px 24px', background: 'transparent',
            color: location.pathname === '/teams' ? '#FACC15' : '#e5e7eb',
            fontSize: '14px', fontWeight: '600',
            border: location.pathname === '/teams' ? '1px solid rgba(250,204,21,0.4)' : '1px solid transparent', 
            borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.target.style.color = '#FACC15'}
          onMouseLeave={e => e.target.style.color = location.pathname === '/teams' ? '#FACC15' : '#e5e7eb'}
        >
          Teams
        </button>

        <button
          onClick={() => navigate('/profile')}
          style={{
            padding: '10px 24px', background: 'transparent',
            color: location.pathname === '/profile' ? '#FACC15' : '#e5e7eb',
            fontSize: '14px', fontWeight: '600',
            border: location.pathname === '/profile' ? '1px solid rgba(250,204,21,0.4)' : '1px solid transparent', 
            borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.target.style.color = '#FACC15'}
          onMouseLeave={e => e.target.style.color = location.pathname === '/profile' ? '#FACC15' : '#e5e7eb'}
        >
          My Profile
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: '10px 24px', background: 'transparent',
            color: '#ef4444', fontSize: '14px', fontWeight: '600',
            border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', cursor: 'pointer',
            transition: 'all 0.2s', marginLeft: '8px'
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Navbar;
