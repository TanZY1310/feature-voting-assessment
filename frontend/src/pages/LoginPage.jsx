import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2Icon, LogInIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "@/hooks/useSession"
import { getErrorMessage } from "@/lib/format"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useSession()
  const from = location.state?.from ?? "/"

  const submit = (event) => {
    event.preventDefault()
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Signed in")
          navigate(from, { replace: true })
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-16">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Access your feature requests and votes.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Welcome back</CardTitle>
          <CardDescription>Use your account email and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {login.error && (
              <p className="text-sm text-destructive">{getErrorMessage(login.error)}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={login.isPending || !email.trim() || !password}
            >
              {login.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <LogInIcon data-icon="inline-start" className="size-4" />
              )}
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        Dev accounts — admin:{" "}
        <span className="font-medium text-foreground">lee@example.com</span>, user:{" "}
        <span className="font-medium text-foreground">sam@example.com</span>. Password:{" "}
        <span className="font-medium text-foreground">password</span>
      </p>
    </div>
  )
}