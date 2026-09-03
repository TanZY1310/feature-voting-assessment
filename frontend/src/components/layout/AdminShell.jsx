import { Link, Navigate, Outlet, useLocation } from "react-router-dom"
import { ShieldAlertIcon } from "lucide-react"
import { Header } from "./Header"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useSession } from "@/hooks/useSession"

function ForbiddenNotice() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlertIcon className="size-6" />
      </span>
      <div className="space-y-1">
        <h1 className="font-heading text-lg font-medium">403 — Admin access required</h1>
        <p className="text-sm text-muted-foreground">
          You need the admin role to view this page. Sign in with an admin account
          (e.g. <span className="font-medium">lee@example.com</span>).
        </p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link to="/">Back to browse</Link>
      </Button>
    </div>
  )
}

export function AdminShell() {
  const { user, isPending } = useSession()
  const location = useLocation()

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col">
        <div className="h-14 border-b" />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">
          <ForbiddenNotice />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}