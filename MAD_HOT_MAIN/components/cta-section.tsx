"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, ArrowRight, Zap } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative border-b border-border/60 bg-background py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-secondary">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Start Your <span className="text-primary">Security Analysis</span> Now
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Analyze your network traffic in seconds. Our AI-powered system will detect potential
          threats, DDoS attacks, and suspicious patterns in real-time.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/analyzer">
            <Button size="lg" className="gap-2 text-base shadow-sm">
              <Zap className="h-5 w-5" />
              Start Internet Security Analysis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyber-success" />
            No installation required
          </span>
          <span className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyber-success" />
            Results in seconds
          </span>
          <span className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyber-success" />
            Free analysis
          </span>
        </div>
      </div>
    </section>
  )
}
