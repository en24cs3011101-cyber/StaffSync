import { useEffect, useState } from 'react';
import api, { errMsg, fmtTime } from '../api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';

export default function Attendance() {
  const { user } = useAuth();
  const canView = user.role !== 'employee';
  const todayStr = new Date().toISOString().slice(0, 10);
  const [mine, setMine] = useState([]);
  const [all, setAll] = useState([]);
  const [date, setDate] = useState(todayStr);
  const [error, setError] = useState('');

  const loadMine = () => api.get('/attendance/my').then((r) => setMine(r.data)).catch((e) => setError(errMsg(e)));
  const loadAll = () => api.get(`/attendance?date=${date}`).then((r) => setAll(r.data)).catch((e) => setError(errMsg(e)));

  useEffect(() => { loadMine(); }, []);
  useEffect(() => { if (canView) loadAll(); }, [date]);

  const todayRecord = mine.find((m) => m.date === todayStr);

  const mark = async (action) => {
    setError('');
    try { await api.post(`/attendance/${action}`); loadMine(); if (canView) loadAll(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <>
      <Alert message={error} onClose={() => setError('')} />
      <div className="card p-3 mb-4">
        <h5>Today ({todayStr})</h5>
        <p className="mb-2">
          Check-in: <strong>{fmtTime(todayRecord?.checkIn)}</strong> &nbsp; Check-out: <strong>{fmtTime(todayRecord?.checkOut)}</strong>
        </p>
        <div>
          <button className="btn btn-primary me-2" disabled={!!todayRecord} onClick={() => mark('check-in')}>Check in</button>
          <button className="btn btn-outline-primary" disabled={!todayRecord || !!todayRecord?.checkOut} onClick={() => mark('check-out')}>Check out</button>
        </div>
      </div>

      {canView && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">{user.role === 'hr' ? 'All employees' : 'My team'}</h5>
            <input type="date" className="form-control w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="table-responsive card mb-4">
            <table className="table mb-0">
              <thead><tr><th>Employee</th><th>Department</th><th>Check-in</th><th>Check-out</th><th>Status</th></tr></thead>
              <tbody>
                {all.length === 0 && <tr><td colSpan="5" className="text-center text-muted py-4">No attendance recorded for this date.</td></tr>}
                {all.map((a) => (
                  <tr key={a._id}><td>{a.employee?.name}</td><td>{a.employee?.department}</td><td>{fmtTime(a.checkIn)}</td><td>{fmtTime(a.checkOut)}</td><td><StatusBadge value={a.status} /></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h5>My attendance history</h5>
      <div className="table-responsive card">
        <table className="table mb-0">
          <thead><tr><th>Date</th><th>Check-in</th><th>Check-out</th><th>Status</th></tr></thead>
          <tbody>
            {mine.length === 0 && <tr><td colSpan="4" className="text-center text-muted py-4">No records yet. Check in to start.</td></tr>}
            {mine.map((a) => (
              <tr key={a._id}><td>{a.date}</td><td>{fmtTime(a.checkIn)}</td><td>{fmtTime(a.checkOut)}</td><td><StatusBadge value={a.status} /></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
