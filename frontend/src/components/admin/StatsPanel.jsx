import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/request/StatusBadge"
import { EmptyState } from "@/components/feedback/EmptyState"
import { ErrorNotice } from "@/components/feedback/ErrorNotice"
import { Skeleton } from "@/components/ui/skeleton"
import { useStats } from "@/hooks/useStats"

function Kpi({ label, value }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-heading text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  )
}

function StatusDistribution({ distribution }) {
  const max = Math.max(1, ...distribution.map((d) => d.count))
  return (
    <div className="space-y-2">
      {distribution.map((d) => (
        <div key={d.status} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs text-muted-foreground">{d.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.max(3, (d.count / max) * 100)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs tabular-nums">{d.count}</span>
        </div>
      ))}
    </div>
  )
}

function VotesOverTime({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="flex h-32 items-end gap-[3px]">
      {data.map((d) => (
        <div
          key={d.date}
          className="group relative flex-1"
          title={`${d.date}: ${d.count}`}
        >
          <div
            className="w-full rounded-t-sm bg-primary/70 transition-colors group-hover:bg-primary"
            style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  )
}

export function StatsPanel() {
  const { data, isPending, isError, error, refetch } = useStats()

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError) return <ErrorNotice error={error} onRetry={refetch} />

  const kpis = [
    { label: "Total Requests", value: data.totalRequests },
    { label: "Active Requests", value: data.activeRequests },
    { label: "Total Support", value: data.totalSupport },
    { label: "Released Requests", value: data.releasedRequests },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((kpi) => (
          <Kpi key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status distribution</CardTitle>
            <CardDescription>Requests by lifecycle position</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDistribution distribution={data.statusDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Votes over time</CardTitle>
            <CardDescription>Support added per day, last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <VotesOverTime data={data.votesOverTime} />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{data.votesOverTime[0]?.date}</span>
              <span>{data.votesOverTime[data.votesOverTime.length - 1]?.date}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Top voted requests</CardTitle>
          <CardDescription>Highest community support</CardDescription>
        </CardHeader>
        <CardContent>
          {data.topVoted.length === 0 ? (
            <EmptyState title="No requests yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Request</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Support</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topVoted.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.id}
                    </TableCell>
                    <TableCell>
                      <Link to={`/requests/${r.id}`} className="font-medium hover:underline">
                        {r.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {r.support}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}