import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';

const empty = { title: '', description: '', trainer: '', startDate: '', endDate: '', status: 'Planned', participants: [] };

export default function Training() {
  const { user } = useAuth();
  const canManage = user.role !== 'employee';
  const [items, setItems] = useState([]);
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/training').then((r) => setItems(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => {
    load();
    if (canManage) api.get('/employees').then((r) => setTeam(r.data.filter((u) => u.role === 'employee'))).catch(() => {});
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggle = (id) => setForm({ ...form, participants: form.participants.includes(id) ? form.participants.filter((p) => p !== id) : [...form.participants, id] });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) await api.put(`/training/${editId}`, form);
      else await api.post('/training', form);
      setForm(empty); setEditId(null); load();
    } catch (err) { setError(errMsg(err)); }
  };

  const edit = (t) => {
    setEditId(t._id);
    setForm({ ...t, startDate: t.startDate?.slice(0, 10), endDate: t.endDate?.slice(0, 10), participants: t.participants.map((p) => p._id) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this program?')) return;
    try { await api.delete(`/training/${id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      <h4 className="mb-3">Training and development</h4>
      <Alert message={error} onClose={() => setError('')} />
      {canManage && (
        <form className="card p-3 mb-4" onSubmit={submit}>
          <div className="row g-2">
            <div className="col-md-4"><input className="form-control" name="title" placeholder="Program title" value={form.title} onChange={change} required /></div>
            <div className="col-md-3"><input className="form-control" name="trainer" placeholder="Trainer" value={form.trainer} onChange={change} /></div>
            <div className="col-md-2"><input type="date" className="form-control" name="startDate" value={form.startDate} onChange={change} required /></div>
            <div className="col-md-2"><input type="date" className="form-control" name="endDate" value={form.endDate} onChange={change} required /></div>
            <div className="col-md-1">
              <select className="form-select px-1" name="status" value={form.status} onChange={change}><option>Planned</option><option>Ongoing</option><option>Completed</option></select>
            </div>
            <div className="col-12"><input className="form-control" name="description" placeholder="Description" value={form.description} onChange={change} /></div>
            <div className="col-12">
              <div className="small text-muted mb-1">Participants</div>
              {team.length === 0 && <span className="text-muted small">No employees available to enrol.</span>}
              {team.map((m) => (
                <div className="form-check form-check-inline" key={m._id}>
                  <input className="form-check-input" type="checkbox" id={`p-${m._id}`} checked={form.participants.includes(m._id)} onChange={() => toggle(m._id)} />
                  <label className="form-check-label" htmlFor={`p-${m._id}`}>{m.name}</label>
                </div>
              ))}
            </div>
            <div className="col-12">
              <button className="btn btn-primary me-2">{editId ? 'Save changes' : 'Create program'}</button>
              {editId && <button type="button" className="btn btn-outline-secondary" onClick={() => { setEditId(null); setForm(empty); }}>Cancel edit</button>}
            </div>
          </div>
        </form>
      )}

      {items.length === 0 && <p className="text-muted">{canManage ? 'No programs yet. Create one above.' : 'You have not been enrolled in any training programs.'}</p>}
      <div className="row g-3">
        {items.map((t) => (
          <div className="col-md-6" key={t._id}>
            <div className="card p-3 h-100">
              <div className="d-flex justify-content-between"><strong>{t.title}</strong><StatusBadge value={t.status} /></div>
              <p className="my-2">{t.description}</p>
              <small className="text-muted d-block">Trainer: {t.trainer || '-'}</small>
              <small className="text-muted d-block">{fmtDate(t.startDate)} to {fmtDate(t.endDate)}</small>
              <small className="text-muted d-block">Participants: {t.participants.map((p) => p.name).join(', ') || 'None'}</small>
              {canManage && (
                <div className="mt-2">
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => edit(t)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(t._id)}>Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
