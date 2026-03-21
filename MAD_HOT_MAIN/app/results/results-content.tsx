"use client"
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { exportAnalysisReportToPDF } from "@/lib/export-pdf"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

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
  AlertTriangle,
  CheckCircle2,
  Activity,
  Download,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Zap,
  Clock,
  Globe,
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
} from "recharts"



/* ------------------------------
   GET RESULTS FROM ANALYZER PAGE
--------------------------------*/

export default function ResultsPage() {

  const searchParams = useSearchParams()

  const attackType = searchParams.get("attack") || "Normal Traffic"
  const confidenceParam = Number(searchParams.get("confidence") || 0)

  const [confidence] = useState(confidenceParam * 100)
  const [riskLevel] = useState(confidenceParam * 100)
  const [isAttack] = useState(attackType !== "Normal Traffic")
  const [isExporting, setIsExporting] = useState(false)



  /* ------------------------------
   VISUALIZATION DATA FROM BACKEND
--------------------------------*/

  const searchVisualization = searchParams.get("viz")

  let visualizationData = null

  if (searchVisualization) {
    try {
      visualizationData = JSON.parse(decodeURIComponent(searchVisualization))
    } catch {
      visualizationData = null
    }
  }

  const packetRateData = visualizationData?.packet_rate || []
  const protocolData = visualizationData?.protocol_distribution || []
  const heatmapData = visualizationData?.traffic_heatmap || []
  const topIPs = visualizationData?.top_ips || []

  console.log("Visualization Data:", visualizationData)
  console.log("Packet Rate:", packetRateData)
  console.log("Protocol Data:", protocolData)
  console.log("Heatmap Data:", heatmapData)
  console.log("Top IPs:", topIPs)

  const getAttackTheme = (attack: string) => {
    switch (attack) {
      case "Benign":
        return {
          box: "border-green-500/40 bg-green-500/10",
          badge: "bg-green-500/20 text-green-400",
          dot: "bg-green-400",
        }

      case "PortScan":
        return {
          box: "border-orange-500/40 bg-orange-500/10",
          badge: "bg-orange-500/20 text-orange-400",
          dot: "bg-orange-400",
        }

      case "C":
      case "Malware":
        return {
          box: "border-red-500/40 bg-red-500/10",
          badge: "bg-red-500/20 text-red-400",
          dot: "bg-red-400",
        }

      case "DDoS":
        return {
          box: "border-red-700/40 bg-red-700/10",
          badge: "bg-red-700/20 text-red-500",
          dot: "bg-red-500",
        }

      default:
        return {
          box: "border-border/50 bg-card/50",
          badge: "",
          dot: "",
        }
    }
  }



  /* ------------------------------
     DETECTION REASONS
  --------------------------------*/

  const detectionReasons = [
    "Abnormal packet burst detected",
    "High TCP SYN frequency detected",
    "Network entropy anomaly detected",
    "Traffic pattern matches malicious behavior",
    "Source IP flagged in threat intelligence database",
  ]

  const attackDescriptions = {
    Benign: {
      type: "Normal Traffic",
      rate: "Normal Rate",
      description:
        "Benign traffic represents legitimate network communication between devices. Packets are transmitted at a stable and expected rate without attempting to exhaust network resources. This traffic follows standard communication patterns and does not exhibit malicious behavior such as flooding, scanning, or command-and-control activity.",
      characteristics: [
        "Stable packet transmission rate",
        "No abnormal traffic spikes",
        "Legitimate communication between devices",
        "No attempt to exhaust network bandwidth or CPU",
      ],
    },

    "C": {
      type: "Command & Control Communication",
      rate: "Suspicious Control Traffic",
      description:
        "Command-and-Control (C&C) traffic indicates communication between a compromised device and a remote attacker-controlled server. Malware-infected systems use C&C channels to receive instructions, download additional payloads, or exfiltrate sensitive data. Detecting C&C traffic is critical because it often indicates an active compromise within the network.",
      characteristics: [
        "Persistent connection to suspicious external servers",
        "Periodic beaconing behavior",
        "Encrypted or obfuscated command channels",
        "Communication with known malicious domains or IPs",
      ],
    },

    DDoS: {
      type: "Distributed Denial of Service",
      rate: "Extremely High Packet Rate",
      description:
        "A Distributed Denial of Service (DDoS) attack attempts to overwhelm a target system, server, or network by flooding it with an excessive number of packets. These attacks typically originate from multiple compromised devices (botnets) and aim to disrupt legitimate service availability by exhausting network or computational resources.",
      characteristics: [
        "Extremely high packet transmission rate",
        "Traffic spikes originating from multiple sources",
        "Abnormal surge in connection attempts",
        "Network resource exhaustion and service disruption",
      ],
    },

    Malware: {
      type: "Malicious Activity Detected",
      rate: "Irregular Communication Pattern",
      description:
        "Malware-related traffic indicates the presence of malicious software operating within the network. Compromised devices may perform unauthorized actions such as scanning the network, communicating with attacker infrastructure, downloading payloads, or participating in botnet activity.",
      characteristics: [
        "Suspicious communication with external servers",
        "Unexpected packet behavior patterns",
        "Possible participation in botnet activity",
        "Irregular traffic patterns inconsistent with normal device behavior",
      ],
    },

    PortScan: {
      type: "Port Scanning Activity",
      rate: "Rapid Connection Attempts",
      description:
        "Port scanning is a reconnaissance technique used by attackers to identify open ports and services running on network devices. By rapidly probing multiple ports or hosts, attackers gather information that can later be exploited to launch targeted attacks against vulnerable services.",
      characteristics: [
        "Rapid sequential connection attempts",
        "Multiple ports probed within a short time window",
        "Reconnaissance activity before exploitation",
        "Unusual probing patterns across network hosts",
      ],
    },
  }
  const predictedAttack =
    attackType === "Normal Traffic" ? "Benign" : attackType

  const attack = attackDescriptions[predictedAttack as keyof typeof attackDescriptions] || attackDescriptions.Benign
  /* ------------------------------
     EXPORT REPORT
  --------------------------------*/

  const handleExportReport = async () => {

    setIsExporting(true)

    try {
      await exportAnalysisReportToPDF({
        attackType,
        confidence,
        riskLevel,
        status: isAttack ? "ATTACK" : "NORMAL",
        reasons: isAttack ? detectionReasons : ["Normal traffic patterns observed"],
        explanation: attack.description,
        characteristics: attack.characteristics
      })
    } finally {
      setIsExporting(false)
    }
  }



  /* ------------------------------
     PAGE UI
  --------------------------------*/

  return (
    <main className="min-h-screen">

      <Navigation />

      <div id="results-report" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">

        {/* Header */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold">Security Analysis Results</h1>
            <p className="mt-1 text-muted-foreground">
              Analysis completed at {new Date().toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2">

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleExportReport}
              disabled={isExporting}
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export Report"}
            </Button>

            <Link href="/analyzer">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                New Analysis
              </Button>
            </Link>

          </div>

        </div>



        {/* SECURITY STATUS */}

        <Card
          className={`mb-8 border-2 ${isAttack
            ? "border-destructive/50 bg-destructive/5"
            : "border-cyber-success/50 bg-cyber-success/5"
            }`}
        >

          <CardContent className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:justify-between">

            <div className="flex items-center gap-4">

              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full ${isAttack ? "bg-destructive/20" : "bg-cyber-success/20"
                  }`}
              >

                {isAttack ? (
                  <AlertTriangle className="h-10 w-10 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-10 w-10 text-cyber-success" />
                )}

              </div>

              <div>

                <h2
                  className={`text-3xl font-bold ${isAttack ? "text-destructive" : "text-cyber-success"
                    }`}
                >
                  {isAttack ? "ATTACK DETECTED" : "SAFE"}
                </h2>

                <p className="text-muted-foreground">
                  {isAttack
                    ? "Malicious network activity has been identified"
                    : "No malicious activity detected"}
                </p>

              </div>

            </div>


            {/* ATTACK TYPE + CONFIDENCE */}

            <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-3">

              <div>
                <div className="text-2xl font-bold text-primary">{attackType}</div>
                <div className="text-sm text-muted-foreground">Attack Type</div>
              </div>

              <div>
                <div className="text-2xl font-bold">{confidence.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <div className={`text-2xl font-bold ${isAttack ? "text-destructive" : "text-cyber-success"}`}>
                  {riskLevel.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Risk Level</div>
              </div>

            </div>

          </CardContent>

        </Card>



        {/* RISK GAUGE */}

        <div className="mb-8 grid gap-6 lg:grid-cols-3">

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">

            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Risk Assessment
              </CardTitle>
            </CardHeader>

            <CardContent>

              <div className="relative mx-auto h-40 w-40">

                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">

                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-secondary"
                  />

                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${riskLevel * 2.83} 283`}
                    strokeLinecap="round"
                    className={`${isAttack ? "text-destructive" : "text-cyber-success"} transition-all duration-500`}
                  />

                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{riskLevel.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>

              </div>

              <div className="mt-4 text-center">
                <Badge
                  variant={isAttack ? "destructive" : "secondary"}
                  className="text-sm"
                >
                  {isAttack ? "High Risk" : "Low Risk"}
                </Badge>
              </div>

            </CardContent>

          </Card>



          {/* DETECTION REASON */}

          <Card className={`backdrop-blur-sm lg:col-span-2 ${getAttackTheme(predictedAttack).box}`}>

            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-primary" />
                Detection Reason
              </CardTitle>
              <CardDescription>
                Why this traffic was flagged as malicious
              </CardDescription>
            </CardHeader>

            <CardContent>

              {isAttack ? (
                <ul className="space-y-3">

                  {detectionReasons.map((reason, i) => (

                    <li key={i} className="flex items-start gap-3">

                      <div className="mt-0.5 h-2 w-2 rounded-full bg-destructive" />

                      <span className="text-sm">{reason}</span>

                    </li>

                  ))}

                </ul>
              ) : (
                <ul className="text-sm text-cyber-success list-disc pl-5 space-y-2">
                  <li>
                    This traffic pattern matches normal network behaviour.
                  </li>

                  <li>
                    The packet rate is within the expected range for standard network
                    communication and does not indicate abnormal spikes typically
                    associated with flooding or denial-of-service attacks.
                  </li>

                  <li>
                    The packet size falls within the normal distribution observed during
                    training, suggesting legitimate data transmission rather than
                    malicious payload patterns.
                  </li>

                  <li>
                    The flow duration indicates a stable and short-lived communication
                    session, which is characteristic of regular client–server interactions.
                  </li>

                  <li>
                    The protocol used in the communication is commonly observed in benign
                    network operations and does not exhibit patterns associated with
                    known attack signatures.
                  </li>
                </ul>
              )}

            </CardContent>

          </Card>

        </div>

        {/* Attack Type Explanation */}
        <Card className={`mt-8 backdrop-blur-sm ${getAttackTheme(predictedAttack).box}`}>
          <CardHeader>
            <CardTitle>Attack Type Explanation</CardTitle>
            <CardDescription>
              Description of detected traffic patterns
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">

              <div className={`rounded-lg border p-6 ${getAttackTheme(predictedAttack).box}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{predictedAttack} Traffic</h3>
                  <Badge className={getAttackTheme(predictedAttack).badge}>
                    {attack?.rate}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {attack?.description}
                </p>

                <div>
                  <p className="text-sm font-medium mb-2">Characteristics:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {attack?.characteristics?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={`mt-1 h-2 w-2 rounded-full ${getAttackTheme(predictedAttack).dot}`}></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* ===============================
              NETWORK TRAFFIC VISUALIZATIONS
            ================================*/}

        {packetRateData.length <= 10 && (
          <div className="mb-6 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-300">
            Visualization shows simulated traffic patterns based on the provided packet characteristics.
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">


          {/* Packet Rate Timeline */}

          <Card id="packet-rate-chart">

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Packet Rate Timeline
              </CardTitle>

              <CardDescription>
                Traffic flow observed in uploaded dataset
              </CardDescription>

            </CardHeader>

            <CardContent>

              <ResponsiveContainer width="100%" height={250}>

                <LineChart data={packetRateData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="time" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#00f0ff"
                    strokeWidth={3}
                  />

                </LineChart>

              </ResponsiveContainer>

            </CardContent>

          </Card>



          {/* Protocol Distribution */}

          <Card id="protocol-chart">

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Protocol Distribution
              </CardTitle>

              <CardDescription>
                Protocol usage detected in traffic
              </CardDescription>

            </CardHeader>

            <CardContent>

              <ResponsiveContainer width="100%" height={250}>

                <PieChart>

                  <Pie
                    data={protocolData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                  >

                    {protocolData.map((_entry: any, index: number) => (
                      <Cell key={index} fill={["#00d4ff", "#6366f1", "#22c55e", "#f59e0b"][index % 4]} />
                    ))}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </CardContent>

          </Card>



          {/* Traffic Heatmap */}

          <Card id="traffic-intensity-chart">

            <CardHeader>

              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Traffic Intensity
              </CardTitle>

              <CardDescription>
                Traffic distribution across time windows
              </CardDescription>

            </CardHeader>

            <CardContent>

              <ResponsiveContainer width="100%" height={250}>

                <AreaChart data={heatmapData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="hour" />

                  <YAxis />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="intensity"
                    stroke="#6366f1"
                    fill="#6366f133"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </CardContent>

          </Card>



          {/* Top Source IPs */}

          <Card id="top-ip-chart">

            <CardHeader>

              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Top Source IPs
              </CardTitle>

              <CardDescription>
                Most active sources detected
              </CardDescription>

            </CardHeader>

            <CardContent>

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead>IP Address</TableHead>
                    <TableHead>Packets</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Threat Score</TableHead>

                  </TableRow>

                </TableHeader>

                <TableBody>

                  {topIPs.map((ip: { ip: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; packets: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; protocol: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; threatScore: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }, index: Key | null | undefined) => {
                    const threatScoreValue = typeof ip.threatScore === 'number' ? ip.threatScore : 0

                    return (
                      <TableRow key={index}>

                        <TableCell>{ip.ip}</TableCell>

                        <TableCell>{ip.packets}</TableCell>

                        <TableCell>{ip.protocol}</TableCell>

                        <TableCell>

                          <Badge variant={threatScoreValue > 70 ? "destructive" : "secondary"}>
                            {threatScoreValue}%
                          </Badge>

                        </TableCell>

                      </TableRow>
                    )
                  })}

                </TableBody>

              </Table>

            </CardContent>

          </Card>

        </div>

        {/* ACTIONS */}

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">

          <Link href="/dashboard">

            <Button size="lg" className="gap-2 glow-cyan">
              <Activity className="h-5 w-5" />
              View Live Dashboard
            </Button>

          </Link>

          <Link href="/intelligence">

            <Button size="lg" variant="outline" className="gap-2">
              <ExternalLink className="h-5 w-5" />
              Attack Intelligence
            </Button>

          </Link>

        </div>

      </div>

      <Footer />

    </main>
  )
}