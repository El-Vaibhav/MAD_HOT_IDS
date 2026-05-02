"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NetworkAnimation } from "@/components/network-animation"
import { ENDPOINTS } from "@/lib/config"

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(ENDPOINTS.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Registration failed")
      }

      router.push("/login")

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not reach backend")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 cyber-grid" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/65 to-background" />
      <NetworkAnimation />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        
        {/* LEFT SECTION */}
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

          <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-tight">
            Create your intrusion detection workspace.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Register to start monitoring network traffic, detect anomalies, and access real-time threat intelligence powered by AI.
          </p>
        </section>

        {/* RIGHT SECTION (FORM) */}
        <section className="mx-auto w-full max-w-md rounded-2xl border border-primary/30 bg-background/90 p-6 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-8">
          
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <UserPlus className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Create Account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join MAD-HOT IDS and secure your network insights.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="h-11 w-full rounded-md border border-border bg-background/70 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="h-11 w-full rounded-md border border-border bg-background/70 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}

            <Button
              onClick={handleRegister}
              disabled={loading}
              className="h-11 w-full gap-2 glow-cyan"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}