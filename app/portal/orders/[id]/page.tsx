"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Check, ArrowLeft } from "lucide-react"
import { subscribeToOrder, updateOrder, type Order } from "@/lib/firestore"
import { useAuth } from "@/contexts/AuthContext"
import {
  calculateOrderTotals,
  getOrderStatusBadgeClasses,
  getOrderStatusLabel,
  getOrderStatusSteps,
  getStatusStepIndex,
} from "@/lib/orders/utils"

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()

  const [order, setOrder] = useState<Order | null>(null)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  const statusSteps = useMemo(() => getOrderStatusSteps("portal"), [])

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/login")
      return
    }
    if (userProfile?.role === "admin") {
      router.push("/admin")
      return
    }
    if (!params?.id) return

    setLoadingOrder(true)

    const unsubscribe = subscribeToOrder(params.id, (nextOrder) => {
      if (!nextOrder || nextOrder.userId !== user.uid) {
        setOrder(null)
      } else {
        setOrder(nextOrder)
      }
      setLoadingOrder(false)
    })

    return () => unsubscribe()
  }, [loading, user, userProfile, params?.id, router])

  const stepIndex = useMemo(() => (order ? getStatusStepIndex(order.status) : -1), [order])
  const totals = useMemo(() => calculateOrderTotals(order?.items ?? []), [order])
  const canCancel = order?.status === "pending"

  const handleCancelOrder = async () => {
    if (!order || order.status !== "pending") return
    if (typeof window !== "undefined") {
      const confirmCancel = window.confirm("Seguro que deseas cancelar este pedido?")
      if (!confirmCancel) return
    }

    try {
      setIsCancelling(true)
      await updateOrder(order.id, { status: "cancelled" })
      if (typeof window !== "undefined") {
        window.alert("Tu pedido fue cancelado.")
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
      if (typeof window !== "undefined") {
        window.alert("No pudimos cancelar tu pedido. Intenta nuevamente.")
      }
    } finally {
      setIsCancelling(false)
    }
  }

  const handleRepeatOrder = () => {
    if (!order || typeof window === "undefined") return

    try {
      const rawCart = window.localStorage.getItem("cart")
      const currentCart: Record<string, number> = rawCart ? JSON.parse(rawCart) : {}

      order.items.forEach((item) => {
        currentCart[item.productId] = (currentCart[item.productId] ?? 0) + item.quantity
      })

      window.localStorage.setItem("cart", JSON.stringify(currentCart))
      window.alert("Agregamos los productos del pedido a tu carrito. Puedes revisarlos antes de enviarlo.")
      router.push("/carrito")
    } catch (error) {
      console.error("Error repeating order:", error)
      window.alert("No pudimos preparar tu carrito con este pedido. Intenta nuevamente.")
    }
  }

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRepeatOrder} className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Repetir pedido
            </Button>
            {canCancel ? (
              <Button
                variant="outline"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="border-red-500 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isCancelling ? "Cancelando..." : "Cancelar pedido"}
              </Button>
            ) : null}
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
                {statusSteps.map((step, index) => {
                  const done = stepIndex > index
                  const current = stepIndex === index
                  return (
                    <div key={step.value} className="relative pb-6 last:pb-0">
                      <div
                        className={`absolute left-[-3px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          done ? "bg-blue-600 border-blue-600 text-white" : current ? "border-blue-600 bg-white" : "border-neutral-300 bg-white"
                        }`}
                      >
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
            {order.items.map((item) => (
              <div key={`${item.productId}-${item.name}`} className="flex items-center justify-between">
                <span className="truncate pr-4">{item.name}</span>
                <span className="font-medium">{item.quantity} x ${item.price.toLocaleString("es-AR")}</span>
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
