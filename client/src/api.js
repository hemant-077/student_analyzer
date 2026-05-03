const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:5001";

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed." }));
    throw new Error(error.message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function getStudents(filters) {
  const params = new URLSearchParams(filters);
  return request(`/api/students?${params.toString()}`);
}

export function getAnalytics() {
  return request("/api/analytics");
}

export function getOptions() {
  return request("/api/options");
}

export function createStudent(payload) {
  return request("/api/students", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateStudent(id, payload) {
  return request(`/api/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteStudent(id) {
  return request(`/api/students/${id}`, {
    method: "DELETE"
  });
}
