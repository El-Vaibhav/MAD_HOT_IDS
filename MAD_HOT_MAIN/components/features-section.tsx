"use client"

import { Activity, Brain, Layers, LineChart, Tags, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Activity,
    title: "Real-Time Intrusion Detection",
    description:
      "Monitor and detect malicious network activity in real-time with sub-millisecond response times.",
  },
  {
    icon: Brain,
    title: "AI-Powered Traffic Analysis",
    description:
      "Advanced machine learning algorithms analyze packet patterns to identify sophisticated threats.",
  },
  {
    icon: Layers,
    title: "Mixed-Rate DDoS Detection",
    description:
      "Detect advanced DDoS attacks that combine high-rate floods with low-rate stealth bursts.",
  },
  {
    icon: LineChart,
    title: "Visual Network Monitoring",
    description:
      "Live graphs and visualizations of traffic patterns, packet rates, and network anomalies.",
  },
  {
    icon: Tags,
    title: "Attack Classification",
    description:
      "Identify and classify attack types including High Rate DDoS, Low Rate DDoS, Mixed Rate DDoS, and more.",
  },
  {
    icon: BookOpen,
    title: "Research-Backed Security",
    description:
      "Built on the MAD-HOT research algorithm with peer-reviewed methodology and proven results.",
  },
]

export function FeaturesSection() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0 cyber-grid opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Enterprise-Grade <span className="text-primary">Security Features</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Comprehensive protection powered by cutting-edge machine learning and years of
            cybersecurity research.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
