"use client"
import { X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Product } from "@/lib/firestore" // Import Product from firestore

interface ProductComparisonProps {
  products: Product[]
  onClose: () => void
}

export default function ProductComparison({ products, onClose }: ProductComparisonProps) {
  if (products.length === 0) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">Comparar Productos</h2>
          <Button variant="outline" size="sm" onClick={onClose} className="w-10 h-10 p-0 bg-transparent">
            <X size={16} />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border border-neutral-200 rounded-xl p-4">
                <div className="text-center mb-4">
                  <img
                    src={product.images?.[0] || "/placeholder.svg"} // Use optional chaining for images
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-neutral-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-neutral-500">{product.category}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Valoración:</span>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating ?? 0}</span> {/* Handle potentially undefined rating */}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Stock:</span>
                    <span className="text-sm font-medium">
                      {product.stock} {product.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Origen:</span>
                    <span className="text-sm font-medium">{product.origin}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Frescura:</span>
                    <Badge className="text-xs bg-green-100 text-green-800">{product.freshness?.toString() || "N/A"} días</Badge> {/* Convert freshness to string */}
                  </div>

                  {product.nutritionalInfo && (
                    <div className="border-t border-neutral-100 pt-3 mt-3">
                      <h4 className="text-sm font-medium text-neutral-900 mb-2">Información Nutricional</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Proteína:</span>
                          <span>{product.nutritionalInfo.protein}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Grasa:</span>
                          <span>{product.nutritionalInfo.fat}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Omega-3:</span>
                          <span>{product.nutritionalInfo.omega3}mg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Calorías:</span>
                          <span>{product.nutritionalInfo.calories}kcal</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
