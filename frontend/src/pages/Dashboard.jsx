import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import API from '../services/api';

export default function Dashboard() {
  const { user }              = useAuth();
  const [stats, setStats]     = useState({ users: 0, assignments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const assignRes = await API.get('/assignments');
        let userCount = 0;
        if (user.role === 'admin') {
          const userRes = await API.get('/users');
          userCount = userRes.data.length;
        }
        setStats({ users: userCount, assignments: assignRes.data.length });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.role]);

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <h2>Welcome, {user.name} 👋</h2>
        <p style={styles.role}>Role: <strong>{user.role}</strong></p>

        {loading ? <p>Loading...</p> : (
          <div style={styles.cards}>
            <StatCard label="Assignments" value={stats.assignments} color="#4f46e5" />
            {user.role === 'admin' && (
              <StatCard label="Total Users" value={stats.users} color="#0ea5e9" />
            )}
          </div>
        )}

        <div style={styles.actions}>
          <Link to="/assignments" style={styles.link}>View Assignments →</Link>
          {user.role === 'admin' && (
            <Link to="/admin" style={styles.link}>Admin Panel →</Link>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <h3 style={{ color, margin: 0 }}>{value}</h3>
      <p style={{ margin: '4px 0 0', color: '#666' }}>{label}</p>
    </div>
  );
}

const styles = {
  page:    { maxWidth:'900px', margin:'2rem auto', padding:'0 1rem' },
  role:    { color:'#555', marginBottom:'1.5rem' },
  cards:   { display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'2rem' },
  card:    { background:'#fff', borderRadius:'8px', padding:'1.5rem 2rem', boxShadow:'0 1px 6px rgba(0,0,0,0.08)', minWidth:'160px' },
  actions: { display:'flex', gap:'1rem', flexWrap:'wrap' },
  link:    { padding:'10px 20px', background:'#4f46e5', color:'#fff', borderRadius:'6px', textDecoration:'none', fontSize:'14px' },
};