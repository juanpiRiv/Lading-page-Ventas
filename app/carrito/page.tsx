"use client"

import { useEffect, useMemo, useState } from "react"
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Package, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { subscribeToProducts, type Product } from "@/lib/firestore"

type CartState = Record<string, number>

const STORAGE_KEY = "cart"

const loadCartFromStorage = (): CartState => {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartState) : {}
  } catch (error) {
    console.warn("Unable to parse cart from storage:", error)
    return {}
  }
}

const persistCart = (nextCart: CartState) => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCart))
  } catch (error) {
    console.warn("Unable to persist cart to storage:", error)
  }
}

const getProductImage = (product: Product): string => {
  if (product.imageUrl && product.imageUrl.length > 0) return product.imageUrl
  if (Array.isArray(product.images) && product.images.length > 0) return product.images[0]!
  return "/placeholder.svg"
}

const formatFreshness = (product: Product): string => {
  if (typeof product.freshness === "number") return product.freshness.toString()
  if (typeof product.freshness === "string") return product.freshness
  return "N/A"
}

export default function CartPage() {
  const [cart, setCart] = useState<CartState>({})
  const [products, setProducts] = useState<Product[]>([])
  const [loadingCart, setLoadingCart] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    setCart(loadCartFromStorage())
    setLoadingCart(false)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToProducts((fetchedProducts) => {
      setProducts(fetchedProducts)
      setLoadingProducts(false)
    })

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [])

  const updateCart = (nextCart: CartState) => {
    setCart(nextCart)
    persistCart(nextCart)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      const { [productId]: _removed, ...rest } = cart
      updateCart(rest)
      return
    }

    updateCart({
      ...cart,
      [productId]: quantity,
    })
  }

  const removeItem = (productId: string) => {
    const { [productId]: _removed, ...rest } = cart
    updateCart(rest)
  }

  const clearCart = () => {
    updateCart({})
  }

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = products.find((item) => item.id === productId)
        if (!product) return null
        return { product, quantity }
      })
      .filter((entry): entry is { product: Product; quantity: number } => entry !== null)
  }, [cart, products])

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loadingCart || loadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando carrito...
      </div>
    )
  }

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 mt-6">
            <h1 className="text-4xl font-bold text-neutral-900">Tu Carrito</h1>
            <p className="text-neutral-500 mt-2">
              {totalItems} producto{totalItems === 1 ? "" : "s"} seleccionado{totalItems === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <ShoppingCart className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Tu carrito esta vacio</h2>
            <p className="text-neutral-500 mb-6">
              Agrega productos desde el catalogo para comenzar un nuevo pedido.
            </p>
            <Link href="/productos">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Ver Productos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(({ product, quantity }, index) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-neutral-500 mb-2">{product.category}</p>

                      <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3">
                        {product.origin ? (
                          <div className="flex items-center gap-1">
                            <Package size={12} />
                            <span>{product.origin}</span>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-1">
                          <Scale size={12} />
                          <span>{product.unit || "unidad"}</span>
                        </div>
                        <span className="text-green-600 font-medium">
                          Frescura: {formatFreshness(product)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-8 h-8 p-0"
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="font-medium text-neutral-900 min-w-[3rem] text-center">
                            {quantity} {product.unit}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-8 h-8 p-0"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeItem(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                >
                  <Trash2 size={16} className="mr-2" />
                  Vaciar Carrito
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sticky top-24 animate-fade-in-up animation-delay-300">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Resumen del Pedido</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Total de productos:</span>
                    <span className="font-medium text-neutral-900">{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Productos unicos:</span>
                    <span className="font-medium text-neutral-900">{cartItems.length}</span>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4 mb-6">
                  <p className="text-sm text-neutral-600 mb-2">
                    Los precios se gestionan directamente con nuestro equipo comercial.
                  </p>
                  <p className="text-xs text-neutral-500">
                    Recibiras una cotizacion personalizada basada en tu pedido.
                  </p>
                </div>

                <Link href="/carrito/finalizar" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Finalizar Pedido
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>

                <Link href="/productos" className="block mt-3">
                  <Button variant="outline" className="w-full bg-transparent">
                    Seguir Comprando
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
