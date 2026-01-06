import { useState } from "react";
import { request } from "../api/http";

type RegisterRequest = { username: string; email: string; password: string};
type AuthResponse = {message: string; token: string | null};

export default function RegisterPage() {
    const [form, setForm] = useState<RegisterRequest>({
        username: '',
        email: '',
        password: '',
    });

    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent){
        e.preventDefault();
        setMsg(null);
        setErr(null);

        try{
            const res = await request<AuthResponse>('/auth/register', 'POST', form);
            setMsg(res.message);
        } catch (e: any){ 
            setErr(e.message ?? 'Error');
        }
    }
    return (
        <div>
            <h2>Registro</h2>

            <form className = "card p-3 mt-3" onSubmit={onSubmit}>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input className="form-control" 
                        value = {form.username}
                        onChange={(e) => setForm({...form, username: e.target.value})}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input className="form-control" 
                        value = {form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                    />
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" 
                        value = {form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                    />
                </div>

                <button className="btn btn-primary">Crear usuario</button>

                {msg && <div className="alert alert-success mt-3 mb-0">{msg}</div>}
                {err && <div className="alert alert-danger mt-3 mb-0">{err}</div>}
            </form>
        </div>
    );
}