import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2Icon, SaveIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateRequest } from "@/hooks/useUpdateRequest"
import { getErrorMessage } from "@/lib/format"

export function EditRequestForm({ request }) {
  const [title, setTitle] = useState(request.title)
  const [description, setDescription] = useState(request.description)
  const navigate = useNavigate()
  const mutation = useUpdateRequest(request.id)

  const submit = (event) => {
    event.preventDefault()
    if (!title.trim()) return
    mutation.mutate(
      { title, description },
      {
        onSuccess: () => {
          toast.success("Changes saved")
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
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
        />
      </div>
      {mutation.error && (
        <p className="text-sm text-destructive">{getErrorMessage(mutation.error)}</p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => navigate(`/requests/${request.id}`)} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending || !title.trim()}>
          {mutation.isPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SaveIcon data-icon="inline-start" className="size-4" />
          )}
          {mutation.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}