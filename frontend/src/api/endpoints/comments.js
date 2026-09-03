import { db, getUser, requireAdmin, requireSession } from "../db.js"
import { ApiError, ErrorCode } from "../errors.js"

export function listComments(requestId) {
  const request = db.requests.find((r) => r.id === requestId)
  if (!request) throw new ApiError("Request not found", ErrorCode.NOT_FOUND)
  return db.comments
    .filter((c) => c.requestId === requestId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((c) => ({
      id: c.id,
      requestId: c.requestId,
      author: { id: getUser(c.authorId).id, name: getUser(c.authorId).name },
      body: c.body,
      createdAt: c.createdAt,
    }))
}

export function addComment(requestId, { body }) {
  const currentUser = requireSession()
  const request = db.requests.find((r) => r.id === requestId)
  if (!request) throw new ApiError("Request not found", ErrorCode.NOT_FOUND)
  if (!body || !body.trim()) throw new ApiError("Comment cannot be empty")
  db.counters.comment += 1
  const comment = {
    id: `c-${db.counters.comment}`,
    requestId,
    authorId: currentUser.id,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  }
  db.comments.push(comment)
  return {
    id: comment.id,
    requestId,
    author: { id: currentUser.id, name: currentUser.name },
    body: comment.body,
    createdAt: comment.createdAt,
  }
}

export function setOfficialResponse(requestId, { body }) {
  const currentUser = requireAdmin()
  if (!currentUser) throw new ApiError("Admin access required", ErrorCode.FORBIDDEN)
  const request = db.requests.find((r) => r.id === requestId)
  if (!request) throw new ApiError("Request not found", ErrorCode.NOT_FOUND)
  if (!body || !body.trim()) throw new ApiError("Response cannot be empty")

  const updatedAt = new Date().toISOString()
  const existing = db.responses[requestId]
  if (existing) {
    existing.body = body.trim()
    existing.updatedAt = updatedAt
    db.counters.activity += 1
    db.activity.push({
      id: `a-${db.counters.activity}`,
      requestId,
      type: "response_edited",
      actorId: currentUser.id,
      detail: "edited the official response",
      createdAt: updatedAt,
    })
  } else {
    db.responses[requestId] = {
      requestId,
      authorId: currentUser.id,
      body: body.trim(),
      createdAt: updatedAt,
      updatedAt,
    }
    db.counters.activity += 1
    db.activity.push({
      id: `a-${db.counters.activity}`,
      requestId,
      type: "response_posted",
      actorId: currentUser.id,
      detail: "posted an official response",
      createdAt: updatedAt,
    })
  }
  return {
    requestId,
    author: { id: currentUser.id, name: currentUser.name },
    body: db.responses[requestId].body,
    createdAt: db.responses[requestId].createdAt,
    updatedAt,
  }
}

export function removeOfficialResponse(requestId) {
  const currentUser = requireAdmin()
  if (!currentUser) throw new ApiError("Admin access required", ErrorCode.FORBIDDEN)
  const request = db.requests.find((r) => r.id === requestId)
  if (!request) throw new ApiError("Request not found", ErrorCode.NOT_FOUND)
  if (db.responses[requestId]) {
    delete db.responses[requestId]
    db.counters.activity += 1
    db.activity.push({
      id: `a-${db.counters.activity}`,
      requestId,
      type: "response_removed",
      actorId: currentUser.id,
      detail: "removed the official response",
      createdAt: new Date().toISOString(),
    })
  }
  return null
}