import Hero from "@/components/Hero"
import ProductsSection from "@/components/ProductsSection"
import MapSection from "@/components/MapSection"
import ContactForm from "@/components/ContactForm"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProductsSection />
      <MapSection />
      <ContactForm />
      <Footer />
    </main>
  )
}
