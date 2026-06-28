"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Activity, ArrowRight, LayoutDashboard, Shield, UserRound } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { NetworkAnimation } from "@/components/network-animation"
import { ENDPOINTS } from "@/lib/config"

const GUEST_KEY = "mad-hot-guest-mode"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(ENDPOINTS.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Login failed")
      }

      localStorage.removeItem(GUEST_KEY)
      login(data.access_token)
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not reach the backend")
    } finally {
      setLoading(false)
    }
  }

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_KEY, "true")
    router.push("/")
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 cyber-grid" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/65 to-background" />
      <NetworkAnimation />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="hidden lg:block">
          <Link href="/" className="mb-10 inline-flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Shield className="h-7 w-7 text-primary-foreground" />
              <div className="absolute inset-0 rounded-xl bg-primary/50 blur-sm" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              MAD-HOT <span className="text-primary">IDS</span>
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Research-Backed AI Security</span>
          </div>

          <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-tight">
            Continue your intrusion detection workspace.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Login to keep dashboard activity, attack intelligence, and uploaded traffic analyses attached to your account.
          </p>

          <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/60 bg-card/50 p-4 backdrop-blur-sm">
              <Activity className="mb-4 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold">Live</p>
              <p className="text-sm text-muted-foreground">IDS monitoring</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card/50 p-4 backdrop-blur-sm">
              <LayoutDashboard className="mb-4 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold">Private</p>
              <p className="text-sm text-muted-foreground">User-specific data</p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md rounded-2xl border border-primary/30 bg-background/90 p-6 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Login to MAD-HOT IDS</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your personalized intrusion detection dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="h-11 w-full rounded-md border border-border bg-background/70 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="h-11 w-full rounded-md border border-border bg-background/70 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error && <p className="text-center text-sm text-destructive">{error}</p>}

            <Button onClick={handleLogin} disabled={loading} className="h-11 w-full gap-2 glow-cyan">
              <UserRound className="h-4 w-4" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <Button onClick={continueAsGuest} variant="outline" className="h-11 w-full gap-2">
              Continue as Guest
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
