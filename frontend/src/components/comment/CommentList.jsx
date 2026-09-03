import { MessageSquareIcon } from "lucide-react"
import { CommentItem } from "./CommentItem"

export function CommentList({ comments }) {
  if (comments.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-8 text-sm text-muted-foreground">
        <MessageSquareIcon className="size-4" />
        No comments yet — start the discussion.
      </div>
    )
  }
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  )
}