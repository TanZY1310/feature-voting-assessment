import { db, getUser, requireAdmin, requireSession } from "../db.js"
import { ApiError, ErrorCode } from "../errors.js"
import {
  ACTIVE_STATUSES,
  Sort,
  STATUS_LABELS,
  Status,
} from "../types.js"

export function voteRows(requestId) {
  return db.votes.filter((v) => v.requestId === requestId)
}

export function toSummary(request, currentUserId = null) {
  const votes = voteRows(request.id)
  const comments = db.comments.filter((c) => c.requestId === request.id)
  const author = getUser(request.authorId)
  return {
    id: request.id,
    title: request.title,
    status: request.status,
    support: votes.length,
    commentCount: comments.length,
    votedByMe: currentUserId ? votes.some((v) => v.userId === currentUserId) : false,
    author: { id: author.id, name: author.name },
    mergedInto: request.mergedInto,
    createdAt: request.createdAt,
  }
}

function serializeResponse(resp) {
  if (!resp) return null
  const author = getUser(resp.authorId)
  return {
    requestId: resp.requestId,
    author: { id: author.id, name: author.name },
    body: resp.body,
    createdAt: resp.createdAt,
    updatedAt: resp.updatedAt,
  }
}

function serializeActivity(entry) {
  const actor = getUser(entry.actorId)
  return { ...entry, actor: { id: actor.id, name: actor.name } }
}

export function toDetail(request, currentUserId = null) {
  const votes = voteRows(request.id)
  const author = getUser(request.authorId)
  const mergedFrom = db.requests.filter((r) => r.mergedInto === request.id)
  const mergedIntoRequest = request.mergedInto
    ? db.requests.find((r) => r.id === request.mergedInto)
    : null
  const comments = db.comments
    .filter((c) => c.requestId === request.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((c) => ({
      id: c.id,
      requestId: c.requestId,
      author: { id: getUser(c.authorId).id, name: getUser(c.authorId).name },
      body: c.body,
      createdAt: c.createdAt,
    }))
  const activity = db.activity
    .filter((a) => a.requestId === request.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map(serializeActivity)

  return {
    id: request.id,
    title: request.title,
    description: request.description,
    status: request.status,
    support: votes.length,
    votedByMe: currentUserId ? votes.some((v) => v.userId === currentUserId) : false,
    canVote: Boolean(currentUserId) && ACTIVE_STATUSES.includes(request.status),
    author: { id: author.id, name: author.name },
    mergedInto: request.mergedInto,
    mergedIntoRequest: mergedIntoRequest
      ? { id: mergedIntoRequest.id, title: mergedIntoRequest.title }
      : null,
    mergedFrom: mergedFrom.map((r) => ({ id: r.id, title: r.title })),
    officialResponse: serializeResponse(db.responses[request.id]),
    comments,
    activity,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  }
}

export function listRequests({ q = "", status = "", sort = Sort.SUPPORT } = {}) {
  const currentUser = db.users.find((u) => u.id === db.sessionUserId) ?? null
  const query = q.trim().toLowerCase()

  let items = db.requests.filter((r) => {
    if (status && r.status !== status) return false
    if (query) {
      const haystack = `${r.title} ${r.description}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    return true
  })

  const bySupport = (a, b) => voteRows(b.id).length - voteRows(a.id).length
  const byNewest = (a, b) => (a.createdAt < b.createdAt ? 1 : -1)

  if (sort === Sort.NEWEST) {
    items = [...items].sort(byNewest)
  } else {
    items = [...items].sort((a, b) => bySupport(a, b) || byNewest(a, b))
  }

  return {
    items: items.map((r) => toSummary(r, currentUser?.id)),
    total: items.length,
  }
}

export function getRequest(id) {
  const request = db.requests.find((r) => r.id === id)
  if (!request) throw new ApiError("Request not found", ErrorCode.NOT_FOUND)
  const currentUser = db.users.find((u) => u.id === db.sessionUserId) ?? null
  return toDetail(request, currentUser?.id)
}

export function createRequest({ title, description }) {
  const currentUser = requireSession()
  if (!title || !title.trim()) {
    throw new ApiError("Title is required")
  }
  db.counters.request += 1
  const id = `req-${db.counters.request}`
  const createdAt = new Date().toISOString()
  const request = {
    id,
    title: title.trim(),
    description: (description ?? "").trim(),
    authorId: currentUser.id,
    status: Status.UNDER_REVIEW,
    mergedInto: null,
    createdAt,
    updatedAt: createdAt,
  }
  db.requests.push(request)
  db.counters.activity += 1
  db.activity.push({
    id: `a-${db.counters.activity}`,
    requestId: id,
    type: "created",
    actorId: currentUser.id,
    detail: "created this request",
    createdAt,
  })
  return toDetail(request, currentUser.id)
}

export function updateRequest(id, { title, description }) {
  const currentUser = requireSession()
  const request = db.requests.find((r) => r.id === id)
  if (!request) throw new ApiError("Request not found", ErrorCode.NOT_FOUND)
  if (request.authorId !== currentUser.id && currentUser.role !== "admin") {
    throw new ApiError("Only the author or an admin can edit this request", ErrorCode.FORBIDDEN)
  }
  if (!title || !title.trim()) throw new ApiError("Title is required")
  request.title = title.trim()
  request.description = (description ?? "").trim()
  request.updatedAt = new Date().toISOString()
  return toDetail(request, currentUser.id)
}

export function deleteRequest(id) {
  const currentUser = requireSession()
  const request = db.requests.find((r) => r.id === id)
  if (!request) throw new ApiError("Request not found", ErrorCode.NOT_FOUND)
  if (request.authorId !== currentUser.id && currentUser.role !== "admin") {
    throw new ApiError("Only the author or an admin can delete this request", ErrorCode.FORBIDDEN)
  }
  db.requests = db.requests.filter((r) => r.id !== id)
  db.votes = db.votes.filter((v) => v.requestId !== id)
  db.comments = db.comments.filter((c) => c.requestId !== id)
  delete db.responses[id]
  db.activity = db.activity.filter((a) => a.requestId !== id)
  return { id }
}

function addActivity(requestId, type, actorId, detail, createdAt) {
  db.counters.activity += 1
  db.activity.push({ id: `a-${db.counters.activity}`, requestId, type, actorId, detail, createdAt })
}

export function setStatus(id, { status }) {
  const currentUser = requireAdmin()
  if (!currentUser) throw new ApiError("Admin access required", ErrorCode.FORBIDDEN)
  const request = db.requests.find((r) => r.id === id)
  if (!request) throw new ApiError("Request not found", ErrorCode.NOT_FOUND)
  if (request.status === Status.REDIRECTED) {
    throw new ApiError("Redirected requests are locked by a merge", ErrorCode.REDIRECTED_LOCKED)
  }
  if (status === Status.REDIRECTED) {
    throw new ApiError("Redirected status is only set by a merge", ErrorCode.REDIRECTED_LOCKED)
  }
  if (!STATUS_LABELS[status]) throw new ApiError("Unknown status")
  request.status = status
  request.updatedAt = new Date().toISOString()
  addActivity(id, "status_changed", currentUser.id, `moved to ${STATUS_LABELS[status]}`, request.updatedAt)
  return toDetail(request, currentUser.id)
}

export function mergeRequests(absorbedId, { into }) {
  const currentUser = requireAdmin()
  if (!currentUser) throw new ApiError("Admin access required", ErrorCode.FORBIDDEN)
  if (absorbedId === into) throw new ApiError("Cannot merge a request into itself")
  const absorbed = db.requests.find((r) => r.id === absorbedId)
  const survivor = db.requests.find((r) => r.id === into)
  if (!absorbed) throw new ApiError("Request not found", ErrorCode.NOT_FOUND)
  if (!survivor) throw new ApiError("Merge target not found", ErrorCode.NOT_FOUND)
  if (absorbed.status === Status.REDIRECTED) {
    throw new ApiError("Request is already redirected by a merge", ErrorCode.REDIRECTED_LOCKED)
  }
  if (survivor.status === Status.REDIRECTED) {
    throw new ApiError("Cannot merge into a Redirected request")
  }

  // Union of voters, deduplicated by user.
  const survivorVoters = new Set(voteRows(survivor.id).map((v) => v.userId))
  const absorbedVotes = voteRows(absorbed.id)
  for (const vote of absorbedVotes) {
    if (!survivorVoters.has(vote.userId)) {
      vote.requestId = survivor.id
      survivorVoters.add(vote.userId)
    } else {
      db.votes = db.votes.filter((v) => v !== vote)
    }
  }

  const updatedAt = new Date().toISOString()
  absorbed.status = Status.REDIRECTED
  absorbed.mergedInto = survivor.id
  absorbed.updatedAt = updatedAt
  survivor.updatedAt = updatedAt

  addActivity(absorbed.id, "merged_into", currentUser.id, `merged into ${survivor.id}`, updatedAt)
  addActivity(survivor.id, "merged_into", currentUser.id, `absorbed ${absorbed.id}`, updatedAt)

  return toDetail(survivor, currentUser.id)
}