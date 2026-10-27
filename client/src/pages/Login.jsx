import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import Alert from '../components/Alert';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) await register(form);
      else await login(form.email, form.password);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="login-wrap">
      <div className="card shadow-sm p-4" style={{ width: 400 }}>
        <h3 className="mb-1">StaffSync</h3>
        <p className="text-muted">{isRegister ? 'Create an employee account' : 'Sign in to your account'}</p>
        <Alert message={error} onClose={() => setError('')} />
        <form onSubmit={submit}>
          {isRegister && (
            <div className="mb-3">
              <label className="form-label">Full name</label>
              <input className="form-control" name="name" value={form.name} onChange={change} required />
            </div>
          )}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" name="email" value={form.email} onChange={change} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" name="password" minLength={6} value={form.password} onChange={change} required />
          </div>
          <button className="btn btn-primary w-100">{isRegister ? 'Create account' : 'Sign in'}</button>
        </form>
        <button className="btn btn-link mt-2" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
          {isRegister ? 'Already have an account? Sign in' : 'New employee? Create an account'}
        </button>
      </div>
    </div>
  );
}
