// One source of truth for domain enums and DTO shapes.
// Re-exported by components (badges, filters) and consumed by the mock.

export const Status = {
  UNDER_REVIEW: "under_review",
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  RELEASED: "released",
  DECLINED: "declined",
  REDIRECTED: "redirected",
}

export const STATUS_LABELS = {
  [Status.UNDER_REVIEW]: "Under Review",
  [Status.PLANNED]: "Planned",
  [Status.IN_PROGRESS]: "In Progress",
  [Status.RELEASED]: "Released",
  [Status.DECLINED]: "Declined",
  [Status.REDIRECTED]: "Redirected",
}

// The active progression rendered by the Pipeline stepper.
export const PIPELINE_STATUSES = [
  Status.UNDER_REVIEW,
  Status.PLANNED,
  Status.IN_PROGRESS,
  Status.RELEASED,
]

// Statuses on which voting is still open.
export const ACTIVE_STATUSES = [
  Status.UNDER_REVIEW,
  Status.PLANNED,
  Status.IN_PROGRESS,
]

export const Sort = {
  SUPPORT: "support",
  NEWEST: "newest",
}

export const Role = {
  USER: "user",
  ADMIN: "admin",
}

/**
 * @typedef {object} User
 * @property {string} id
 * @property {string} name
 * @property {"user"|"admin"} role
 */

/**
 * @typedef {object} RequestSummary
 * @property {string} id
 * @property {string} title
 * @property {string} status
 * @property {number} support        // unique voter count
 * @property {number} commentCount
 * @property {boolean} votedByMe
 * @property {{id: string, name: string}} author
 * @property {string|null} mergedInto  // survivor id when redirected
 * @property {string} createdAt
 */

/**
 * @typedef {object} Comment
 * @property {string} id
 * @property {string} requestId
 * @property {{id: string, name: string}} author
 * @property {string} body
 * @property {string} createdAt
 */

/**
 * @typedef {object} OfficialResponse
 * @property {string} requestId
 * @property {{id: string, name: string}} author
 * @property {string} body
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {object} ActivityEntry
 * @property {string} id
 * @property {string} requestId
 * @property {"created"|"status_changed"|"merged_into"|"response_posted"|"response_edited"|"response_removed"} type
 * @property {{id: string, name: string}} actor
 * @property {string} detail
 * @property {string} createdAt
 */

/**
 * @typedef {object} RequestDetail
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} status
 * @property {number} support
 * @property {boolean} votedByMe
 * @property {boolean} canVote
 * @property {{id: string, name: string}} author
 * @property {string|null} mergedInto
 * @property {{id: string, title: string}|null} mergedIntoRequest
 * @property {Array<{id: string, title: string}>} mergedFrom
 * @property {OfficialResponse|null} officialResponse
 * @property {Comment[]} comments
 * @property {ActivityEntry[]} activity
 * @property {string} createdAt
 * @property {string} updatedAt
 */