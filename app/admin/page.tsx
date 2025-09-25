"use client"

import { useEffect } from "react" // Re-import useEffect
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ProtectedRoute from "@/components/ProtectedRoute"
import { LogOut } from "lucide-react" // Import LogOut icon

export default function AdminPortalPage() {
  const { user, userProfile, loading, logout } = useAuth() // Re-add user, userProfile, loading
  const router = useRouter()

  useEffect(() => {
    console.log("AdminPortalPage useEffect: user", user ? user.uid : "null", "userProfile", userProfile ? userProfile.role : "null", "loading", loading);
    if (!loading && (!user || userProfile?.role !== "admin")) {
      router.push("/login")
    }
  }, [user, userProfile, loading, router])

  const handleLogout = async () => {
    console.log("AdminPortalPage: Logout button clicked.");
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      alert("Error al cerrar sesión. Por favor, inténtalo de nuevo.")
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
        <header className="bg-white shadow-sm py-4 px-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-700">Pescadería Argentina - Admin</h2>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-red-500 text-white hover:bg-red-600 border-red-700 font-bold py-2 px-4 rounded" // Add prominent styling
          >
            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
          </Button>
        </header>

        <div className="container mx-auto py-8">
          <h1 className="text-4xl font-bold mb-8">Portal de Administración</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Administra el catálogo de productos, precios e inventario.
                </p>
                <Button onClick={() => router.push("/admin/products")}>
                  Ir a Productos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestión de Órdenes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Revisa y procesa las órdenes de los clientes.
                </p>
                <Button onClick={() => router.push("/admin/orders")}>
                  Ir a Órdenes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Administra los usuarios y sus roles.
                </p>
                <Button onClick={() => router.push("/admin/users")}>
                  Ir a Usuarios
                </Button>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-8" />

          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ajustes generales de la aplicación.
              </p>
              <Button onClick={() => router.push("/admin/settings")}>
                Ir a Configuración
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
