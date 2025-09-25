"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Star,
  Package,
  Truck,
  Scale,
  Clock,
  Shield,
  Award,
  MapPin,
  Share2,
  Calculator,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductRecommendations from "@/components/ProductRecommendations"
import QuickQuote from "@/components/QuickQuote"
import { getProductById, type Product } from "@/lib/firestore"

type RecentProduct = {
  id: string
  name: string
  category?: string
  image?: string
}

const FALLBACK_IMAGE = "/placeholder.svg"
type Tone = "blue" | "green" | "orange" | "purple"

const INITIAL_CART: Record<string, number> = {}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return INITIAL_CART
    try {
      const saved = window.localStorage.getItem("cart")
      return saved ? JSON.parse(saved) : INITIAL_CART
    } catch (storageError) {
      console.warn("Unable to parse cart from localStorage:", storageError)
      return INITIAL_CART
    }
  })
  const [isFavorite, setIsFavorite] = useState(false)
  const [showQuickQuote, setShowQuickQuote] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [viewCount, setViewCount] = useState(0)
  const [recentlyViewed, setRecentlyViewed] = useState<RecentProduct[]>([])

  const productId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = window.localStorage.getItem("recentlyViewed")
      if (stored) {
        const parsed = JSON.parse(stored) as RecentProduct[]
        setRecentlyViewed(parsed)
      }
    } catch (storageError) {
      console.warn("Unable to read recently viewed products:", storageError)
    }
  }, [])

  useEffect(() => {
    if (!productId) return

    let cancelled = false

    const persistRecentlyViewed = (item: Product) => {
      if (typeof window === "undefined") return
      const entry: RecentProduct = {
        id: item.id,
        name: item.name,
        category: item.category,
        image: item.images?.[0] ?? item.imageUrl,
      }

      try {
        const stored = window.localStorage.getItem("recentlyViewed")
        const parsed: RecentProduct[] = stored ? JSON.parse(stored) : []
        const updated = [entry, ...parsed.filter((candidate) => candidate.id !== entry.id)].slice(0, 5)
        window.localStorage.setItem("recentlyViewed", JSON.stringify(updated))
        setRecentlyViewed(updated.slice(1))
      } catch (storageError) {
        console.warn("Unable to persist recently viewed products:", storageError)
      }
    }

    const loadProduct = async () => {
      setLoading(true)
      setError(null)
      setViewCount(0)

      try {
        const fetched = await getProductById(productId)
        if (cancelled) return

        setProduct(fetched)
        setLoading(false)

        if (!fetched) {
          setError("Producto no encontrado")
          return
        }

        setViewCount(1)
        persistRecentlyViewed(fetched)
      } catch (fetchError) {
        console.error("Error fetching product:", fetchError)
        if (cancelled) return
        setProduct(null)
        setLoading(false)
        setError("No se pudo cargar el producto")
      }
    }

    loadProduct()

    return () => {
      cancelled = true
    }
  }, [productId])

  const addToCart = (id: string, qty: number) => {
    setCart((previous) => {
      const next = {
        ...previous,
        [id]: (previous[id] ?? 0) + qty,
      }

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("cart", JSON.stringify(next))
        } catch (storageError) {
          console.warn("Unable to persist cart in localStorage:", storageError)
        }
      }

      return next
    })
  }

  const handleShare = async () => {
    if (!product) return

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (shareError) {
        console.warn("Error sharing product:", shareError)
        setShowShareMenu(true)
      }
    } else {
      setShowShareMenu(true)
    }
  }

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setShowShareMenu(false)
      alert("Enlace copiado al portapapeles")
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock > 50) return { text: "En stock", color: "bg-green-100 text-green-800" }
    if (stock > 20) return { text: "Stock limitado", color: "bg-yellow-100 text-yellow-800" }
    if (stock > 0) return { text: "Ultimas unidades", color: "bg-red-100 text-red-800" }
    return { text: "Sin stock", color: "bg-gray-100 text-gray-800" }
  }

  const productImage = product?.images?.[0] ?? product?.imageUrl ?? FALLBACK_IMAGE
  const stock = product?.stock ?? 0
  const cartQuantity = product ? cart[product.id] ?? 0 : 0
  const maxSelectable = product?.maxOrder ?? stock
  const minSelectable = product?.minOrder ?? 1
  const stockBadge = getStockStatus(stock)
  const rating = product?.rating ?? 0
  const reviews = product?.reviews ?? 0

  const nutritionalInfo = useMemo(() => {
    if (!product?.nutritionalInfo) return null
    return {
      protein: product.nutritionalInfo.protein,
      omega3: product.nutritionalInfo.omega3,
      fat: product.nutritionalInfo.fat,
      calories: product.nutritionalInfo.calories,
    }
  }, [product?.nutritionalInfo])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-20 flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-neutral-900">{error ?? "Producto no disponible"}</h1>
          <p className="text-neutral-600">Te invitamos a continuar explorando nuestro catalogo.</p>
          <Button onClick={() => router.push("/productos")}>Volver al listado</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={() => router.push("/productos")}
          variant="outline"
          className="mb-6 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
        >
          <ArrowLeft size={16} className="mr-2" />
          Volver a Productos
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-8">
          <div>
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-white/60 bg-white">
              <img src={productImage} alt={product.name} className="w-full h-96 object-cover" />

              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={stockBadge.color}>{stockBadge.text}</Badge>
                {product.featured && <Badge className="bg-blue-600 text-white">Destacado</Badge>}
              </div>

              <button
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow"
                onClick={() => setIsFavorite((previous) => !previous)}
              >
                <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-neutral-600"} />
              </button>
            </div>

            <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-sm text-neutral-500">Categoria</p>
                  <p className="text-lg font-semibold text-neutral-900">{product.category}</p>
                </div>

                {product.origin && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <MapPin size={16} className="text-blue-600" />
                    <span>{product.origin}</span>
                  </div>
                )}

                <div className="ml-auto text-right">
                  <div className="flex items-center justify-end gap-1 text-yellow-500">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={16}
                        className={index < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">
                    {rating.toFixed(1)} ({reviews} reseñas)
                  </p>
                </div>
              </div>

              <p className="text-neutral-700 leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-600 uppercase tracking-wide">Precio</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">
                    ${product.price.toLocaleString("es-AR")}
                    <span className="text-sm text-neutral-500 font-medium ml-1">/ {product.unit}</span>
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-xs text-emerald-600 uppercase tracking-wide">Disponibilidad</p>
                  <p className="text-lg font-semibold text-neutral-900 mt-1">{stock} {product.unit}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-xs text-orange-600 uppercase tracking-wide">Vistas</p>
                  <p className="text-lg font-semibold text-neutral-900 mt-1">{viewCount} vistas</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Cantidad ({product.unit})</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity((previous) => Math.max(minSelectable, previous - 1))}
                      disabled={quantity <= minSelectable}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity((previous) => Math.min(maxSelectable, previous + 1))}
                      disabled={quantity >= maxSelectable || quantity >= stock}
                    >
                      +
                    </Button>
                    <span className="text-sm text-neutral-500 ml-2">
                      Maximo: {Math.min(maxSelectable, stock)} {product.unit}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => addToCart(product.id, quantity)}
                    disabled={stock === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-neutral-300 h-12"
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    {cartQuantity > 0 ? `En carrito (${cartQuantity})` : "Agregar al carrito"}
                  </Button>
                  <Button
                    onClick={() => setShowQuickQuote(true)}
                    variant="outline"
                    className="h-12 px-6 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                  >
                    <Calculator size={16} className="mr-2" />
                    Cotizar
                  </Button>
                  <Button variant="ghost" className="h-12 px-6 hover:text-blue-600" onClick={handleShare}>
                    <Share2 size={16} className="mr-2" />
                    Compartir
                  </Button>
                </div>

                {cartQuantity > 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    Ya tienes {cartQuantity} {product.unit} en tu carrito
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Shield size={16} className="text-green-600" />
                  <span>Producto fresco</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Award size={16} className="text-blue-600" />
                  <span>Calidad premium</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Truck size={16} className="text-orange-600" />
                  <span>Envio refrigerado</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-neutral-900">Informacion del producto</h2>
                <span className="text-sm text-neutral-500">ID: {product.id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={<Package size={20} className="text-blue-600" />} label="Unidad" value={product.unit} />
                <InfoRow
                  icon={<Clock size={20} className="text-blue-600" />}
                  label="Frescura"
                  value={product.freshness ?? "N/D"}
                />
                <InfoRow
                  icon={<Scale size={20} className="text-blue-600" />}
                  label="Minimo de compra"
                  value={`${minSelectable} ${product.unit}`}
                />
                <InfoRow
                  icon={<Truck size={20} className="text-blue-600" />}
                  label="Maximo por pedido"
                  value={`${Math.min(maxSelectable, stock)} ${product.unit}`}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="description">Descripcion</TabsTrigger>
                  <TabsTrigger value="nutrition">Informacion nutricional</TabsTrigger>
                  <TabsTrigger value="storage">Conservacion</TabsTrigger>
                  <TabsTrigger value="preparation">Preparacion</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-6">
                  <div className="prose max-w-none">
                    <p className="text-neutral-700 leading-relaxed">{product.description}</p>
                  </div>
                </TabsContent>

                <TabsContent value="nutrition" className="mt-6">
                  {nutritionalInfo ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <NutritionCard label="Proteina" value={nutritionalInfo.protein} tone="blue" />
                      <NutritionCard label="Omega 3" value={nutritionalInfo.omega3} tone="green" />
                      <NutritionCard label="Grasa" value={nutritionalInfo.fat} tone="orange" />
                      <NutritionCard label="Calorias" value={nutritionalInfo.calories} tone="purple" />
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">No hay informacion nutricional disponible.</p>
                  )}
                </TabsContent>

                <TabsContent value="storage" className="mt-6">
                  {product.storageInstructions ? (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                        <Package size={16} className="text-blue-600" />
                        Instrucciones de conservacion
                      </h4>
                      <p className="text-neutral-700">{product.storageInstructions}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">No hay instrucciones de conservacion registradas.</p>
                  )}
                </TabsContent>

                <TabsContent value="preparation" className="mt-6">
                  {product.preparationTips && product.preparationTips.length > 0 ? (
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-4">Sugerencias de preparacion</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {product.preparationTips.map((tip, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                            <span className="text-neutral-700">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">No hay sugerencias de preparacion registradas.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <ProductRecommendations currentProduct={product} onAddToCart={(id) => addToCart(id, 1)} />

            {recentlyViewed.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">Productos vistos recientemente</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {recentlyViewed.map((recent) => (
                    <button
                      type="button"
                      key={recent.id}
                      className="group text-left"
                      onClick={() => router.push(`/productos/${recent.id}`)}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-2">
                        <img
                          src={recent.image || FALLBACK_IMAGE}
                          alt={recent.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <h4 className="text-sm font-medium text-neutral-900 truncate group-hover:text-blue-600">
                        {recent.name}
                      </h4>
                      <p className="text-xs text-neutral-500">{recent.category}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showShareMenu && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h4 className="text-lg font-semibold text-neutral-900 mb-2">Compartir producto</h4>
            <p className="text-sm text-neutral-600 mb-4">Copia el enlace para compartirlo manualmente.</p>
            <Button className="w-full" onClick={copyToClipboard}>
              Copiar enlace
            </Button>
            <Button variant="ghost" className="w-full mt-2" onClick={() => setShowShareMenu(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <QuickQuote
        isOpen={showQuickQuote}
        onClose={() => setShowQuickQuote(false)}
        selectedProducts={[
          {
            name: product.name,
            quantity,
            unit: product.unit,
          },
        ]}
      />
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="font-medium text-neutral-900">{value}</p>
      </div>
    </div>
  )
}

function NutritionCard({ label, value, tone }: { label: string; value?: number; tone: Tone }) {
  const toneClasses: Record<Tone, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
  }

  const toneBackground: Record<Tone, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
  }

  return (
    <div className={`${toneBackground[tone]} rounded-lg p-4 text-center`}>
      <div className={`text-2xl font-bold ${toneClasses[tone]} mb-1`}>{value ?? "-"}</div>
      <div className="text-sm text-neutral-600">{label}</div>
    </div>
  )
}
