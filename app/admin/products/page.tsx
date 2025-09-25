"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, PlusCircle } from "lucide-react"
import { type Product, subscribeToProducts, deleteProduct } from "@/lib/firestore"

export default function AdminProductsPage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile?.role === "admin") {
      const unsubscribe = subscribeToProducts((fetchedProducts) => {
        setProducts(fetchedProducts)
        setLoading(false)
      })
      return () => unsubscribe()
    } else {
      setLoading(false)
    }
  }, [userProfile])

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await deleteProduct(productId)
        // The subscription will automatically update the state
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Error al eliminar el producto.")
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando productos...
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => router.push("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
        </Button>
        <h1 className="text-4xl font-bold mb-8">Gestión de Productos</h1>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Listado de Productos</CardTitle>
            <Button onClick={() => router.push("/admin/products/new")}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Producto
            </Button>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay productos para mostrar.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.id.slice(0, 8)}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price.toLocaleString()}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="mr-1" onClick={() => router.push(`/admin/products/${product.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
