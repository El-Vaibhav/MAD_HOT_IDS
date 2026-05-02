"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Activity, ArrowRight, Shield, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ENDPOINTS } from "@/lib/config"
import { useAuth } from "@/context/AuthContext"

const GUEST_KEY = "mad-hot-guest-mode"

export function AuthEntryDialog() {
  const { user, login } = useAuth()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) return

    const guestMode = localStorage.getItem(GUEST_KEY)
    if (!guestMode) {
      const timer = window.setTimeout(() => setOpen(true), 500)
      return () => window.clearTimeout(timer)
    }
  }, [user])

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_KEY, "true")
    setOpen(false)
  }

  const handleLogin = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(ENDPOINTS.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Login failed")
      }

      localStorage.removeItem(GUEST_KEY)
      login(data.access_token)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the backend")
    } finally {
      setLoading(false)
    }
  }

  if (user) return null

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) continueAsGuest()
      else setOpen(true)
    }}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden border-primary/30 bg-background/95 p-0 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:max-w-3xl"
      >
        <div className="relative grid md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative hidden overflow-hidden border-r border-border/60 bg-primary/5 p-8 md:block">
            <div className="absolute inset-0 cyber-grid opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background" />
            <div className="relative flex h-full min-h-96 flex-col justify-between">
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  <Shield className="h-8 w-8" />
                </div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Activity className="h-3.5 w-3.5" />
                  Research-Backed AI Security
                </p>
                <h2 className="text-3xl font-bold leading-tight">
                  MAD-HOT <span className="text-primary text-glow-cyan">IDS</span>
                </h2>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Sign in to keep your attack intelligence, dashboard history, and packet analysis separated from other users.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border/60 bg-card/60 p-3">
                  <p className="text-xl font-bold text-primary">99%</p>
                  <p className="text-xs text-muted-foreground">Detection Accuracy</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/60 p-3">
                  <p className="text-xl font-bold text-primary">Live</p>
                  <p className="text-xs text-muted-foreground">IDS Monitoring</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <DialogHeader className="text-left">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary md:hidden">
                <Shield className="h-6 w-6" />
              </div>
              <DialogTitle className="text-2xl">Start Secure Session</DialogTitle>
              <DialogDescription>
                Login for personalized detection history, or continue as guest to explore shared legacy data.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 w-full rounded-md border border-border bg-background/70 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-md border border-border bg-background/70 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button onClick={handleLogin} disabled={loading} className="h-11 w-full gap-2 glow-cyan">
                <UserRound className="h-4 w-4" />
                {loading ? "Signing in..." : "Login"}
              </Button>

              <Button onClick={continueAsGuest} variant="outline" className="h-11 w-full gap-2">
                Continue as Guest
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                New to MAD-HOT IDS?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
