import { Link } from "react-router-dom"
import { MessageSquareIcon, GitMergeIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ACTIVE_STATUSES } from "@/api/types"
import { StatusBadge } from "./StatusBadge"
import { VoteButton } from "@/components/vote/VoteButton"
import { formatRelative } from "@/lib/format"

export function RequestCard({ request }) {
  const isRedirected = request.status === "redirected"
  return (
    <Card className="transition-colors hover:bg-muted/30">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              to={`/requests/${request.id}`}
              className="font-heading text-sm font-medium leading-snug hover:underline"
            >
              {request.title}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={request.status} />
              {isRedirected && request.mergedInto && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <GitMergeIcon className="size-3" />
                  merged into <Link to={`/requests/${request.mergedInto}`} className="hover:underline">#{request.mergedInto}</Link>
                </span>
              )}
            </div>
          </div>
          <VoteButton
            requestId={request.id}
            support={request.support}
            votedByMe={request.votedByMe}
            canVote={!isRedirected && ACTIVE_STATUSES.includes(request.status)}
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            by <span className="font-medium text-foreground">{request.author.name}</span>
          </span>
          <span aria-hidden>·</span>
          <span>{formatRelative(request.createdAt)}</span>
          <span className="ml-auto inline-flex items-center gap-1">
            <MessageSquareIcon className="size-3.5" />
            {request.commentCount}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}