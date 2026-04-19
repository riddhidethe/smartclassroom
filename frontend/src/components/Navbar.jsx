import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>📚 Smart Classroom</Link>
      <div style={styles.links}>
        <Link to="/dashboard"   style={styles.link}>Dashboard</Link>
        <Link to="/assignments" style={styles.link}>Assignments</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" style={styles.link}>Admin</Link>
        )}
      </div>
      <div style={styles.user}>
        <span style={styles.name}>{user?.name} ({user?.role})</span>
        <button onClick={handleLogout} style={styles.logout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav:    { display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'0 2rem', height:'60px', background:'#4f46e5', color:'#fff' },
  brand:  { color:'#fff', textDecoration:'none', fontWeight:'bold', fontSize:'18px' },
  links:  { display:'flex', gap:'1.5rem' },
  link:   { color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:'14px' },
  user:   { display:'flex', alignItems:'center', gap:'12px' },
  name:   { fontSize:'13px', opacity:0.85 },
  logout: { padding:'6px 14px', background:'rgba(255,255,255,0.15)', color:'#fff',
            border:'1px solid rgba(255,255,255,0.3)', borderRadius:'6px', cursor:'pointer' },
};