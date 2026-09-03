import { Link, useNavigate } from "react-router-dom"
import { ChevronDownIcon, LogOutIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession } from "@/hooks/useSession"

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function UserMenu() {
  const { user, logout } = useSession()
  const navigate = useNavigate()

  if (!user) {
    return (
      <Button size="sm" asChild>
        <Link to="/login">Sign in</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 pr-2">
          <Avatar className="size-6">
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="max-w-32 truncate text-sm">{user.name}</span>
          <Badge variant="secondary" className="capitalize">
            {user.role}
          </Badge>
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>
          Signed in as{" "}
          <span className="font-medium text-foreground">{user.name}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => logout.mutate(undefined, { onSettled: () => navigate("/") })}
        >
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}