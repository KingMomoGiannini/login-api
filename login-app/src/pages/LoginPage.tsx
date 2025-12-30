import { useState } from 'react';
import { request, setToken } from '../api/http';

type LoginRequest = { username: string; password: string };
type AuthResponse = { message: string; token: string | null };

export default function LoginPage() {
  const [form, setForm] = useState<LoginRequest>({ username: '', password: '' });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    try {
      const res = await request<AuthResponse>('/auth/login', 'POST', form, false);
      if (res.token) setToken(res.token);
      setMsg('Login OK. Token guardado.');
    } catch (e: any) {
      setErr(e.message ?? 'Error');
    }
  }

  return (
    <div className="container py-4">
      <h2>Login</h2>

      <form className="card p-3 mt-3" onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input className="form-control"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button className="btn btn-success">Ingresar</button>

        {msg && <div className="alert alert-success mt-3 mb-0">{msg}</div>}
        {err && <div className="alert alert-danger mt-3 mb-0">{err}</div>}
      </form>
    </div>
  );
}
