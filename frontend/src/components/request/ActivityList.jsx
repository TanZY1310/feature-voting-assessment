import {
  ArrowRightLeftIcon,
  BadgeCheckIcon,
  GitMergeIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react"
import { formatRelative } from "@/lib/format"

const ICONS = {
  created: SparklesIcon,
  status_changed: ArrowRightLeftIcon,
  merged_into: GitMergeIcon,
  response_posted: BadgeCheckIcon,
  response_edited: BadgeCheckIcon,
  response_removed: Trash2Icon,
}

export function ActivityList({ entries }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>
  }
  return (
    <ol className="space-y-3">
      {entries.map((entry) => {
        const Icon = ICONS[entry.type] ?? SparklesIcon
        return (
          <li key={entry.id} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <p>
                <span className="font-medium">{entry.actor.name}</span>{" "}
                <span className="text-muted-foreground">{entry.detail}</span>
              </p>
              <p className="text-xs text-muted-foreground">{formatRelative(entry.createdAt)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}