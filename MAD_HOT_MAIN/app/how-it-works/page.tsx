import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Wifi,
  Database,
  Cpu,
  Shield,
  FileText,
  ArrowDown,
  ArrowRight,
  Activity,
  Layers,
  Brain,
  Zap,
  CheckCircle2,
} from "lucide-react"

const architectureSteps = [
  {
    icon: Wifi,
    title: "Internet Traffic",
    description: "Raw network packets are captured from your device or network interface in real-time.",
    details: [
      "TCP/UDP packet capture",
      "Protocol identification",
      "Flow aggregation",
    ],
  },
  {
    icon: Database,
    title: "Packet Capture Engine",
    description: "High-performance packet processing extracts relevant network features.",
    details: [
      "Packet header analysis",
      "Payload inspection",
      "Flow statistics computation",
    ],
  },
  {
    icon: Layers,
    title: "Feature Extraction",
    description: "41 network features are extracted from each traffic flow for analysis.",
    details: [
      "Packet rate metrics",
      "Byte distribution analysis",
      "Protocol-specific features",
    ],
  },
  {
    icon: Brain,
    title: "MAD-HOT ML Model",
    description: "Stacked ensemble model processes features through multiple classifiers.",
    details: [
      "Hoeffding Tree classification",
      "Random Forest ensemble",
      "Logistic Regression meta-learner",
    ],
  },
  {
    icon: Shield,
    title: "Attack Classification",
    description: "Traffic is classified into normal or specific attack categories.",
    details: [
      "High Rate DDoS detection",
      "Low Rate DDoS detection",
      "Mixed Rate attack identification",
    ],
  },
  {
    icon: FileText,
    title: "Security Dashboard",
    description: "Results are presented with detailed explanations and visualizations.",
    details: [
      "Real-time alerts",
      "Traffic visualization",
      "Threat intelligence",
    ],
  },
]

const features = [
  {
    title: "Real-Time Processing",
    description: "Sub-millisecond detection latency for immediate threat response",
    icon: Zap,
  },
  {
    title: "High Accuracy",
    description: "99.2% detection accuracy with minimal false positives",
    icon: Activity,
  },
  {
    title: "Adaptive Learning",
    description: "Hoeffding Trees enable incremental learning from streaming data",
    icon: Brain,
  },
  {
    title: "Multi-Attack Detection",
    description: "Identifies 15+ different attack types including mixed-rate DDoS",
    icon: Shield,
  },
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            How <span className="text-primary">MAD-HOT IDS</span> Works
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Understanding the technology behind our AI-powered intrusion detection system
          </p>
        </div>

        {/* System Architecture */}
        <section className="mb-20">
          <h2 className="mb-8 text-center text-2xl font-bold">System Architecture</h2>
          <div className="relative">
            {architectureSteps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
                  {/* Icon */}
                  <div className="flex flex-col items-center md:w-48">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20">
                      <step.icon className="h-10 w-10 text-primary" />
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-sm text-muted-foreground">Step {index + 1}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <Card className="flex-1 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="mt-2 text-muted-foreground">{step.description}</p>
                      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                        {step.details.map((detail) => (
                          <li key={detail} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Arrow */}
                {index < architectureSteps.length - 1 && (
                  <div className="flex justify-center py-6 md:ml-24 md:justify-start">
                    <ArrowDown className="h-8 w-8 text-primary/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-20">
          <h2 className="mb-8 text-center text-2xl font-bold">Key Capabilities</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Detection Process */}
        <section className="mb-20">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-8">
              <h2 className="mb-6 text-center text-2xl font-bold">The Detection Process</h2>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    1
                  </div>
                  <h3 className="font-semibold">Capture</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Network traffic is captured and processed into analyzable flows with
                    41 statistical features.
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    2
                  </div>
                  <h3 className="font-semibold">Analyze</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The MAD-HOT ensemble model processes features through multiple
                    machine learning algorithms simultaneously.
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    3
                  </div>
                  <h3 className="font-semibold">Respond</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Threats are classified and alerts generated with detailed
                    explanations of detected malicious patterns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold">Experience It Yourself</h2>
          <p className="mt-2 text-muted-foreground">
            Try our AI-powered intrusion detection system
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/analyzer">
              <Button size="lg" className="gap-2 glow-cyan">
                Start Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/research">
              <Button size="lg" variant="outline" className="gap-2">
                Read the Research
              </Button>
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
