"use client"

import { useState, useEffect } from "react"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Globe,
  TrendingUp,
  AlertTriangle,
  Target,
  Clock,
  BarChart3,
} from "lucide-react"

import {
  BarChart,
  Bar,
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
import { ENDPOINTS } from "@/lib/config"


const pieColors = ["#ef4444", "#f97316", "#22c55e", "#8b5cf6"]

export default function IntelligencePage() {

  const [attackTypeData, setAttackTypeData] = useState<any[]>([])
  const [attackDistribution, setAttackDistribution] = useState<any[]>([])
  const [topRegions, setTopRegions] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])
  const [recentThreats, setRecentThreats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState({
    total_attacks: 0,
    attack_types: 0,
    detection_rate: 0,
    response_time: 0
  })
  useEffect(() => {

    setLoading(true)

    fetch(ENDPOINTS.attackIntelligence)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load intelligence data: ${res.status}`)
        }
        return res.json()
      })
      .then((res) => res.json())
      .then((data) => {

        setAttackTypeData(data.attack_types || [])
        setAttackDistribution(data.attack_distribution || [])
        setTopRegions(data.top_regions || [])
        setTrendData(data.trend_data || [])
        setRecentThreats(data.recent_threats || [])

        setStats({
          total_attacks: data.total_attacks || 0,
          attack_types: data.attack_types_count || 0,
          detection_rate: data.detection_rate || 0,
          response_time: data.avg_response_time || 0
        })

        setTimeout(() => setLoading(false), 200) // smooth delay
      })
      .catch((err) => {
        console.error(err)
        setError("Unable to load intelligence data. Please check backend connectivity.")
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading Intelligence Data...
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive">{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Endpoint: {ENDPOINTS.attackIntelligence}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen animate-fade-in">

      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Attack Intelligence
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Comprehensive threat analysis and attack statistics from the MAD-HOT intrusion detection system.
          </p>
        </div>


        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {[
            { label: "Total Attacks Detected", value: stats.total_attacks, icon: AlertTriangle, color: "text-destructive" },
            { label: "Attack Types Identified", value: stats.attack_types, icon: Target, color: "text-primary" },
            { label: "Detection Rate", value: `${stats.detection_rate}%`, icon: TrendingUp, color: "text-green-500" },
            { label: "Avg Response Time", value: `${stats.response_time} ms`, icon: Clock, color: "text-yellow-500" },
          ].map((stat) => (

            <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur-sm">

              <CardContent className="flex items-center gap-4 p-6">

                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-secondary ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>

              </CardContent>

            </Card>

          ))}

        </div>


        {/* Attack Types */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">


          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Most Common Attack Types
              </CardTitle>

              <CardDescription>
                Attack frequency by category
              </CardDescription>

            </CardHeader>


            <CardContent>

              <div className="h-80">

                <ResponsiveContainer width="100%" height="100%">

                  <BarChart data={attackTypeData} layout="vertical">

                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />

                    <XAxis type="number" stroke="#888" fontSize={12} />

                    <YAxis type="category" dataKey="name" stroke="#888" fontSize={11} width={120} />

                    <Tooltip />

                    <Bar
                      dataKey="count"
                      radius={[0, 4, 4, 0]}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >

                      {attackTypeData.map((entry, index) => (
                        <Cell key={index} fill={entry.color || "#ef4444"} />
                      ))}

                    </Bar>

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </CardContent>

          </Card>


          {/* Attack Distribution */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">

            <CardHeader>

              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Attack Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of attack categories by percentage
              </CardDescription>

            </CardHeader>

            <CardContent>

              <div className="h-64">

                <ResponsiveContainer width="100%" height="100%">

                  <PieChart>

                    <Pie
                      data={attackDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      label={({ name, value }) => `${name}: ${value}%`}
                      animationDuration={1200}
                      animationBegin={200}
                    >

                      {attackDistribution.map((entry, index) => (
                        <Cell key={index} fill={pieColors[index % pieColors.length]} />
                      ))}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {attackDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: pieColors[i % pieColors.length] }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

            </CardContent>

          </Card>

        </div>


        {/* Trend Graph */}
        <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur-sm">

          <CardHeader>

            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Traffic Anomaly Trends
            </CardTitle>

          </CardHeader>


          <CardContent>

            <div className="h-80">

              <ResponsiveContainer width="100%" height="100%">

                <AreaChart data={trendData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="day" />

                  <YAxis />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="attacks"
                    stroke="#ef4444"
                    fill="#ef444433"
                  />

                  <Area
                    type="monotone"
                    dataKey="blocked"
                    stroke="#22c55e"
                    fill="#22c55e33"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </CardContent>

        </Card>


        {/* Regions + Recent Threats */}

        <div className="grid gap-6">


          {/* Recent Threats */}
          <Card>

            <CardHeader>

              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Recent Threat Activity
              </CardTitle>

            </CardHeader>


            <CardContent className="p-0">

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Time</TableHead>

                  </TableRow>

                </TableHeader>


                <TableBody>
                  {recentThreats.map((threat, index) => {

                    const formatTime = (timestamp: any) => {
                      if (!timestamp) return "just now"

                      const date = new Date(timestamp)
                      const diff = Date.now() - date.getTime()

                      const minutes = Math.floor(diff / 60000)

                      if (minutes < 1) return "just now"
                      if (minutes < 60) return `${minutes} min ago`
                      return `${Math.floor(minutes / 60)} hour ago`
                    }

                    return (

                      <TableRow key={index}>

                        <TableCell>
                          {threat.type || "Unknown"}
                        </TableCell>

                        <TableCell className="font-mono text-xs">
                          {threat.source || "unknown"}
                        </TableCell>

                        <TableCell>

                          <Badge
                            className={
                              threat.severity === "critical"
                                ? "bg-red-500"
                                : threat.severity === "high"
                                  ? "bg-orange-500"
                                  : threat.severity === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-yellow-400"
                            }
                          >
                            {threat.severity || "low"}
                          </Badge>

                        </TableCell>

                        <TableCell>
                          {formatTime(threat.time)}
                        </TableCell>

                      </TableRow>

                    )
                  })}
                </TableBody>

              </Table>

            </CardContent>

          </Card>

        </div>

      </div>

      <Footer />

    </main>
  )
}
