import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { AuthEntryDialog } from "@/components/auth-entry-dialog"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <AuthEntryDialog />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  )
}
