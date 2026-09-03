import { Card, CardContent } from "@/components/ui/card"
import { SubmitRequestForm } from "@/components/request/SubmitRequestForm"

export function SubmitRequestPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Submit a request</h1>
        <p className="text-sm text-muted-foreground">
          New requests start Under Review. Admins triage them from the review queue.
        </p>
      </div>
      <Card>
        <CardContent className="py-6">
          <SubmitRequestForm />
        </CardContent>
      </Card>
    </div>
  )
}