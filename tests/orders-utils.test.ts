import assert from "node:assert/strict"
import { test } from "node:test"

import type { OrderItem, OrderStatus } from "../lib/firestore"
import {
  calculateOrderTotals,
  getOrderStatusBadgeClasses,
  getOrderStatusLabel,
  getOrderStatusSteps,
  getStatusStepIndex,
} from "../lib/orders/utils"

const sampleItems: OrderItem[] = [
  { productId: "salmon", name: "Salmon", quantity: 2, price: 1800 },
  { productId: "merluza", name: "Merluza", quantity: 1, price: 950.5 },
]

test("calculateOrderTotals computes subtotal and total accurately", () => {
  const { subtotal, total } = calculateOrderTotals(sampleItems)
  assert.strictEqual(subtotal, 4550.5)
  assert.strictEqual(total, 4550.5)
})

test("calculateOrderTotals returns zeros when there are no items", () => {
  const { subtotal, total } = calculateOrderTotals([])
  assert.strictEqual(subtotal, 0)
  assert.strictEqual(total, 0)
})

test("getStatusStepIndex respects cancelled shortcut and flow order", () => {
  const activeStatuses: OrderStatus[] = ["pending", "confirmed", "preparing", "shipped", "delivered"]
  activeStatuses.forEach((status, index) => {
    assert.strictEqual(getStatusStepIndex(status), index)
  })
  assert.strictEqual(getStatusStepIndex("cancelled"), -1)
})

test("getOrderStatus helpers stay consistent across views", () => {
  const portalSteps = getOrderStatusSteps("portal")
  const adminSteps = getOrderStatusSteps("admin")

  assert.strictEqual(portalSteps.length, 5)
  assert.strictEqual(adminSteps.length, 5)

  portalSteps.forEach((step, index) => {
    const adminStep = adminSteps[index]
    assert.strictEqual(step.value, adminStep.value)
    assert.strictEqual(step.label, getOrderStatusLabel(step.value))
    assert.strictEqual(adminStep.label, getOrderStatusLabel(adminStep.value))
  })

  assert.notStrictEqual(portalSteps[0].description, adminSteps[0].description)
})

test("getOrderStatusBadgeClasses returns the expected variants", () => {
  const cancelledClasses = getOrderStatusBadgeClasses("cancelled")
  assert.ok(cancelledClasses.includes("bg-red-100"))
  assert.ok(cancelledClasses.includes("text-red-700"))
})
