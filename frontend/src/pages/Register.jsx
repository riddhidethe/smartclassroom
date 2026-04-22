// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import API from '../services/api';

// export default function Register() {
//   const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       await API.post('/auth/register', form);
//       navigate('/login');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Registration failed');
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.card}>
//         <h2>Create Account</h2>
//         {error && <p style={styles.error}>{error}</p>}
//         <form onSubmit={handleSubmit} style={styles.form}>
//           <input style={styles.input} placeholder="Full Name"
//             value={form.name}
//             onChange={e => setForm({ ...form, name: e.target.value })} required />
//           <input style={styles.input} type="email" placeholder="Email"
//             value={form.email}
//             onChange={e => setForm({ ...form, email: e.target.value })} required />
//           <input style={styles.input} type="password" placeholder="Password"
//             value={form.password}
//             onChange={e => setForm({ ...form, password: e.target.value })} required />
//           <select style={styles.input} value={form.role}
//             onChange={e => setForm({ ...form, role: e.target.value })}>
//             <option value="student">Student</option>
//             <option value="teacher">Teacher</option>
//             <option value="admin">Admin</option>
//           </select>
//           <button style={styles.button} type="submit">Register</button>
//         </form>
//         <p>Already have an account? <Link to="/login">Login</Link></p>
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
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

// Password rules — checked live as user types
const PASSWORD_RULES = [
  { id: 'length',    label: 'At least 8 characters',              test: v => v.length >= 8 },
  { id: 'uppercase', label: 'At least one uppercase letter (A-Z)', test: v => /[A-Z]/.test(v) },
  { id: 'lowercase', label: 'At least one lowercase letter (a-z)', test: v => /[a-z]/.test(v) },
  { id: 'number',    label: 'At least one number (0-9)',           test: v => /[0-9]/.test(v) },
  { id: 'special',   label: 'At least one special character (@$!%*?&)', test: v => /[@$!%*?&]/.test(v) },
];

export default function Register() {
  const [form, setForm]         = useState({ name: '', email: '', password: '', role: 'student' });
  const [fieldErrors, setFieldErrors] = useState({});   // per-field error messages
  const [serverErrors, setServerErrors] = useState([]); // errors from backend
  const [loading, setLoading]   = useState(false);
  const [touched, setTouched]   = useState({ password: false }); // show rules only after typing
  const navigate = useNavigate();

  // Live check: which rules pass right now
  const ruleResults = PASSWORD_RULES.map(rule => ({
    ...rule,
    passed: rule.test(form.password),
  }));
  const allRulesPassed = ruleResults.every(r => r.passed);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateFrontend = () => {
    const errs = {};
    if (!form.name.trim())          errs.name = 'Name is required';
    else if (form.name.length < 2)  errs.name = 'Name must be at least 2 characters';

    if (!form.email.trim())         errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';

    if (!form.password)             errs.password = 'Password is required';
    else if (!allRulesPassed)       errs.password = 'Password does not meet all requirements';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors([]);
    setTouched({ password: true });

    const frontendErrs = validateFrontend();
    if (Object.keys(frontendErrs).length > 0) {
      setFieldErrors(frontendErrs);
      return; // stop — don't call API if frontend already knows it's wrong
    }

    setLoading(true);
    try {
      await API.post('/auth/register', form);
      navigate('/login', { state: { message: 'Account created! Please log in.' } });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        // Map backend field errors back to the right fields
        const errs = {};
        const general = [];
        data.errors.forEach(e => {
          if (e.path === 'name')     errs.name     = e.msg;
          else if (e.path === 'email')    errs.email    = e.msg;
          else if (e.path === 'password') errs.password = e.msg;
          else general.push(e.msg);
        });
        setFieldErrors(errs);
        setServerErrors(general);
      } else {
        setServerErrors([data?.message || 'Registration failed. Please try again.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Create Account</h2>
        <p style={styles.sub}>Join the Smart Classroom</p>

        {/* General server errors */}
        {serverErrors.length > 0 && (
          <div style={styles.errorBox}>
            {serverErrors.map((e, i) => <p key={i} style={styles.errorText}>⚠ {e}</p>)}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Name */}
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              name="name"
              style={{ ...styles.input, ...(fieldErrors.name ? styles.inputError : {}) }}
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {fieldErrors.name && <p style={styles.fieldError}>{fieldErrors.name}</p>}
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              style={{ ...styles.input, ...(fieldErrors.email ? styles.inputError : {}) }}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {fieldErrors.email && <p style={styles.fieldError}>{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              style={{ ...styles.input, ...(fieldErrors.password ? styles.inputError : {}) }}
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {fieldErrors.password && !touched.password && (
              <p style={styles.fieldError}>{fieldErrors.password}</p>
            )}

            {/* Live password checklist — shows once user starts typing */}
            {(touched.password || form.password.length > 0) && (
              <div style={styles.ruleBox}>
                <p style={styles.ruleTitle}>Password must contain:</p>
                {ruleResults.map(rule => (
                  <div key={rule.id} style={styles.ruleRow}>
                    <span style={{ ...styles.ruleDot, background: rule.passed ? '#22c55e' : '#e5e7eb' }}>
                      {rule.passed ? '✓' : ''}
                    </span>
                    <span style={{
                      ...styles.ruleLabel,
                      color: rule.passed ? '#15803d' : '#6b7280',
                      textDecoration: rule.passed ? 'none' : 'none',
                    }}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role */}
          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <select
              name="role"
              style={styles.input}
              value={form.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <p style={styles.hint}>Admin accounts are created by system administrators only.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:       { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f0f2f5', padding:'1rem' },
  card:       { background:'#fff', padding:'2rem', borderRadius:'12px', width:'100%', maxWidth:'420px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)' },
  heading:    { margin:'0 0 4px', fontSize:'22px', fontWeight:'600', color:'#111' },
  sub:        { margin:'0 0 1.5rem', color:'#666', fontSize:'14px' },
  field:      { marginBottom:'1rem' },
  label:      { display:'block', marginBottom:'6px', fontSize:'13px', fontWeight:'500', color:'#374151' },
  input:      { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #d1d5db', fontSize:'14px', boxSizing:'border-box', outline:'none', transition:'border-color .2s' },
  inputError: { borderColor:'#ef4444' },
  fieldError: { margin:'4px 0 0', fontSize:'12px', color:'#ef4444' },
  hint:       { margin:'4px 0 0', fontSize:'11px', color:'#9ca3af' },
  errorBox:   { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px 14px', marginBottom:'1rem' },
  errorText:  { margin:'2px 0', fontSize:'13px', color:'#b91c1c' },
  ruleBox:    { marginTop:'10px', background:'#f9fafb', borderRadius:'8px', padding:'12px 14px', border:'1px solid #e5e7eb' },
  ruleTitle:  { margin:'0 0 8px', fontSize:'12px', fontWeight:'500', color:'#374151' },
  ruleRow:    { display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px' },
  ruleDot:    { width:'18px', height:'18px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', color:'#fff', flexShrink:0, transition:'background .2s' },
  ruleLabel:  { fontSize:'12px', transition:'color .2s' },
  button:     { width:'100%', padding:'11px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'15px', fontWeight:'500', marginTop:'0.5rem' },
  footer:     { textAlign:'center', marginTop:'1.5rem', fontSize:'13px', color:'#6b7280' },
  link:       { color:'#4f46e5', textDecoration:'none', fontWeight:'500' },
};