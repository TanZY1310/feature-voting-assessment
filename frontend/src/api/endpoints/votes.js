import { db, requireSession } from "../db.js"
import { ApiError, ErrorCode } from "../errors.js"
import { ACTIVE_STATUSES } from "../types.js"
import { toSummary } from "./requests.js"

export function setVote(requestId) {
  const currentUser = requireSession()
  const request = db.requests.find((r) => r.id === requestId)
  if (!request) throw new ApiError("Request not found", ErrorCode.NOT_FOUND)
  if (!ACTIVE_STATUSES.includes(request.status)) {
    throw new ApiError("Voting is closed for this request", ErrorCode.NOT_OPEN)
  }
  const existing = db.votes.find(
    (v) => v.requestId === requestId && v.userId === currentUser.id
  )
  if (!existing) {
    db.votes.push({ userId: currentUser.id, requestId, createdAt: new Date().toISOString() })
  }
  return toSummary(request, currentUser.id)
}

export function clearVote(requestId) {
  const currentUser = requireSession()
  const request = db.requests.find((r) => r.id === requestId)
  if (!request) throw new ApiError("Request not found", ErrorCode.NOT_FOUND)
  db.votes = db.votes.filter(
    (v) => !(v.requestId === requestId && v.userId === currentUser.id)
  )
  return toSummary(request, currentUser.id)
}