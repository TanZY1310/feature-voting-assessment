import { api, ApiError } from "../src/api/client.js"
import { db, setSessionUser } from "../src/api/db.js"
import { Status } from "../src/api/types.js"

let passed = 0
let failed = 0

function assert(condition, label) {
  if (condition) {
    passed += 1
    console.log(`  ok  ${label}`)
  } else {
    failed += 1
    console.error(`FAIL  ${label}`)
  }
}

async function expectError(fn, code, label) {
  try {
    await fn()
    failed += 1
    console.error(`FAIL  ${label} (expected error ${code}, none thrown)`)
  } catch (error) {
    if (error instanceof ApiError && error.code === code) {
      passed += 1
      console.log(`  ok  ${label}`)
    } else {
      failed += 1
      console.error(`FAIL  ${label} — got ${error?.code ?? error}`)
    }
  }
}

setSessionUser("u-2") // Sam Rivera, role user

const list = await api.listRequests({ q: "csv", sort: "support" })
assert(list.total === 1 && list.items[0].title.includes("CSV"), "list: q filter finds the CSV request")

const listAll = await api.listRequests({ sort: "support" })
assert(listAll.items.length === db.requests.length, "list: unfiltered returns all requests")
assert(listAll.items[0].support >= listAll.items[1].support, "list: default sort by support desc")

const created = await api.createRequest({ title: "Smoke test request", description: "verify create" })
assert(created.status === Status.UNDER_REVIEW, "create: starts under_review")
assert(created.author.id === "u-2", "create: author is current user")

// Vote once + idempotent set + clear
const afterVote1 = await api.setVote(created.id)
assert(afterVote1.support === 1 && afterVote1.votedByMe, "vote: support increments")
const afterVote2 = await api.setVote(created.id)
assert(afterVote2.support === 1, "vote: repeat PUT is a no-op (vote-once)")
const afterClear = await api.clearVote(created.id)
assert(afterClear.support === 0 && !afterClear.votedByMe, "vote: unvote clears")

// Voting closed on terminal status
db.requests.find((r) => r.id === "req-1").status = Status.RELEASED
await expectError(() => api.setVote("req-1"), "NOT_OPEN", "vote: rejected on released request")

// Admin-only status change — as user
await expectError(() => api.setStatus(created.id, { status: Status.PLANNED }), "FORBIDDEN", "status: user cannot change status")
await expectError(() => api.setStatus(created.id, { status: Status.REDIRECTED }), "FORBIDDEN", "status: redirect locked via forbidden path")

// Author-or-admin edit — non-owner user cannot edit
await expectError(() => api.updateRequest("req-9", { title: "hack" }), "FORBIDDEN", "edit: non-owner user forbidden")

// Switch to admin and exercise admin flows
setSessionUser("u-1")
const moved = await api.setStatus(created.id, { status: Status.PLANNED })
assert(moved.status === Status.PLANNED, "status: admin moves to planned")
await expectError(() => api.setStatus(created.id, { status: Status.REDIRECTED }), "REDIRECTED_LOCKED", "status: admin cannot manually set redirected")

// Admin can edit others' requests
const adminEdit = await api.updateRequest("req-9", { title: "Self-serve billing (v2)" })
assert(adminEdit.title === "Self-serve billing (v2)", "edit: admin can edit anyone's request")
await api.updateRequest("req-9", { title: "Self-serve billing" })

// Official response set/edit/remove
const response = await api.setOfficialResponse(created.id, { body: "We'll look into it." })
assert(response.body === "We'll look into it.", "response: admin posts official response")
const response2 = await api.setOfficialResponse(created.id, { body: "Updated answer." })
assert(response2.body === "Updated answer." && response2.author.name === "Lee Park", "response: edit keeps single slot")
await api.removeOfficialResponse(created.id)
assert(!db.responses[created.id], "response: removed")

// Comment
const comment = await api.addComment(created.id, { body: "nice idea" })
assert(comment.author.name === "Lee Park", "comment: posted by current user")

// Merge: absorbed-initiated, survivor gains the UNION of voters (dedup by user).
db.requests.find((r) => r.id === "req-12").status = Status.UNDER_REVIEW
const survivorSupportBefore = (await api.getRequest("req-12")).support
const absorbedSupport = (await api.getRequest("req-4")).support
const survivor = await api.mergeRequests("req-4", { into: "req-12" })
// req-4 voters {u-1..u-6}; req-12 voters {u-1..u-5} ⊂ req-4 → union size = req-4 support (6).
assert(survivor.support === absorbedSupport, "merge: survivor support = union of voters")
assert(survivor.support < survivorSupportBefore + absorbedSupport, "merge: dedup, not sum")
const absorbedDetail = await api.getRequest("req-4")
assert(absorbedDetail.status === Status.REDIRECTED && absorbedDetail.mergedInto === "req-12", "merge: absorbed becomes redirected with mergedInto")
assert(absorbedDetail.comments.length > 0, "merge: absorbed keeps its comments")
assert(survivor.mergedFrom.some((r) => r.id === "req-4"), "merge: survivor lists merged-from")
const unionVote = await api.setVote("req-12")
const doubled = await api.setVote("req-12")
assert(unionVote.support === survivor.support && doubled.support === unionVote.support, "merge: no double-count across requests")
await expectError(() => api.mergeRequests("req-4", { into: "req-12" }), "REDIRECTED_LOCKED", "merge: already-redirected cannot merge again")
await expectError(() => api.mergeRequests("req-12", { into: "req-4" }), "INVALID", "merge: cannot merge into a redirected request")

// Stats admin-only + shape
const stats = await api.getStats()
assert(stats.totalRequests === db.requests.length, "stats: total matches db")
assert(stats.statusDistribution.length === 6, "stats: distribution covers 6 statuses")
assert(stats.topVoted.length === 5, "stats: top 5 table")
assert(stats.votesOverTime.length === 30, "stats: 30-day vote series")
setSessionUser("u-2")
await expectError(() => api.getStats(), "FORBIDDEN", "stats: non-admin forbidden")

// Session
const session = await api.getSession()
assert(session.role === "user", "session: reflects current role")

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)