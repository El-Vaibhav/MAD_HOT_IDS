"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Activity,
  Upload,
  FileText,
  Wifi,
  ArrowRight,
  Shield,
  Server,
  Cpu,
  Database,
  CheckCircle2,
} from "lucide-react"
import { analyzePacket, uploadTrafficFile } from "@/lib/api"
import { ENDPOINTS } from "@/lib/config"

const pipelineSteps = [
  { icon: Wifi, label: "Capturing Network Packets", description: "Collecting live traffic data" },
  { icon: Database, label: "Feature Extraction", description: "Processing packet attributes" },
  { icon: Cpu, label: "MAD-HOT ML Model", description: "Running classification algorithm" },
  { icon: Shield, label: "Attack Detection", description: "Identifying malicious patterns" },
  { icon: FileText, label: "Security Report", description: "Generating analysis results" },
]

async function runAnalysis(features: any) {

  const result = await analyzePacket(features)

  console.log("Analysis result:", result)

  return result
}

export default function AnalyzerPage() {

  const router = useRouter()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<any[]>([])
  const [livePackets, setLivePackets] = useState<any[]>([])
  const [isLiveRunning, setIsLiveRunning] = useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)



  const [formData, setFormData] = useState({
    sourceIp: "",
    destIp: "",
    protocol: "",
    packetRate: "",
    packetSize: "",
    flowDuration: "",
  })

  const startAnalysis = (result?: any) => {

    setCurrentStep(0) // start from beginning

    const interval = setInterval(() => {

      setCurrentStep((prev) => {

        if (prev >= pipelineSteps.length - 1) {

          clearInterval(interval)

          setTimeout(() => {
            router.push(
              `/results?attack=${result?.attack || ""}&confidence=${result?.confidence || 0}&viz=${encodeURIComponent(
                JSON.stringify(result?.visualization || {})
              )}`
            )
          }, 1000)

          return prev
        }

        return prev + 1

      })

    }, 1200) // speed of animation

  }
  const startLiveDetection = async () => {

    setIsAnalyzing(true) // show pipeline animation

    let packetBuffer: any[] = []
    let finished = false

    // start backend live session
    await fetch(ENDPOINTS.startLive, {
      method: "POST"
    })

    const ws = new WebSocket(ENDPOINTS.liveDetectionWs)

    ws.onopen = () => {
      console.log("Connected to Live IDS")

      setIsLiveRunning(true)

      // start animation ONLY after connection
      setIsAnalyzing(true)
    }
    ws.onmessage = (event) => {

      if (finished) return

      const raw = JSON.parse(event.data)

      console.log("WS RAW:", event.data)

      const data = {
        attack: raw.attack || raw.prediction || "Normal Traffic",
        confidence: raw.confidence || 0,
        sourceIp: raw.sourceIp,
        destIp: raw.destIp,
        protocol: raw.protocol,
        packetRate: raw.packetRate,
        packetSize: raw.packetSize,
        flowDuration: raw.flowDuration
      }

      packetBuffer.push(data)

      setLivePackets(prev => {
        const updated = [...prev, data]
        return updated.slice(-30) // keep last 30
      })

      // stop after 30 packets
      if (packetBuffer.length >= 30) {

        finished = true
        ws.close()

        const attackCounts: any = {}

        packetBuffer.forEach(p => {
          attackCounts[p.attack] = (attackCounts[p.attack] || 0) + 1
        })

        let topAttack = "Normal Traffic"
        let max = 0

        for (const k in attackCounts) {
          if (attackCounts[k] > max) {
            max = attackCounts[k]
            topAttack = k
          }
        }

        const confidence = max / packetBuffer.length

        // calculate protocol distribution
        const protoCounts: any = {}
        const ipCounts: any = {}

        packetBuffer.forEach(p => {

          if (p.protocol) {
            protoCounts[p.protocol] = (protoCounts[p.protocol] || 0) + 1
          }

          if (p.sourceIp) {
            ipCounts[p.sourceIp] = (ipCounts[p.sourceIp] || 0) + 1
          }

        })

        const protocol_distribution = Object.entries(protoCounts).map(
          ([name, value]) => ({
            name: String(name).toUpperCase(),
            value
          })
        )

        const top_ips = Object.entries(ipCounts)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 5)
          .map(([ip, count]) => ({
            ip,
            packets: count,
            protocol: "TCP",
            threatScore: Math.round(confidence * 100)
          }))

        const visualization = {

          packet_rate: packetBuffer.map((p, i) => ({
            time: `${i}s`,
            rate: Math.round(p.packetRate || 0)
          })),

          protocol_distribution,

          traffic_heatmap: packetBuffer.map((p, i) => ({

            hour: `${i}:00`,

            intensity: Math.round(
              ((p.packetSize || 1) * (p.flowDuration || 1)) / 100
            )

          })),

          top_ips

        }

        const finalResult = {

          attack: topAttack,
          confidence: confidence,
          visualization: visualization
        }

        console.log("Final Live Result:", finalResult)

        startAnalysis(finalResult)

      }

    }

    ws.onclose = () => {
      console.log("Live IDS disconnected")
      setIsLiveRunning(false)
    }

    setSocket(ws)

  }

  const handleManualSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    setIsAnalyzing(true)

    try {

      const result = await runAnalysis({
        sourceIp: formData.sourceIp,
        destIp: formData.destIp,
        protocol: formData.protocol,
        packetRate: Number(formData.packetRate),
        packetSize: Number(formData.packetSize),
        flowDuration: Number(formData.flowDuration),
      })

      const baseRate = Number(formData.packetRate)
      const protocol = formData.protocol.toUpperCase()
      const srcIp = formData.sourceIp

      // Generate simulated packet timeline
      const packet_rate = Array.from({ length: 10 }, (_, i) => ({
        time: `${i}s`,
        rate: Math.round(baseRate + (Math.random() - 0.5) * baseRate * 0.2)
      }))

      // Protocol distribution (mostly same protocol)
      const protocol_distribution = [
        { name: protocol, value: 90 },
        { name: protocol === "TCP" ? "UDP" : "TCP", value: 10 }
      ]

      // Simulated traffic intensity
      const traffic_heatmap = Array.from({ length: 10 }, (_, i) => ({
        hour: `${i}:00`,
        intensity: Math.round(baseRate + Math.random() * baseRate * 0.3)
      }))

      // Simulated IP activity
      const top_ips = [
        {
          ip: srcIp,
          packets: baseRate * 10,
          protocol: protocol,
          threatScore: Math.round(result.confidence * 100)
        }
      ]

      const visualization = {
        packet_rate,
        protocol_distribution,
        traffic_heatmap,
        top_ips
      }

      const finalResult = {
        ...result,
        visualization
      }

      setAnalysisResult(finalResult)

      startAnalysis(finalResult)

    } catch (error) {

      console.error("Analysis failed:", error)

    }

  }

  if (isAnalyzing) {

    return (
      <main className="min-h-screen">

        <Navigation />

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 pt-16">

          <div className="w-full max-w-2xl">

            <div className="mb-12 text-center">

              <h1 className="text-3xl font-bold">Analyzing Network Traffic</h1>

              <p className="mt-2 text-muted-foreground">
                Please wait while we analyze your traffic data
              </p>

            </div>

            <div className="space-y-4">

              {pipelineSteps.map((step, index) => (

                <div
                  key={step.label}
                  className={`flex items-center gap-4 rounded-lg border p-4 transition-all duration-500 ${index < currentStep
                    ? "border-cyber-success/50 bg-cyber-success/10"
                    : index === currentStep
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card/50 opacity-50"
                    }`}
                >

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${index < currentStep
                      ? "bg-cyber-success text-background"
                      : index === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                      }`}
                  >

                    {index < currentStep ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}

                  </div>

                  <div className="flex-1">

                    <div className="font-medium">{step.label}</div>

                    <div className="text-sm text-muted-foreground">
                      {step.description}
                    </div>

                  </div>

                  {index === currentStep && (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}

                </div>

              ))}

            </div>

            {currentStep === pipelineSteps.length - 1 && (

              <div className="mt-8 text-center">

                <div className="inline-flex items-center gap-2 rounded-full bg-cyber-success/20 px-4 py-2 text-cyber-success">

                  <CheckCircle2 className="h-5 w-5" />

                  <span>Analysis Complete - Redirecting to results...</span>

                </div>

              </div>

            )}

          </div>

        </div>

      </main>
    )
  }

  return (

    <main className="min-h-screen">

      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">

        <div className="mb-12 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">

            <Activity className="h-8 w-8 text-primary" />

          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Internet Security Analyzer
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">

            This tool analyzes your internet traffic using the MAD-HOT intrusion
            detection system to detect malicious patterns such as DDoS attacks
            and abnormal network activity.

          </p>

        </div>

        <Tabs defaultValue="live" className="mx-auto max-w-4xl">

          <TabsList className="grid w-full grid-cols-3">

            <TabsTrigger value="live" className="gap-2">
              <Wifi className="h-4 w-4" />
              Live
            </TabsTrigger>

            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>

            <TabsTrigger value="manual" className="gap-2">
              <FileText className="h-4 w-4" />
              Manual
            </TabsTrigger>

          </TabsList>
          {/* ---------------- LIVE TAB ---------------- */}

          <TabsContent value="live" className="mt-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-primary" />
                  Live Traffic Analysis
                </CardTitle>
                <CardDescription>
                  Analyze packets from your device network in real-time. This will capture and
                  analyze current network activity.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                  <Server className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 font-medium">Ready to Capture Traffic</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click the button below to start capturing and analyzing your network traffic
                  </p>
                </div>
                <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-300">

                  <p className="font-semibold mb-2">⚠ Live Detection Requires Local Sensor</p>

                  <p>
                    Live traffic analysis requires a small sensor program to run on your computer.
                    This sensor captures network packets from your device and securely sends them
                    to the MAD-HOT detection system for analysis.
                  </p>

                  <ol className="mt-2 list-decimal pl-5 space-y-2">

                    <li>
                      Install Npcap (https://npcap.com/) to allow packet capturing on Windows.
                    </li>

                    <li>
                      Download the <b>MAD_HOT_IDS_Sensor.exe</b> program.
                    </li>

                  </ol>

                  {/* DOWNLOAD BUTTON */}

                  <div className="mt-3">

                    <a
                      href="/MAD_HOT_IDS_Sensor.exe"
                      download
                      className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-black text-sm font-medium hover:bg-cyan-400 transition"
                    >
                      ⬇ Download Sensor (.exe)
                    </a>

                  </div>

                  <ol start={2} className="mt-3 list-decimal pl-5 space-y-2">

                    <li>
                      Right-click the downloaded file and select <b>Run as Administrator</b>.
                    </li>

                    <li>
                      If Windows SmartScreen shows a warning, click:
                      <br />
                      <b>More Info → Run Anyway</b>.
                    </li>

                  </ol>

                  <div className="mt-3 rounded-md bg-black/40 p-3 text-xs text-yellow-200">

                    ✔ This program is completely safe and open-source.<br />
                    ✔ It only reads network packets from your device.<br />
                    ✔ No personal data or files are accessed.<br />
                    ✔ It simply sends packet metadata to the MAD-HOT detection server for analysis.

                  </div>

                  <p className="mt-3">
                    After the sensor starts running, return here and click
                    <b> Start Live Traffic Analysis</b>.
                  </p>

                </div>

                <Button onClick={startLiveDetection} size="lg" className="w-full gap-2 glow-cyan">
                  <Activity className="h-5 w-5" />
                  Start Live Traffic Analysis
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {livePackets.length > 0 && (

                  <div className="rounded-lg border border-border p-4">

                    <h3 className="mb-4 font-semibold">Live Packet Detection</h3>

                    <div className="max-h-64 overflow-y-auto">

                      <table className="w-full text-sm">

                        <thead className="border-b">

                          <tr>
                            <th className="text-left p-2">Source</th>
                            <th className="text-left p-2">Destination</th>
                            <th className="text-left p-2">Protocol</th>
                            <th className="text-left p-2">Attack</th>
                            <th className="text-left p-2">Confidence</th>
                          </tr>

                        </thead>

                        <tbody>

                          {livePackets.map((pkt, i) => (

                            <tr key={i} className="border-b">

                              <td className="p-2">{pkt.sourceIp}</td>
                              <td className="p-2">{pkt.destIp}</td>
                              <td className="p-2">{pkt.protocol?.toUpperCase()}</td>

                              <td className={`p-2 ${pkt.attack === "Normal Traffic"
                                ? "text-green-400"
                                : "text-red-400"
                                }`}>
                                {pkt.attack}
                              </td>

                              <td className="p-2">
                                {(pkt.confidence * 100).toFixed(2)}%
                              </td>

                            </tr>

                          ))}

                        </tbody>

                      </table>

                    </div>

                  </div>

                )}
              </CardContent>
            </Card>
          </TabsContent>


          {/* ---------------- UPLOAD TAB ---------------- */}

          <TabsContent value="upload" className="mt-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Network Log
                </CardTitle>
                <CardDescription>
                  Upload a PCAP, CSV, or network log file for analysis.
                  Supported formats: .pcap, .pcapng, .csv
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="rounded-lg border border-dashed border-border p-8 transition-colors hover:border-primary/50">

                  {!uploadedFile ? (

                    <div className="text-center">

                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />

                      <h3 className="mt-4 font-medium">Drag and drop your file here</h3>

                      <p className="mt-2 text-sm text-muted-foreground">
                        or click to browse your files
                      </p>

                      <p className="mt-4 text-xs text-muted-foreground">
                        Supports PCAP, PCAPNG, and CSV files up to 100MB
                      </p>

                      <input
                        type="file"
                        accept=".pcap,.pcapng,.csv"
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => {

                          const file = e.target.files?.[0]
                          if (!file) return

                          setUploadedFile(file)

                          const reader = new FileReader()

                          reader.onload = (event) => {

                            const text = event.target?.result as string

                            const rows = text.split("\n").slice(0, 6)

                            const headers = rows[0].split(",")

                            const data = rows.slice(1).map((row) => {

                              const values = row.split(",")

                              const obj: any = {}

                              headers.forEach((h, i) => {
                                obj[h] = values[i]
                              })

                              return obj
                            })

                            setCsvPreview(data)

                          }

                          reader.readAsText(file)

                        }}
                      />

                      <label htmlFor="file-upload" className="cursor-pointer absolute inset-0"></label>

                    </div>

                  ) : (

                    <div>

                      <p className="text-sm text-primary mb-4 text-center">
                        Selected file: {uploadedFile.name}
                      </p>

                      {csvPreview.length > 0 && (

                        <div className="overflow-x-auto">

                          <p className="mb-2 text-sm text-muted-foreground text-center">
                            Preview of uploaded data
                          </p>

                          <table className="w-full border text-sm">

                            <thead className="bg-muted">

                              <tr>

                                {Object.keys(csvPreview[0]).map((key) => (

                                  <th key={key} className="border px-3 py-2 text-left">
                                    {key}
                                  </th>

                                ))}

                              </tr>

                            </thead>

                            <tbody>

                              {csvPreview.map((row, index) => (

                                <tr key={index}>

                                  {Object.values(row).map((val: any, i) => (

                                    <td key={i} className="border px-3 py-2">
                                      {val}
                                    </td>

                                  ))}

                                </tr>

                              ))}

                            </tbody>

                          </table>

                        </div>

                      )}

                    </div>

                  )}

                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={async () => {

                    if (!uploadedFile) return

                    setIsAnalyzing(true)

                    try {

                      const result = await uploadTrafficFile(uploadedFile)

                      console.log("Full Upload Result:", result)

                      const summary = result.summary
                      const attackPercentages = result.attack_percentages

                      let mostAttack = ""
                      let maxCount = 0

                      for (const attack in summary) {
                        if (summary[attack] > maxCount) {
                          maxCount = summary[attack]
                          mostAttack = attack
                        }
                      }

                      const percentage = attackPercentages[mostAttack] || 0
                      const confidence = percentage / 100

                      console.log("Most Frequent Attack:", mostAttack)
                      console.log("Confidence:", percentage)

                      const finalResult = {
                        attack: mostAttack,
                        confidence: confidence,
                        visualization: result.visualization
                      }

                      setAnalysisResult(finalResult)

                      startAnalysis(finalResult)

                    } catch (error) {

                      console.error("Upload failed:", error)

                      setIsAnalyzing(false)

                    }

                  }}
                >
                  <FileText className="h-5 w-5" />
                  Upload and Analyze
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="mt-8">

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <FileText className="h-5 w-5 text-primary" />

                  Manual Traffic Input

                </CardTitle>

                <CardDescription>

                  Manually enter network traffic parameters for analysis.

                </CardDescription>

              </CardHeader>

              <CardContent>

                <form onSubmit={handleManualSubmit} className="space-y-6">

                  <div className="grid gap-6 sm:grid-cols-2">

                    <div className="space-y-2">

                      <Label>Source IP Address</Label>

                      <Input
                        placeholder="192.168.1.100"
                        value={formData.sourceIp}
                        onChange={(e) =>
                          setFormData({ ...formData, sourceIp: e.target.value })
                        }
                      />

                    </div>

                    <div className="space-y-2">

                      <Label>Destination IP Address</Label>

                      <Input
                        placeholder="10.0.0.1"
                        value={formData.destIp}
                        onChange={(e) =>
                          setFormData({ ...formData, destIp: e.target.value })
                        }
                      />

                    </div>

                    <div className="space-y-2">

                      <Label>Protocol</Label>

                      <Select
                        value={formData.protocol}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, protocol: value })
                        }
                      >

                        <SelectTrigger>

                          <SelectValue placeholder="Select protocol" />

                        </SelectTrigger>

                        <SelectContent>

                          <SelectItem value="tcp">TCP</SelectItem>
                          <SelectItem value="udp">UDP</SelectItem>
                          <SelectItem value="icmp">ICMP</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div className="space-y-2">

                      <Label>Packet Rate (pps)</Label>

                      <Input
                        type="number"
                        placeholder="1000"
                        value={formData.packetRate}
                        onChange={(e) =>
                          setFormData({ ...formData, packetRate: e.target.value })
                        }
                      />

                    </div>

                    <div className="space-y-2">

                      <Label>Packet Size (bytes)</Label>

                      <Input
                        type="number"
                        placeholder="1500"
                        value={formData.packetSize}
                        onChange={(e) =>
                          setFormData({ ...formData, packetSize: e.target.value })
                        }
                      />

                    </div>

                    <div className="space-y-2">

                      <Label>Flow Duration (seconds)</Label>

                      <Input
                        type="number"
                        placeholder="60"
                        value={formData.flowDuration}
                        onChange={(e) =>
                          setFormData({ ...formData, flowDuration: e.target.value })
                        }
                      />

                    </div>

                  </div>

                  <Button type="submit" size="lg" className="w-full gap-2 glow-cyan">

                    <Shield className="h-5 w-5" />

                    Analyze Traffic

                    <ArrowRight className="h-4 w-4" />

                  </Button>

                </form>

              </CardContent>

            </Card>

          </TabsContent>

        </Tabs>

      </div>

      <Footer />

    </main>
  )
}
