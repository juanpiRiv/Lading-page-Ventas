"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, User, ShoppingCart } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/productos" },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Contacto", href: "#contacto" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <Image
                src="/epuyen-logo.png"
                alt="Epuyen Congelados"
                width={40}
                height={40}
                className="h-17 w-auto object-contain transition-transform group-hover:scale-105"
                priority
              />
              <span className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-neutral-700 hover:text-blue-600 transition-all duration-200 hover:scale-105">Epuyen Congelados</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-medium text-neutral-700 hover:text-blue-600 transition-all duration-200 hover:scale-105"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/carrito"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-neutral-700 hover:text-blue-600 transition-all duration-200 hover:scale-105"
            >
              <ShoppingCart size={16} />
              <span>Carrito</span>
            </Link>
            <Link
              href="/portal"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 hover:scale-105"
            >
              <User size={16} />
              <span>Portal Cliente</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-neutral-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden animate-scale-in">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-neutral-100 rounded-b-lg shadow-lg">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-neutral-700 hover:text-blue-600 hover:bg-neutral-50 rounded-md font-medium transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/carrito"
                className="flex items-center space-x-2 px-3 py-2 text-neutral-700 hover:text-blue-600 hover:bg-neutral-50 rounded-md font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart size={16} />
                <span>Carrito</span>
              </Link>
              <Link
                href="/portal"
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={16} />
                <span>Portal Cliente</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
