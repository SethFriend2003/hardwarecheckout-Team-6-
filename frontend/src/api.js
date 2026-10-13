const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

async function request(path, method = "GET", body) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const register = (userid, password) => request("/register", "POST", { userid, password });
export const login = (userid, password) => request("/login", "POST", { userid, password });
export const createProject = (projectId, name, description, userid) =>
  request("/projects", "POST", { projectId, name, description, userid });
export const joinProject = (projectId, userid) => request("/projects/join", "POST", { projectId, userid });
export const getProject = (projectId) => request(`/projects/${projectId}`);
export const getHardware = () => request("/hardware");
export const checkout = (projectId, hwName, qty) =>
  request("/hardware/checkout", "POST", { projectId, hwName, qty });
export const checkin = (projectId, hwName, qty) =>
  request("/hardware/checkin", "POST", { projectId, hwName, qty });