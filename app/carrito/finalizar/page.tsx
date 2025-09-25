"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, User, MapPin, Building, FileText, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import {
  subscribeToProducts,
  createOrder,
  type Product,
  type OrderItem,
  type OrderInput,
  type OrderContact,
} from "@/lib/firestore"
import { useAuth } from "@/contexts/AuthContext"

type CartState = Record<string, number>

const STORAGE_KEY = "cart"

interface CheckoutFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string
  taxId: string
  address: string
  city: string
  state: string
  zipCode: string
  deliveryNotes: string
  preferredDeliveryTime: string
}

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

const clearCartStorage = () => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn("Unable to clear cart storage:", error)
  }
}

const getProductImage = (product: Product): string => {
  if (product.imageUrl && product.imageUrl.length > 0) return product.imageUrl
  if (Array.isArray(product.images) && product.images.length > 0) return product.images[0]!
  return "/placeholder.svg"
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, userProfile } = useAuth()

  const [cart, setCart] = useState<CartState>({})
  const [products, setProducts] = useState<Product[]>([])
  const [loadingCart, setLoadingCart] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    taxId: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    deliveryNotes: "",
    preferredDeliveryTime: "",
  })

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

  useEffect(() => {
    if (!userProfile) return

    const [profileFirstName, ...profileLastParts] = userProfile.displayName?.split(" ") ?? [""]
    const profileLastName = profileLastParts.join(" ")

    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || profileFirstName || "",
      lastName: prev.lastName || profileLastName || "",
      email: prev.email || userProfile.email || "",
      phone: prev.phone || userProfile.phone || "",
      companyName: prev.companyName || userProfile.company || "",
      address: prev.address || userProfile.address || "",
    }))
  }, [userProfile])

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = products.find((item) => item.id === productId)
        if (!product) return null
        return { product, quantity }
      })
      .filter((entry): entry is { product: Product; quantity: number } => entry !== null)
  }, [cart, products])

  const missingProductIds = useMemo(() => {
    return Object.keys(cart).filter((productId) => !products.some((product) => product.id === productId))
  }, [cart, products])

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (cartItems.length === 0) {
      alert("Tu carrito esta vacio. Agrega productos antes de enviar el pedido.")
      return
    }

    setIsSubmitting(true)

    try {
      const orderItems: OrderItem[] = cartItems.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        quantity,
        price: product.price ?? 0,
      }))

      const computedTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const fallbackName = `${formData.firstName} ${formData.lastName}`.trim() || "Cliente"

      const contactDetails: OrderContact = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        ...(formData.phone ? { phone: formData.phone } : {}),
        ...(formData.companyName ? { companyName: formData.companyName } : {}),
        ...(formData.taxId ? { taxId: formData.taxId } : {}),
        ...(formData.deliveryNotes ? { deliveryNotes: formData.deliveryNotes } : {}),
        ...(formData.preferredDeliveryTime ? { preferredDeliveryTime: formData.preferredDeliveryTime } : {}),
      }

      const orderPayload: OrderInput = {
        userId: user?.uid ?? "guest",
        items: orderItems,
        total: computedTotal,
        totalAmount: computedTotal,
        status: "pending",
        userDisplayName: userProfile?.displayName || fallbackName,
        contact: contactDetails,
      }

      const orderId = await createOrder(orderPayload)

      clearCartStorage()
      setCart({})

      alert(`Pedido enviado exitosamente. Tu numero de pedido es ${orderId}.`)
      router.push("/")
    } catch (error) {
      console.error("Error creating order:", error)
      alert("No pudimos generar tu pedido. Por favor, intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingCart || loadingProducts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-neutral-200 rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Package size={48} className="text-neutral-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">No hay productos en tu carrito</h2>
            <p className="text-neutral-600 mb-6">Agrega algunos productos antes de finalizar tu pedido.</p>
            <Link href="/productos">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Ver Productos</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
              <Link href="/carrito" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700">
                <ArrowLeft size={16} />
                Volver al Carrito
              </Link>
              <span>•</span>
              <span>Revisa y envia tu pedido</span>
            </div>
            <h1 className="text-4xl font-bold text-neutral-900">Finalizar Pedido</h1>
            <p className="text-neutral-500 mt-2">
              Completa tus datos para que nuestro equipo comercial se comunique contigo.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Productos en el pedido</p>
            <p className="text-2xl font-semibold text-neutral-900">{totalItems}</p>
          </div>
        </div>

        {missingProductIds.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-6">
            Algunos productos ya no estan disponibles y fueron removidos del pedido.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Datos Personales */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">Datos Personales</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Nombre *</label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Apellido *</label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Correo Electronico *</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Telefono de Contacto *</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Datos de Empresa (Opcional) */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 animate-fade-in-up animation-delay-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building size={20} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">Datos de Empresa (Opcional)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Nombre de la Empresa</label>
                    <Input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">CUIT/CUIL</label>
                    <Input
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Direccion de Entrega */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 animate-fade-in-up animation-delay-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPin size={20} className="text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">Direccion de Entrega</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Direccion *</label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Ciudad *</label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Provincia *</label>
                      <Input
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Codigo Postal *</label>
                      <Input
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informacion Adicional */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 animate-fade-in-up animation-delay-400">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">Informacion Adicional</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Horario Preferido de Entrega
                    </label>
                    <Input
                      name="preferredDeliveryTime"
                      value={formData.preferredDeliveryTime}
                      onChange={handleInputChange}
                      placeholder="Ej: Mananas de 9 a 12hs"
                      className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Notas de Entrega</label>
                    <Textarea
                      name="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={handleInputChange}
                      placeholder="Instrucciones especiales, referencias del domicilio, etc."
                      rows={3}
                      className="border-neutral-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sticky top-24 animate-fade-in-up animation-delay-500">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Resumen del Pedido</h3>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-3 p-3 bg-neutral-50 rounded-lg">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-neutral-500">{product.category}</p>
                        <p className="text-sm font-medium text-blue-600">
                          {quantity} {product.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-100 pt-4 mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-600">Total productos:</span>
                    <span className="font-medium text-neutral-900">{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-600">Productos unicos:</span>
                    <span className="font-medium text-neutral-900">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-neutral-600">Monto estimado:</span>
                    <span className="font-medium text-neutral-900">
                      ${totalAmount.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-2">
                    Los precios se gestionan directamente con nuestro equipo comercial.
                  </p>
                  <p className="text-xs text-neutral-500">
                    Recibiras una cotizacion personalizada en las proximas horas.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-neutral-400"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Enviar Pedido
                    </>
                  )}
                </Button>

                <p className="text-xs text-neutral-500 text-center mt-3">
                  Al enviar tu pedido, aceptas nuestros terminos y condiciones.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
