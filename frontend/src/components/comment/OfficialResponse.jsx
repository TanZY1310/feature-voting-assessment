import { useState } from "react"
import { toast } from "sonner"
import { BadgeCheckIcon, Loader2Icon, PencilIcon, Trash2Icon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useOfficialResponse } from "@/hooks/useOfficialResponse"
import { getErrorMessage, formatRelative } from "@/lib/format"

export function OfficialResponse({ requestId, response, isAdmin }) {
  const { setResponse, removeResponse } = useOfficialResponse(requestId)
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(response?.body ?? "")

  if (!response && !isAdmin) return null

  const pending = setResponse.isPending || removeResponse.isPending

  const save = () => {
    if (!body.trim()) return
    setResponse.mutate(body, {
      onSuccess: () => {
        setEditing(false)
        toast.success("Official response saved")
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  const remove = () => {
    removeResponse.mutate(undefined, {
      onSuccess: () => toast.success("Official response removed"),
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <BadgeCheckIcon className="size-4 text-primary" />
        <span className="font-heading text-sm font-medium">Official response</span>
        <span className="text-xs text-muted-foreground">
          {response ? `by ${response.author.name} · ${formatRelative(response.updatedAt)}` : "Not yet posted"}
        </span>
        {isAdmin && response && !editing && (
          <div className="ml-auto flex gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(true); setBody(response.body) }}>
              <PencilIcon className="size-3.5" />
              <span className="sr-only">Edit response</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={remove} disabled={pending}>
              <Trash2Icon className="size-3.5 text-destructive" />
              <span className="sr-only">Remove response</span>
            </Button>
          </div>
        )}
      </div>

      {(response && !editing) ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{response.body}</p>
      ) : (
        <div className="space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write the team's official response…"
            aria-label="Official response body"
          />
          <div className="flex justify-end gap-2">
            {response && editing && (
              <Button variant="outline" size="sm" onClick={() => { setEditing(false); setBody(response.body) }} disabled={pending}>
                <XIcon data-icon="inline-start" className="size-4" />
                Cancel
              </Button>
            )}
            <Button size="sm" onClick={save} disabled={pending || !body.trim()}>
              {pending ? <Loader2Icon className="size-4 animate-spin" /> : <BadgeCheckIcon data-icon="inline-start" className="size-4" />}
              {response ? "Save" : "Post"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}