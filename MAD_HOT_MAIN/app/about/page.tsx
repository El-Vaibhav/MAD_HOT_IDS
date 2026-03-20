import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Shield,
  Target,
  Users,
  Award,
  BookOpen,
  Mail,
  MapPin,
  ExternalLink,
  ArrowRight,
  Lightbulb,
  GraduationCap,
} from "lucide-react"

const teamMembers = [
  {
    name: "Research Team Lead",
    role: "Principal Investigator",
    description: "Leading research in network security and machine learning applications for intrusion detection.",
  },
  {
    name: "ML Engineer",
    role: "Algorithm Development",
    description: "Specializing in ensemble learning methods and real-time classification systems.",
  },
  {
    name: "Security Analyst",
    role: "Threat Intelligence",
    description: "Expert in DDoS attack patterns and network traffic analysis.",
  },
  {
    name: "Software Engineer",
    role: "Platform Development",
    description: "Building scalable systems for real-time network monitoring and analysis.",
  },
]

const milestones = [
  { year: "2023", title: "Research Initiated", description: "Study of mixed-rate DDoS attacks began" },
  { year: "2024", title: "MAD-HOT Algorithm", description: "Novel stacked ensemble model developed" },
  { year: "2024", title: "Dataset Validation", description: "Tested on IoT-23, CIC-DDoS, and WSN-DS" },
  { year: "2025", title: "Platform Launch", description: "Public release of the IDS platform" },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            About MAD-HOT IDS
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            A research-backed intrusion detection system designed to protect networks
            from sophisticated cyber threats.
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-16 border-primary/30 bg-primary/5">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
                <Target className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Our Mission</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  To democratize advanced cybersecurity by making research-grade intrusion detection
                  accessible to everyone. We believe that effective network security should not be
                  limited to large enterprises with extensive resources.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Background */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Project Background</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <Lightbulb className="h-8 w-8 text-primary" />
                <CardTitle>The Challenge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Traditional intrusion detection systems struggle with sophisticated attacks
                  that combine multiple strategies. Mixed-rate DDoS attacks, which alternate
                  between high-rate flooding and low-rate stealth bursts, pose a particular
                  challenge as they evade conventional threshold-based detection methods.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary" />
                <CardTitle>Our Solution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The MAD-HOT algorithm employs a stacked ensemble approach, combining
                  Hoeffding Trees with traditional machine learning methods. This enables
                  real-time detection of complex attack patterns while maintaining high
                  accuracy and low false positive rates.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Research Inspiration */}
        <section className="mb-16">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                Research Foundation
              </CardTitle>
              <CardDescription>
                Built on peer-reviewed research and rigorous scientific methodology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-3">
                <div>
                  <h3 className="font-semibold">Academic Rigor</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Our approach is grounded in published research on network security,
                    machine learning, and streaming data analysis.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Validated Results</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The algorithm has been validated against multiple benchmark datasets
                    with reproducible results and documented methodology.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Continuous Improvement</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We continuously refine our models based on new threat intelligence
                    and emerging attack patterns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Timeline */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Development Timeline</h2>
          <div className="relative">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative flex items-center gap-8 ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                    <Card className="inline-block border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="text-sm font-bold text-primary">{milestone.year}</div>
                        <div className="font-semibold">{milestone.title}</div>
                        <div className="text-sm text-muted-foreground">{milestone.description}</div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="absolute left-1/2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-primary" />
                  <div className="w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Research Team</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <Card key={member.name} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-primary">{member.role}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                Contact Us
              </CardTitle>
              <CardDescription>
                Get in touch with the MAD-HOT IDS research team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>research@madhot-ids.example</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>Research Institution, Department of Computer Science</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    <span>github.com/madhot-ids</span>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-end">
                  <Link href="/analyzer">
                    <Button size="lg" className="gap-2 glow-cyan">
                      Try MAD-HOT IDS
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <Footer />
    </main>
  )
}
