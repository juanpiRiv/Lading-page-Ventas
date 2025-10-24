"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import ProductForm, {
  type ProductFormPayload,
} from "@/components/admin/ProductForm"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  createProduct,
  subscribeToCategories,
  type Category,
} from "@/lib/firestore"

export default function AdminNewProductPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToCategories((list) => {
      setCategories(list)
      setLoadingCategories(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleSubmit = async (payload: ProductFormPayload) => {
    try {
      const id = await createProduct(payload)
      toast({
        title: "Producto creado",
        description: `Se creo el producto correctamente (ID: ${id.slice(0, 8)}).`,
      })
      router.push("/admin/products")
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error al crear el producto",
        description: "Revisa los datos e intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-neutral-100 py-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/products")}
              className="w-fit"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al listado
            </Button>
          </div>

          <ProductForm
            mode="create"
            categories={categories}
            onSubmit={handleSubmit}
            isLoadingCategories={loadingCategories}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}
