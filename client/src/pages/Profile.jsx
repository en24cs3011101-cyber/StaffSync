import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import Alert from '../components/Alert';

export default function Profile() {
  const [p, setP] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    api.get('/employees/profile/me').then((r) => {
      setP(r.data);
      setForm({ name: r.data.name, phone: r.data.phone, address: r.data.address, password: '' });
    }).catch((e) => setError(errMsg(e)));
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setError(''); setOk('');
    try {
      const r = await api.put('/employees/profile/me', form);
      setP(r.data);
      setForm({ ...form, password: '' });
      setOk('Profile updated');
    } catch (err) { setError(errMsg(err)); }
  };

  if (!p) return <p>Loading...</p>;

  return (
    <div className="row g-4">
      <div className="col-md-5">
        <div className="card p-3">
          <h5>{p.name}</h5>
          <p className="text-muted text-capitalize mb-2">{p.role}</p>
          <div><strong>Email:</strong> {p.email}</div>
          <div><strong>Department:</strong> {p.department || '-'}</div>
          <div><strong>Designation:</strong> {p.designation || '-'}</div>
          <div><strong>Manager:</strong> {p.manager?.name || '-'}</div>
          <div><strong>Joined:</strong> {fmtDate(p.joinDate)}</div>
          <div><strong>Leave balance:</strong> {p.leaveBalance} days</div>
        </div>
      </div>
      <div className="col-md-7">
        <form className="card p-3" onSubmit={save}>
          <h5>Edit my details</h5>
          <Alert message={error} onClose={() => setError('')} />
          <Alert type="success" message={ok} onClose={() => setOk('')} />
          <label className="form-label">Name</label>
          <input className="form-control mb-2" name="name" value={form.name} onChange={change} required />
          <label className="form-label">Phone</label>
          <input className="form-control mb-2" name="phone" value={form.phone} onChange={change} />
          <label className="form-label">Address</label>
          <textarea className="form-control mb-2" rows="2" name="address" value={form.address} onChange={change} />
          <label className="form-label">New password (leave blank to keep current)</label>
          <input type="password" minLength={6} className="form-control mb-3" name="password" value={form.password} onChange={change} />
          <button className="btn btn-primary align-self-start">Save changes</button>
        </form>
      </div>
    </div>
  );
}
