"use client"

import { useState } from "react"
import { Search, Filter, X, MapPin, Star, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

interface SearchFilters {
  category: string[]
  origin: string[]
  freshness: string[]
  rating: number
  stockLevel: "all" | "high" | "medium" | "low"
  featured: boolean
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void
  onClose: () => void
}

const categories = ["Salmón", "Pescado Blanco", "Mariscos", "Atún", "Pescado Rojo"]
const origins = ["Mar del Plata", "Puerto Madryn", "Rawson", "Mar Argentino", "Ushuaia", "Necochea", "Puerto Deseado"]
const freshnessLevels = ["Ultra fresco", "Fresco", "Vivo"]

export default function AdvancedSearch({ onSearch, onClose }: AdvancedSearchProps) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    category: [],
    origin: [],
    freshness: [],
    rating: 0,
    stockLevel: "all",
    featured: false,
  })

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = (key: "category" | "origin" | "freshness", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((item) => item !== value) : [...prev[key], value],
    }))
  }

  const clearFilters = () => {
    setFilters({
      category: [],
      origin: [],
      freshness: [],
      rating: 0,
      stockLevel: "all",
      featured: false,
    })
  }

  const handleSearch = () => {
    onSearch(query, filters)
    onClose()
  }

  const activeFiltersCount =
    filters.category.length +
    filters.origin.length +
    filters.freshness.length +
    (filters.rating > 0 ? 1 : 0) +
    (filters.stockLevel !== "all" ? 1 : 0) +
    (filters.featured ? 1 : 0)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-neutral-900">Búsqueda Avanzada</h2>
            {activeFiltersCount > 0 && (
              <Badge className="bg-blue-100 text-blue-800">{activeFiltersCount} filtros activos</Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="w-10 h-10 p-0 bg-transparent">
            <X size={16} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Query */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Buscar productos</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nombre del producto, descripción..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">Categorías</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={filters.category.includes(category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleArrayFilter("category", category)}
                  className="text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              <MapPin size={16} className="inline mr-1" />
              Origen
            </label>
            <div className="flex flex-wrap gap-2">
              {origins.map((origin) => (
                <Button
                  key={origin}
                  variant={filters.origin.includes(origin) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleArrayFilter("origin", origin)}
                  className="text-sm"
                >
                  {origin}
                </Button>
              ))}
            </div>
          </div>

          {/* Freshness */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">Estado de Frescura</label>
            <div className="flex flex-wrap gap-2">
              {freshnessLevels.map((freshness) => (
                <Button
                  key={freshness}
                  variant={filters.freshness.includes(freshness) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleArrayFilter("freshness", freshness)}
                  className="text-sm"
                >
                  {freshness}
                </Button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              <Star size={16} className="inline mr-1" />
              Valoración mínima: {filters.rating > 0 ? `${filters.rating} estrellas` : "Cualquiera"}
            </label>
            <Slider
              value={[filters.rating]}
              onValueChange={(value) => handleFilterChange("rating", value[0])}
              max={5}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Stock Level */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              <Package size={16} className="inline mr-1" />
              Nivel de Stock
            </label>
            <div className="flex gap-2">
              {[
                { value: "all", label: "Todos" },
                { value: "high", label: "Alto (50+)" },
                { value: "medium", label: "Medio (20-50)" },
                { value: "low", label: "Bajo (<20)" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={filters.stockLevel === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("stockLevel", option.value)}
                  className="text-sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured"
              checked={filters.featured}
              onChange={(e) => handleFilterChange("featured", e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white border-neutral-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="featured" className="text-sm font-medium text-neutral-700">
              Solo productos destacados
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-100 p-6 flex gap-3">
          <Button onClick={clearFilters} variant="outline" className="flex-1 bg-transparent">
            Limpiar Filtros
          </Button>
          <Button onClick={handleSearch} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            <Search size={16} className="mr-2" />
            Buscar
          </Button>
        </div>
      </div>
    </div>
  )
}
