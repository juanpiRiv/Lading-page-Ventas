"use client"

import { Star, ShoppingCart, Eye, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/firestore"

interface ProductRecommendationsProps {
  currentProduct?: Product | null
  onAddToCart: (productId: string) => void
}

const FALLBACK_IMAGE = "/placeholder.svg"

const recommendedProducts: Array<Pick<Product, "id" | "name" | "category" | "stock" | "unit" | "rating" | "featured"> & {
  imageUrl?: string
  images?: string[]
  reviews?: number
}> = [
  {
    id: "salmon-premium",
    name: "Salmon Atlantico Premium",
    category: "Salmon",
    stock: 45,
    unit: "kg",
    imageUrl: "/fresh-salmon-fillet.jpg",
    rating: 4.8,
    reviews: 124,
    featured: true,
  },
  {
    id: "langostinos-patagonicos",
    name: "Langostinos Patagonicos",
    category: "Mariscos",
    stock: 32,
    unit: "kg",
    imageUrl: "/fresh-prawns-shrimp.jpg",
    rating: 4.9,
    reviews: 156,
    featured: true,
  },
  {
    id: "atun-rojo-premium",
    name: "Atun Rojo Premium",
    category: "Atun",
    stock: 23,
    unit: "kg",
    imageUrl: "/fresh-tuna-steak.jpg",
    rating: 4.7,
    reviews: 67,
    featured: true,
  },
]

export default function ProductRecommendations({ currentProduct, onAddToCart }: ProductRecommendationsProps) {
  const filteredRecommendations = recommendedProducts
    .filter((product) => product.id !== currentProduct?.id)
    .slice(0, 3)

  if (filteredRecommendations.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-blue-600" size={20} />
        <h3 className="text-xl font-semibold text-neutral-900">Productos recomendados</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredRecommendations.map((product) => {
          const image = product.images?.[0] ?? product.imageUrl ?? FALLBACK_IMAGE

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 hover:shadow-md transition-all duration-200 group"
            >
              <div className="relative mb-3">
                <img
                  src={image}
                  alt={product.name}
                  className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                />
                {product.featured && (
                  <Badge className="absolute top-2 left-2 bg-blue-600 text-white text-xs">Destacado</Badge>
                )}
              </div>

              <h4 className="font-medium text-neutral-900 mb-1 text-sm">{product.name}</h4>
              <p className="text-xs text-neutral-500 mb-2">{product.category}</p>

              <div className="flex items-center gap-1 mb-2">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-neutral-600">{(product.rating ?? 0).toFixed(1)}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onAddToCart(product.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                >
                  <ShoppingCart size={12} className="mr-1" />
                  Agregar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => (window.location.href = `/productos/${product.id}`)}
                  className="w-8 h-8 p-0"
                >
                  <Eye size={12} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}