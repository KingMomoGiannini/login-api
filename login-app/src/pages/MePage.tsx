import { useState } from 'react';
import { request } from '../api/http';

type UserResponse = {
  id: number;
  username: string;
  email: string;
  roles: string[];
};

export default function MePage() {
  const [data, setData] = useState<UserResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const res = await request<UserResponse>('/users/me', 'GET', undefined, true);
      setData(res);
    } catch (e: any) {
      setErr(e.message ?? 'Error');
      setData(null);
    }
  }

  return (
    <div className="container py-4">
      <h2>/users/me</h2>
      <button className="btn btn-outline-primary mt-3" onClick={load}>
        Consultar
      </button>

      {err && <div className="alert alert-danger mt-3">{err}</div>}

      {data && (
        <pre className="mt-3 p-3 bg-light border rounded">
{JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
