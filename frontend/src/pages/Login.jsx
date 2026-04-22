// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import API from '../services/api';

// export default function Login() {
//   const [form, setForm]   = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const { login }         = useAuth();
//   const navigate          = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       const { data } = await API.post('/auth/login', form);
//       login(data.user, data.token);
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed');
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.card}>
//         <h2>Smart Classroom</h2>
//         <p style={{ color:'#666', marginBottom:'1rem' }}>Sign in to your account</p>
//         {error && <p style={styles.error}>{error}</p>}
//         <form onSubmit={handleSubmit} style={styles.form}>
//           <input style={styles.input} type="email" placeholder="Email"
//             value={form.email}
//             onChange={e => setForm({ ...form, email: e.target.value })} required />
//           <input style={styles.input} type="password" placeholder="Password"
//             value={form.password}
//             onChange={e => setForm({ ...form, password: e.target.value })} required />
//           <button style={styles.button} type="submit">Login</button>
//         </form>
//         <p>No account? <Link to="/register">Register here</Link></p>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f0f2f5' },
//   card:      { background:'#fff', padding:'2rem', borderRadius:'8px', width:'360px', boxShadow:'0 2px 12px rgba(0,0,0,0.1)' },
//   form:      { display:'flex', flexDirection:'column', gap:'12px' },
//   input:     { padding:'10px', borderRadius:'6px', border:'1px solid #ccc', fontSize:'14px' },
//   button:    { padding:'10px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'15px' },
//   error:     { color:'red', fontSize:'13px' },
// };

import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  // Show success message if redirected from Register
  const successMsg = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (!form.email || !form.password) {
      setErrors([{ msg: 'Please fill in all fields' }]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setErrors([{ msg: data?.message || 'Login failed. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Welcome back</h2>
        <p style={styles.sub}>Smart Classroom System</p>

        {successMsg && (
          <div style={styles.successBox}>
            <p style={styles.successText}>✓ {successMsg}</p>
          </div>
        )}

        {errors.length > 0 && (
          <div style={styles.errorBox}>
            {errors.map((e, i) => <p key={i} style={styles.errorText}>⚠ {e.msg}</p>)}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              style={styles.input}
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              style={styles.input}
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          No account? <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:        { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f0f2f5', padding:'1rem' },
  card:        { background:'#fff', padding:'2rem', borderRadius:'12px', width:'100%', maxWidth:'400px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)' },
  heading:     { margin:'0 0 4px', fontSize:'22px', fontWeight:'600', color:'#111' },
  sub:         { margin:'0 0 1.5rem', color:'#666', fontSize:'14px' },
  field:       { marginBottom:'1rem' },
  label:       { display:'block', marginBottom:'6px', fontSize:'13px', fontWeight:'500', color:'#374151' },
  input:       { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #d1d5db', fontSize:'14px', boxSizing:'border-box' },
  button:      { width:'100%', padding:'11px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'15px', fontWeight:'500', marginTop:'0.5rem' },
  footer:      { textAlign:'center', marginTop:'1.5rem', fontSize:'13px', color:'#6b7280' },
  link:        { color:'#4f46e5', textDecoration:'none', fontWeight:'500' },
  errorBox:    { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px 14px', marginBottom:'1rem' },
  errorText:   { margin:'2px 0', fontSize:'13px', color:'#b91c1c' },
  successBox:  { background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'8px', padding:'10px 14px', marginBottom:'1rem' },
  successText: { margin:0, fontSize:'13px', color:'#15803d' },
};