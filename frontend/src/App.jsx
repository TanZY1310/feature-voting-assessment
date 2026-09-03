import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AppShell } from "@/components/layout/AppShell"
import { AdminShell } from "@/components/layout/AdminShell"
import { BrowsePage } from "@/pages/BrowsePage"
import { LoginPage } from "@/pages/LoginPage"
import { RequestDetailPage } from "@/pages/RequestDetailPage"
import { SubmitRequestPage } from "@/pages/SubmitRequestPage"
import { EditRequestPage } from "@/pages/EditRequestPage"
import { ReviewPage } from "@/pages/admin/ReviewPage"
import { StatsPage } from "@/pages/admin/StatsPage"
import { useSession } from "@/hooks/useSession"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: 1,
    },
  },
})

function RequireAuth({ children }) {
  const location = useLocation()
  const { user, isPending } = useSession()
  if (isPending) return null
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="text-sm text-primary hover:underline">
        Back to browse
      </Link>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <BrowsePage />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/requests/new"
              element={
                <RequireAuth>
                  <SubmitRequestPage />
                </RequireAuth>
              }
            />
            <Route
              path="/requests/:id"
              element={
                <RequireAuth>
                  <RequestDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/requests/:id/edit"
              element={
                <RequireAuth>
                  <EditRequestPage />
                </RequireAuth>
              }
            />
          </Route>
          <Route element={<AdminShell />}>
            <Route path="/admin/review" element={<ReviewPage />} />
            <Route path="/admin/stats" element={<StatsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App