import { useLocation, useNavigate } from "react-router-dom"
import { ArrowUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useVote } from "@/hooks/useVote"
import { useSession } from "@/hooks/useSession"

export function VoteButton({
  requestId,
  support,
  votedByMe,
  canVote = true,
  className,
}) {
  const { vote, unvote, isPending } = useVote()
  const { user } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = () => {
    if (!canVote) return
    if (!user) {
      navigate("/login", { state: { from: location.pathname + location.search } })
      return
    }
    if (votedByMe) unvote(requestId)
    else vote(requestId)
  }

  return (
    <Button
      variant={votedByMe ? "default" : "outline"}
      size="sm"
      aria-pressed={votedByMe}
      disabled={isPending || !canVote}
      onClick={handleClick}
      className={className}
    >
      <ArrowUpIcon data-icon="inline-start" className={cn("size-4", votedByMe && "fill-current")} />
      <span data-slot="vote-count">{support}</span>
      <span className="sr-only">
        {votedByMe ? "Remove your vote" : `Vote — ${support} supporter${support === 1 ? "" : "s"}`}
      </span>
    </Button>
  )
}