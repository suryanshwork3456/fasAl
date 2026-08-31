const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request(path, body) {
  const res = await fetch(`${API_BASE}/api/v1/auth${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Something went wrong.");
  return data;
}

export const authApi = {
  register: (full_name, mobile_number) => request("/register", { full_name, mobile_number }),
  login: (mobile_number) => request("/login", { mobile_number }),
  verifyOtp: (mobile_number, otp) => request("/verify-otp", { mobile_number, otp }),
  resendOtp: (mobile_number) => request("/resend-otp", { mobile_number }),
};


export async function authFetch(path, options = {}) {
  const token = localStorage.getItem("fasai_token");
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Server returned status: ${res.status}`);
  }
  return res.json();
}