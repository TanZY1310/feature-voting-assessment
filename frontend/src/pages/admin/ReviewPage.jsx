import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewQueue } from "@/components/admin/ReviewQueue"

const TABS = [
  ["", "All"],
  ["under_review", "Under Review"],
  ["planned", "Planned"],
  ["in_progress", "In Progress"],
  ["declined", "Declined"],
]

export function ReviewPage() {
  const [status, setStatus] = useState("under_review")

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Review queue</h1>
        <p className="text-sm text-muted-foreground">
          Triage requests: move status, merge duplicates, and respond.
        </p>
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {TABS.map(([value, label]) => (
            <TabsTrigger key={value} value={value} className="shrink-0">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={status} className="mt-4">
          <ReviewQueue status={status} />
        </TabsContent>
      </Tabs>
    </div>
  )
}