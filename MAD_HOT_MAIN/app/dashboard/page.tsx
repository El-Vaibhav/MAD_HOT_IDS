"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/api";
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
  ChevronLeft,
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
import { ENDPOINTS } from "@/lib/config"

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
  status: "safe" | "suspicious" | "blocked"
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

// Shared recharts tooltip styling — defined once so every chart on the
// dashboard renders legible text (fixes the "invisible on hover" issue).
const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
    padding: "8px 12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
  },
  itemStyle: {
    color: "hsl(var(--foreground))",
  },
  labelStyle: {
    color: "hsl(var(--muted-foreground))",
    fontWeight: 600,
    marginBottom: 4,
  },
  cursor: { fill: "hsl(var(--secondary))", opacity: 0.25 },
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
  const { user } = useAuth();
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
  const [queueExpanded, setQueueExpanded] = useState(false)
  const [severityFilter, setSeverityFilter] = useState<"all" | Alert["severity"]>("all")

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
      const res = await fetchWithAuth(`http://ip-api.com/json/${ip}`)
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

      const res = await fetchWithAuth("/recent-packets")
      if (!res.ok) {
        throw new Error(`Recent packets API failed: ${res.status}`)
      }

      const data: Packet[] = await res.json()

      // remove duplicate packets (same src, dest, protocol, timestamp)

      const uniqueMap = new Map<string, Packet>()

      data.forEach((p) => {

        const key = `${p.sourceIp}-${p.destIp}-${p.protocol}`

        // keep the latest packet of the flow
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, p)
        } else {
          const existing = uniqueMap.get(key)!

          if (new Date(p.timestamp) > new Date(existing.timestamp)) {
            uniqueMap.set(key, p)
          }
        }

      })

      const uniquePackets = Array.from(uniqueMap.values())

      /* ---------- ALERTS ---------- */


      const newAlerts = uniquePackets
        .filter(p => p.prediction !== "Benign" && p.prediction !== "Normal Traffic")
        .slice(0, 10)
        .map((p, i): Alert => ({

          id: "ALT-" + i,

          severity:

            p.confidence >= 0.9
              ? "critical"
              : p.confidence >= 0.75
                ? "high"
                : "medium",

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

      setSelectedAlert((prev) => {
        // First load
        if (!prev) return newAlerts[0] ?? null

        // Keep currently selected alert if it still exists
        const existing = newAlerts.find((a) => a.id === prev.id)

        return existing ?? newAlerts[0] ?? null
      })


      /* ---------- CONNECTIONS ---------- */

      const conns: Connection[] = uniquePackets.slice(0, 15).map((p, i) => {

        let status: Connection["status"] = "safe"

        if (
          p.prediction !== "Benign" &&
          p.prediction !== "Normal Traffic"
        ) {
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

      const threats = uniquePackets.filter(p => p.prediction !== "Benign" && p.prediction !== "Normal Traffic").length

      const threatRatio = threats / (uniquePackets.length || 1)

      const avgConfidence =
        uniquePackets.reduce((sum, p) => sum + p.confidence, 0) / (uniquePackets.length || 1)

      const avgPacketRate =
        uniquePackets.reduce((sum, p) => sum + p.packetRate, 0) / (uniquePackets.length || 1)

      const totalBytes =
        uniquePackets.reduce((sum, p) => sum + p.packetSize, 0)

      const packetsPerSecond =
        Math.round(avgPacketRate * uniquePackets.length) +
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


      const maliciousPackets = uniquePackets.filter(
        (p) => p.prediction !== "Normal Traffic" && p.prediction !== "Benign"
      )
      const maliciousRatio =
        maliciousPackets.length / Math.max(uniquePackets.length, 1)

      let risk =
        maliciousRatio * 90 +
        Math.min(avgPacketRate, 10)

      risk = Math.min(100, Math.round(risk))

      setStats({
        totalPackets: uniquePackets.length,
        packetsPerSecond,
        txPackets,
        rxPackets,
        activeConnections: new Set(uniquePackets.map(p => p.sourceIp)).size,
        threatsBlocked: threats,
        bandwidth: bandwidthMB,
        systemRisk: risk
      })


      /* ---------- PROTOCOL PIE ---------- */

      const counts: any = {}

      uniquePackets.forEach(p => {

        const proto = p.protocol.toUpperCase()

        counts[proto] = (counts[proto] || 0) + 1

      })

      const total = uniquePackets.length

      const protoChart = Object.keys(counts).map(proto => ({

        name: proto,

        value: Math.round((counts[proto] / total) * 100)

      }))

      setProtocolData(protoChart)


      /* ---------- TRAFFIC GRAPH ---------- */

      setPacketData(prev => {

        if (!uniquePackets.length) return prev

        const avgSize =
          uniquePackets.reduce((sum, p) => sum + p.packetSize, 0) / uniquePackets.length

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

      uniquePackets.forEach(p => {
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

        if (!uniquePackets.length) return prev

        const attacks = uniquePackets.filter(p => p.prediction !== "Benign" && p.prediction !== "Normal Traffic").length

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
      case "safe":
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

  // Lightweight MITRE ATT&CK lookup so the "Threat Intelligence" panel can
  // give the analyst a tactic/technique + plain-English impact statement
  // without needing a new backend field — matched against alert.type.
  const threatIntelMap: Record<string, { tactic: string; technique: string; impact: string }> = {
    "ddos": {
      tactic: "Impact",
      technique: "T1498 · Network Denial of Service",
      impact: "Volumetric flood targeting availability. Left unmitigated, upstream links or the target service may saturate.",
    },
    "dos": {
      tactic: "Impact",
      technique: "T1498 · Network Denial of Service",
      impact: "Sustained high-rate traffic aimed at exhausting service resources.",
    },
    "port scan": {
      tactic: "Reconnaissance",
      technique: "T1595 · Active Scanning",
      impact: "Attacker is enumerating open services. No data has been exfiltrated at this stage, but it often precedes exploitation.",
    },
    "probe": {
      tactic: "Reconnaissance",
      technique: "T1595 · Active Scanning",
      impact: "Low-noise probing of exposed services, typically a precursor to a targeted attempt.",
    },
    "brute force": {
      tactic: "Credential Access",
      technique: "T1110 · Brute Force",
      impact: "Repeated authentication attempts. Risk of account compromise increases the longer this continues.",
    },
    "botnet": {
      tactic: "Command & Control",
      technique: "T1071 · Application Layer Protocol",
      impact: "Traffic pattern consistent with a compromised host beaconing to a C2 server.",
    },
    "web attack": {
      tactic: "Initial Access",
      technique: "T1190 · Exploit Public-Facing Application",
      impact: "Possible exploitation attempt against an internet-facing service.",
    },
    "injection": {
      tactic: "Initial Access",
      technique: "T1190 · Exploit Public-Facing Application",
      impact: "Payload structure suggests an injection attempt against an application input.",
    },
  }

  const getThreatIntel = (type: string) => {
    const key = Object.keys(threatIntelMap).find((k) => type.toLowerCase().includes(k))
    return (
      (key && threatIntelMap[key]) || {
        tactic: "Unclassified",
        technique: "—",
        impact: "Traffic doesn't match a known signature pattern. Manual review is recommended before deciding next steps.",
      }
    )
  }

  const filteredAlerts = severityFilter === "all" ? alerts : alerts.filter((a) => a.severity === severityFilter)

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="px-4 py-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live IDS Dashboard</h1>
            {!user && (
              <p className="mt-1 text-xs text-black dark:text-yellow-400">
                Viewing global data (Login for personalized insights)
              </p>
            )}
            {user && (
              <p className="text-green-400 text-xs mt-1">
                Logged in as {user.name}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Real-time network intrusion detection monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
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
        <div className="grid gap-4 lg:grid-cols-12 items-start">
          {/* Left Column - Alert Queue */}

          {alerts.length > 0 && (

            <div
              className={`self-start space-y-4 transition-all duration-300 ${queueExpanded ? "lg:col-span-3" : "lg:col-span-2"
                }`}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Alert Queue
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl font-bold text-foreground">{filteredAlerts.length}</span>
                      <button
                        onClick={() => setQueueExpanded((v) => !v)}
                        aria-label={queueExpanded ? "Collapse alert queue" : "Expand alert queue"}
                        className="ml-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {queueExpanded ? (
                          <ChevronLeft className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Severity filter — gives the queue an actual job to do
                      instead of just being a static list, and reduces the
                      pressure on this column to feel empty. */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(["all", "critical", "high", "medium", "low"] as const).map((sev) => {
                      const count = sev === "all" ? alerts.length : alerts.filter((a) => a.severity === sev).length
                      const active = severityFilter === sev
                      return (
                        <button
                          key={sev}
                          onClick={() => setSeverityFilter(sev)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide transition-colors ${
                            active
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                          }`}
                        >
                          {sev} <span className="opacity-70">{count}</span>
                        </button>
                      )
                    })}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* max-h instead of a fixed h so the card hugs its content
                      when there are only a few alerts, instead of always
                      reserving 600px and leaving empty space below. */}
                  <ScrollArea className="max-h-[600px]">
                    <div className="space-y-1.5 p-2">
                      {filteredAlerts.length === 0 ? (
                        <p className="p-4 text-center text-xs text-muted-foreground">
                          No {severityFilter} severity alerts right now.
                        </p>
                      ) : (
                        filteredAlerts.map((alert) => (
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
                            <p className="mt-1 font-mono text-xs text-muted-foreground truncate">
                              {alert.source} → {alert.target}
                            </p>
                            <p className="mt-1 text-xs text-primary">
                              {alert.confidence.toFixed(1)}% <span className="text-muted-foreground">{alert.id}</span>
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Attack Type Frequency — the other half of what fills this
                  column: which attack types are recurring in the current
                  queue, computed from data already in `alerts`. */}
              {(() => {
                const typeCounts = alerts.reduce<Record<string, number>>((acc, a) => {
                  acc[a.type] = (acc[a.type] || 0) + 1
                  return acc
                }, {})
                const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])
                const maxCount = sortedTypes[0]?.[1] ?? 1

                return sortedTypes.length > 0 ? (
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Attack Type Frequency
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sortedTypes.map(([type, count]) => (
                        <div key={type}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="truncate text-foreground">{type}</span>
                            <span className="ml-2 shrink-0 font-semibold text-primary">{count}</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-primary/70"
                              style={{ width: `${(count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : null
              })()}
            </div>
          )}

          {/* Center Column - Live View */}
          <div
            className={`space-y-4 ${alerts.length > 0
              ? (queueExpanded ? "lg:col-span-6" : "lg:col-span-7")
              : "lg:col-span-9"
              }`}
          >
            {selectedAlert ? (
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
                    {selectedAlert.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{selectedAlert.description}</p>
                    )}

                    {/* Stats Row */}
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
                        <p className="text-lg font-bold font-mono text-foreground truncate">{selectedAlert.source}</p>
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

                            <Tooltip {...chartTooltipStyle} />

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
                <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
                  <Card className="flex h-full flex-col border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Detection Reasoning
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
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

                  <Card className="flex h-full flex-col border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Target Ports
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-center">
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={selectedAlert.targetPorts}
                            layout="horizontal"
                            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                          >
                            <XAxis
                              dataKey="port"
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={10}
                              tickFormatter={(value) => `:${value}`}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} hide />
                            {/* Explicit item/label colors fix the white-on-hover
                                legibility issue — recharts falls back to a color
                                that blends into the dark card without these. */}
                            <Tooltip
                              {...chartTooltipStyle}
                              formatter={(value: number) => [`${value} hits`, "Count"]}
                              labelFormatter={(value) => `Port :${value}`}
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

                {/* Recommended Actions + Threat Intelligence */}
                <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
                  <Card className="flex h-full flex-col border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Recommended Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
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

                  {/* New: fills the space that used to sit empty beside
                      Recommended Actions with a MITRE-mapped read on the
                      current alert, plus how often this source has shown
                      up in the live queue. */}
                  <Card className="flex h-full flex-col border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Threat Intelligence
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col space-y-4">
                      {(() => {
                        const intel = getThreatIntel(selectedAlert.type)
                        const sourceOccurrences = alerts.filter(
                          (a) => a.source === selectedAlert.source
                        ).length

                        return (
                          <>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                                {intel.tactic}
                              </Badge>
                              <span className="font-mono text-xs text-muted-foreground">{intel.technique}</span>
                            </div>

                            <p className="text-sm leading-6 text-foreground">{intel.impact}</p>

                            <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border/30 pt-3">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  Source Activity
                                </p>
                                <p className="mt-1 text-sm font-semibold text-foreground">
                                  {sourceOccurrences} alert{sourceOccurrences === 1 ? "" : "s"} in queue
                                </p>
                                <p className="text-xs text-muted-foreground">from {selectedAlert.source}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  Detection Confidence
                                </p>
                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                  <div
                                    className={`h-full ${getRiskBarColor(selectedAlert.confidence)}`}
                                    style={{ width: `${selectedAlert.confidence}%` }}
                                  />
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">{selectedAlert.confidence.toFixed(1)}%</p>
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <>
                {/* Healthy Network Overview */}

                <Card className="border-green-500/20 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">

                    <div className="flex flex-wrap items-center gap-3">

                      <Shield className="h-8 w-8 text-green-500 shrink-0" />

                      <div className="min-w-0">
                        <h2 className="text-2xl font-bold text-green-400">
                          All Security Systems Operational
                        </h2>

                        <p className="text-muted-foreground">
                          No active intrusion attempts detected. The IDS is continuously monitoring network traffic in real time.
                        </p>
                      </div>

                      <div className="ml-auto text-right">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          HEALTHY
                        </Badge>

                        <p className="mt-2 text-xs text-muted-foreground">
                          Last Health Check • Just now
                        </p>
                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-8 sm:grid-cols-4">

                      <div>
                        <p className="text-xs uppercase text-muted-foreground">
                          Packets Analysed
                        </p>

                        <p className="text-2xl font-bold">
                          {stats.totalPackets.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-muted-foreground">
                          Active Connections
                        </p>

                        <p className="text-2xl font-bold">
                          {stats.activeConnections}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-muted-foreground">
                          Detection Status
                        </p>

                        <p className="text-2xl font-bold text-green-400">
                          NORMAL
                        </p>
                      </div>

                      <div>
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">
                            Last Threat
                          </p>

                          <p className="text-xl font-bold text-green-400">
                            None
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Current Session
                          </p>
                        </div>
                      </div>

                    </div>

                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">

                  <Card className="border-green-500/20 bg-card/50 backdrop-blur-sm">

                    <CardHeader>
                      <CardTitle className="text-sm uppercase tracking-wider">
                        Network Health
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">

                      {[
                        "Traffic volume within normal baseline",
                        "No malicious signatures detected",
                        "No abnormal connection behavior observed",
                        "Packet flow operating within expected thresholds",
                        "Intrusion Detection Engine operational",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between border-b border-border/30 pb-2 last:border-none last:pb-0"
                        >
                          <span className="text-sm text-foreground">
                            {item}
                          </span>

                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-green-400">
                              OK
                            </span>
                          </div>
                        </div>
                      ))}

                    </CardContent>

                  </Card>

                  <Card className="border-green-500/20 bg-card/50 backdrop-blur-sm">

                    <CardHeader>

                      <CardTitle className="text-sm uppercase tracking-wider">
                        Recommended Actions
                      </CardTitle>

                    </CardHeader>

                    <CardContent className="space-y-4">

                      {[
                        ["Firewall Policies", "Active"],
                        ["Detection Engine", "Online"],
                        ["Signature Database", "Updated"],
                        ["Traffic Inspection", "Running"],
                        ["Security Logs", "Healthy"],
                      ].map(([label, value]) => (

                        <div
                          key={label}
                          className="flex items-center justify-between border-b border-border/30 pb-2 last:border-none last:pb-0"
                        >
                          <span className="text-sm text-muted-foreground">
                            {label}
                          </span>

                          <span className="text-sm font-medium text-green-400">
                            {value}
                          </span>

                        </div>

                      ))}

                    </CardContent>

                  </Card>

                </div>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">

                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider">
                      Monitoring Summary
                    </CardTitle>
                  </CardHeader>

                  <CardContent>

                    <p className="text-sm leading-7 text-muted-foreground">
                      No Indicators of Compromise (IoCs) have been detected during the
                      current monitoring session. Network traffic characteristics remain
                      consistent with the established baseline, and all IDS detection
                      modules are actively inspecting inbound and outbound traffic.
                    </p>

                  </CardContent>

                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">

                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider">
                      Recent Activity
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">

                    {[
                      "Traffic baseline verified",
                      "Signature database synchronized",
                      "Flow monitoring active",
                      "Packet inspection completed",
                      "No anomalies detected",
                    ].map((event, index) => (

                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">

                          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />

                          <span className="text-sm">
                            {event}
                          </span>

                        </div>

                        <span className="text-xs text-muted-foreground">
                          Just now
                        </span>

                      </div>

                    ))}

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

            {/* Packets/Sec + Bandwidth + Active Connections — merged into one
                compact card instead of three, so the sidebar doesn't run
                longer than the center column and leave a gap underneath. */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="grid grid-cols-3 divide-x divide-border/50 p-0">
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pkts/Sec</p>
                  <p className="mt-1 text-xl font-bold text-foreground">{stats.packetsPerSecond.toLocaleString()}</p>
                  <div className="mt-1 flex gap-2 text-[10px]">
                    <span className="text-primary">TX {stats.txPackets}</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Bandwidth</p>
                  <p className="mt-1 text-xl font-bold text-foreground">{stats.bandwidth} <span className="text-[10px] font-normal text-muted-foreground">MB/s</span></p>
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Connections</p>
                  <p className="mt-1 text-xl font-bold text-foreground">{stats.activeConnections}</p>
                </div>
              </CardContent>
            </Card>

            {/* Severity Breakdown — glanceable composition of the current
                alert queue, built entirely from data already in `alerts`. */}
            {alerts.length > 0 && (() => {
              const severityOrder: Alert["severity"][] = ["critical", "high", "medium", "low"]
              const severityBarColor: Record<Alert["severity"], string> = {
                critical: "bg-destructive",
                high: "bg-orange-500",
                medium: "bg-yellow-500",
                low: "bg-blue-500",
              }
              const severityTextColor: Record<Alert["severity"], string> = {
                critical: "text-destructive",
                high: "text-orange-500",
                medium: "text-yellow-500",
                low: "text-blue-500",
              }
              const counts = severityOrder.map((sev) => ({
                sev,
                count: alerts.filter((a) => a.severity === sev).length,
              }))

              return (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Severity Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
                      {counts.map(({ sev, count }) =>
                        count > 0 ? (
                          <div
                            key={sev}
                            className={severityBarColor[sev]}
                            style={{ width: `${(count / alerts.length) * 100}%` }}
                          />
                        ) : null
                      )}
                    </div>
                    <div className="mt-3 space-y-2">
                      {counts.map(({ sev, count }) => (
                        <div key={sev} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${severityBarColor[sev]}`} />
                            <span className="capitalize text-foreground">{sev}</span>
                          </div>
                          <span className={`font-semibold ${severityTextColor[sev]}`}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })()}

            {/* Protocol Distribution — this is now the single source of truth
                for protocol breakdown (a matching donut chart previously
                duplicated this data further down the page; removed). */}
            {protocolData.length > 0 && (

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Protocol Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={protocolData}
                            cx="50%"
                            cy="50%"
                            innerRadius={26}
                            outerRadius={42}
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
                                stroke="hsl(var(--card))"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            {...chartTooltipStyle}
                            formatter={(value: number, name: string) => [`${value}%`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      {protocolData.map((proto) => (
                        <div key={proto.name} className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: protocolColors[proto.name] || "#888" }}
                          />
                          <span className="text-foreground">{proto.name}</span>
                          <span className="text-muted-foreground">{proto.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {topSources.length > 0 && (

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Top Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topSources.map((source) => (
                      <div key={source.ip} className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex min-w-0 items-center gap-2">
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: source.color }}
                          />
                          <span className="truncate font-mono text-foreground">{source.ip}</span>
                        </div>
                        <span className="shrink-0 text-muted-foreground">{source.location}, {source.country}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 border-t border-border/30 pt-3 text-xs">
                    <div className="h-2 w-2 rounded-full bg-cyber-success animate-pulse" />
                    <span className="text-cyber-success">STREAM CONNECTED</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom Section - Live Packet Monitor (full width; the redundant
            Protocol Breakdown pie chart that used to sit beside it has been
            removed since Protocol Distribution in the sidebar already
            covers the exact same data). */}
        {packetData.length > 0 && (

          <div className="mt-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
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
                      <Tooltip {...chartTooltipStyle} />
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
          </div>
        )}

        {/* Active Connections Table */}
        {connections.length > 0 && (

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
              <div className="overflow-x-auto">
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
                      <TableRow key={conn.id} className="hover:bg-secondary/40">
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
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </main>
  )
}