"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  LogOut,
  TrendingUp,
  Calendar,
  DollarSign,
  Star,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Activity,
  Bell,
  Clock,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { subscribeToUserOrders, type Order } from "@/lib/firestore"
import {
  calculateOrderTotals,
  getOrderStatusBadgeClasses,
  getOrderStatusLabel,
  getOrderStatusSteps,
  getStatusStepIndex,
} from "@/lib/orders/utils"

export default function PortalPage() {
  const { user, userProfile, logout, loading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const router = useRouter()

  useEffect(() => {
    if (loading) {
      return
    }

    if (!user) {
      router.push("/login")
      setOrders([])
      setLoadingOrders(false)
      return
    }

    if (userProfile?.role === "admin") {
      router.push("/admin")
      return
    }

    setLoadingOrders(true)
    const unsubscribe = subscribeToUserOrders(user.uid, (userOrders) => {
      setOrders(userOrders)
      setLoadingOrders(false)
    })

    return () => {
      unsubscribe()
    }
  }, [user, userProfile, loading, router])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando portal...</p>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  const stats = [
    {
      title: "Pedidos este mes",
      value: orders
        .filter((order) => {
          const orderDate = order.createdAt;
          const now = new Date()
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
        })
        .length.toString(),
      change: "+15%",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "up",
    },
    {
      title: "Total gastado",
      value: `$${orders.reduce((total, order) => total + order.totalAmount, 0).toLocaleString()}`,
      change: "+8%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "up",
    },
    {
      title: "Pedidos totales",
      value: orders.length.toString(),
      change: `+${
        orders.filter((order) => {
          const orderDate = order.createdAt
          const lastMonth = new Date()
          lastMonth.setMonth(lastMonth.getMonth() - 1)
          return orderDate > lastMonth
        }).length
      }`,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "up",
    },
  ]

  const recentOrders = orders.slice(0, 3).map((order) => {
    const totals = calculateOrderTotals(order.items)
    return {
      id: order.id,
      date: order.createdAt.toLocaleDateString(),
      status: getOrderStatusLabel(order.status),
      statusColor: getOrderStatusBadgeClasses(order.status),
      total: `$${totals.total.toLocaleString()}`,
      items: `${order.items.length} producto${order.items.length === 1 ? '' : 's'}`
    }
  })

  const latestOrder = orders[0] ?? null
  const statusSteps = getOrderStatusSteps("portal")
  const latestOrderStep = latestOrder ? getStatusStepIndex(latestOrder.status) : -1
  const isLatestOrderCancelled = latestOrder?.status === "cancelled"

  const quickActions = [
    {
      title: "Nuevo Pedido",
      icon: Package,
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Realizar pedido",
      href: "/productos",
    },
    {
      title: "Programar Entrega",
      icon: Calendar,
      color: "bg-purple-600 hover:bg-purple-700",
      description: "Agendar fecha",
      href: "/carrito/finalizar",
    },
    {
      title: "Ver Catálogo",
      icon: FileText,
      color: "bg-green-600 hover:bg-green-700",
      description: "Explorar productos",
      href: "/productos",
    },
    {
      title: "Soporte",
      icon: Phone,
      color: "bg-orange-600 hover:bg-orange-700",
      description: "Contactar ayuda",
      href: "/#contacto",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-700/90"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-3">¡Bienvenido, {userProfile.displayName}!</h1>
                <p className="text-blue-100 text-lg font-medium mb-4">
                  Gestiona tus pedidos y explora nuestros productos frescos del mar
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Bell size={24} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Última conexión</p>
                  <p className="font-semibold">{currentTime.toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-blue-100">
              <div className="flex items-center space-x-2">
                <Star className="fill-current" size={16} />
                <span className="text-sm">Cliente desde {userProfile.createdAt.toLocaleDateString()}</span>
              </div>
              {userProfile.company && (
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span className="text-sm">{userProfile.company}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span className="text-sm">Activo ahora</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white/80 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                    <div className="flex items-center space-x-1">
                      <TrendingUp size={14} className="text-green-600" />
                      <p className="text-sm text-green-600 font-semibold">{stat.change}</p>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bgColor} ${stat.color} shadow-inner`}>
                    <stat.icon size={28} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <FileText size={24} className="text-blue-600" />
                  </div>
                  <span>Pedidos Recientes</span>
                </CardTitle>
                <CardDescription className="text-slate-600 font-medium">
                  Tus ultimos pedidos y su estado actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Cargando pedidos...</p>
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => router.push(`/portal/orders/${order.id}`)}
                        className="relative flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all duration-300 hover:shadow-md group cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <p className="font-bold text-slate-900 text-lg">{order.id.slice(0, 8)}</p>
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${order.statusColor}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 font-medium mb-1">{order.items}</p>
                          <p className="text-xs text-slate-500">{order.date}</p>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                          <div>
                            <p className="font-bold text-slate-900 text-lg">{order.total}</p>
                          </div>
                          <ChevronRight
                            size={20}
                            className="text-slate-400 group-hover:text-slate-600 transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">No tienes pedidos aun</p>
                    <p className="text-slate-500 text-sm">Realiza tu primer pedido para verlo aqui</p>
                  </div>
                )}
                <Button
                  className="w-full mt-6 h-12 bg-transparent border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-semibold rounded-xl transition-all duration-300"
                  variant="outline"
                  onClick={() => router.push(recentOrders.length > 0 ? "/portal/orders" : "/productos")}
                >
                  {recentOrders.length > 0 ? "Ver todos los pedidos" : "Realizar primer pedido"}
                </Button>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Activity size={24} className="text-blue-600" />
                  </div>
                  <span>Seguimiento de Pedido</span>
                </CardTitle>
                <CardDescription className="text-slate-600 font-medium">
                  Estado actual del ultimo pedido
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestOrder ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Pedido</p>
                        <p className="text-xl font-bold text-slate-900">#{latestOrder.id.slice(0, 8)}</p>
                        <p className="text-xs text-slate-500">
                          {latestOrder.createdAt.toLocaleDateString()} - {latestOrder.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge className={`text-xs font-semibold ${getOrderStatusBadgeClasses(latestOrder.status)}`}>
                        {getOrderStatusLabel(latestOrder.status)}
                      </Badge>
                    </div>
                    {isLatestOrderCancelled ? (
                      <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
                        Este pedido fue cancelado. Si necesitas asistencia comunicate con nuestro equipo comercial.
                      </div>
                    ) : (
                      <div className="relative pl-6">
                        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200"></div>
                        {statusSteps.map((step, index) => {
                          const isCompleted = latestOrderStep > index
                          const isCurrent = latestOrderStep === index
                          return (
                            <div key={step.value} className="relative pb-6 last:pb-0">
                              <div
                                className={`absolute left-[-3px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  isCompleted
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : isCurrent
                                      ? "border-blue-600 bg-white"
                                      : "border-slate-300 bg-white"
                                }`}
                              >
                                {isCompleted ? <Check size={14} /> : null}
                              </div>
                              <div className={`ml-6 ${isCompleted || isCurrent ? "text-slate-900" : "text-slate-500"}`}>
                                <p className="font-semibold text-sm">{step.label}</p>
                                <p className="text-xs mt-1">{step.description}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Productos</p>
                        <div className="space-y-2 text-sm text-slate-600">
                          {latestOrder.items.slice(0, 3).map((item) => (
                            <div key={item.productId} className="flex justify-between">
                              <span className="truncate pr-2">{item.name}</span>
                              <span className="font-medium text-slate-900">
                                {item.quantity} - {"$" + (item.price ?? 0).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          {latestOrder.items.length > 3 && (
                            <p className="text-xs text-slate-500">
                              +{latestOrder.items.length - 3} producto(s) adicionales
                            </p>
                          )}
                        </div>
                      </div>
                      {latestOrder.contact ? (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-2">Entrega</p>
                          <div className="text-sm text-slate-600 space-y-1">
                            <p className="font-medium text-slate-900">
                              {latestOrder.contact.firstName} {latestOrder.contact.lastName}
                            </p>
                            <p>{latestOrder.contact.address}</p>
                            <p>
                              {latestOrder.contact.city}, {latestOrder.contact.state} {latestOrder.contact.zipCode}
                            </p>
                            {latestOrder.contact.phone && <p>Tel: {latestOrder.contact.phone}</p>}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Aun no registramos pedidos.</p>
                    <p className="text-slate-500 text-sm">Realiza tu primer compra para ver el seguimiento aqui.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            {latestOrder ? (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-50 rounded-xl">
                      <Package size={20} className="text-emerald-600" />
                    </div>
                    <span>Resumen del Pedido</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Numero</span>
                    <span className="font-semibold text-slate-900">#{latestOrder.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha</span>
                    <span className="font-semibold text-slate-900">{latestOrder.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Estado</span>
                    <Badge className={`text-xs font-semibold ${getOrderStatusBadgeClasses(latestOrder.status)}`}>
                      {getOrderStatusLabel(latestOrder.status)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total estimado</span>
                    <span className="font-semibold text-slate-900">${latestOrder.totalAmount.toLocaleString("es-AR")}</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-100 rounded-xl">
                      <Package size={20} className="text-slate-600" />
                    </div>
                    <span>Aun sin pedidos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-3">
                  <p>No registramos pedidos en tu cuenta. Realiza una compra para ver el seguimiento aqui.</p>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => router.push("/productos")}>
                    Ver catalogo
                  </Button>
                </CardContent>
              </Card>
            )}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-xl">
                    <User size={20} className="text-purple-600" />
                  </div>
                  <span>Mi Cuenta</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-4 bg-slate-50 rounded-xl mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {userProfile.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{userProfile.displayName}</p>
                      <p className="text-sm text-slate-600">{userProfile.email}</p>
                      {userProfile.company && <p className="text-xs text-slate-500">{userProfile.company}</p>}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 hover:bg-slate-50 rounded-xl font-medium transition-all duration-200"
                >
                  <User size={18} className="mr-3" />
                  Perfil
                  <ChevronRight size={16} className="ml-auto" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 hover:bg-slate-50 rounded-xl font-medium transition-all duration-200"
                >
                  <Settings size={18} className="mr-3" />
                  Configuración
                  <ChevronRight size={16} className="ml-auto" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 hover:bg-slate-50 rounded-xl font-medium transition-all duration-200"
                >
                  <FileText size={18} className="mr-3" />
                  Facturas
                  <ChevronRight size={16} className="ml-auto" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 hover:bg-slate-50 rounded-xl font-medium transition-all duration-200"
                >
                  <Mail size={18} className="mr-3" />
                  Mensajes
                  <ChevronRight size={16} className="ml-auto" />
                </Button>
                <div className="pt-2 border-t border-slate-200">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl font-medium transition-all duration-200"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} className="mr-3" />
                    Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-50 rounded-xl">
                    <TrendingUp size={20} className="text-orange-600" />
                  </div>
                  <span>Rendimiento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-700">Pedidos completados</span>
                      <span className="font-bold text-green-600">
                        {orders.length > 0
                          ? Math.round((orders.filter((o) => o.status === "delivered").length / orders.length) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${orders.length > 0 ? (orders.filter((o) => o.status === "delivered").length / orders.length) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                  </div>
                  <div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}








