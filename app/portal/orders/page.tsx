"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Package } from "lucide-react"
import { subscribeToUserOrders, type Order } from "@/lib/firestore"
import { useAuth } from "@/contexts/AuthContext"
import { getOrderStatusBadgeClasses, getOrderStatusLabel } from "@/lib/orders/utils"

export default function OrdersListPage() {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

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

    const unsub = subscribeToUserOrders(user.uid, (list) => {
      setOrders(list)
      setLoadingOrders(false)
    })
    return () => unsub()
  }, [user, userProfile, loading, router])

  const items = useMemo(
    () =>
      orders.map((o) => ({
        id: o.id,
        date: o.createdAt.toLocaleDateString(),
        total: `$${o.totalAmount.toLocaleString()}`,
        status: getOrderStatusLabel(o.status),
        statusColor: getOrderStatusBadgeClasses(o.status),
        count: o.items.length,
      })),
    [orders],
  )
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all')
  const filtered = useMemo(() => {
    if (statusFilter === 'all') return items
    return items.filter((x) => x.status === getOrderStatusLabel(statusFilter))
  }, [items, statusFilter])

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-900">Mis Pedidos</h1>
          <Link href="/productos">
            <Button variant="outline">Nuevo pedido</Button>
          </Link>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle>Tus pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {(["all","pending","confirmed","preparing","shipped","delivered","cancelled"] as const).map((key) => (
                <Button key={key} variant={statusFilter === key ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(key as any)}>
                  {key === "all" ? "Todas" : getOrderStatusLabel(key as Order["status"])}
                </Button>
              ))}
            </div>
            {loadingOrders ? (
              <div className="text-center py-10 text-neutral-600">Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Package size={48} className="text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600 font-medium">Aun no tienes pedidos</p>
                <Link href="/productos" className="inline-block mt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Ver catalogo</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-5 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-neutral-900">#{order.id.slice(0,8)}</p>
                        <Badge className={`text-xs ${order.statusColor}`}>{order.status}</Badge>
                      </div>
                      <p className="text-sm text-neutral-600">{order.count} item(s) · {order.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-neutral-900">{order.total}</p>
                      <Button variant="ghost" onClick={() => router.push(`/portal/orders/${order.id}`)}>
                        Ver <ChevronRight size={18} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



