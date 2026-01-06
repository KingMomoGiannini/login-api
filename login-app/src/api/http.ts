const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export function getToken(): string |  null {
    return localStorage.getItem('token');
}

export function setToken(token: string){
    localStorage.setItem('token', token);
}

export function clearToken() {
    localStorage.removeItem('token');
}

type HttpMethod = 'GET' | 'POST';

export async function request<T> (
    path: string,
    method: HttpMethod,
    body?: unknown,
    auth: boolean = false
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (auth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    const data = text ?  JSON.parse(text) : null;

    if (!res.ok) {
        const msg = data?.message ?? `HTTP ${res.status}`;
        throw new Error(msg);
    }

    return data as T;
    
}