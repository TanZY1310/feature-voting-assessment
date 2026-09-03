import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { GitMergeIcon, Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
import { StatusBadge } from "./StatusBadge"
import { RequestPipeline } from "./RequestPipeline"
import { ActivityList } from "./ActivityList"
import { VoteButton } from "@/components/vote/VoteButton"
import { OfficialResponse } from "@/components/comment/OfficialResponse"
import { CommentComposer } from "@/components/comment/CommentComposer"
import { CommentList } from "@/components/comment/CommentList"
import { StatusChangeMenu } from "@/components/admin/StatusChangeMenu"
import { MergeDialog } from "@/components/admin/MergeDialog"
import { useSession } from "@/hooks/useSession"
import { useDeleteRequest } from "@/hooks/useDeleteRequest"
import { formatDate, formatRelative, getErrorMessage } from "@/lib/format"

function DeleteRequestButton({ requestId }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const mutation = useDeleteRequest(requestId)

  const confirm = () => {
    mutation.mutate(undefined, {
      onSuccess: () => {
        setOpen(false)
        toast.success("Request deleted")
        navigate("/")
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2Icon data-icon="inline-start" className="size-4 text-destructive" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this request?</DialogTitle>
          <DialogDescription>
            The request, its votes, comments, and activity are removed permanently.
          </DialogDescription>
        </DialogHeader>
        {mutation.error && <p className="text-sm text-destructive">{getErrorMessage(mutation.error)}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={mutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={confirm} disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <Trash2Icon data-icon="inline-start" className="size-4" />
            )}
            Delete request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RequestDetail({ request }) {
  const { user } = useSession()
  const isAdmin = user?.role === "admin"
  const isAuthor = user?.id === request.author.id
  const isRedirected = request.status === "redirected"

  return (
    <article className="space-y-6">
      {request.mergedIntoRequest && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
          <GitMergeIcon className="size-4 shrink-0 text-muted-foreground" />
          <span>
            This request was merged into{" "}
            <Link to={`/requests/${request.mergedIntoRequest.id}`} className="font-medium text-primary hover:underline">
              #{request.mergedIntoRequest.id} — {request.mergedIntoRequest.title}
            </Link>
            . Votes now count toward that request.
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-xl font-semibold leading-snug">{request.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            by <span className="font-medium text-foreground">{request.author.name}</span> · created{" "}
            {formatDate(request.createdAt)} · updated {formatRelative(request.updatedAt)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <VoteButton
            requestId={request.id}
            support={request.support}
            votedByMe={request.votedByMe}
            canVote={request.canVote}
            className="min-w-20"
          />
          {!request.canVote && (
            <span className="text-xs text-muted-foreground">Voting is closed</span>
          )}
          {isAdmin && !isRedirected && (
            <div className="flex items-center gap-1.5">
              <StatusChangeMenu requestId={request.id} currentStatus={request.status} />
              <MergeDialog requestId={request.id} />
            </div>
          )}
          {(isAdmin || isAuthor) && (
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/requests/${request.id}/edit`}>
                  <PencilIcon data-icon="inline-start" className="size-4" />
                  Edit
                </Link>
              </Button>
              <DeleteRequestButton requestId={request.id} />
            </div>
          )}
        </div>
      </div>

      <RequestPipeline status={request.status} />

      {request.mergedFrom.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Absorbed from:{" "}
          {request.mergedFrom.map((r, i) => (
            <span key={r.id}>
              {i > 0 && ", "}
              <Link to={`/requests/${r.id}`} className="font-mono text-primary hover:underline">
                {r.id}
              </Link>
            </span>
          ))}
        </p>
      )}

      <section>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{request.description}</p>
      </section>

      <Separator />

      <section className="space-y-4">
        <OfficialResponse
          requestId={request.id}
          response={request.officialResponse}
          isAdmin={isAdmin}
        />
        <div className="space-y-3">
          <CommentComposer requestId={request.id} />
          <CommentList comments={request.comments} />
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="mb-3 font-heading text-sm font-medium">Activity</h2>
        <ActivityList entries={request.activity} />
      </section>
    </article>
  )
}