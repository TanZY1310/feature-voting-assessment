import { RequestCard } from "./RequestCard"

export function RequestList({ items }) {
  return (
    <div className="space-y-3">
      {items.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  )
}