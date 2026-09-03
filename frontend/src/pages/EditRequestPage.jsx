import { useParams } from "react-router-dom"
import { ShieldAlertIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EditRequestForm } from "@/components/request/EditRequestForm"
import { ErrorNotice } from "@/components/feedback/ErrorNotice"
import { EmptyState } from "@/components/feedback/EmptyState"
import { useRequest } from "@/hooks/useRequest"
import { useSession } from "@/hooks/useSession"

export function EditRequestPage() {
  const { id } = useParams()
  const { user } = useSession()
  const { data, isPending, isError, error, refetch } = useRequest(id)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Edit request</h1>
        <p className="text-sm text-muted-foreground">
          Only the author or an admin can edit a request.
        </p>
      </div>

      {isPending ? (
        <Skeleton className="h-72 w-full" />
      ) : isError ? (
        error?.code === "NOT_FOUND" ? (
          <EmptyState title="Request not found" description="This request may have been deleted." />
        ) : (
          <ErrorNotice error={error} onRetry={refetch} />
        )
      ) : user?.role === "admin" || user?.id === data.author.id ? (
        <Card>
          <CardContent className="py-6">
            <EditRequestForm request={data} />
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="You can't edit this request"
          description="Only the author or an admin can edit this request."
          action={
            <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlertIcon className="size-5" />
            </span>
          }
        />
      )}
    </div>
  )
}