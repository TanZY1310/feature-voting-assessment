import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2Icon, SendIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateRequest } from "@/hooks/useCreateRequest"
import { getErrorMessage } from "@/lib/format"

export function SubmitRequestForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const navigate = useNavigate()
  const mutation = useCreateRequest()

  const submit = (event) => {
    event.preventDefault()
    if (!title.trim()) return
    mutation.mutate(
      { title, description },
      {
        onSuccess: (request) => {
          toast.success("Submitted — under review")
          navigate(`/requests/${request.id}`)
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A short, specific title"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you asking for, and why does it matter?"
          rows={6}
        />
      </div>
      {mutation.error && (
        <p className="text-sm text-destructive">{getErrorMessage(mutation.error)}</p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => navigate("/")} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending || !title.trim()}>
          {mutation.isPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SendIcon data-icon="inline-start" className="size-4" />
          )}
          {mutation.isPending ? "Submitting…" : "Submit request"}
        </Button>
      </div>
    </form>
  )
}