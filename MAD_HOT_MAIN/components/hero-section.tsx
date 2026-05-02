"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NetworkAnimation } from "@/components/network-animation"
import { Activity, LayoutDashboard, BookOpen, ArrowRight, Shield } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[92svh] overflow-hidden pt-16 sm:min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 cyber-grid" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      <NetworkAnimation />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Research-Backed AI Security</span>
        </div>

        <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          AI-Powered Intrusion Detection{" "}
          <span className="text-primary text-glow-cyan">for Your Internet</span>
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
          Powered by the{" "}
          <span className="font-semibold text-foreground">MAD-HOT Machine Learning Algorithm</span>.
          Detect malicious traffic, DDoS attacks, and suspicious network behavior using our
          research-backed AI intrusion detection system.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap">
          <Link href="/analyzer">
            <Button size="lg" className="gap-2 glow-cyan text-base">
              <Activity className="h-5 w-5" />
              Analyze My Internet
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="gap-2 text-base">
              <LayoutDashboard className="h-5 w-5" />
              Open Live IDS Dashboard
            </Button>
          </Link>
          <Link href="/research">
            <Button size="lg" variant="ghost" className="gap-2 text-base">
              <BookOpen className="h-5 w-5" />
              Read Research
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { label: "Detection Accuracy", value: "99%" },
            { label: "Attack Types", value: "15+" },
            { label: "Response Time", value: "<1ms" },
            { label: "False Positives", value: "<0.1%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 lg:block">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs">Scroll to explore</span>
            <div className="h-8 w-5 rounded-full border border-muted-foreground/30 p-1">
              <div className="h-2 w-full animate-bounce rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
