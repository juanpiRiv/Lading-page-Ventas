"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, CheckCircle, XCircle, Truck, MapPin, Phone, Mail, User, Package, Check } from "lucide-react"
import { type Order, subscribeToOrders, updateOrder } from "@/lib/firestore"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const ORDER_STATUS_STEPS: Array<{ value: Order["status"]; label: string; description: string }> = [
  {
    value: "pending",
    label: "Pendiente",
    description: "Pedido recibido y a la espera de confirmacion.",
  },
  {
    value: "confirmed",
    label: "Confirmado",
    description: "Pedido confirmado por el equipo comercial.",
  },
  {
    value: "preparing",
    label: "Preparando",
    description: "Preparando productos para despacho.",
  },
  {
    value: "shipped",
    label: "En transito",
    description: "Pedido enviado y en camino al cliente.",
  },
  {
    value: "delivered",
    label: "Entregado",
    description: "Pedido entregado al cliente.",
  },
]

const getOrderStatusLabel = (status: Order["status"]): string => {
  switch (status) {
    case "delivered":
      return "Entregado"
    case "shipped":
      return "En transito"
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
  if (status === "cancelled") {
    return -1
  }
  return ORDER_STATUS_STEPS.findIndex((step) => step.value === status)
}

export default function AdminOrdersPage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile?.role === "admin") {
      const unsubscribe = subscribeToOrders((fetchedOrders) => {
        setOrders(fetchedOrders)
        setLoading(false)
      })
      return () => unsubscribe()
    } else {
      setLoading(false)
    }
  }, [userProfile])

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await updateOrder(orderId, { status: newStatus })
      // The subscription will automatically update the state
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Error al actualizar el estado del pedido.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando órdenes...
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => router.push("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
        </Button>
        <h1 className="text-4xl font-bold mb-8">Gestión de Órdenes</h1>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Órdenes</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay órdenes para mostrar.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID de Orden</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                      <TableCell>{order.userDisplayName || "N/A"}</TableCell>
                      <TableCell>{format(order.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                      <TableCell>${order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "shipped"
                                ? "bg-blue-100 text-blue-700"
                                : order.status === "confirmed"
                                  ? "bg-purple-100 text-purple-700"
                                  : order.status === "preparing"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status === "delivered"
                            ? "Entregado"
                            : order.status === "shipped"
                              ? "En tránsito"
                              : order.status === "confirmed"
                                ? "Confirmado"
                                : order.status === "preparing"
                                  ? "Preparando"
                                  : "Pendiente"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="mr-1" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === "pending" && (
                          <Button variant="ghost" size="sm" className="mr-1" onClick={() => handleUpdateOrderStatus(order.id, "confirmed")}>
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <Button variant="ghost" size="sm" className="mr-1" onClick={() => handleUpdateOrderStatus(order.id, "preparing")}>
                            <Truck className="h-4 w-4 text-yellow-600" />
                          </Button>
                        )}
                        {order.status === "preparing" && (
                          <Button variant="ghost" size="sm" className="mr-1" onClick={() => handleUpdateOrderStatus(order.id, "shipped")}>
                            <Truck className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateOrderStatus(order.id, "delivered")}>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {order.status !== "delivered" && (
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}>
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
