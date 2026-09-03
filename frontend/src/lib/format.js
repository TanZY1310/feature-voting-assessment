export function formatRelative(iso) {
  const then = new Date(iso).getTime()
  const seconds = Math.round((Date.now() - then) / 1000)
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ]
  for (const [name, size] of units) {
    const amount = Math.floor(seconds / size)
    if (amount >= 1) return `${amount}${name[0]} ago`
  }
  return "just now"
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatFullDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function getErrorMessage(error) {
  if (error && typeof error.message === "string" && error.message) return error.message
  return "Something went wrong"
}