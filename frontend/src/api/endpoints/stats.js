import { db, requireAdmin } from "../db.js"
import { ApiError, ErrorCode } from "../errors.js"
import { STATUS_LABELS, Status } from "../types.js"
import { voteRows } from "./requests.js"

function pad(n) {
  return String(n).padStart(2, "0")
}

function toDayKey(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function getStats() {
  const currentUser = requireAdmin()
  if (!currentUser) throw new ApiError("Admin access required", ErrorCode.FORBIDDEN)

  const totalRequests = db.requests.length
  const activeRequests = db.requests.filter((r) =>
    [Status.UNDER_REVIEW, Status.PLANNED, Status.IN_PROGRESS].includes(r.status)
  ).length
  const totalSupport = db.votes.length
  const releasedRequests = db.requests.filter((r) => r.status === Status.RELEASED).length

  const statusDistribution = Object.values(Status).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: db.requests.filter((r) => r.status === status).length,
  }))

  const topVoted = [...db.requests]
    .sort((a, b) => voteRows(b.id).length - voteRows(a.id).length || (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      support: voteRows(r.id).length,
    }))

  // Votes per day over the last 30 days.
  const now = new Date()
  const buckets = new Map()
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    buckets.set(toDayKey(d.toISOString()), 0)
  }
  for (const vote of db.votes) {
    const key = toDayKey(vote.createdAt)
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + 1)
  }
  const votesOverTime = [...buckets.entries()].map(([date, count]) => ({ date, count }))

  return {
    totalRequests,
    activeRequests,
    totalSupport,
    releasedRequests,
    statusDistribution,
    topVoted,
    votesOverTime,
  }
}