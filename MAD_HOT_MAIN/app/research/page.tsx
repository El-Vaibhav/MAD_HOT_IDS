"use client"

import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Brain,
  Database,
  BarChart3,
  Layers,
  Target,
  ArrowRight,
  Download,
  ExternalLink,
  CheckCircle2,
  Zap,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

const performanceData = [
  { metric: "Accuracy", value: 99.2 },
  { metric: "Precision", value: 99.1 },
  { metric: "Recall", value: 98.5 },
  { metric: "F1 Score", value: 98.8 },
]

const radarData = [
  { metric: "Accuracy", MADHOT: 99, RF: 95, DT: 92, KNN: 89 },
  { metric: "Precision", MADHOT: 99, RF: 94, DT: 91, KNN: 88 },
  { metric: "Recall", MADHOT: 98, RF: 93, DT: 90, KNN: 87 },
  { metric: "F1 Score", MADHOT: 98, RF: 94, DT: 91, KNN: 88 },
  { metric: "Speed", MADHOT: 95, RF: 80, DT: 90, KNN: 70 },
]

const datasets = [
  {
    name: "IoT-23 Dataset",
    description: "Network traffic dataset from IoT devices with labeled attack samples",
    samples: "325,307",
    attacks: 7,
    source: "Stratosphere Lab",
  },
  {
    name: "CIC-DDoS Dataset",
    description: "Comprehensive DDoS attack dataset with multiple attack vectors",
    samples: "50,063,112",
    attacks: 12,
    source: "Canadian Institute",
  },
  {
    name: "WSN-DS Dataset",
    description: "Wireless sensor network dataset with intrusion scenarios",
    samples: "374,661",
    attacks: 4,
    source: "Research Lab",
  },
]

const level1Models = [
  { name: "Hoeffding Tree", description: "Incremental decision tree for streaming data", accuracy: "97.8%" },
  { name: "Decision Tree", description: "Traditional classification tree algorithm", accuracy: "96.5%" },
  { name: "Random Forest", description: "Ensemble of decision trees", accuracy: "98.2%" },
  { name: "K-Nearest Neighbors", description: "Instance-based learning algorithm", accuracy: "95.1%" },
]

export default function ResearchPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary">Research Paper</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            MAD-HOT Algorithm
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-xl text-muted-foreground">
            Mixed Rate Attack Detection using Hoeffding Optimized Trees
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="https://link.springer.com/chapter/10.1007/978-3-031-94263-1_23" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 glow-cyan">
                <ExternalLink className="h-5 w-5" />
                View on Springer
              </Button>
            </Link>
    
          </div>
        </div>

        {/* Published Paper */}
        <Card className="mb-12 border-cyber-success/50 bg-cyber-success/5 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex-1">
                <Badge className="mb-3 bg-cyber-success/20 text-cyber-success">Published on Springer</Badge>
                <CardTitle className="mb-2 text-2xl">
                  MAD-HOT: Mixed Rate DDoS Attack Detection in IEEE 802.15 4e/TSCH Networks Using Hoeffding Optimized Trees
                </CardTitle>
                <CardDescription className="text-base">
                  <span className="font-medium text-foreground">Conference Paper</span> • Published June 2, 2025 • pp 417-436
                </CardDescription>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p><span className="font-medium">Authors:</span> Pradeepkumar Bhale, Darpan Maurya, Vaibhav Sodhi, Tabish Farooqi, Harsh Singh & Sonam Maurya</p>
                  <p className="mt-1"><span className="font-medium">Published in:</span> Innovations for Community Services (I4CS 2025) - Communications in Computer and Information Science</p>
                </div>
              </div>
              <div className="shrink-0">
                <img 
                  src="/springer-paper.jpg" 
                  alt="MAD-HOT Springer Paper Cover" 
                  className="h-64 w-auto rounded-lg border border-border shadow-lg"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Abstract Section */}
        <Card className="mb-12 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="h-6 w-6 text-primary" />
              Abstract
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p className="text-base leading-relaxed text-muted-foreground">
              Internet of Things (IoT) is expanding rapidly as its use cases and technology advances. However, 
              along with these benefits, IoT also faces many attacks. One of the most common and difficult-to-detect 
              attacks is the DDoS attack and its variations (MrDDoS). Implementing security solutions in the IoT 
              ecosystem is challenging due to resource-constrained devices. The proposed security solution, namely, 
              MAD-HOT utilized the Hoeffding tree and placement strategies for MrDDoS attack detection with reasonable 
              accuracy. The placement problem is formulated with a hypergraph and a game theory algorithm. Security 
              module based on Hoeffding trees is the main classifier, along with many other classifiers for model training. 
              Finally, for prediction, we have used logistic regression as the meta-classifier. Extensive experimentation 
              on the Contiki cooja simulator shows that the MAD-HOT can best execute the balance between MrDDoS detection 
              and energy overhead.
            </p>
          </CardContent>
        </Card>

        {/* Problem Statement */}
        <Card className="mb-12 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6 text-primary" />
              The Problem
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p className="text-lg text-muted-foreground">
              Internet of Things (IoT) networks are increasingly vulnerable to sophisticated DDoS attacks.
              Traditional intrusion detection systems struggle with:
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                "High-rate flooding attacks overwhelming network resources",
                "Low-rate stealth attacks that evade threshold-based detection",
                "Mixed-rate attacks combining multiple attack patterns",
                "Real-time detection requirements for streaming data",
                "High false positive rates in existing ML solutions",
                "Limited adaptability to evolving attack patterns",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg bg-destructive/5 p-4">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Algorithm Architecture */}
        <Card className="mb-12 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="h-6 w-6 text-primary" />
              MAD-HOT Algorithm Architecture
            </CardTitle>
            <CardDescription>
              Stacked ensemble machine learning model for intrusion detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8 rounded-lg bg-cyber-dark p-6">
              <h3 className="mb-6 text-center text-lg font-medium">Two-Level Stacking Architecture</h3>
              <div className="flex flex-col items-center gap-8">
                {/* Input */}
                <div className="rounded-lg border border-border bg-secondary/30 px-6 py-3">
                  <span className="font-medium">Network Traffic Features</span>
                </div>
                
                <div className="h-8 w-px bg-primary" />
                
                {/* Level 1 */}
                <div className="w-full">
                  <p className="mb-4 text-center text-sm text-muted-foreground">Level 1: Base Learners</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {level1Models.map((model) => (
                      <Card key={model.name} className="border-primary/30 bg-primary/5">
                        <CardContent className="p-4 text-center">
                          <Layers className="mx-auto mb-2 h-6 w-6 text-primary" />
                          <h4 className="font-medium">{model.name}</h4>
                          <p className="mt-1 text-xs text-muted-foreground">{model.description}</p>
                          <Badge className="mt-2 bg-primary/20 text-primary">{model.accuracy}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="h-8 w-px bg-primary" />
                
                {/* Level 2 */}
                <div className="w-full max-w-md">
                  <p className="mb-4 text-center text-sm text-muted-foreground">Level 2: Meta-Classifier</p>
                  <Card className="border-cyber-success/50 bg-cyber-success/10">
                    <CardContent className="p-6 text-center">
                      <Zap className="mx-auto mb-2 h-8 w-8 text-cyber-success" />
                      <h4 className="text-lg font-medium">Logistic Regression</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Combines predictions from all base learners
                      </p>
                      <Badge className="mt-3 bg-cyber-success/20 text-cyber-success">99.2% Accuracy</Badge>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="h-8 w-px bg-primary" />
                
                {/* Output */}
                <div className="rounded-lg border border-cyber-success bg-cyber-success/10 px-6 py-3">
                  <span className="font-medium text-cyber-success">Attack Classification Output</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/30 p-6">
              <h4 className="mb-4 font-medium">Why Hoeffding Trees?</h4>
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  "Designed for streaming data processing",
                  "Incremental learning without storing all data",
                  "Mathematically bounded error guarantees",
                  "Efficient memory usage for IoT environments",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyber-success" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Datasets & Performance */}
        <Tabs defaultValue="datasets" className="mb-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="datasets" className="gap-2">
              <Database className="h-4 w-4" />
              Datasets Used
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="datasets" className="mt-8">
            <div className="grid gap-6 lg:grid-cols-3">
              {datasets.map((dataset) => (
                <Card key={dataset.name} className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Database className="h-5 w-5 text-primary" />
                      {dataset.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm text-muted-foreground">{dataset.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Samples:</span>
                        <span className="font-medium">{dataset.samples}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Attack Types:</span>
                        <span className="font-medium">{dataset.attacks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Source:</span>
                        <span className="font-medium">{dataset.source}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>MAD-HOT algorithm evaluation results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="metric" stroke="#888" fontSize={12} />
                        <YAxis domain={[90, 100]} stroke="#888" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a2e",
                            border: "1px solid #333",
                            borderRadius: "8px",
                          }}
                          formatter={(value) => [`${value}%`, "Score"]}
                        />
                        <Bar dataKey="value" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Model Comparison</CardTitle>
                  <CardDescription>MAD-HOT vs individual algorithms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="metric" stroke="#888" fontSize={11} />
                        <PolarRadiusAxis domain={[60, 100]} stroke="#888" fontSize={10} />
                        <Radar name="MAD-HOT" dataKey="MADHOT" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.3} />
                        <Radar name="Random Forest" dataKey="RF" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
                        <Radar name="Decision Tree" dataKey="DT" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a2e",
                            border: "1px solid #333",
                            borderRadius: "8px",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span className="text-sm">MAD-HOT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-cyber-success" />
                      <span className="text-sm">Random Forest</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-cyber-warning" />
                      <span className="text-sm">Decision Tree</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Key Insight */}
        <Card className="mb-12 border-primary/30 bg-primary/5">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Key Insight: Mixed Rate Attacks</h3>
                <p className="mt-2 text-muted-foreground">
                  Mixed rate attacks alternate between high-rate flooding and low-rate stealth bursts
                  to evade traditional detection systems. The MAD-HOT algorithm specifically targets
                  these sophisticated attack patterns by combining multiple detection strategies
                  through ensemble learning.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">Ready to Try MAD-HOT?</h2>
          <p className="mt-2 text-muted-foreground">
            Experience the power of our research-backed intrusion detection system
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/analyzer">
              <Button size="lg" className="gap-2 glow-cyan">
                Analyze My Traffic
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="gap-2">
                <BookOpen className="h-5 w-5" />
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
