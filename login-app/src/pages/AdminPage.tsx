import { useState } from 'react';
import { request } from '../api/http';

export default function AdminPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function ping() {
    setErr(null);
    setMsg(null);
    try {
      type PingResponse = { message: string };
      const res = await request<PingResponse>('/admin/ping', 'GET', undefined, true);
      setMsg(res.message);
    } catch (e: any) {
      setErr(e.message ?? 'Error');
    }
  }

  return (
    <div className="container py-4">
      <h2>/admin/ping</h2>
      <button className="btn btn-warning mt-3" onClick={ping}>
        Probar admin
      </button>

      {msg && <div className="alert alert-success mt-3">{msg}</div>}
      {err && <div className="alert alert-danger mt-3">{err}</div>}
    </div>
  );
}
