import Image from "next/image"
import { Award, Users, Truck, Fish, Calendar } from "lucide-react"

export default function AboutPage() {
  const milestones = [
    { year: "1985", title: "Fundación", description: "Inicio de operaciones en Puerto Madero" },
    { year: "1995", title: "Expansión Nacional", description: "Primera flota de distribución refrigerada" },
    { year: "2005", title: "Certificación SENASA", description: "Obtención de certificaciones de calidad" },
    { year: "2015", title: "Modernización", description: "Implementación de tecnología de cadena de frío" },
    { year: "2025", title: "Presente", description: "Líderes en distribución de pescados y mariscos" },
  ]

  const values = [
    {
      icon: <Fish className="w-8 h-8" />,
      title: "Calidad Premium",
      description: "Seleccionamos solo los mejores productos del mar y río argentino",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Distribución Confiable",
      description: "Flota propia con tecnología de refrigeración avanzada",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Certificaciones",
      description: "Cumplimos con los más altos estándares de SENASA y HACCP",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Equipo Experto",
      description: "40 años de experiencia en el sector pesquero",
    },
  ]

  return (
    <main className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-900 to-blue-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">Nuestra Historia</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto text-pretty leading-relaxed">
            Desde 1985, conectamos el mar argentino con tu mesa, garantizando frescura y calidad en cada entrega.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-neutral-900 mb-8">40 Años de Tradición</h2>
              <div className="space-y-6 text-lg text-neutral-600 leading-relaxed">
                <p>
                  Pescadería Argentina nació en 1985 con una visión clara: llevar los mejores productos del mar y río
                  argentino a todas las provincias del país, manteniendo la cadena de frío y garantizando la máxima
                  frescura.
                </p>
                <p>
                  Lo que comenzó como una pequeña empresa familiar en Puerto Madero, hoy se ha convertido en uno de los
                  distribuidores más confiables del sector, con una flota propia de vehículos refrigerados y
                  certificaciones que avalan nuestra calidad.
                </p>
                <p>
                  Nuestro compromiso con la excelencia nos ha permitido construir relaciones duraderas con pescadores,
                  proveedores y clientes en todo el territorio nacional.
                </p>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/fishing-boats-at-puerto-madero-argentina.jpg"
                alt="Puerto Madero - Origen de Pescadería Argentina"
                width={600}
                height={500}
                className="rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-neutral-900 mb-6">Nuestra Evolución</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Cuatro décadas de crecimiento y mejora continua
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-600">{milestone.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-2">{milestone.title}</h3>
                      <p className="text-neutral-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-neutral-900 mb-6">Nuestros Valores</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Los principios que guían nuestro trabajo diario
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="bg-blue-50 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">{value.title}</h3>
                <p className="text-neutral-600 text-pretty leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-900 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">¿Querés ser parte de nuestra historia?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a los cientos de clientes que confían en nosotros para sus necesidades de pescados y mariscos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/productos"
              className="bg-red-700 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Ver Productos
            </a>
            <a
              href="#contacto"
              className="border-2 border-white/80 text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 hover:scale-105"
            >
              Contactanos
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
