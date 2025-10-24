"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, PackageSearch } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import ProductForm, {
  type ProductFormPayload,
} from "@/components/admin/ProductForm"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  deleteProduct,
  getProductById,
  subscribeToCategories,
  updateProduct,
  type Category,
  type Product,
} from "@/lib/firestore"

const mergeProductPayload = (
  current: Product,
  payload: ProductFormPayload,
): Product => ({
  ...current,
  ...payload,
  imageUrl:
    payload.imageUrl !== undefined && payload.imageUrl !== ""
      ? payload.imageUrl
      : payload.imageUrl === ""
        ? undefined
        : current.imageUrl,
  images:
    payload.images !== undefined ? payload.images : current.images ?? undefined,
  tags: payload.tags !== undefined ? payload.tags : current.tags ?? undefined,
  preparationTips:
    payload.preparationTips !== undefined
      ? payload.preparationTips
      : current.preparationTips ?? undefined,
  nutritionalInfo:
    payload.nutritionalInfo ?? current.nutritionalInfo ?? undefined,
  storageInstructions:
    payload.storageInstructions !== undefined
      ? payload.storageInstructions
      : current.storageInstructions ?? undefined,
  minOrder: payload.minOrder !== undefined ? payload.minOrder : current.minOrder,
  maxOrder: payload.maxOrder !== undefined ? payload.maxOrder : current.maxOrder,
  freshness:
    payload.freshness !== undefined ? payload.freshness : current.freshness,
  updatedAt: new Date(),
})

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const productId = useMemo(() => {
    if (!params?.id) return null
    return Array.isArray(params.id) ? params.id[0] : params.id
  }, [params])

  const [product, setProduct] = useState<Product | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToCategories((list) => {
      setCategories(list)
      setLoadingCategories(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!productId) return
    let mounted = true

    const loadProduct = async () => {
      try {
        const nextProduct = await getProductById(productId)
        if (!mounted) return
        setProduct(nextProduct)
      } catch (error) {
        console.error("Error fetching product:", error)
        if (mounted) setProduct(null)
      } finally {
        if (mounted) setLoadingProduct(false)
      }
    }

    loadProduct()

    return () => {
      mounted = false
    }
  }, [productId])

  const handleSubmit = async (payload: ProductFormPayload) => {
    if (!productId) return

    try {
      await updateProduct(productId, payload)
      toast({
        title: "Producto actualizado",
        description: "Los cambios se guardaron correctamente.",
      })
      setProduct((current) =>
        current ? mergeProductPayload(current, payload) : current,
      )
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "No se pudo guardar",
        description: "Hubo un problema al actualizar el producto.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!productId) return

    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm("Esta accion eliminara el producto. Continuar?")

    if (!confirmed) return

    try {
      await deleteProduct(productId)
      toast({
        title: "Producto eliminado",
        description: "Se elimino el producto del catalogo.",
      })
      router.push("/admin/products")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "No se pudo eliminar",
        description: "Intenta nuevamente en unos segundos.",
        variant: "destructive",
      })
    }
  }

  const renderContent = () => {
    if (loadingProduct) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      )
    }

    if (!product) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-12 text-center">
          <PackageSearch className="mb-4 h-12 w-12 text-neutral-400" />
          <h2 className="text-2xl font-semibold text-neutral-900">
            Producto no encontrado
          </h2>
          <p className="mt-2 max-w-sm text-sm text-neutral-600">
            El producto solicitado no existe o fue eliminado.
          </p>
          <Button className="mt-6" onClick={() => router.push("/admin/products")}>
            Volver al listado
          </Button>
        </div>
      )
    }

    return (
      <ProductForm
        mode="edit"
        categories={categories}
        initialProduct={product}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isLoadingCategories={loadingCategories}
      />
    )
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
          {renderContent()}
        </div>
      </div>
    </ProtectedRoute>
  )
}
