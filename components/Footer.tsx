import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, Award } from "lucide-react"

export default function Footer() {
  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#", label: "Facebook" },
    { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" },
  ]

  const footerLinks = {
    productos: [
      { name: "Pescados de Mar", href: "/productos" },
      { name: "Pescados de Río", href: "/productos" },
      { name: "Productos Premium", href: "/productos" },
      { name: "Catálogo Completo", href: "/productos" },
    ],
    empresa: [
      { name: "Portal de Clientes", href: "/portal" },
      { name: "Nuestra Historia", href: "#" },
      { name: "Certificaciones", href: "#" },
      { name: "Trabajá con Nosotros", href: "#" },
    ],
    servicios: [
      { name: "Distribución Nacional", href: "#" },
      { name: "Carrito de Compras", href: "/carrito" },
      { name: "Soporte Técnico", href: "#contacto" },
      { name: "Términos y Condiciones", href: "#" },
    ],
  }

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <Image
                src="/epuyen-logo.png"
                alt="Epuyen Congelados"
                width={76}
                height={76}
                className="h-24 w-auto object-contain"
                priority
              />
              <span className="text-xl font-semibold">Epuyen Congelados</span>
            </div>
            <p className="text-neutral-400 mb-8 text-pretty leading-relaxed">
              Distribuidores especializados en pescados y derivados para todo el país. Calidad y frescura garantizada
              desde 1985.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center space-x-3 text-neutral-400">
                <Phone className="w-4 h-4" />
                <span>+54 11 4000-0000</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-400">
                <Mail className="w-4 h-4" />
                <span>ventas@pescaderiaargentina.com</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-400">
                <MapPin className="w-4 h-4" />
                <span>Puerto Madero, CABA</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center space-x-2 bg-neutral-800 px-3 py-2 rounded-lg">
                <Award className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium">SENASA</span>
              </div>
              <div className="flex items-center space-x-2 bg-neutral-800 px-3 py-2 rounded-lg">
                <Award className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium">HACCP</span>
              </div>
            </div>

            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className="bg-neutral-800 hover:bg-blue-600 p-3 rounded-xl transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-8 text-white">Productos</h3>
            <ul className="space-y-4">
              {footerLinks.productos.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-8 text-white">Empresa</h3>
            <ul className="space-y-4">
              {footerLinks.empresa.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-8 text-white">Servicios</h3>
            <ul className="space-y-4">
              {footerLinks.servicios.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-16 pt-10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm">© 2025 Pescadería Argentina. Todos los derechos reservados.</p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <Link href="#" className="text-neutral-400 hover:text-white text-sm transition-colors duration-200">
              Política de Privacidad
            </Link>
            <Link href="#" className="text-neutral-400 hover:text-white text-sm transition-colors duration-200">
              Términos de Uso
            </Link>
            <Link href="#" className="text-neutral-400 hover:text-white text-sm transition-colors duration-200">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
