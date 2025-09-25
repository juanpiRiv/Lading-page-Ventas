"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { usePathname } from "next/navigation"
import "./globals.css"
import Header from "@/components/Header"
import { AuthProvider } from "@/contexts/AuthContext"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// Metadata cannot be exported from a client component.
// If metadata is needed, it should be defined in a separate layout.js file
// that is a server component, or in a page.js file.
// For now, we remove it to resolve the error.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/admin")

  return (
    <html lang="es" className={`${inter.variable} antialiased`}>
      <body className="font-sans">
        <AuthProvider>
          {!isAdminRoute && <Header />} {/* Conditionally render Header */}
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
