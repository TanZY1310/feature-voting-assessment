import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { BarChart3Icon, LayersIcon, PlusIcon, SparklesIcon } from "lucide-react"
import { Link, NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSession } from "@/hooks/useSession"
import { RoleSwitcher } from "./RoleSwitcher"

const navItem = ({ isActive }) =>
  cn(
    "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  )

function AdminLinks({ isAdmin }) {
  if (!isAdmin) return null
  return (
    <>
      <NavLink to="/admin/review" className={navItem}>
        <LayersIcon className="size-4" />
        Review
      </NavLink>
      <NavLink to="/admin/stats" className={navItem}>
        <BarChart3Icon className="size-4" />
        Stats
      </NavLink>
    </>
  )
}

export function Header() {
  const { user } = useSession()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SparklesIcon className="size-4" />
          </span>
          FeatureBoard
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navItem}>
            Browse
          </NavLink>
          <AdminLinks isAdmin={user?.role === "admin"} />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" asChild>
            <Link to="/requests/new">
              <PlusIcon data-icon="inline-start" className="size-4" />
              New request
            </Link>
          </Button>
          <RoleSwitcher />
        </div>
      </div>
    </header>
  )
}