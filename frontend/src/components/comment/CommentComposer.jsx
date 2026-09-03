import { useState } from "react"
import { toast } from "sonner"
import { Loader2Icon, SendIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useComment } from "@/hooks/useComment"
import { getErrorMessage } from "@/lib/format"

export function CommentComposer({ requestId }) {
  const [body, setBody] = useState("")
  const mutation = useComment(requestId)

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