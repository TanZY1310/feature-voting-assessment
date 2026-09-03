import { db, getSessionUser, setSessionUser } from "./db.js"
import * as requests from "./endpoints/requests.js"
import * as votes from "./endpoints/votes.js"
import * as comments from "./endpoints/comments.js"
import * as stats from "./endpoints/stats.js"

export { ApiError, ErrorCode } from "./errors.js"

const LATENCY_MS = 220
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Mutations on the same key run serially, mirroring write isolation for the
// vote-once rule under concurrent rapid toggles.
const queues = new Map()
function serialized(key, fn) {
  const prev = queues.get(key) ?? Promise.resolve()
  const next = prev.catch(() => {}).then(fn)
  queues.set(key, next)
  return next
}

function respond(mutationKey, handler) {
  return (...args) => {
    const run = () => handler(...args)
    if (mutationKey) return serialized(mutationKey, () => delay(LATENCY_MS).then(run))
    return delay(LATENCY_MS).then(run)
  }
}

function getSession() {
  return getSessionUser()
}

function setSession(role) {
  const match = db.users.find((u) => u.role === role)
  if (!match) throw new Error(`No user with role "${role}"`)
  return setSessionUser(match.id)
}

export const api = {
  // session
  getSession: respond(null, getSession),
  setSession: respond("session", setSession),
  // requests
  listRequests: respond(null, requests.listRequests),
  getRequest: respond(null, requests.getRequest),
  createRequest: respond("create", requests.createRequest),
  updateRequest: respond("update", requests.updateRequest),
  deleteRequest: respond("delete", requests.deleteRequest),
  setStatus: respond("status", requests.setStatus),
  mergeRequests: respond("merge", requests.mergeRequests),
  // votes
  setVote: respond("vote", votes.setVote),
  clearVote: respond("vote", votes.clearVote),
  // comments + official response
  listComments: respond(null, comments.listComments),
  addComment: respond("comment", comments.addComment),
  setOfficialResponse: respond("response", comments.setOfficialResponse),
  removeOfficialResponse: respond("response", comments.removeOfficialResponse),
  // stats
  getStats: respond(null, stats.getStats),
}