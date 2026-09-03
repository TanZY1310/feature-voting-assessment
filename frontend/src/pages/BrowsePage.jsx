import { Button } from "@/components/ui/button"
import { RequestFilters } from "@/components/request/RequestFilters"
import { RequestList } from "@/components/request/RequestList"
import { SkeletonList } from "@/components/feedback/SkeletonList"
import { ErrorNotice } from "@/components/feedback/ErrorNotice"
import { EmptyState } from "@/components/feedback/EmptyState"
import { useBrowseParams } from "@/hooks/useBrowseParams"
import { useRequests } from "@/hooks/useRequests"

export function BrowsePage() {
  const { params, setParams, clear } = useBrowseParams()
  const { data, isPending, isError, error, refetch } = useRequests(params)
  const hasFilters = Boolean(params.q || params.status)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Feature requests</h1>
        <p className="text-sm text-muted-foreground">
          Browse what the community is asking for, and vote to show your support.
        </p>
      </div>

      <RequestFilters params={params} onChange={setParams} onClear={clear} />

      {isPending ? (
        <SkeletonList rows={5} />
      ) : isError ? (
        <ErrorNotice error={error} onRetry={refetch} />
      ) : data.items.length === 0 ? (
        <EmptyState
          title="No requests match your filters"
          description="Try clearing the search or filters to see everything."
          action={
            hasFilters ? (
              <Button variant="outline" size="sm" onClick={clear}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {data.total} request{data.total === 1 ? "" : "s"}
          </p>
          <RequestList items={data.items} />
        </>
      )}
    </div>
  )
}