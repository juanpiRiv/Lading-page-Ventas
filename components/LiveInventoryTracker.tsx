"use client"

import { useState, useEffect } from "react"
import { Package, TrendingUp, TrendingDown, Clock, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface InventoryItem {
  id: number
  name: string
  currentStock: number
  unit: string
  lastUpdated: string
  trend: "up" | "down" | "stable"
  status: "high" | "medium" | "low" | "critical"
}

const inventoryData: InventoryItem[] = [
  {
    id: 1,
    name: "Salmón Atlántico",
    currentStock: 45,
    unit: "kg",
    lastUpdated: "Hace 5 min",
    trend: "down",
    status: "medium",
  },
  {
    id: 2,
    name: "Langostinos Patagónicos",
    currentStock: 32,
    unit: "kg",
    lastUpdated: "Hace 2 min",
    trend: "up",
    status: "medium",
  },
  {
    id: 3,
    name: "Centolla Patagónica",
    currentStock: 15,
    unit: "unidades",
    lastUpdated: "Hace 1 min",
    trend: "down",
    status: "low",
  },
  {
    id: 4,
    name: "Atún Rojo Premium",
    currentStock: 8,
    unit: "kg",
    lastUpdated: "Hace 3 min",
    trend: "down",
    status: "critical",
  },
]

export default function LiveInventoryTracker() {
  const [inventory, setInventory] = useState(inventoryData)
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setInventory((prev) =>
        prev.map((item) => ({
          ...item,
          lastUpdated: "Hace " + Math.floor(Math.random() * 10 + 1) + " min",
          currentStock: Math.max(0, item.currentStock + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3)),
        })),
      )
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [isLive])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "high":
        return "Stock Alto"
      case "medium":
        return "Stock Medio"
      case "low":
        return "Stock Bajo"
      case "critical":
        return "Stock Crítico"
      default:
        return "Sin Stock"
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="text-blue-600" size={24} />
          <h3 className="text-xl font-semibold text-neutral-900">Inventario en Tiempo Real</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
          <span className="text-sm text-neutral-600">{isLive ? "En vivo" : "Pausado"}</span>
        </div>
      </div>

      <div className="space-y-4">
        {inventory.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-medium text-neutral-900">{item.name}</h4>
                <Badge className={getStatusColor(item.status)}>{getStatusText(item.status)}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span className="flex items-center gap-1">
                  <Package size={14} />
                  {item.currentStock} {item.unit}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {item.lastUpdated}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {item.trend === "up" && <TrendingUp className="text-green-600" size={20} />}
              {item.trend === "down" && <TrendingDown className="text-red-600" size={20} />}
              {item.status === "critical" && <AlertTriangle className="text-red-600" size={20} />}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Los niveles de stock se actualizan automáticamente cada 30 segundos. Para pedidos
          grandes, recomendamos contactar directamente para confirmar disponibilidad.
        </p>
      </div>
    </div>
  )
}
