import { Link } from "react-router-dom"
import { GitMergeIcon, MessageSquareIcon, ArrowUpRightIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/request/StatusBadge"
import { StatusChangeMenu } from "./StatusChangeMenu"
import { MergeDialog } from "./MergeDialog"
import { EmptyState } from "@/components/feedback/EmptyState"
import { ErrorNotice } from "@/components/feedback/ErrorNotice"
import { SkeletonList } from "@/components/feedback/SkeletonList"
import { useRequests } from "@/hooks/useRequests"
import { formatRelative } from "@/lib/format"

function ReviewRow({ request }) {
  const isRedirected = request.status === "redirected"
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              to={`/requests/${request.id}`}
              className="font-heading text-sm font-medium leading-snug hover:underline"
            >
              {request.title}
            </Link>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={request.status} />
              <span className="text-xs text-muted-foreground">
                {request.support} supporter{request.support === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {isRedirected ? (
              request.mergedInto ? (
                <Link
                  to={`/requests/${request.mergedInto}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <GitMergeIcon className="size-3.5" />
                  into #{request.mergedInto}
                </Link>
              ) : null
            ) : (
              <>
                <StatusChangeMenu requestId={request.id} currentStatus={request.status} />
                <MergeDialog requestId={request.id} />
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            by <span className="font-medium text-foreground">{request.author.name}</span>
          </span>
          <span aria-hidden>·</span>
          <span>{formatRelative(request.createdAt)}</span>
          <span className="inline-flex items-center gap-1">
            <MessageSquareIcon className="size-3.5" />
            {request.commentCount}
          </span>
          <Link
            to={`/requests/${request.id}`}
            className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
          >
            View & respond
            <ArrowUpRightIcon className="size-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function ReviewQueue({ status }) {
  const { data, isPending, isError, error, refetch } = useRequests({ status })

  if (isPending) return <SkeletonList rows={5} />
  if (isError) return <ErrorNotice error={error} onRetry={refetch} />
  if (data.items.length === 0) {
    return (
      <EmptyState
        title="Queue is empty"
        description={
          status
            ? `No requests are currently ${status.replace("_", " ")}.`
            : "No requests match this view yet."
        }
      />
    )
  }

  return (
    <div className="space-y-2">
      {data.items.map((request) => (
        <ReviewRow key={request.id} request={request} />
      ))}
    </div>
  )
}