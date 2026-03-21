"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from "@/components/ui/table"

import {
User,
Activity,
FileText,
Shield,
Download,
Settings,
Bell,
Clock,
AlertTriangle,
CheckCircle2,
ExternalLink,
} from "lucide-react"

export default function AccountPage() {

const [name, setName] = useState("")
const [email, setEmail] = useState("")

const user = {
plan: "Professional",
joinDate: "March 2025",
}

const [stats, setStats] = useState({
total_analyses: 0,
attacks_detected: 0,
safe_scans: 0,
reports_generated: 0
})

const [analysisHistory, setAnalysisHistory] = useState<any[]>([])
const [detectedAttacks, setDetectedAttacks] = useState<any[]>([])

useEffect(() => {
fetchAccountData()
loadProfile()
}, [])

const loadProfile = async () => {
try {

const res = await fetch("https://mad-hot-ids.onrender.com/get-profile")
const data = await res.json()

setName(data.name)
setEmail(data.email)

} catch (err) {
console.error("Failed to load profile", err)
}
}

const fetchAccountData = async () => {
try {

const res = await fetch("https://mad-hot-ids.onrender.com/account-data")
const data = await res.json()

setStats(data?.stats || {
total_analyses: 0,
attacks_detected: 0,
safe_scans: 0,
reports_generated: 0
})

setAnalysisHistory(data?.history || [])
setDetectedAttacks(data?.attacks || [])

} catch (err) {
console.error("Failed to load account data", err)
}
}

const saveProfile = async () => {
try {

await fetch("https://mad-hot-ids.onrender.com/update-profile", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ name, email })
})

alert("Profile updated successfully")
loadProfile()

} catch (err) {
console.error(err)
alert("Failed to update profile")
}
}

return (
<main className="min-h-screen">

<Navigation />

<div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">

{/* Header */}

<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

<div className="flex items-center gap-4">

<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
<User className="h-8 w-8 text-primary" />
</div>

<div>
<h1 className="text-2xl font-bold">{name}</h1>
<p className="text-muted-foreground">{email}</p>
</div>

</div>

<div className="flex items-center gap-2">
<Badge className="bg-primary/20 text-primary">{user.plan}</Badge>
<span className="text-sm text-muted-foreground">
Member since {user.joinDate}
</span>
</div>

</div>

{/* Stats */}

<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

{[
{ label: "Total Analyses", value: stats?.total_analyses ?? 0, icon: Activity },
{ label: "Attacks Detected", value: stats?.attacks_detected ?? 0, icon: AlertTriangle },
{ label: "Safe Scans", value: stats?.safe_scans ?? 0, icon: CheckCircle2 },
{ label: "Reports Generated", value: stats?.reports_generated ?? 0, icon: FileText },
].map((stat) => (

<Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur-sm">

<CardContent className="flex items-center gap-4 p-4">

<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
<stat.icon className="h-5 w-5 text-primary" />
</div>

<div>
<p className="text-2xl font-bold">{stat.value}</p>
<p className="text-sm text-muted-foreground">{stat.label}</p>
</div>

</CardContent>

</Card>

))}

</div>

<Tabs defaultValue="history" className="space-y-8">

<TabsList>

<TabsTrigger value="history" className="gap-2">
<Clock className="h-4 w-4" />
Analysis History
</TabsTrigger>

<TabsTrigger value="attacks" className="gap-2">
<Shield className="h-4 w-4" />
Detected Attacks
</TabsTrigger>

<TabsTrigger value="settings" className="gap-2">
<Settings className="h-4 w-4" />
Settings
</TabsTrigger>

</TabsList>

{/* ANALYSIS HISTORY */}

<TabsContent value="history">

<Card className="border-border/50 bg-card/50 backdrop-blur-sm">

<CardHeader>
<CardTitle>Analysis History</CardTitle>
<CardDescription>
View your past security analyses and their results
</CardDescription>
</CardHeader>

<CardContent className="p-0">

<Table>

<TableHeader>

<TableRow>
<TableHead>ID</TableHead>
<TableHead>Date</TableHead>
<TableHead>Type</TableHead>
<TableHead>Result</TableHead>
<TableHead>Attack Type</TableHead>
<TableHead>Confidence</TableHead>
</TableRow>

</TableHeader>

<TableBody>

{analysisHistory.map((analysis) => (

<TableRow key={analysis.id}>

<TableCell className="font-mono text-sm">
{analysis.id}
</TableCell>

<TableCell>{analysis.date}</TableCell>

<TableCell>
<Badge variant="outline">{analysis.type}</Badge>
</TableCell>

<TableCell>

<Badge
className={
analysis.result === "attack"
? "bg-destructive/20 text-destructive"
: "bg-cyber-success/20 text-cyber-success"
}
>

{analysis.result === "attack" ? "Attack Detected" : "Safe"}

</Badge>

</TableCell>

<TableCell>
{analysis.attackType || "-"}
</TableCell>

<TableCell>
{analysis.confidence}%
</TableCell>

</TableRow>

))}

</TableBody>

</Table>

</CardContent>

</Card>

</TabsContent>

{/* DETECTED ATTACKS */}

<TabsContent value="attacks">

<Card className="border-border/50 bg-card/50 backdrop-blur-sm">

<CardHeader>
<CardTitle>Detected Attacks</CardTitle>
<CardDescription>
Summary of attacks detected
</CardDescription>
</CardHeader>

<CardContent>

<div className="space-y-4">

{detectedAttacks.map((attack) => (

<div
key={attack.type}
className="flex items-center justify-between rounded-lg border border-border p-4"
>

<div className="flex items-center gap-4">

<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">

<AlertTriangle className="h-5 w-5 text-destructive"/>

</div>

<div>

<p className="font-medium">{attack.type}</p>

<p className="text-sm text-muted-foreground">
Last seen: {attack.lastSeen}
</p>

</div>

</div>

<div className="text-right">

<p className="text-2xl font-bold">{attack.count}</p>

<p className="text-sm text-muted-foreground">
detections
</p>

</div>

</div>

))}

</div>

</CardContent>

</Card>

</TabsContent>

{/* SETTINGS */}

<TabsContent value="settings">

<Card className="border-border/50 bg-card/50 backdrop-blur-sm">

<CardHeader>
<CardTitle>Profile Settings</CardTitle>
</CardHeader>

<CardContent className="space-y-4">

<div className="space-y-2">
<Label>Name</Label>
<Input value={name} onChange={(e)=>setName(e.target.value)}/>
</div>

<div className="space-y-2">
<Label>Email</Label>
<Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
</div>

<Button className="w-full" onClick={saveProfile}>
Save Changes
</Button>

</CardContent>

</Card>

</TabsContent>

</Tabs>

</div>

<Footer />

</main>
)
}