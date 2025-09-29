import { type OrderItem, type OrderStatus } from "@/lib/firestore"

const ORDER_STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "preparing", "shipped", "delivered"]

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  shipped: "En transito",
  delivered: "Entregado",
  cancelled: "Cancelado",
}

const ORDER_STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-gray-100 text-gray-700",
  confirmed: "bg-purple-100 text-purple-700",
  preparing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

type ViewKey = "portal" | "admin"

type DescriptionRecord = Record<OrderStatus, string>

const DEFAULT_DESCRIPTIONS: DescriptionRecord = {
  pending: "Recibimos tu pedido y estamos verificando los productos.",
  confirmed: "Confirmamos la disponibilidad de cada item.",
  preparing: "Estamos preparando tu pedido para el despacho.",
  shipped: "Tu pedido esta en camino a tu direccion.",
  delivered: "Tu pedido fue entregado.",
  cancelled: "El pedido fue cancelado.",
}

const VIEW_DESCRIPTIONS: Record<ViewKey, DescriptionRecord> = {
  portal: DEFAULT_DESCRIPTIONS,
  admin: {
    pending: "Pedido recibido, a la espera de confirmacion.",
    confirmed: "Disponibilidad confirmada por el equipo.",
    preparing: "Seleccionando y acondicionando los productos.",
    shipped: "Pedido despachado hacia el cliente.",
    delivered: "Pedido entregado al cliente.",
    cancelled: "El pedido fue cancelado.",
  },
}

export interface OrderStatusStep {
  value: OrderStatus
  label: string
  description: string
}

export const getOrderStatusLabel = (status: OrderStatus): string => {
  return ORDER_STATUS_LABELS[status] ?? ORDER_STATUS_LABELS.pending
}

export const getOrderStatusBadgeClasses = (status: OrderStatus): string => {
  return ORDER_STATUS_BADGE_CLASSES[status] ?? ORDER_STATUS_BADGE_CLASSES.pending
}

export const getStatusStepIndex = (status: OrderStatus): number => {
  if (status === "cancelled") return -1
  return ORDER_STATUS_FLOW.indexOf(status)
}

export const getOrderStatusSteps = (view: ViewKey = "portal"): OrderStatusStep[] => {
  const descriptions = VIEW_DESCRIPTIONS[view] ?? DEFAULT_DESCRIPTIONS
  return ORDER_STATUS_FLOW.map((value) => ({
    value,
    label: getOrderStatusLabel(value),
    description: descriptions[value],
  }))
}

export const calculateOrderTotals = (items: OrderItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return { subtotal, total: subtotal }
}
