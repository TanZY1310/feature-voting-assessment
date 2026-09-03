import { request, toQuery } from "./http.js"
import { getToken, setToken } from "./token.js"

export { ApiError, ErrorCode } from "./errors.js"

const enc = encodeURIComponent

export const api = {
  // session / auth
  async getSession() {
    if (!getToken()) return null
    try {
      return await request("/session")
    } catch (error) {
      if (error?.code === "UNAUTHORIZED") return null
      throw error
    }
  },
  async login(email, password) {
    const data = await request("/auth/login", {
      method: "POST",
      body: { email, password },
    })
    setToken(data.token)
    return data.user
  },
  logout() {
    setToken(null)
  },
  // requests
  listRequests: (params = {}) => request(`/requests${toQuery(params)}`),
  getRequest: (id) => request(`/requests/${enc(id)}`),
  createRequest: (input) => request("/requests", { method: "POST", body: input }),
  updateRequest: (id, input) =>
    request(`/requests/${enc(id)}`, { method: "PATCH", body: input }),
  deleteRequest: (id) => request(`/requests/${enc(id)}`, { method: "DELETE" }),
  setStatus: (id, { status }) =>
    request(`/requests/${enc(id)}/status`, { method: "PUT", body: { status } }),
  mergeRequests: (absorbedId, { into }) =>
    request(`/requests/${enc(absorbedId)}/merge`, {
      method: "POST",
      body: { into },
    }),
  // votes
  setVote: (requestId) => request(`/requests/${enc(requestId)}/vote`, { method: "PUT" }),
  clearVote: (requestId) =>
    request(`/requests/${enc(requestId)}/vote`, { method: "DELETE" }),
  // comments + official response
  listComments: (requestId) => request(`/requests/${enc(requestId)}/comments`),
  addComment: (requestId, { body }) =>
    request(`/requests/${enc(requestId)}/comments`, { method: "POST", body: { body } }),
  setOfficialResponse: (requestId, { body }) =>
    request(`/requests/${enc(requestId)}/response`, { method: "PUT", body: { body } }),
  removeOfficialResponse: (requestId) =>
    request(`/requests/${enc(requestId)}/response`, { method: "DELETE" }),
  // stats
  getStats: () => request("/stats"),
}