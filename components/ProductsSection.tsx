import Image from "next/image"
import Link from "next/link"
import { Fish, Waves, Award, ArrowRight, ShoppingCart } from "lucide-react"

export default function ProductsSection() {
  const products = [
    {
      title: "Pescados de Mar",
      description: "Merluza, corvina, lenguado y más especies del Atlántico Sur",
      image: "/fresh-sea-fish-on-ice-display--professional-photog.jpg",
      icon: <Waves className="w-6 h-6" />,
      stock: "Disponible",
      varieties: "15+ especies",
    },
    {
      title: "Pescados de Río",
      description: "Sábalo, surubí, dorado y especies de agua dulce",
      image: "/fresh-river-fish-display--market-photography.jpg",
      icon: <Fish className="w-6 h-6" />,
      stock: "Disponible",
      varieties: "8+ especies",
    },
    {
      title: "Productos Premium",
      description: "Salmón, trucha y especies importadas de primera calidad",
      image: "/premium-salmon-and-trout-fillets--gourmet-presenta.jpg",
      icon: <Award className="w-6 h-6" />,
      stock: "Limitado",
      varieties: "5+ especies",
    },
  ]

  return (
    <section id="productos" className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 text-balance">Nuestros Productos</h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto text-pretty leading-relaxed">
            Seleccionados cuidadosamente para garantizar frescura y calidad excepcional con certificación SENASA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-neutral-100"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-blue-600 p-2 rounded-lg">
                  {product.icon}
                </div>
                <div
                  className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                    product.stock === "Disponible" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {product.stock}
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">{product.title}</h3>
                <p className="text-neutral-600 text-pretty leading-relaxed mb-4">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-neutral-500">{product.varieties}</span>
                  <span className="text-sm font-medium text-blue-600">Stock disponible</span>
                </div>
                <div className="flex gap-2">
                  <Link href="/productos" className="flex-1">
                    <button className="w-full text-blue-600 hover:text-red-700 font-medium transition-colors duration-200 group-hover:translate-x-1 inline-flex items-center justify-center">
                      Ver más
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link href="/productos">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-medium text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 inline-flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Ver Catálogo Completo</span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
