import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import API from '../services/api';

export default function Assignments() {
  const { user }                    = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [form, setForm]             = useState({ title: '', description: '' });
  const [file, setFile]             = useState(null);
  const [loading, setLoading]       = useState(true);

  const fetchAssignments = async () => {
    try {
      const { data } = await API.get('/assignments');
      setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    if (file) formData.append('file', file);

    try {
      await API.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ title: '', description: '' });
      setFile(null);
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await API.delete(`/assignments/${id}`);
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <h2>Assignments</h2>

        {/* Upload form — teachers and admins only */}
        {(user.role === 'teacher' || user.role === 'admin') && (
          <form onSubmit={handleUpload} style={styles.form}>
            <h3>Upload New Assignment</h3>
            <input style={styles.input} placeholder="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea style={{ ...styles.input, height:'80px' }} placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <button style={styles.button} type="submit">Upload</button>
          </form>
        )}

        {/* Assignment list */}
        {loading ? <p>Loading...</p> : assignments.length === 0 ? (
          <p>No assignments yet.</p>
        ) : (
          <div style={styles.list}>
            {assignments.map(a => (
              <div key={a._id} style={styles.card}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px' }}>{a.title}</h4>
                  <p style={styles.meta}>
                    By {a.uploadedBy?.name} ({a.uploadedBy?.role}) &nbsp;•&nbsp;
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                  {a.description && <p style={{ margin: '4px 0', color:'#555' }}>{a.description}</p>}
                  {a.fileUrl && (
                    <a href={`http://localhost:5000/${a.fileUrl}`} target="_blank" rel="noreferrer"
                      style={{ color:'#4f46e5', fontSize:'13px' }}>
                      Download file
                    </a>
                  )}
                </div>
                {(user.role === 'admin' || user.id === a.uploadedBy?._id) && (
                  <button onClick={() => handleDelete(a._id)} style={styles.del}>Delete</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  page: { maxWidth:'900px', margin:'2rem auto', padding:'0 1rem' },
  form: { background:'#fff', padding:'1.5rem', borderRadius:'8px', marginBottom:'2rem',
          boxShadow:'0 1px 6px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', gap:'10px' },
  input:  { padding:'10px', borderRadius:'6px', border:'1px solid #ccc', fontSize:'14px' },
  button: { padding:'10px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', width:'120px' },
  list:   { display:'flex', flexDirection:'column', gap:'12px' },
  card:   { background:'#fff', padding:'1rem 1.5rem', borderRadius:'8px',
            boxShadow:'0 1px 6px rgba(0,0,0,0.08)', display:'flex', alignItems:'flex-start', gap:'1rem' },
  meta:   { color:'#888', fontSize:'12px', margin:'0 0 4px' },
  del:    { padding:'6px 12px', background:'#ef4444', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', whiteSpace:'nowrap' },
};