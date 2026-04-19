import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';

export default function AdminPanel() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await API.put(`/users/${id}`, { role });
      fetchUsers();
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <h2>Admin Panel — All Users</h2>
        {loading ? <p>Loading...</p> : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={styles.row}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select value={u.role}
                      onChange={e => handleRoleChange(u._id, e.target.value)}
                      style={styles.select}>
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDelete(u._id)} style={styles.del}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

const styles = {
  page:   { maxWidth:'1000px', margin:'2rem auto', padding:'0 1rem' },
  table:  { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:'8px',
            overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,0.08)' },
  thead:  { background:'#4f46e5', color:'#fff' },
  row:    { borderBottom:'1px solid #eee' },
  select: { padding:'4px 8px', borderRadius:'4px', border:'1px solid #ccc' },
  del:    { padding:'4px 10px', background:'#ef4444', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer' },
};