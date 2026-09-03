import { Role, Status } from "./types.js"

const now = Date.now()
const daysAgo = (days, hours = 0) =>
  new Date(now - (days * 24 + hours) * 3600_000).toISOString()

export const db = {
  users: [
    { id: "u-1", name: "Lee Park", role: Role.ADMIN },
    { id: "u-2", name: "Sam Rivera", role: Role.USER },
    { id: "u-3", name: "Alex Chen", role: Role.USER },
    { id: "u-4", name: "Maya Patel", role: Role.USER },
    { id: "u-5", name: "Jordan Lee", role: Role.USER },
    { id: "u-6", name: "Priya Nair", role: Role.USER },
    { id: "u-7", name: "Diego Ramirez", role: Role.USER },
    { id: "u-8", name: "Hannah Kim", role: Role.USER },
    { id: "u-9", name: "Omar Haddad", role: Role.USER },
    { id: "u-10", name: "Ella Fischer", role: Role.USER },
    { id: "u-11", name: "Noah Tanaka", role: Role.USER },
    { id: "u-12", name: "Chloe Weber", role: Role.USER },
  ],

  requests: [
    {
      id: "req-1",
      title: "Dark mode for the whole app",
      description:
        "The admin panels, request lists, and comment threads should respect a dark theme alongside the existing light theme. Follows system preference with a manual override.",
      authorId: "u-2",
      status: Status.RELEASED,
      mergedInto: null,
      createdAt: daysAgo(28),
      updatedAt: daysAgo(6),
    },
    {
      id: "req-2",
      title: "Export my votes to CSV",
      description:
        "Users should be able to download a CSV of the requests they voted on, including status and current support. Useful for tracking the roadmap they care about.",
      authorId: "u-3",
      status: Status.PLANNED,
      mergedInto: null,
      createdAt: daysAgo(24),
      updatedAt: daysAgo(13),
    },
    {
      id: "req-3",
      title: "Keyboard shortcuts for the review queue",
      description:
        "Admins should be able to triage faster with shortcuts: jump between requests, move status, and merge duplicates without reaching for the mouse.",
      authorId: "u-4",
      status: Status.IN_PROGRESS,
      mergedInto: null,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(2),
    },
    {
      id: "req-4",
      title: "Real-time vote counts",
      description:
        "When other users vote, the count should update live instead of requiring a refresh. Explore subscribing to vote events for the requests a user is viewing.",
      authorId: "u-2",
      status: Status.UNDER_REVIEW,
      mergedInto: null,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: "req-5",
      title: "GitHub issue sync",
      description:
        "Automatically create a GitHub issue when a feature request is accepted, and link it back so supporters can follow progress in the repo.",
      authorId: "u-3",
      status: Status.DECLINED,
      mergedInto: null,
      createdAt: daysAgo(18),
      updatedAt: daysAgo(15),
    },
    {
      id: "req-6",
      title: "Team workspaces",
      description:
        "Let organizations group requests by workspace so internal tools and client feedback stay separate but share the same voting engine.",
      authorId: "u-4",
      status: Status.UNDER_REVIEW,
      mergedInto: null,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: "req-7",
      title: "Bulk moderation tools",
      description:
        "Admins need to select multiple requests and decline or redirect them in one pass, with a single confirm step and a full activity trail.",
      authorId: "u-2",
      status: Status.PLANNED,
      mergedInto: null,
      createdAt: daysAgo(12),
      updatedAt: daysAgo(9),
    },
    {
      id: "req-8",
      title: "API rate-limit dashboard",
      description:
        "A usage view showing per-key request counts, throttling events, and the remaining quota window so heavy consumers can self-diagnose.",
      authorId: "u-3",
      status: Status.RELEASED,
      mergedInto: null,
      createdAt: daysAgo(15),
      updatedAt: daysAgo(4),
    },
    {
      id: "req-9",
      title: "Self-serve billing",
      description:
        "Upgrade, downgrade, and see invoices without talking to sales. Includes a seat-based plan model and prorated changes.",
      authorId: "u-4",
      status: Status.IN_PROGRESS,
      mergedInto: null,
      createdAt: daysAgo(8),
      updatedAt: daysAgo(1),
    },
    {
      id: "req-10",
      title: "Dark mode toggle in the header",
      description:
        "A quick toggle in the app header to switch themes without touching settings.",
      authorId: "u-2",
      status: Status.REDIRECTED,
      mergedInto: "req-1",
      createdAt: daysAgo(26),
      updatedAt: daysAgo(24),
    },
    {
      id: "req-11",
      title: "Offline support",
      description:
        "Cache the browse and detail pages so the app is usable on flaky connections.",
      authorId: "u-3",
      status: Status.DECLINED,
      mergedInto: null,
      createdAt: daysAgo(10),
      updatedAt: daysAgo(7),
    },
    {
      id: "req-12",
      title: "Mobile push notifications",
      description:
        "Notify users when a request they voted on changes status or receives an official response.",
      authorId: "u-4",
      status: Status.UNDER_REVIEW,
      mergedInto: null,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
  ],

  votes: [],
  comments: [],
  responses: {},
  activity: [],
}

// [requestId, userId, daysAgo] — one vote per user per request (vote-once).
const votePlan = [
  ["req-1", "u-2", 27], ["req-1", "u-3", 26], ["req-1", "u-4", 25], ["req-1", "u-1", 24],
  ["req-1", "u-5", 23], ["req-1", "u-6", 22], ["req-1", "u-7", 21], ["req-1", "u-8", 18],
  ["req-1", "u-9", 16], ["req-1", "u-10", 14], ["req-1", "u-11", 12], ["req-1", "u-12", 9],
  ["req-2", "u-2", 23], ["req-2", "u-4", 21], ["req-2", "u-3", 18], ["req-2", "u-5", 14], ["req-2", "u-8", 11],
  ["req-3", "u-2", 19], ["req-3", "u-3", 17], ["req-3", "u-4", 15], ["req-3", "u-1", 14],
  ["req-3", "u-6", 13], ["req-3", "u-7", 10], ["req-3", "u-9", 8], ["req-3", "u-10", 5],
  ["req-4", "u-3", 2], ["req-4", "u-4", 2], ["req-4", "u-2", 2], ["req-4", "u-1", 1], ["req-4", "u-5", 1], ["req-4", "u-6", 0],
  ["req-5", "u-2", 17], ["req-5", "u-4", 16], ["req-5", "u-3", 14], ["req-5", "u-7", 13],
  ["req-6", "u-2", 1], ["req-6", "u-3", 1], ["req-6", "u-1", 0],
  ["req-7", "u-4", 11], ["req-7", "u-2", 10], ["req-7", "u-3", 9], ["req-7", "u-1", 8],
  ["req-7", "u-8", 7], ["req-7", "u-9", 6], ["req-7", "u-10", 5],
  ["req-8", "u-2", 14], ["req-8", "u-4", 13], ["req-8", "u-3", 11], ["req-8", "u-1", 9], ["req-8", "u-11", 7],
  ["req-9", "u-2", 7], ["req-9", "u-3", 7], ["req-9", "u-4", 6], ["req-9", "u-1", 6],
  ["req-9", "u-5", 5], ["req-9", "u-6", 4], ["req-9", "u-7", 3], ["req-9", "u-8", 2], ["req-9", "u-9", 1],
  ["req-10", "u-3", 25], ["req-10", "u-4", 25], ["req-10", "u-2", 24], ["req-10", "u-1", 24],
  ["req-11", "u-4", 9], ["req-11", "u-2", 8],
  ["req-12", "u-2", 0], ["req-12", "u-3", 0], ["req-12", "u-4", 0], ["req-12", "u-1", 0], ["req-12", "u-5", 0],
]

for (const [requestId, userId, d] of votePlan) {
  db.votes.push({ userId, requestId, createdAt: daysAgo(d, 3) })
}

// [requestId, authorId, body, daysAgo]
const commentPlan = [
  ["req-1", "u-3", "Would this also cover the request list and admin panels, or just the main app?", 25],
  ["req-1", "u-2", "Everything — we want one consistent theme across the whole product.", 24],
  ["req-1", "u-4", "Please make sure the contrast passes WCAG in dark mode.", 10],
  ["req-4", "u-4", "Polling every few seconds would be a simpler first step than a websocket.", 2],
  ["req-4", "u-2", "Agreed — polling is fine to start, we can move to events later.", 1],
  ["req-9", "u-3", "Will annual plans get a discount like the current pricing page?", 6],
  ["req-9", "u-2", "Yes — 20% on annual, same as today.", 5],
  ["req-12", "u-2", "Only for status changes, or also for official responses?", 0],
]

let commentSeq = 0
for (const [requestId, authorId, body, d] of commentPlan) {
  commentSeq += 1
  db.comments.push({
    id: `c-${commentSeq}`,
    requestId,
    authorId,
    body,
    createdAt: daysAgo(d, 5),
  })
}

db.responses = {
  "req-1": {
    requestId: "req-1",
    authorId: "u-1",
    body: "Shipped in v2.4. Toggle lives in the header and follows system preference by default. Thanks to everyone who voted.",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
  "req-5": {
    requestId: "req-5",
    authorId: "u-1",
    body: "We reviewed this and it duplicates our existing GitHub webhooks integration. Not accepting as a standalone request.",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  "req-9": {
    requestId: "req-9",
    authorId: "u-1",
    body: "Building now. Targeted for the next billing release — invoices will be downloadable from the account page.",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
}

// [requestId, type, actorId, detail, daysAgo]
const activityPlan = [
  ["req-1", "created", "u-2", "created this request", 28],
  ["req-1", "status_changed", "u-1", "moved to Planned", 19],
  ["req-1", "status_changed", "u-1", "moved to In Progress", 12],
  ["req-1", "status_changed", "u-1", "moved to Released", 6],
  ["req-1", "response_posted", "u-1", "posted an official response", 7],
  ["req-10", "created", "u-2", "created this request", 26],
  ["req-10", "merged_into", "u-1", "merged into req-1", 24],
  ["req-2", "created", "u-3", "created this request", 24],
  ["req-2", "status_changed", "u-1", "moved to Planned", 13],
  ["req-3", "created", "u-4", "created this request", 20],
  ["req-3", "status_changed", "u-1", "moved to Planned", 15],
  ["req-3", "status_changed", "u-1", "moved to In Progress", 2],
  ["req-4", "created", "u-2", "created this request", 3],
  ["req-5", "created", "u-3", "created this request", 18],
  ["req-5", "status_changed", "u-1", "moved to Declined", 15],
  ["req-5", "response_posted", "u-1", "posted an official response", 15],
  ["req-6", "created", "u-4", "created this request", 2],
  ["req-7", "created", "u-2", "created this request", 12],
  ["req-7", "status_changed", "u-1", "moved to Planned", 9],
  ["req-8", "created", "u-3", "created this request", 15],
  ["req-8", "status_changed", "u-1", "moved to Released", 4],
  ["req-9", "created", "u-4", "created this request", 8],
  ["req-9", "status_changed", "u-1", "moved to In Progress", 7],
  ["req-9", "response_posted", "u-1", "posted an official response", 1],
  ["req-11", "created", "u-3", "created this request", 10],
  ["req-11", "status_changed", "u-1", "moved to Declined", 7],
  ["req-12", "created", "u-4", "created this request", 1],
]

let activitySeq = 0
for (const [requestId, type, actorId, detail, d] of activityPlan) {
  activitySeq += 1
  db.activity.push({
    id: `a-${activitySeq}`,
    requestId,
    type,
    actorId,
    detail,
    createdAt: daysAgo(d, 2),
  })
}

db.counters = {
  request: db.requests.length,
  comment: commentSeq,
  activity: activitySeq,
}

// Mock session — the dev role switcher writes here; a real auth provider replaces this.
db.sessionUserId = "u-1"

export function getSessionUser() {
  return db.users.find((u) => u.id === db.sessionUserId) ?? null
}

export function setSessionUser(id) {
  const user = db.users.find((u) => u.id === id)
  if (!user) throw new Error(`Unknown user: ${id}`)
  db.sessionUserId = id
  return user
}

export function getUser(id) {
  return db.users.find((u) => u.id === id) ?? null
}

export function requireSession() {
  const user = getSessionUser()
  return user
}

export function requireAdmin() {
  const user = requireSession()
  if (user.role !== Role.ADMIN) return null
  return user
}