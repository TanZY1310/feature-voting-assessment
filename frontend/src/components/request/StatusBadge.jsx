import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS, Status } from "@/api/types"

const STATUS_STYLES = {
  [Status.UNDER_REVIEW]: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  [Status.PLANNED]: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  [Status.IN_PROGRESS]: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  [Status.RELEASED]: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  [Status.DECLINED]: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  [Status.REDIRECTED]: "bg-muted text-muted-foreground",
}

export function StatusBadge({ status, className }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", STATUS_STYLES[status], className)}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}