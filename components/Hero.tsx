import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronDown, Fish, Truck, Award } from "lucide-react"

export default function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/logo3.jpg"
          alt="Mar argentino con barcos pesqueros"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/70 via-blue-800/50 to-blue-300/60"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-red-600/80 mb-6 text-balance leading-tight">
              Distribuidora
            <span className="block text-red-600/80">Peces</span>
          </h1> 
          <p className="text-xl md:text-2xl text-blue-100 font-extrabold mb-8 drop-shadow-xl ">Del mar y río a tu mesa</p>
          <p className="text-lg text-blue-100 font-extrabold mb-12 max-w-2xl mx-auto text-pretty leading-relaxed drop-shadow-xl">
            Distribuimos pescados y derivados de la más alta calidad a todas las provincias argentinas con certificación
            SENASA.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 animate-fade-in-up animate-delay-300">
              <Truck className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-white font-medium">Envío Nacional</p>
              <p className="text-blue-200 text-sm">Flota refrigerada</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 animate-fade-in-up animate-delay-500">
              <Award className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-white font-medium">Certificación</p>
              <p className="text-blue-200 text-sm">SENASA</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/productos">
              <button className="group bg-red-700 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center space-x-2">
                <span>Ver Catálogo</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <a href="#contacto">
              <button className="border-2 border-white/80 text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 hover:scale-105">
                Conocer Más
              </button>
            </a>
          </div>
        </div>
      </div>

      <a
        href="#productos"
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
      >
        <ChevronDown className="w-6 h-6 text-white/70 hover:text-white transition-colors" />
      </a>
    </section>
  )
}
