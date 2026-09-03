import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatRelative } from "@/lib/format"

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function CommentItem({ comment }) {
  return (
    <div className="flex gap-3">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback>{initials(comment.author.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">{formatRelative(comment.createdAt)}</span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.body}</p>
      </div>
    </div>
  )
}