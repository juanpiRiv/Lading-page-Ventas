"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Package, User, MapPin, Phone, Mail, Check, Timer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { subscribeToOrders, updateOrder, type Order, type OrderItem } from "@/lib/firestore"
import ProtectedRoute from "@/components/ProtectedRoute"

const ORDER_STATUS_STEPS: Array<{ value: Order["status"]; label: string; description: string }> = [
  { value: "pending", label: "Pendiente", description: "Pedido recibido, a la espera de confirmación." },
  { value: "confirmed", label: "Confirmado", description: "Confirmamos disponibilidad y cantidades." },
  { value: "preparing", label: "Preparando", description: "Seleccionando y acondicionando los productos." },
  { value: "shipped", label: "En tránsito", description: "Pedido despachado hacia el cliente." },
  { value: "delivered", label: "Entregado", description: "Pedido entregado al cliente." },
]

const getOrderStatusLabel = (status: Order["status"]): string => {
  switch (status) {
    case "delivered":
      return "Entregado"
    case "shipped":
      return "En tránsito"
    case "confirmed":
      return "Confirmado"
    case "preparing":
      return "Preparando"
    case "cancelled":
      return "Cancelado"
    default:
      return "Pendiente"
  }
}

const getOrderStatusBadgeClasses = (status: Order["status"]): string => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-700"
    case "shipped":
      return "bg-blue-100 text-blue-700"
    case "confirmed":
      return "bg-purple-100 text-purple-700"
    case "preparing":
      return "bg-yellow-100 text-yellow-700"
    case "cancelled":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const getStatusStepIndex = (status: Order["status"]): number => {
  if (status === "cancelled") return -1
  return ORDER_STATUS_STEPS.findIndex((s) => s.value === status)
}

const calculateOrderTotals = (items: OrderItem[]) => {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0)
  return { subtotal, total: subtotal }
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const handleAdvance = async () => {
    if (!order) return
    const transitions: Record<Order["status"], Order["status"] | null> = {
      pending: "confirmed",
      confirmed: "preparing",
      preparing: "shipped",
      shipped: "delivered",
      delivered: null,
      cancelled: null,
    }
    const next = transitions[order.status]
    if (!next) return
    try {
      await updateOrder(order.id, { status: next })
    } catch (e) {
      console.error("Error advancing status", e)
      alert("No se pudo actualizar el estado del pedido")
    }
  }

  const handleCancel = async () => {
    if (!order || order.status === "delivered") return
    try {
      await updateOrder(order.id, { status: "cancelled" })
    } catch (e) {
      console.error("Error cancelling order", e)
      alert("No se pudo cancelar el pedido")
    }
  }

  useEffect(() => {
    if (!params?.id) return
    const unsubscribe = subscribeToOrders((orders) => {
      const match = orders.find((o) => o.id === params.id) ?? null
      setOrder(match)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [params?.id])

  const timelineIndex = useMemo(() => (order ? getStatusStepIndex(order.status) : -1), [order])
  const totals = useMemo(() => calculateOrderTotals(order?.items ?? []), [order])

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="flex items-center justify-center min-h-screen">Cargando pedido...</div>
      </ProtectedRoute>
    )
  }

  if (!order) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4">
          <Package size={48} className="text-slate-300" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Pedido no encontrado</h1>
            <p className="text-slate-600">Verifica el identificador o regresa al listado.</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/admin/orders")} className="border-slate-300 text-slate-700 hover:bg-slate-50">
            Volver al listado
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  const createdAt = order.createdAt.toLocaleString("es-AR")
  const updatedAt = order.updatedAt.toLocaleString("es-AR")

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="container mx-auto py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Button variant="ghost" className="-ml-2 text-slate-600" onClick={() => router.push("/admin/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a pedidos
            </Button>
            <div>
              <p className="text-sm text-slate-500">Pedido</p>
              <h1 className="text-3xl font-bold text-slate-900">#{order.id}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={`text-xs font-semibold ${getOrderStatusBadgeClasses(order.status)}`}>
                {getOrderStatusLabel(order.status)}
              </Badge>
              <span className="text-sm text-slate-500">Actualizado {updatedAt}</span>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div>
              <p className="text-sm text-slate-500">Creado</p>
              <p className="text-lg font-semibold text-slate-900">{createdAt}</p>
            </div>
            <div className="flex items-center justify-end gap-2">
              {order.status !== "delivered" && order.status !== "cancelled" ? (
                <>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAdvance}>
                    Avanzar estado
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Timer size={20} className="text-blue-600" />
                </div>
                <span>Línea de tiempo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {order.status === "cancelled" ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  El pedido fue cancelado.
                </div>
              ) : (
                <div className="relative pl-8">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" aria-hidden />
                  {ORDER_STATUS_STEPS.map((step, index) => {
                    const isCompleted = timelineIndex > index
                    const isCurrent = timelineIndex === index
                    return (
                      <div key={step.value} className="relative pb-8 last:pb-0">
                        <div
                          className={`absolute left-[-3px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isCompleted ? "bg-blue-600 border-blue-600 text-white" : isCurrent ? "border-blue-600 bg-white" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isCompleted ? <Check size={14} /> : null}
                        </div>
                        <div className={`ml-6 space-y-1 ${isCompleted || isCurrent ? "text-slate-900" : "text-slate-500"}`}>
                          <p className="font-semibold text-sm">{step.label}</p>
                          <p className="text-xs leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <Package size={20} className="text-emerald-600" />
                </div>
                <span>Resumen</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Items</span>
                <span className="font-semibold text-slate-900">{order.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Cantidad total</span>
                <span className="font-semibold text-slate-900">{order.items.reduce((s, it) => s + it.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal estimado</span>
                <span className="font-semibold text-slate-900">${totals.subtotal.toLocaleString("es-AR")}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-slate-900">${totals.total.toLocaleString("es-AR")}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <Package size={20} className="text-slate-700" />
                </div>
                <span>Productos solicitados</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={`${item.productId}-${item.name}`}>
                      <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.price.toLocaleString("es-AR")}</TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">{(item.price * item.quantity).toLocaleString("es-AR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-xl">
                    <User size={20} className="text-purple-600" />
                  </div>
                  <span>Cliente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-6 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{order.userDisplayName ?? "Cliente"}</p>
                <p>ID de usuario: {order.userId}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-50 rounded-xl">
                    <MapPin size={20} className="text-orange-600" />
                  </div>
                  <span>Datos de entrega</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3 text-sm text-slate-600">
                {order.contact ? (
                  <>
                    <div>
                      <p className="font-semibold text-slate-900">{order.contact.firstName} {order.contact.lastName}</p>
                      <p>{order.contact.address}</p>
                      <p>
                        {order.contact.city}, {order.contact.state} {order.contact.zipCode}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {order.contact.phone ? (
                        <p className="flex items-center gap-2">
                          <Phone size={14} className="text-slate-500" />
                          <span>{order.contact.phone}</span>
                        </p>
                      ) : null}
                      {order.contact.email ? (
                        <p className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-500" />
                          <span>{order.contact.email}</span>
                        </p>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500">Sin información de contacto registrada.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

