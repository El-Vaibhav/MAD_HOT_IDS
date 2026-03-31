import Link from "next/link"
import { Shield } from "lucide-react"

const footerLinks = {
  product: [
    { label: "Internet Analyzer", href: "/analyzer" },
    { label: "Live IDS Dashboard", href: "/dashboard" },
    { label: "Attack Intelligence", href: "/intelligence" },
    { label: "Results", href: "/results" },
  ],
  research: [
    { label: "MAD-HOT Algorithm", href: "/research" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Documentation", href: "/docs" },
    { label: "Datasets", href: "/research#datasets" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/about#contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">MAD-HOT IDS</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              AI-powered intrusion detection system using Hoeffding Optimized Trees for real-time
              network security analysis.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Research</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.research.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/50 pt-8">
  <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">

    {/* Left */}
    <p className="text-sm text-muted-foreground">
      © {new Date().getFullYear()} MAD-HOT IDS. All rights reserved.
    </p>

    {/* Center */}
    <p className="text-sm text-muted-foreground text-center">
      Mixed Rate Attack Detection using Hoeffding Optimized Trees
    </p>

    {/* Right (YOUR PART) */}
    <div className="flex flex-col items-center text-sm text-muted-foreground">
      <p>
        Developed by{" "}
        <span className="font-medium text-foreground">
          Vaibhav
        </span>
      </p>

      <div className="flex gap-3 mt-1">
        <a
          href="https://elvaibhavportfolionew.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition"
        >
          Portfolio
        </a>

        <a
          href="https://www.linkedin.com/in/vaibhav-sodhi-8b0207257"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition"
        >
          LinkedIn
        </a>
      </div>
    </div>

  </div>
</div>
      </div>
    </footer>
  )
}
