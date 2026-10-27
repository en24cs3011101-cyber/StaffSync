import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';

export default function Leaves() {
  const { user } = useAuth();
  const canReview = user.role !== 'employee';
  const [mine, setMine] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ type: 'Casual', fromDate: '', toDate: '', reason: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const load = async () => {
    try {
      setMine((await api.get('/leaves/my')).data);
      if (canReview) setRequests((await api.get('/leaves')).data);
    } catch (e) { setError(errMsg(e)); }
  };
  useEffect(() => { load(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const apply = async (e) => {
    e.preventDefault();
    setError(''); setOk('');
    try {
      await api.post('/leaves', form);
      setOk('Leave request submitted');
      setForm({ type: 'Casual', fromDate: '', toDate: '', reason: '' });
      load();
    } catch (err) { setError(errMsg(err)); }
  };

  const review = async (id, status) => {
    const remarks = status === 'Rejected' ? window.prompt('Reason for rejection (optional)') || '' : '';
    try { await api.put(`/leaves/${id}/status`, { status, remarks }); load(); } catch (err) { setError(errMsg(err)); }
  };

  const cancel = async (id) => {
    try { await api.delete(`/leaves/${id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={ok} onClose={() => setOk('')} />

      {canReview && (
        <>
          <h4>Leave requests to review</h4>
          <div className="table-responsive card mb-4">
            <table className="table mb-0 align-middle">
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {requests.length === 0 && <tr><td colSpan="8" className="text-center text-muted py-4">No leave requests yet.</td></tr>}
                {requests.map((l) => (
                  <tr key={l._id}>
                    <td>{l.employee?.name}</td><td>{l.type}</td><td>{fmtDate(l.fromDate)}</td><td>{fmtDate(l.toDate)}</td><td>{l.days}</td><td>{l.reason}</td>
                    <td><StatusBadge value={l.status} /></td>
                    <td className="text-nowrap">
                      {l.status === 'Pending' && (
                        <>
                          <button className="btn btn-sm btn-success me-1" onClick={() => review(l._id, 'Approved')}>Approve</button>
                          <button className="btn btn-sm btn-danger" onClick={() => review(l._id, 'Rejected')}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h4>Apply for leave</h4>
      <form className="card p-3 mb-4" onSubmit={apply}>
        <div className="row g-2">
          <div className="col-md-2">
            <select className="form-select" name="type" value={form.type} onChange={change}>
              <option>Casual</option><option>Sick</option><option>Earned</option><option>Unpaid</option>
            </select>
          </div>
          <div className="col-md-2"><input type="date" className="form-control" name="fromDate" value={form.fromDate} onChange={change} required /></div>
          <div className="col-md-2"><input type="date" className="form-control" name="toDate" value={form.toDate} onChange={change} required /></div>
          <div className="col-md-4"><input className="form-control" name="reason" placeholder="Reason" value={form.reason} onChange={change} required /></div>
          <div className="col-md-2"><button className="btn btn-primary w-100">Submit request</button></div>
        </div>
      </form>

      <h4>My leave history</h4>
      <div className="table-responsive card">
        <table className="table mb-0 align-middle">
          <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Remarks</th><th></th></tr></thead>
          <tbody>
            {mine.length === 0 && <tr><td colSpan="8" className="text-center text-muted py-4">You have not applied for any leave.</td></tr>}
            {mine.map((l) => (
              <tr key={l._id}>
                <td>{l.type}</td><td>{fmtDate(l.fromDate)}</td><td>{fmtDate(l.toDate)}</td><td>{l.days}</td><td>{l.reason}</td>
                <td><StatusBadge value={l.status} /></td><td>{l.remarks || '-'}</td>
                <td>{l.status === 'Pending' && <button className="btn btn-sm btn-outline-danger" onClick={() => cancel(l._id)}>Cancel</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
