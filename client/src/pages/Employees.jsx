import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const empty = { name: '', email: '', password: '', role: 'employee', department: '', designation: '', phone: '', salary: '', manager: '' };

export default function Employees() {
  const { user } = useAuth();
  const isHR = user.role === 'hr';
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const load = () => api.get('/employees').then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const edit = (u) => {
    setEditId(u._id);
    setForm({ ...empty, ...u, password: '', manager: u.manager?._id || '' });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setOk('');
    try {
      if (editId) await api.put(`/employees/${editId}`, form);
      else await api.post('/employees', form);
      setOk(editId ? 'Employee updated' : 'Employee added (default password: Welcome@123 if none given)');
      setForm(empty); setEditId(null); setShowForm(false);
      load();
    } catch (err) { setError(errMsg(err)); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try { await api.delete(`/employees/${id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  const managers = list.filter((u) => u.role === 'manager');
  const shown = list.filter((u) => `${u.name} ${u.email} ${u.department}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">{isHR ? 'Employees' : 'My team'}</h4>
        {isHR && <button className="btn btn-primary" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>{showForm ? 'Close form' : 'Add employee'}</button>}
      </div>
      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={ok} onClose={() => setOk('')} />

      {showForm && (
        <form className="card p-3 mb-4" onSubmit={submit}>
          <div className="row g-2">
            <div className="col-md-4"><input className="form-control" name="name" placeholder="Full name" value={form.name} onChange={change} required /></div>
            <div className="col-md-4"><input type="email" className="form-control" name="email" placeholder="Email" value={form.email} onChange={change} required /></div>
            <div className="col-md-4"><input type="password" className="form-control" name="password" placeholder={editId ? 'New password (optional)' : 'Password (optional)'} value={form.password} onChange={change} /></div>
            <div className="col-md-3">
              <select className="form-select" name="role" value={form.role} onChange={change}>
                <option value="employee">Employee</option><option value="manager">Manager</option><option value="hr">HR</option>
              </select>
            </div>
            <div className="col-md-3"><input className="form-control" name="department" placeholder="Department" value={form.department} onChange={change} /></div>
            <div className="col-md-3"><input className="form-control" name="designation" placeholder="Designation" value={form.designation} onChange={change} /></div>
            <div className="col-md-3"><input className="form-control" name="phone" placeholder="Phone" value={form.phone} onChange={change} /></div>
            <div className="col-md-3"><input type="number" className="form-control" name="salary" placeholder="Annual salary" value={form.salary} onChange={change} /></div>
            <div className="col-md-3">
              <select className="form-select" name="manager" value={form.manager} onChange={change}>
                <option value="">No manager</option>
                {managers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div className="col-md-3"><button className="btn btn-primary w-100">{editId ? 'Save changes' : 'Add employee'}</button></div>
          </div>
        </form>
      )}

      <input className="form-control mb-3" placeholder="Search by name, email or department" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="table-responsive card">
        <table className="table table-hover mb-0 align-middle">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Designation</th><th>Manager</th><th>Joined</th>{isHR && <th></th>}</tr></thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan="8" className="text-center text-muted py-4">No employees found.</td></tr>}
            {shown.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td><td>{u.email}</td><td className="text-capitalize">{u.role}</td><td>{u.department}</td><td>{u.designation}</td>
                <td>{u.manager?.name || '-'}</td><td>{fmtDate(u.joinDate)}</td>
                {isHR && (
                  <td className="text-nowrap">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => edit(u)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
