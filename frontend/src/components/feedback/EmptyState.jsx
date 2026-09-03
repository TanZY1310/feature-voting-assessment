import { InboxIcon } from "lucide-react"

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <InboxIcon className="size-6" />
      </span>
      <div className="space-y-1">
        <h3 className="font-heading text-sm font-medium">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}