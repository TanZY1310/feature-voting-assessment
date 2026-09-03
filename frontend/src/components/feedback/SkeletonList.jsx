import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonList({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-xl border p-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-7 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}