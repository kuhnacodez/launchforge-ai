import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Testimonials } from "@/components/landing/testimonials";
import { CTASection } from "@/components/landing/cta-section";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
