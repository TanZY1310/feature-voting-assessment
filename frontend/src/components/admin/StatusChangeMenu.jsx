import { useState } from "react"
import { toast } from "sonner"
import { ArrowRightLeftIcon, Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { STATUS_LABELS, Status } from "@/api/types"
import { useStatusChange } from "@/hooks/useStatusChange"
import { getErrorMessage } from "@/lib/format"

const OPTIONS = [
  Status.UNDER_REVIEW,
  Status.PLANNED,
  Status.IN_PROGRESS,
  Status.RELEASED,
  Status.DECLINED,
]

export function StatusChangeMenu({ requestId, currentStatus }) {
  const [open, setOpen] = useState(false)
  const mutation = useStatusChange()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <ArrowRightLeftIcon data-icon="inline-start" className="size-4" />
          )}
          Move
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Move to…</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.filter((s) => s !== currentStatus).map((s) => (
          <DropdownMenuItem
            key={s}
            disabled={mutation.isPending}
            onSelect={() => {
              setOpen(false)
              mutation.mutate(
                { id: requestId, status: s },
                {
                  onSuccess: () => toast.success(`Moved to ${STATUS_LABELS[s]}`),
                  onError: (error) => toast.error(getErrorMessage(error)),
                }
              )
            }}
          >
            {STATUS_LABELS[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}