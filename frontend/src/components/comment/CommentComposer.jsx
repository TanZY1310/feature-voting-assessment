import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2Icon, LogInIcon, SendIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useComment } from "@/hooks/useComment"
import { useSession } from "@/hooks/useSession"
import { getErrorMessage } from "@/lib/format"

export function CommentComposer({ requestId }) {
  const [body, setBody] = useState("")
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useSession()
  const mutation = useComment(requestId)

  if (!user) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Sign in to join the discussion.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/login", { state: { from: location.pathname + location.search } })}
        >
          <LogInIcon data-icon="inline-start" className="size-4" />
          Sign in
        </Button>
      </div>
    )
  }

  const submit = () => {
    if (!body.trim()) return
    mutation.mutate(body, {
      onSuccess: () => {
        setBody("")
        toast.success("Comment posted")
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Join the discussion…"
        aria-label="Comment"
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={submit} disabled={mutation.isPending || !body.trim()}>
          {mutation.isPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SendIcon data-icon="inline-start" className="size-4" />
          )}
          Comment
        </Button>
      </div>
      {mutation.error && (
        <p className="text-sm text-destructive">{getErrorMessage(mutation.error)}</p>
      )}
    </div>
  )
}