import { TriangleAlertIcon, RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/format"

export function ErrorNotice({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-5" />
      </span>
      <div className="space-y-1">
        <h3 className="font-heading text-sm font-medium">Something went wrong</h3>
        <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCwIcon data-icon="inline-start" className="size-4" />
          Try again
        </Button>
      )}
    </div>
  )
}