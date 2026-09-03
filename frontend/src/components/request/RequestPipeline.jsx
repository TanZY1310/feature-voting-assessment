import { Fragment } from "react"
import { cn } from "@/lib/utils"
import { PIPELINE_STATUSES, STATUS_LABELS } from "@/api/types"

// The stepped pipeline bar — a rendering of current status, not a log.
// Terminal statuses (declined / redirected) render no bar.
export function RequestPipeline({ status, className }) {
  const index = PIPELINE_STATUSES.indexOf(status)
  if (index === -1) return null

  return (
    <div className={cn("flex items-center", className)} role="list" aria-label="Status pipeline">
      {PIPELINE_STATUSES.map((s, i) => {
        const done = i < index
        const current = i === index
        return (
          <Fragment key={s}>
            {i > 0 && (
              <div
                className={cn("mx-2 h-px flex-1", done || current ? "bg-primary" : "bg-border")}
                aria-hidden
              />
            )}
            <div className="flex items-center gap-1.5" role="listitem">
              <span
                className={cn(
                  "size-2.5 rounded-full",
                  done && "bg-primary",
                  current && "bg-primary ring-4 ring-primary/15",
                  !done && !current && "bg-border"
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "text-xs whitespace-nowrap",
                  current ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {STATUS_LABELS[s]}
              </span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}