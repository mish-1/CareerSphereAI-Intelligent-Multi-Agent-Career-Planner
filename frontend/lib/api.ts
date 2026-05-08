const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  
  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data.detail || data.message || message;
    } catch {
      message = await response.text() || message;
    }
    const error: ApiError = {
      status: response.status,
      message,
    };
    throw error;
  }
  return response.json();
}

export async function uploadResume(file: File, targetRole?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (targetRole) {
    formData.append("target_role", targetRole);
  }

  const headers = new Headers();
  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}/resume/upload`, {
    method: "POST",
    body: formData,
    headers,
  });

  if (!response.ok) {
    let message = `Upload failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data.detail || data.message || message;
    } catch {
      message = await response.text() || message;
    }
    const error: ApiError = {
      status: response.status,
      message,
    };
    throw error;
  }

  return response.json();
}

export async function getProfile(): Promise<{ data: any }> {
  return request("/profile");
}

export async function runWorkflow(payload: unknown) {
  return request<{ message: string; data: unknown }>("/workflow/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function optimizeResume(payload: unknown) {
  return request<{ message: string; data: unknown }>("/resume/optimize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function searchOpportunities(payload: unknown) {
  return request<{ message: string; data: unknown }>("/opportunities/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function runMentorChat(payload: unknown) {
  return request<{ message: string; data: { text: string } }>("/mentor/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function checkSafety(payload: unknown) {
  return request<{ message: string; data: unknown }>("/safety/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  return request<{ uid: string; email: string; auth_source: string }>("/me");
}
