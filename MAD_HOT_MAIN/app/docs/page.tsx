"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  FileText,
  Activity,
  Shield,
  AlertTriangle,
  BookOpen,
  Search,
  ArrowRight,
  Terminal,
  Layers,
  Target,
  Zap,
  CheckCircle2,
} from "lucide-react"

const docSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    items: [
      {
        title: "What is MAD-HOT IDS?",
        content: `MAD-HOT IDS (Mixed Rate Attack Detection using Hoeffding Optimized Trees) is an AI-powered intrusion detection system designed to identify malicious network traffic in real-time. It uses a stacked ensemble machine learning approach to detect various types of attacks, including sophisticated mixed-rate DDoS attacks.

The system is built on peer-reviewed research and has been validated against multiple benchmark datasets, achieving 99.2% detection accuracy with minimal false positives.`,
      },
      {
        title: "Quick Start Guide",
        content: `1. **Navigate to the Analyzer**: Click "Analyze My Internet" from the homepage
2. **Choose Analysis Method**: Select live analysis, file upload, or manual input
3. **Start Analysis**: Click the analyze button to begin
4. **View Results**: Review the detailed security report and visualizations
5. **Take Action**: Use the insights to secure your network`,
      },
      {
        title: "System Requirements",
        content: `MAD-HOT IDS is a web-based platform that works in any modern browser:

- **Supported Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Network**: Internet connection for real-time analysis
- **File Uploads**: PCAP, PCAPNG, or CSV files up to 100MB

No local installation required - all processing happens in the cloud.`,
      },
    ],
  },
  {
    id: "analyzing-traffic",
    title: "Analyzing Traffic",
    icon: Activity,
    items: [
      {
        title: "Live Traffic Analysis",
        content: `Live analysis captures and analyzes network packets from your current connection:

1. Click "Start Live Traffic Analysis" on the analyzer page
2. The system will begin capturing packets
3. Features are extracted and processed through the MAD-HOT model
4. Results are displayed in real-time

**Note**: Live analysis provides a snapshot of current network activity. For comprehensive monitoring, use the Live IDS Dashboard.`,
      },
      {
        title: "File Upload Analysis",
        content: `You can upload network capture files for offline analysis:

**Supported Formats**:
- PCAP files (.pcap)
- PCAPNG files (.pcapng)
- CSV log files (.csv)

**CSV Format Requirements**:
Your CSV should include network flow features such as:
- Source/Destination IP
- Protocol
- Packet count
- Byte count
- Flow duration`,
      },
      {
        title: "Manual Input Analysis",
        content: `For testing specific traffic patterns, use manual input:

**Required Fields**:
- Source IP Address
- Destination IP Address
- Protocol (TCP/UDP/ICMP)
- Packet Rate (packets per second)
- Packet Size (bytes)
- Flow Duration (seconds)

This is useful for security researchers testing specific attack signatures.`,
      },
    ],
  },
  {
    id: "understanding-results",
    title: "Understanding Results",
    icon: FileText,
    items: [
      {
        title: "Security Status",
        content: `The security status provides an at-a-glance assessment:

**SAFE** (Green): No malicious activity detected. Normal traffic patterns observed.

**ATTACK DETECTED** (Red): Malicious activity identified. Review the attack type, confidence score, and risk level for details.

**Confidence Score**: The model's certainty about the classification (0-100%)

**Risk Level**: Overall threat severity based on attack type and impact potential (0-100)`,
      },
      {
        title: "Attack Classification",
        content: `MAD-HOT IDS classifies traffic into these categories:

**DDoS Attacks**:
- High Rate DDoS: Volumetric flooding attacks
- Low Rate DDoS: Slow, stealthy attacks
- Mixed Rate DDoS: Combination attacks alternating between high and low rates

**Other Attacks**:
- Port Scanning: Network reconnaissance
- Brute Force: Password guessing attempts
- Protocol Exploitation: Malformed packet attacks

Each classification includes the specific attack signatures detected.`,
      },
      {
        title: "Detection Reasons",
        content: `The detection reasons explain why traffic was flagged:

- **Packet Burst Detection**: Unusual spikes in traffic volume
- **SYN Frequency**: High rate of TCP connection attempts
- **Entropy Anomaly**: Unusual randomness in packet characteristics
- **Oscillating Patterns**: Traffic alternating between high and low rates
- **Threat Intelligence**: Source IP flagged in known malicious databases

Understanding these reasons helps you identify the specific attack vectors targeting your network.`,
      },
    ],
  },
  {
    id: "attack-types",
    title: "Attack Types",
    icon: AlertTriangle,
    items: [
      {
        title: "High Rate DDoS",
        content: `High Rate DDoS attacks attempt to overwhelm network resources through volume:

**Characteristics**:
- Packet rates exceeding 10,000+ pps
- Sustained high bandwidth consumption
- Often uses amplification techniques

**Detection**: MAD-HOT identifies unusual traffic volume and source patterns.

**Impact**: Network saturation, service unavailability.`,
      },
      {
        title: "Low Rate DDoS",
        content: `Low Rate DDoS attacks operate below detection thresholds:

**Characteristics**:
- Packet rates around 100-500 pps
- Targeted at specific services
- Often exploits application vulnerabilities

**Detection**: MAD-HOT analyzes traffic patterns and timing anomalies.

**Impact**: Service degradation, resource exhaustion.`,
      },
      {
        title: "Mixed Rate DDoS",
        content: `Mixed Rate attacks combine multiple strategies:

**Characteristics**:
- Alternates between high and low rate phases
- Evades threshold-based detection
- Uses multiple attack vectors simultaneously

**Detection**: MAD-HOT's ensemble approach specifically targets these oscillating patterns.

**Impact**: Difficult to mitigate, sustained service disruption.

This is the attack type MAD-HOT was specifically designed to detect.`,
      },
    ],
  },
]

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Learn how to use MAD-HOT IDS to analyze and secure your network traffic
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Activity, title: "Analyze Traffic", href: "/analyzer", desc: "Start your analysis" },
            { icon: Shield, title: "Live Dashboard", href: "/dashboard", desc: "Real-time monitoring" },
            { icon: Target, title: "Attack Intelligence", href: "/intelligence", desc: "Threat statistics" },
            { icon: BookOpen, title: "Research", href: "/research", desc: "MAD-HOT algorithm" },
          ].map((link) => (
            <Link key={link.title} href={link.href}>
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:border-primary/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <link.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{link.title}</h3>
                    <p className="text-sm text-muted-foreground">{link.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Documentation Sections */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="hidden lg:block">
            <Card className="sticky top-24 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Contents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 p-2">
                {docSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <section.icon className="h-4 w-4" />
                    {section.title}
                  </a>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {docSections.map((section) => (
              <Card
                key={section.id}
                id={section.id}
                className="border-border/50 bg-card/50 backdrop-blur-sm scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-6 w-6 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {section.items.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="prose prose-invert prose-sm max-w-none">
                            {item.content.split("\n\n").map((paragraph, i) => (
                              <p key={i} className="whitespace-pre-line text-muted-foreground">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}

            {/* API Section */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-6 w-6 text-primary" />
                  API Reference
                </CardTitle>
                <CardDescription>
                  Integrate MAD-HOT IDS into your applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-cyber-dark p-4">
                  <code className="text-sm text-primary">
                    Coming Soon: RESTful API for programmatic access
                  </code>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  The MAD-HOT API will allow developers to integrate intrusion detection
                  capabilities directly into their security infrastructure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold">Ready to Secure Your Network?</h2>
          <p className="mt-2 text-muted-foreground">
            Start analyzing your traffic with MAD-HOT IDS
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/analyzer">
              <Button size="lg" className="gap-2 glow-cyan">
                Start Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2">
                <Zap className="h-5 w-5" />
                Live Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
