const BASE_URL = "http://localhost:3001/gateway"; // inclui o prefixo do controller

interface RequestOptions extends RequestInit {
  body?: any;
  params?: Record<string, string | number>;
  headers?: Record<string, string>;
}

function buildUrl(endpoint: string, params?: Record<string, string | number>) {
  if (!params) return endpoint;

  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const { body, params, headers = {}, ...rest } = options;

  const url = buildUrl(endpoint, params);

  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw { status: res.status, ...errorData };
  }

  return res.json();
}

export const api = {
  findEmail: (email: string, requestId?: string) =>
    request(`/find-email/${encodeURIComponent(email)}`, { method: "GET", headers: requestId ? { "x-request-id": requestId } : undefined }),

  findUser: (query: { name?: string; email?: string }, requestId?: string) =>
    request('/users', { method: "GET", params: query, headers: requestId ? { "x-request-id": requestId } : undefined }),

  registerUser: (data: any, requestId?: string) =>
    request("/register", { method: "POST", body: data, headers: requestId ? { "x-request-id": requestId } : undefined }),
};
