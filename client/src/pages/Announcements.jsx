import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function Announcements() {
  const { user } = useAuth();
  const isHR = user.role === 'hr';
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', category: 'Announcement' });
  const [error, setError] = useState('');

  const load = () => api.get('/announcements').then((r) => setItems(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const post = async (e) => {
    e.preventDefault();
    try { await api.post('/announcements', form); setForm({ title: '', message: '', category: 'Announcement' }); load(); } catch (err) { setError(errMsg(err)); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try { await api.delete(`/announcements/${id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      <h4 className="mb-3">Announcements and news</h4>
      <Alert message={error} onClose={() => setError('')} />
      {isHR && (
        <form className="card p-3 mb-4" onSubmit={post}>
          <div className="row g-2">
            <div className="col-md-5"><input className="form-control" name="title" placeholder="Title" value={form.title} onChange={change} required /></div>
            <div className="col-md-3">
              <select className="form-select" name="category" value={form.category} onChange={change}>
                <option>Announcement</option><option>News</option><option>Policy</option><option>Event</option>
              </select>
            </div>
            <div className="col-12"><textarea className="form-control" rows="3" name="message" placeholder="Write your message" value={form.message} onChange={change} required /></div>
            <div className="col-12"><button className="btn btn-primary">Post</button></div>
          </div>
        </form>
      )}
      {items.length === 0 && <p className="text-muted">Nothing has been posted yet.</p>}
      {items.map((n) => (
        <div className="card p-3 mb-2" key={n._id}>
          <div className="d-flex justify-content-between align-items-start">
            <div><strong>{n.title}</strong> <span className="badge bg-secondary ms-1">{n.category}</span></div>
            {isHR && <button className="btn btn-sm btn-outline-danger" onClick={() => remove(n._id)}>Delete</button>}
          </div>
          <p className="my-2" style={{ whiteSpace: 'pre-wrap' }}>{n.message}</p>
          <small className="text-muted">Posted {fmtDate(n.createdAt)} by {n.postedBy?.name}</small>
        </div>
      ))}
    </>
  );
}
