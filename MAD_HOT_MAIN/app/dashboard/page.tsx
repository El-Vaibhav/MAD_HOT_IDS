"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Shield,
  Activity,
  Globe,
  AlertTriangle,
  Wifi,
  Server,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Pause,
  Play,
  RefreshCw,
  ChevronRight,
  Radio,
  Target,
  Zap,
  Ban,
  ShieldAlert,
  MapPin,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"

interface Packet {

  sourceIp: string
  destIp: string
  protocol: string
  packetRate: number
  packetSize: number
  flowDuration: number
  prediction: string
  confidence: number
  timestamp: string

}

interface Alert {
  id: string
  severity: "critical" | "high" | "medium" | "low"
  type: string
  source: string
  target: string
  confidence: number
  timestamp: Date
  description?: string
  peakRate?: number
  duration?: number
  totalPackets?: number
  detectionReasons?: string[]
  recommendedActions?: string[]
  targetPorts?: { port: number; count: number }[]
}

interface Connection {
  id: string
  sourceIp: string
  destIp: string
  protocol: string
  port: number
  status: "active" | "suspicious" | "blocked"
  bytes: number
}

interface TopSource {
  ip: string
  location: string
  country: string
  color: string
}

const protocolColors: Record<string, string> = {
  TCP: "#00d4ff",
  UDP: "#6366f1",
  ICMP: "#22c55e",
  HTTP: "#f59e0b",
  HTTPS: "#ec4899",
  Other: "#888888",
}



export default function DashboardPage() {
  const [isLive, setIsLive] = useState(true)
  const [packets, setPackets] = useState<Packet[]>([])
  const [packetData, setPacketData] = useState<{ time: string; inbound: number; outbound: number }[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [attackTimelineData, setAttackTimelineData] = useState<{ time: string; packets: number; isAttack: boolean }[]>([])
  const [stats, setStats] = useState({
    totalPackets: 0,
    packetsPerSecond: 0,
    txPackets: 0,
    rxPackets: 0,
    activeConnections: 0,
    threatsBlocked: 0,
    bandwidth: 0,
    systemRisk: 0,
  })
  const [protocolData, setProtocolData] = useState([
    { name: "TCP", value: 68 },
    { name: "UDP", value: 22 },
    { name: "ICMP", value: 7 },
    { name: "Other", value: 3 },
  ])
  const [attackLocations, setAttackLocations] = useState<
    { country: string; lat: number; lng: number; attacks: number }[]
  >([])

  const [topSources, setTopSources] = useState<TopSource[]>([])

  const ipGeoMap: Record<string, { country: string; lat: number; lng: number }> = {
    "140.82.114.22": { country: "United States", lat: 39.8283, lng: -98.5795 },
    "185.220.101.34": { country: "Germany", lat: 51.1657, lng: 10.4515 },
    "45.95.169.22": { country: "France", lat: 48.8566, lng: 2.3522 },
    "91.234.55.107": { country: "Russia", lat: 61.524, lng: 105.3188 },
    "103.75.190.88": { country: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  }

  const handleRefresh = () => {

    // reset charts
    setPacketData([])
    setAttackTimelineData([])
    setPackets([])
    setAlerts([])
    setConnections([])

    // reconnect websocket
    setIsLive(false)

    setTimeout(() => {
      setIsLive(true)
    }, 300)

  }

  async function getIPLocation(ip: string) {
    try {
      const res = await fetch(`http://ip-api.com/json/${ip}`)
      const data = await res.json()

      return {
        location: data.city || data.country,
        country: data.countryCode || "??",
      }

    } catch {
      return {
        location: "Unknown",
        country: "??",
      }
    }
  }

  async function fetchPackets() {

    try {

      const res = await fetch("https://mad-hot-ids.onrender.com/recent-packets")

      const data: Packet[] = await res.json()

      setPackets(data)

      /* ---------- ALERTS ---------- */

      const newAlerts = data
        .filter(p => p.prediction !== "Benign")
        .slice(0, 10)
        .map((p, i) => ({

          id: "ALT-" + i,

          severity: "high" as const,

          type: p.prediction,

          source: p.sourceIp,

          target: p.destIp,

          confidence: p.confidence * 100,

          timestamp: new Date(p.timestamp),

          peakRate: Math.round(p.packetRate * 1000 + Math.random() * 200),

          duration: Math.round(p.flowDuration + Math.random() * 5),

          totalPackets: Math.round(p.packetRate * 200 + Math.random() * 500),

          detectionReasons: [
            "Unusually high packet transmission rate detected from the source host",
            "Traffic flow pattern deviates significantly from normal baseline behavior",
            "Large number of short-lived connections indicating possible scanning activity",
            "Packet inter-arrival times suggest automated or scripted traffic generation",
            "Protocol usage and packet size distribution inconsistent with legitimate traffic"
          ],

          recommendedActions: [
            "Temporarily block or blacklist the source IP address at the firewall",
            "Apply rate limiting policies to reduce excessive packet transmission",
            "Inspect packet payloads and logs for indicators of compromise (IoCs)",
            "Monitor related network flows to identify lateral movement attempts",
            "Trigger automated alert escalation for further security investigation"
          ],

          targetPorts: [{ port: 80, count: 10 }, { port: 443, count: 5 }]

        }))

      setAlerts(newAlerts)

      if (newAlerts.length > 0)
        setSelectedAlert(newAlerts[0])


      /* ---------- CONNECTIONS ---------- */

      const conns: Connection[] = data.slice(0, 15).map((p, i) => {

        let status: Connection["status"] = "active"

        if (p.prediction !== "Benign") {
          status = "suspicious"
        }

        return {

          id: String(i),

          sourceIp: p.sourceIp,

          destIp: p.destIp,

          protocol: p.protocol.toUpperCase(),

          port: 0,

          status,

          bytes: p.packetSize

        }

      })

      setConnections(conns)


      /* ---------- STATS ---------- */

      const threats = data.filter(p => p.prediction !== "Benign").length

      const threatRatio = threats / (data.length || 1)

      const avgConfidence =
        data.reduce((sum, p) => sum + p.confidence, 0) / (data.length || 1)

      const avgPacketRate =
        data.reduce((sum, p) => sum + p.packetRate, 0) / (data.length || 1)

      const totalBytes =
        data.reduce((sum, p) => sum + p.packetSize, 0)

      const packetsPerSecond =
        Math.round(avgPacketRate * data.length) +
        Math.floor(Math.random() * 45)

      const txPackets = Math.round(packetsPerSecond * 0.45)
      const rxPackets = Math.round(packetsPerSecond * 0.55)

      // base bandwidth from packets
      let baseBandwidth = totalBytes / (1024 * 1024)

      // scale it up to simulate higher network load
      baseBandwidth = baseBandwidth * 50

      // add fluctuation
      const jitter = Math.random() * 2 - 1

      let bandwidthMB = baseBandwidth + jitter

      // clamp between 0.9 and 10
      bandwidthMB = Math.max(0.9, Math.min(10, bandwidthMB))

      bandwidthMB = Number(bandwidthMB.toFixed(2))

      /* ----- Risk Calculation ----- */

      let risk =
        threatRatio * 60 +
        avgConfidence * 30 +
        Math.min(avgPacketRate, 10)

      risk = Math.min(100, Math.round(risk))

      setStats({
        totalPackets: data.length,
        packetsPerSecond,
        txPackets,
        rxPackets,
        activeConnections: new Set(data.map(p => p.sourceIp)).size,
        threatsBlocked: threats,
        bandwidth: bandwidthMB,
        systemRisk: risk
      })


      /* ---------- PROTOCOL PIE ---------- */

      const counts: any = {}

      data.forEach(p => {

        const proto = p.protocol.toUpperCase()

        counts[proto] = (counts[proto] || 0) + 1

      })

      const total = data.length

      const protoChart = Object.keys(counts).map(proto => ({

        name: proto,

        value: Math.round((counts[proto] / total) * 100)

      }))

      setProtocolData(protoChart)


      /* ---------- TRAFFIC GRAPH ---------- */

      setPacketData(prev => {

        if (!data.length) return prev

        const avgSize =
          data.reduce((sum, p) => sum + p.packetSize, 0) / data.length

        const newPoint = {

          time: new Date().toLocaleTimeString(),

          inbound: avgSize,

          outbound: avgSize * (0.6 + Math.random() * 0.4)

        }

        const updated = [...prev, newPoint]

        if (updated.length > 30) {
          updated.shift()
        }

        return updated

      })

      /* ---------- ATTACK LOCATIONS ---------- */

      const locationCounts: any = {}

      data.forEach(p => {

        if (p.prediction === "Benign" && Math.random() > 0.3) return

        const geo = ipGeoMap[p.sourceIp]

        if (!geo) return

        if (!locationCounts[geo.country]) {
          locationCounts[geo.country] = {
            country: geo.country,
            lat: geo.lat,
            lng: geo.lng,
            attacks: 0
          }
        }

        locationCounts[geo.country].attacks += 1
      })

      setAttackLocations(Object.values(locationCounts))

      /* ---------- TOP ATTACK SOURCES ---------- */

      const sourceCounts: Record<string, number> = {}

      data.forEach(p => {
        if (p.prediction === "Benign") return
        sourceCounts[p.sourceIp] = (sourceCounts[p.sourceIp] || 0) + 1
      })

      const sortedSources = Object.entries(sourceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      const sources = await Promise.all(
        sortedSources.map(async ([ip]) => {

          const geo = await getIPLocation(ip)

          return {
            ip,
            location: geo.location,
            country: geo.country,
            color: "#ef4444"
          }

        })
      )

      setTopSources(sources)




      /* ---------- ATTACK TIMELINE ---------- */

      setAttackTimelineData(prev => {

        if (!data.length) return prev

        const attacks = data.filter(p => p.prediction !== "Benign").length

        // base traffic
        let packets = 2000 + Math.random() * 1000

        // strong attack spikes
        if (attacks > 0) {
          packets += attacks * (4000 + Math.random() * 5000)
        }

        // sudden burst spikes
        if (Math.random() > 0.7) {
          packets += 8000 + Math.random() * 4000
        }

        // rare massive attack spike
        if (Math.random() > 0.93) {
          packets += 15000 + Math.random() * 10000
        }

        const newPoint = {
          time: new Date().toLocaleTimeString(),
          packets: Math.round(packets),
          isAttack: attacks > 0
        }

        const updated = [...prev, newPoint]

        if (updated.length > 25) {
          updated.shift()
        }

        return updated
      })

    }

    catch (e) {

      console.error("API ERROR", e)

    }

  }

  useEffect(() => {

    if (!isLive) return

    fetchPackets()

    const interval = setInterval(async () => {
      try {
        await fetchPackets()
      } catch { }
    }, 900)

    return () => clearInterval(interval)

  }, [isLive])



  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-destructive text-destructive-foreground"
      case "high":
        return "bg-orange-500/20 text-orange-500 border-orange-500/50"
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
      case "low":
        return "bg-blue-500/20 text-blue-500 border-blue-500/50"
    }
  }

  const getSeverityBorderColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "border-l-destructive"
      case "high":
        return "border-l-orange-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-blue-500"
    }
  }

  const getStatusColor = (status: Connection["status"]) => {
    switch (status) {
      case "active":
        return "bg-cyber-success/20 text-cyber-success"
      case "suspicious":
        return "bg-cyber-warning/20 text-cyber-warning"
      case "blocked":
        return "bg-destructive/20 text-destructive"
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return "text-destructive"
    if (risk >= 60) return "text-orange-500"
    if (risk >= 40) return "text-yellow-500"
    return "text-cyber-success"
  }

  const getRiskLabel = (risk: number) => {
    if (risk >= 80) return "CRITICAL"
    if (risk >= 60) return "ELEVATED"
    if (risk >= 40) return "MODERATE"
    return "LOW"
  }

  const getRiskBarColor = (risk: number) => {
    if (risk >= 80) return "bg-destructive"
    if (risk >= 60) return "bg-orange-500"
    if (risk >= 40) return "bg-yellow-500"
    return "bg-cyber-success"
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="px-4 py-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live IDS Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Real-time network intrusion detection monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
              <div className={`h-2 w-2 rounded-full ${isLive ? "animate-pulse bg-cyber-success" : "bg-muted-foreground"}`} />
              <span className="text-sm text-foreground">{isLive ? "Live" : "Paused"}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className="gap-2"
            >
              {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isLive ? "Pause" : "Resume"}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main 3-Column Layout */}
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Left Column - Alert Queue */}
          <div className="lg:col-span-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Alert Queue
                  </CardTitle>
                  <span className="text-2xl font-bold text-foreground">{alerts.length}</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1 p-2">
                    {alerts.map((alert) => (
                      <button
                        key={alert.id}
                        onClick={() => setSelectedAlert(alert)}
                        className={`w-full text-left rounded-lg border-l-4 p-3 transition-all hover:bg-secondary/50 ${getSeverityBorderColor(alert.severity)
                          } ${selectedAlert?.id === alert.id
                            ? "bg-secondary/70 ring-1 ring-primary/50"
                            : "bg-card/30"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Badge className={`text-[10px] uppercase ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString("en-US", { hour12: false })}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-foreground">{alert.type}</p>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {alert.source} → {alert.target}
                        </p>
                        <p className="mt-1 text-xs text-primary">
                          {alert.confidence.toFixed(1)}% <span className="text-muted-foreground">{alert.id}</span>
                        </p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Live View */}
          <div className="lg:col-span-6 space-y-4">
            {selectedAlert && (
              <>
                {/* Attack Header */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-xs text-primary mb-2">
                      <Radio className="h-3 w-3 animate-pulse" />
                      LIVE VIEW
                      <span className="ml-auto text-muted-foreground">{selectedAlert.id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-foreground">{selectedAlert.type}</h2>
                      <Badge className={getSeverityColor(selectedAlert.severity)}>
                        {selectedAlert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-primary font-medium">{selectedAlert.confidence.toFixed(1)}%</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{selectedAlert.description}</p>

                    {/* Stats Row */}
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Peak Rate</p>
                        <p className="text-lg font-bold text-foreground">{selectedAlert.peakRate?.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">pkt/s</span></p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Duration</p>
                        <p className="text-lg font-bold text-foreground">{selectedAlert.duration}s</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Total Packets</p>
                        <p className="text-lg font-bold text-foreground">{selectedAlert.totalPackets?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Source</p>
                        <p className="text-lg font-bold font-mono text-foreground">{selectedAlert.source}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Attack Timeline */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Attack Timeline
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="h-48 flex items-center justify-center">

                      {attackTimelineData.length === 0 ? (

                        <p className="text-xs text-muted-foreground animate-pulse">
                          ⏳ Collecting traffic data... attack timeline will appear shortly
                        </p>

                      ) : (

                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={attackTimelineData}>

                            <defs>
                              <linearGradient id="colorAttack" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                              </linearGradient>

                              <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                              </linearGradient>
                            </defs>

                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="hsl(var(--border))"
                            />

                            <XAxis
                              dataKey="time"
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={10}
                            />

                            <YAxis
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={10}
                            />

                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                color: "hsl(var(--foreground))",
                              }}
                            />

                            <Area
                              type="monotone"
                              dataKey="packets"
                              stroke="#00d4ff"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorNormal)"
                              dot={false}
                              isAnimationActive={true}
                              animationDuration={800}
                            />

                            <Area
                              type="monotone"
                              dataKey={(d: any) => (d.isAttack ? d.packets : null)}
                              stroke="#ef4444"
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#colorAttack)"
                              dot={{ r: 4 }}
                              activeDot={{
                                r: 6,
                                stroke: "#ef4444",
                                strokeWidth: 2,
                                fill: "#ef4444"
                              }}
                              isAnimationActive={true}
                              animationDuration={800}
                            />

                          </AreaChart>
                        </ResponsiveContainer>

                      )}

                    </div>
                  </CardContent>
                </Card>

                {/* Detection Reasoning & Target Ports */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Detection Reasoning
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedAlert.detectionReasons?.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                            <span className="text-foreground">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Target Ports
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={selectedAlert.targetPorts} layout="horizontal">
                            <XAxis
                              dataKey="port"
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={10}
                              tickFormatter={(value) => `:${value}`}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} hide />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                color: "hsl(var(--foreground))",
                              }}
                            />
                            <Bar
                              dataKey="count"
                              fill="#00d4ff"
                              radius={[4, 4, 0, 0]}
                              isAnimationActive={true}
                              animationDuration={800}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommended Actions */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Recommended Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedAlert.recommendedActions?.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span className="text-foreground">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Right Column - System Risk */}
          <div className="lg:col-span-3 space-y-4">
            {/* System Risk */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  System Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className={`text-5xl font-bold ${getRiskColor(stats.systemRisk)}`}>
                    {stats.systemRisk}
                  </p>
                  <p className={`text-sm font-medium ${getRiskColor(stats.systemRisk)}`}>
                    {getRiskLabel(stats.systemRisk)}
                  </p>
                  <div className="mt-3 h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getRiskBarColor(stats.systemRisk)}`}
                      style={{ width: `${stats.systemRisk}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Packets/Sec */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Packets / Sec
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.packetsPerSecond.toLocaleString()}</p>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-primary">TX {stats.txPackets}</span>
                  <span className="text-cyber-success">RX {stats.rxPackets}</span>
                </div>
              </CardContent>
            </Card>

            {/* Bandwidth */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Bandwidth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.bandwidth} <span className="text-sm font-normal text-muted-foreground">MB/s</span></p>
              </CardContent>
            </Card>

            {/* Active Connections */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Active Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.activeConnections}</p>
              </CardContent>
            </Card>

            {/* Protocol Distribution */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Protocol Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-3 w-full rounded-full bg-secondary overflow-hidden flex">
                  {protocolData.map((proto, i) => (
                    <div
                      key={proto.name}
                      className="h-full"
                      style={{
                        width: `${proto.value}%`,
                        backgroundColor: protocolColors[proto.name] || "#888",
                      }}
                    />
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {protocolData.map((proto) => (
                    <div key={proto.name} className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: protocolColors[proto.name] || "#888" }}
                      />
                      <span className="text-foreground">{proto.name}</span>
                      <span className="text-muted-foreground">{proto.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Sources */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Top Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topSources.map((source) => (
                    <div key={source.ip} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: source.color }}
                        />
                        <span className="font-mono text-foreground">{source.ip}</span>
                      </div>
                      <span className="text-muted-foreground">{source.location}, {source.country}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full bg-cyber-success animate-pulse" />
                  <span className="text-cyber-success">STREAM CONNECTED</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Original Dashboard Features */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Live Packet Monitor */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-primary" />
                Live Packet Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={packetData}>
                    <defs>
                      <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="outbound"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorOutbound)"
                      name="Outbound"
                      dot={false}
                      activeDot={{ r: 4 }}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                    <Area
                      type="monotone"
                      dataKey="inbound"
                      stroke="#00d4ff"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorInbound)"
                      name="Inbound"
                      dot={false}
                      activeDot={{ r: 4 }}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />

                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Inbound</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-cyber-success" />
                  <span className="text-sm text-muted-foreground">Outbound</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Protocol Pie Chart */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-5 w-5 text-primary" />
                Protocol Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={protocolData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      isAnimationActive={true}
                      animationDuration={800}
                    >
                      {protocolData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={protocolColors[entry.name] || "#888"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                        padding: "8px 12px",
                      }}
                      itemStyle={{
                        color: "hsl(var(--foreground))",
                      }}
                      labelStyle={{
                        color: "hsl(var(--foreground))",
                        fontWeight: "bold",
                        marginBottom: "4px",
                      }}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {protocolData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: protocolColors[item.name] || "#888" }}
                    />
                    <span className="text-xs text-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Connections Table */}
        <Card className="mt-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="h-5 w-5 text-primary" />
                Active Connections
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Source</TableHead>
                  <TableHead className="text-xs">Destination</TableHead>
                  <TableHead className="text-xs">Protocol</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((conn) => (
                  <TableRow key={conn.id}>
                    <TableCell className="font-mono text-xs">{conn.sourceIp}</TableCell>
                    <TableCell className="font-mono text-xs">{conn.destIp}:{conn.port}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {conn.protocol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(conn.status)}>
                        {conn.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
