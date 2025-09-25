
"use client"

import { useState, useMemo, useEffect } from "react" // Import useEffect
import {
  Search,
  ShoppingCart,
  Star,
  Eye,
  Heart,
  Package,
  Truck,
  Clock,
  Scale,
  Compass as Compare,
  Calculator,
  Grid,
  List,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ProductComparison from "@/components/ProductComparison"
import QuickQuote from "@/components/QuickQuote"
import { type Product, type Category, subscribeToProducts, subscribeToCategories } from "@/lib/firestore" // Unique comment to force refresh: 202509241319

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [sortBy, setSortBy] = useState("featured")
  const [cart, setCart] = useState<{ [key: string]: number }>(() => { // Change key to string
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cart")
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })
  const [favorites, setFavorites] = useState<Set<string>>(new Set()) // Change to string
  const [compareProducts, setCompareProducts] = useState<Product[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [showQuickQuote, setShowQuickQuote] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState<"all" | "premium" | "standard">("all")

  useEffect(() => {
    const unsubscribeProducts = subscribeToProducts((fetchedProducts) => {
      setProducts(fetchedProducts)
      setLoadingProducts(false)
    })

    const unsubscribeCategories = subscribeToCategories((fetchedCategories: Category[]) => {
      setCategories([{ id: "todos", name: "Todos" }, ...fetchedCategories]) // Add "Todos" option
      setLoadingCategories(false)
    })

    return () => {
      unsubscribeProducts()
      unsubscribeCategories()
    }
  }, [])

  const sortOptions = [
    { value: "featured", label: "Destacados" },
    { value: "stock-high", label: "Mayor Stock" },
    { value: "stock-low", label: "Menor Stock" },
    { value: "rating", label: "Mejor Valorados" },
    { value: "name", label: "Nombre A-Z" },
  ]

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Apply price range filter
    if (priceRange === "premium") {
      filtered = filtered.filter(product => product.price >= 1500); // Example premium threshold
    } else if (priceRange === "standard") {
      filtered = filtered.filter(product => product.price < 1500); // Example standard threshold
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "stock-low":
          return a.stock - b.stock
        case "stock-high":
          return b.stock - a.stock
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0) // Handle potentially undefined rating
        case "name":
          return a.name.localeCompare(b.name)
        case "featured":
        default:
          // Assuming 'featured' is a boolean in Product interface
          return (b.tags?.includes("featured") ? 1 : 0) - (a.tags?.includes("featured") ? 1 : 0)
      }
    })
  }, [products, categories, searchTerm, selectedCategory, sortBy, priceRange])

  const addToCart = (productId: string, quantity = 1) => { // Change productId to string
    const newCart = {
      ...cart,
      [productId]: (cart[productId] || 0) + quantity,
    }
    setCart(newCart)
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(newCart))
    }
  }

  const toggleFavorite = (productId: string) => { // Change productId to string
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  const toggleCompare = (product: Product) => {
    setCompareProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      if (exists) {
        return prev.filter((p) => p.id !== product.id)
      } else if (prev.length < 3) {
        return [...prev, product]
      }
      return prev
    })
  }

  const openQuickQuote = () => {
    const cartProducts = Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = products.find((p) => p.id === productId) // Find by string id
        return product
          ? {
              name: product.name,
              quantity,
              unit: product.unit,
            }
          : null
      })
      .filter(Boolean) as { name: string; quantity: number; unit: string; }[] // Assert type

    setShowQuickQuote(true)
  }

  const getStockStatus = (stock: number) => {
    if (stock > 50) return { text: "En Stock", color: "bg-green-100 text-green-800" }
    if (stock > 20) return { text: "Stock Limitado", color: "bg-yellow-100 text-yellow-800" }
    if (stock > 0) return { text: "Últimas Unidades", color: "bg-red-100 text-red-800" }
    return { text: "Sin Stock", color: "bg-gray-100 text-gray-800" }
  }

  if (loadingProducts || loadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando productos...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 text-balance">
            Nuestros <span className="text-blue-600">Productos</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto text-pretty">
            Descubre nuestra selección premium de pescados y mariscos frescos, directamente desde las mejores aguas
            argentinas
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 mb-8 animate-fade-in-up animation-delay-200">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full lg:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-neutral-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id} // Use category.id
                  variant={selectedCategory === category.name ? "default" : "outline"} // Compare with category.name
                  onClick={() => setSelectedCategory(category.name)} // Set category.name
                  className={`transition-all duration-200 ${
                    selectedCategory === category.name
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* View Mode Toggle and Quick Quote Button */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="w-10 h-10 p-0"
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="w-10 h-10 p-0"
              >
                <List size={16} />
              </Button>
            </div>

            <Button
              onClick={openQuickQuote}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={Object.keys(cart).length === 0}
            >
              <Calculator size={16} className="mr-2" />
              Cotización Rápida
            </Button>
          </div>
        </div>

        {/* Comparison Bar */}
        {compareProducts.length > 0 && (
          <div className="bg-blue-600 text-white rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Compare size={20} />
              <span>Comparando {compareProducts.length} productos</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(true)}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Ver Comparación
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareProducts([])}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Limpiar
              </Button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-neutral-600">
            Mostrando <span className="font-semibold text-neutral-900">{filteredAndSortedProducts.length}</span>{" "}
            productos
          </p>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Package size={16} />
            <span>Total en carrito: {Object.values(cart).reduce((sum, qty) => sum + qty, 0)}</span>
          </div>
        </div>

        {/* Enhanced Products Grid with Comparison Checkboxes */}
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
          }
        >
          {filteredAndSortedProducts.map((product, index) => {
            const stockStatus = getStockStatus(product.stock)
            const cartQuantity = cart[product.id] || 0 // Use product.id as string
            const isFavorite = favorites.has(product.id) // Use product.id as string
            const isInComparison = compareProducts.some((p) => p.id === product.id)

            return (
              <div
                key={product.id}
                className={`group bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 animate-fade-in-up ${
                  viewMode === "list" ? "flex gap-4 p-4" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Comparison Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={isInComparison}
                    onChange={() => toggleCompare(product)}
                    disabled={!isInComparison && compareProducts.length >= 3}
                    className="w-4 h-4 text-blue-600 bg-white border-2 border-white rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>

                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.images?.[0] || "/placeholder.svg"} // Use optional chaining for images
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.tags?.includes("featured") && <Badge className="bg-blue-600 text-white">Destacado</Badge>} {/* Use product.tags */}
                  </div>

                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
                      onClick={() => toggleFavorite(product.id)}
                    >
                      <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500" : "text-neutral-600"} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
                      onClick={() => (window.location.href = `/productos/${product.id}`)}
                    >
                      <Eye size={16} className="text-neutral-600" />
                    </Button>
                  </div>

                  {/* Stock Status */}
                  <div className="absolute bottom-3 left-3">
                    <Badge className={stockStatus.color}>{stockStatus.text}</Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Name and Category */}
                  <h3
                    className="font-semibold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/productos/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-2">{product.category}</p>

                  {/* Description */}
                  <p className="text-sm text-neutral-600 mb-2 line-clamp-2">{product.description}</p>

                  {/* Price */}
                  <div className="text-xl font-bold text-neutral-900 mb-3">
                    ${product.price.toLocaleString("es-AR")}
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Truck size={12} />
                      <span>{product.origin}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Scale size={12} />
                      <span>{product.unit}</span>
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <div className="flex items-center gap-2 mb-3">
                    <Button
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-neutral-300"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      {cartQuantity > 0 ? `En carrito (${cartQuantity})` : "Agregar"}
                    </Button>
                  </div>

                  {/* Stock Info */}
                  <div className="text-xs text-neutral-500 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>
                        Stock: {product.stock} {product.unit}
                      </span>
                    </div>
                    <span className="text-green-600 font-medium">{product.freshness?.toString() || "N/A"}</span> {/* Convert freshness to string */}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No se encontraron productos</h3>
            <p className="text-neutral-600">Intenta ajustar tus filtros o términos de búsqueda</p>
          </div>
        )}
      </div>

      {/* Comparison and Quick Quote Modals */}
      <ProductComparison products={compareProducts} onClose={() => setShowComparison(false)} />

      <QuickQuote
        isOpen={showQuickQuote}
        onClose={() => setShowQuickQuote(false)}
        selectedProducts={Object.entries(cart)
          .map(([productId, quantity]) => {
            const product = products.find((p) => p.id === productId) // Find by string id
            return product
              ? {
                  name: product.name,
                  quantity,
                  unit: product.unit,
                }
              : null
          })
          .filter(Boolean) as { name: string; quantity: number; unit: string; }[]} // Assert type
      />
    </div>
  )
}
