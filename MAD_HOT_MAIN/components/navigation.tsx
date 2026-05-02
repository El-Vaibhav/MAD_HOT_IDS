"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Shield,
  Menu,
  Activity,
  BookOpen,
  Info,
  FileText,
  User,
  LayoutDashboard,
  Sun,
  Moon,
} from "lucide-react"

const navItems = [
  { href: "/analyzer", label: "Internet Analyzer", icon: Activity },
  { href: "/dashboard", label: "Live IDS", icon: LayoutDashboard },
  { href: "/intelligence", label: "Attack Intelligence", icon: Shield },
  { href: "/research", label: "Research", icon: BookOpen },
  { href: "/how-it-works", label: "How It Works", icon: Info },
  { href: "/docs", label: "Documentation", icon: FileText },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
            <div className="absolute inset-0 rounded-lg bg-primary/50 blur-sm" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            MAD-HOT <span className="text-primary">IDS</span>
          </span>
        </Link>

        {/* NAV */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* THEME */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="h-4 w-4 hidden dark:block" />
          </Button>

          {/* 🔥 SINGLE AUTH BUTTON (NO SHIFT) */}
          <Link href={user ? "/account" : "/login"}>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary text-primary hover:bg-primary/10 min-w-[100px] justify-center"
            >
              <User className="h-4 w-4" />
              {user ? "Account" : "Login"}
            </Button>

          </Link>

          {/* ANALYZE */}
          <div className="flex items-center gap-2 ml-2">

            {/* ANALYZE */}
            <Link href="/analyzer">
              <Button
                size="sm"
                className="gap-2 glow-cyan min-w-[150px] justify-center"
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Analyze Traffic</span>
                <span className="sm:hidden">Analyze</span>
              </Button>
            </Link>

            {/* LOGOUT */}
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout()
                  router.push("/")
                }}
                className="min-w-[110px] justify-center border-border/60 hover:border-red-400 hover:text-red-400"
              >
                Logout
              </Button>
            )}

          </div>

          {/* MOBILE */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-80 bg-card">
              <div className="flex flex-col gap-4 pt-8">

                <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 mb-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                    <Shield className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold">MAD-HOT IDS</span>
                </Link>

                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}

                <div className="mt-4 border-t pt-4">
                  <Link href={user ? "/account" : "/login"} onClick={() => setIsOpen(false)}>
                    <Button className="w-full gap-2 glow-cyan">
                      <User className="h-4 w-4" />
                      {user ? "Account" : "Login"}
                    </Button>
                  </Link>

                  {user && (
                    <Button
                      variant="destructive"
                      className="w-full mt-2"
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                        router.push("/")
                      }}
                    >
                      Logout
                    </Button>
                  )}
                </div>

              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </header>
  )
}