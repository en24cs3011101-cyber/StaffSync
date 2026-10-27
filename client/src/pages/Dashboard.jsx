import { useEffect, useState } from 'react';
import api, { fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    (async () => {
      const s = [];
      const today = new Date().toISOString().slice(0, 10);
      if (user.role === 'employee') {
        const [me, leaves, att] = await Promise.all([api.get('/employees/profile/me'), api.get('/leaves/my'), api.get('/attendance/my')]);
        s.push({ label: 'Leave days left', value: me.data.leaveBalance });
        s.push({ label: 'Pending requests', value: leaves.data.filter((l) => l.status === 'Pending').length });
        s.push({ label: 'Days present (recent)', value: att.data.length });
      } else {
        const [emp, leaves, att] = await Promise.all([api.get('/employees'), api.get('/leaves'), api.get(`/attendance?date=${today}`)]);
        s.push({ label: user.role === 'hr' ? 'Total employees' : 'Team members', value: emp.data.length });
        s.push({ label: 'Pending leave requests', value: leaves.data.filter((l) => l.status === 'Pending').length });
        s.push({ label: 'Checked in today', value: att.data.length });
      }
      setStats(s);
      setNews((await api.get('/announcements')).data.slice(0, 3));
    })().catch(() => {});
  }, [user.role]);

  return (
    <>
      <h4 className="mb-3">Welcome, {user.name}</h4>
      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div className="col-md-4" key={s.label}>
            <div className="card p-3">
              <div className="stat">{s.value}</div>
              <div className="text-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <h5>Latest announcements</h5>
      {news.length === 0 && <p className="text-muted">Nothing posted yet.</p>}
      {news.map((n) => (
        <div className="card p-3 mb-2" key={n._id}>
          <div className="d-flex justify-content-between">
            <strong>{n.title}</strong>
            <span className="badge bg-secondary">{n.category}</span>
          </div>
          <p className="mb-1">{n.message}</p>
          <small className="text-muted">Posted {fmtDate(n.createdAt)} by {n.postedBy?.name}</small>
        </div>
      ))}
    </>
  );
}
