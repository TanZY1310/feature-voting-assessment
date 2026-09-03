import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { GitMergeIcon, Loader2Icon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Sort } from "@/api/types"
import { StatusBadge } from "@/components/request/StatusBadge"
import { useRequests } from "@/hooks/useRequests"
import { useMerge } from "@/hooks/useMerge"
import { getErrorMessage } from "@/lib/format"

export function MergeDialog({ requestId }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()
  const merge = useMerge()
  const { data, isPending } = useRequests({ q: search, sort: Sort.SUPPORT })

  const options = (data?.items ?? []).filter(
    (r) => r.id !== requestId && r.status !== "redirected"
  )

  const handleOpenChange = (next) => {
    setOpen(next)
    if (!next) {
      setSearch("")
      setSelected(null)
    }
  }

  const confirm = () => {
    if (!selected) return
    merge.mutate(
      { absorbedId: requestId, into: selected.id },
      {
        onSuccess: () => {
          setOpen(false)
          toast.success(`Merged ${requestId} into ${selected.id}`)
          navigate(`/requests/${selected.id}`)
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <GitMergeIcon data-icon="inline-start" className="size-4" />
          Merge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Merge {requestId} into another request</DialogTitle>
          <DialogDescription>
            {requestId} becomes Redirected and points at the survivor. The survivor gains
            the union of voters; comments and activity stay here. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for the survivor…"
            className="pl-8"
            autoFocus
          />
        </div>

        <div className="scroll-my-1 max-h-64 space-y-1 overflow-y-auto rounded-lg border p-1">
          {isPending &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-md bg-muted" />
            ))}
          {!isPending &&
            options.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  selected?.id === r.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
              >
                <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                <span className="min-w-0 flex-1 truncate">{r.title}</span>
                <StatusBadge status={r.status} />
                <span className="shrink-0 text-xs text-muted-foreground">{r.support}</span>
              </button>
            ))}
          {!isPending && options.length === 0 && (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
              No requests to merge into
            </p>
          )}
        </div>

        {merge.error && (
          <p className="text-sm text-destructive">{getErrorMessage(merge.error)}</p>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={merge.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={confirm} disabled={!selected || merge.isPending}>
            {merge.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <GitMergeIcon data-icon="inline-start" className="size-4" />
            )}
            Merge {requestId} into {selected?.id ? `#${selected.id}` : "…"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}