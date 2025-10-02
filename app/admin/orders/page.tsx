"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, CheckCircle, XCircle, Truck } from "lucide-react"
import { type Order, subscribeToOrders, updateOrder } from "@/lib/firestore"
import { getOrderStatusBadgeClasses, getOrderStatusLabel } from "@/lib/orders/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const FILTER_OPTIONS: Array<{ key: "all" | "7" | "30" | "90"; label: string }> = [
  { key: "all", label: "Todas" },
  { key: "7", label: "Ultimos 7 dias" },
  { key: "30", label: "Ultimos 30 dias" },
  { key: "90", label: "Ultimos 90 dias" },
]

export default function AdminOrdersPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<"all" | "7" | "30" | "90">("all")

  useEffect(() => {
    if (userProfile?.role !== "admin") {
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToOrders((fetchedOrders) => {
      setOrders(fetchedOrders)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userProfile])

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const targetOrder = orders.find((item) => item.id === orderId)
      if (!targetOrder) {
        throw new Error("Pedido no encontrado en la lista actual")
      }

      let note = `Cambio de estado a ${getOrderStatusLabel(newStatus)}`
      if (newStatus === "cancelled" && typeof window !== "undefined") {
        const userNote = window.prompt("Nota para la cancelacion", note)
        if (userNote === null) {
          return
        }
        note = userNote.trim().length > 0 ? userNote.trim() : note
      }

      await updateOrder(
        orderId,
        { status: newStatus },
        {
          previousStatus: targetOrder.status,
          actorId: user?.uid,
          actorName: userProfile?.displayName ?? user?.email ?? "Administrador",
          note,
        },
      )
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Error al actualizar el estado del pedido.")
    }
  }

  const filteredOrders = useMemo(() => {
    if (dateFilter === "all") return orders
    const days = Number(dateFilter)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return orders.filter((order) => order.createdAt >= cutoff)
  }, [orders, dateFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando ordenes...
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => router.push("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
        </Button>

        <div className="mb-6 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <Button
              key={option.key}
              variant={dateFilter === option.key ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <h1 className="text-4xl font-bold mb-8">Gestion de Ordenes</h1>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Ordenes</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay ordenes para mostrar.</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay ordenes en el periodo seleccionado.</p>
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
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                      <TableCell>{order.userDisplayName || "N/A"}</TableCell>
                      <TableCell>{format(order.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                      <TableCell>${order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getOrderStatusBadgeClasses(order.status)}`}
                        >
                          {getOrderStatusLabel(order.status)}
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





