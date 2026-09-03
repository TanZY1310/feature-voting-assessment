import { StatsPanel } from "@/components/admin/StatsPanel"

export function StatsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Usage statistics</h1>
        <p className="text-sm text-muted-foreground">
          Community signal, pipeline health, and shipping velocity across all requests.
        </p>
      </div>
      <StatsPanel />
    </div>
  )
}