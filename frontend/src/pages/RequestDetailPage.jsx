import { Link, useParams } from "react-router-dom"
import { ArrowLeftIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { RequestDetail } from "@/components/request/RequestDetail"
import { ErrorNotice } from "@/components/feedback/ErrorNotice"
import { EmptyState } from "@/components/feedback/EmptyState"
import { useRequest } from "@/hooks/useRequest"

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

export function RequestDetailPage() {
  const { id } = useParams()
  const { data, isPending, isError, error, refetch } = useRequest(id)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to browse
      </Link>

      {isPending ? (
        <DetailSkeleton />
      ) : isError ? (
        error?.code === "NOT_FOUND" ? (
          <EmptyState
            title="Request not found"
            description="This request may have been deleted."
          />
        ) : (
          <ErrorNotice error={error} onRetry={refetch} />
        )
      ) : (
        <RequestDetail request={data} />
      )}
    </div>
  )
}