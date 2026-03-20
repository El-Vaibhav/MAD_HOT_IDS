"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  Server,
  Cpu,
  HardDrive,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  BarChart3,
  Zap,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"

const systemMetrics = {
  cpuUsage: 45,
  memoryUsage: 62,
  diskUsage: 38,
  networkIO: 78,
}

const performanceData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  accuracy: 98.5 + Math.random() * 1.5,
  latency: 0.5 + Math.random() * 0.5,
  throughput: 4000 + Math.floor(Math.random() * 2000),
}))

const recentActivity = [
  { id: 1, event: "Critical alert triggered", type: "alert", time: "2 min ago", user: "System" },
  { id: 2, event: "New user registered", type: "user", time: "15 min ago", user: "analyst@company.com" },
  { id: 3, event: "Model retraining completed", type: "system", time: "1 hour ago", user: "AutoML" },
  { id: 4, event: "Threat database updated", type: "update", time: "2 hours ago", user: "System" },
  { id: 5, event: "Bulk analysis completed", type: "analysis", time: "3 hours ago", user: "admin@company.com" },
]

const modelMetrics = [
  { name: "Accuracy", current: 99.2, target: 99.0, status: "good" },
  { name: "Precision", current: 99.1, target: 98.5, status: "good" },
  { name: "Recall", current: 98.5, target: 98.0, status: "good" },
  { name: "F1 Score", current: 98.8, target: 98.0, status: "good" },
  { name: "False Positive Rate", current: 0.3, target: 1.0, status: "excellent" },
  { name: "Avg Detection Time", current: 0.8, target: 1.0, status: "good" },
]

export default function AdminPage() {
  const [isLive, setIsLive] = useState(true)
  const [stats, setStats] = useState({
    totalAnalyses: 125847,
    activeUsers: 342,
    threatsBlocked: 8956,
    systemUptime: "99.99%",
  })

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        totalAnalyses: prev.totalAnalyses + Math.floor(Math.random() * 5),
        threatsBlocked: prev.threatsBlocked + (Math.random() > 0.8 ? 1 : 0),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  return (
    <main className="min-h-screen bg-cyber-dark">
      <Navigation />
      <div className="px-4 py-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">System monitoring and management</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-cyber-success/20 px-3 py-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-cyber-success" />
              <span className="text-sm text-cyber-success">All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Analyses", value: stats.totalAnalyses.toLocaleString(), icon: Activity, color: "text-primary" },
            { label: "Active Users", value: stats.activeUsers, icon: Users, color: "text-cyber-success" },
            { label: "Threats Blocked", value: stats.threatsBlocked.toLocaleString(), icon: Shield, color: "text-destructive" },
            { label: "System Uptime", value: stats.systemUptime, icon: Server, color: "text-cyber-warning" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex items-center gap-4 p-4">
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

        {/* System Health & Performance */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* System Health */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Server className="h-5 w-5 text-primary" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "CPU Usage", value: systemMetrics.cpuUsage, icon: Cpu },
                { label: "Memory Usage", value: systemMetrics.memoryUsage, icon: HardDrive },
                { label: "Disk Usage", value: systemMetrics.diskUsage, icon: HardDrive },
                { label: "Network I/O", value: systemMetrics.networkIO, icon: Activity },
              ].map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <metric.icon className="h-4 w-4 text-muted-foreground" />
                      {metric.label}
                    </span>
                    <span className={metric.value > 80 ? "text-destructive" : "text-muted-foreground"}>
                      {metric.value}%
                    </span>
                  </div>
                  <Progress
                    value={metric.value}
                    className={`h-2 ${metric.value > 80 ? "[&>div]:bg-destructive" : ""}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Detection Performance (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="hour" stroke="#888" fontSize={10} />
                    <YAxis domain={[95, 100]} stroke="#888" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, "Accuracy"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#00d4ff"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAccuracy)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model Performance & Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Model Metrics */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Model Performance
              </CardTitle>
              <CardDescription>MAD-HOT algorithm metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelMetrics.map((metric) => (
                    <TableRow key={metric.name}>
                      <TableCell className="font-medium">{metric.name}</TableCell>
                      <TableCell>
                        {metric.name.includes("Rate") || metric.name.includes("Time")
                          ? `${metric.current}${metric.name.includes("Time") ? "ms" : "%"}`
                          : `${metric.current}%`}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {metric.name.includes("Rate") || metric.name.includes("Time")
                          ? `< ${metric.target}${metric.name.includes("Time") ? "ms" : "%"}`
                          : `> ${metric.target}%`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            metric.status === "excellent"
                              ? "bg-primary/20 text-primary"
                              : "bg-cyber-success/20 text-cyber-success"
                          }
                        >
                          {metric.status === "excellent" ? "Excellent" : "Good"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>System events and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        activity.type === "alert"
                          ? "bg-destructive/20"
                          : activity.type === "user"
                          ? "bg-primary/20"
                          : activity.type === "system"
                          ? "bg-cyber-success/20"
                          : "bg-secondary"
                      }`}
                    >
                      {activity.type === "alert" ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : activity.type === "user" ? (
                        <Users className="h-4 w-4 text-primary" />
                      ) : activity.type === "system" ? (
                        <Zap className="h-4 w-4 text-cyber-success" />
                      ) : (
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.event}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Traffic Statistics */}
        <Card className="mt-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Traffic Statistics
            </CardTitle>
            <CardDescription>Network analysis throughput over 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#888" fontSize={10} />
                  <YAxis stroke="#888" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a2e",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} pps`, "Throughput"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="throughput"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
