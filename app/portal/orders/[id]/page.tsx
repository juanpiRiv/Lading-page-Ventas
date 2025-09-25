"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Check, ArrowLeft } from "lucide-react"
import { subscribeToUserOrders, type Order, type OrderItem } from "@/lib/firestore"
import { useAuth } from "@/contexts/AuthContext"

const ORDER_STATUS_STEPS: Array<{ value: Order["status"]; label: string; description: string }> = [
  { value: "pending", label: "Pedido recibido", description: "Recibimos tu pedido." },
  { value: "confirmed", label: "Confirmado", description: "Confirmamos disponibilidad." },
  { value: "preparing", label: "Preparando", description: "Seleccionando productos." },
  { value: "shipped", label: "En camino", description: "Despachado hacia tu direccion." },
  { value: "delivered", label: "Entregado", description: "Pedido entregado." },
]

const getOrderStatusLabel = (status: Order["status"]): string => {
  switch (status) {
    case "delivered": return "Entregado"
    case "shipped": return "En transito"
    case "confirmed": return "Confirmado"
    case "preparing": return "Preparando"
    case "cancelled": return "Cancelado"
    default: return "Pendiente"
  }
}

const getOrderStatusBadgeClasses = (status: Order["status"]): string => {
  switch (status) {
    case "delivered": return "bg-green-100 text-green-700"
    case "shipped": return "bg-blue-100 text-blue-700"
    case "confirmed": return "bg-purple-100 text-purple-700"
    case "preparing": return "bg-yellow-100 text-yellow-700"
    case "cancelled": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

const totalsFromItems = (items: OrderItem[]) => {
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)
  return { subtotal, total: subtotal }
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()

  const [order, setOrder] = useState<Order | null>(null)
  const [loadingOrder, setLoadingOrder] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) { router.push("/login"); return }
    if (userProfile?.role === "admin") { router.push("/admin"); return }
    if (!params?.id) return

    const unsub = subscribeToUserOrders(user.uid, (list) => {
      const match = list.find((o) => o.id === params.id) ?? null
      setOrder(match)
      setLoadingOrder(false)
    })
    return () => unsub()
  }, [user, userProfile, loading, params?.id, router])

  const stepIndex = useMemo(() => (order ? ORDER_STATUS_STEPS.findIndex(s => s.value === order.status) : -1), [order])
  const totals = useMemo(() => totalsFromItems(order?.items ?? []), [order])

  if (loadingOrder) {
    return <div className="min-h-screen flex items-center justify-center">Cargando pedido...</div>
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-3">
        <Package size={48} className="text-neutral-300" />
        <p className="font-semibold">Pedido no encontrado</p>
        <Button variant="outline" onClick={() => router.push("/portal/orders")}>Volver a mis pedidos</Button>
      </div>
    )
  }

  const createdAt = order.createdAt.toLocaleString("es-AR")

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Button variant="ghost" onClick={() => router.push("/portal/orders")} className="-ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
            <h1 className="text-3xl font-bold text-neutral-900">Pedido #{order.id}</h1>
            <div className="flex items-center gap-3">
              <Badge className={`text-xs ${getOrderStatusBadgeClasses(order.status)}`}>{getOrderStatusLabel(order.status)}</Badge>
              <span className="text-sm text-neutral-600">{createdAt}</span>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Linea de tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            {order.status === "cancelled" ? (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">Pedido cancelado.</div>
            ) : (
              <div className="relative pl-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-neutral-200"></div>
                {ORDER_STATUS_STEPS.map((step, i) => {
                  const done = stepIndex > i
                  const current = stepIndex === i
                  return (
                    <div key={step.value} className="relative pb-6 last:pb-0">
                      <div className={`absolute left-[-3px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${done ? "bg-blue-600 border-blue-600 text-white" : current ? "border-blue-600 bg-white" : "border-neutral-300 bg-white"}`}>
                        {done ? <Check size={14} /> : null}
                      </div>
                      <div className={`ml-6 ${done || current ? "text-neutral-900" : "text-neutral-500"}`}>
                        <p className="font-semibold text-sm">{step.label}</p>
                        <p className="text-xs mt-1">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {order.items.map((it) => (
              <div key={`${it.productId}-${it.name}`} className="flex items-center justify-between">
                <span className="truncate pr-4">{it.name}</span>
                <span className="font-medium">{it.quantity} · ${it.price.toLocaleString("es-AR")}</span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3 flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>${totals.total.toLocaleString("es-AR")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
