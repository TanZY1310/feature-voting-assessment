import { ApiError, ErrorCode } from "./errors.js"
import { clearToken, getToken } from "./token.js"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export async function request(path, { method = "GET", body } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers["Content-Type"] = "application/json"

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError("Unable to reach the server", ErrorCode.INVALID)
  }

  if (!response.ok) {
    let payload = null
    try {
      payload = await response.json()
    } catch {
      // Non-JSON error body; fall through to the default below.
    }
    if (response.status === 401) clearToken()
    throw new ApiError(
      payload?.message ?? "Request failed",
      payload?.code ?? ErrorCode.INVALID
    )
  }

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export function toQuery(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, value)
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}