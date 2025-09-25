import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore"

import { db } from "../firebase"

export interface NutritionalInfo {
  calories?: number
  fat?: number
  omega3?: number
  protein?: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  category: string
  stock: number
  images?: string[]
  rating?: number
  unit: string
  origin?: string
  freshness?: number
  nutritionalInfo?: NutritionalInfo
  tags?: string[]
  minOrder?: number
  maxOrder?: number
  createdAt: Date
  updatedAt: Date
  availableQuantity?: number
  reviews?: number
  storageInstructions?: string
  preparationTips?: string[]
  featured?: boolean
}

export interface Category {
  id: string
  name: string
}

export type OrderStatus = "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled"

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
}

export interface OrderContact {
  firstName: string
  lastName: string
  email: string
  phone?: string
  companyName?: string
  taxId?: string
  address: string
  city: string
  state: string
  zipCode: string
  deliveryNotes?: string
  preferredDeliveryTime?: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
  userDisplayName?: string
  totalAmount: number
  contact?: OrderContact
}

export interface ProductInput extends Omit<Product, "id" | "createdAt" | "updatedAt"> {
  createdAt?: Date
  updatedAt?: Date
}

export interface OrderInput extends Omit<Order, "id" | "createdAt" | "updatedAt"> {
  createdAt?: Date
  updatedAt?: Date
}

export interface OrderUpdate extends Partial<Omit<Order, "id" | "createdAt">> {
  updatedAt?: Date
}

const coerceDate = (value: unknown): Date | null => {
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  if (typeof value === "number") {
    const fromNumber = new Date(value)
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber
  }
  if (typeof value === "string") {
    const fromString = new Date(value)
    return Number.isNaN(fromString.getTime()) ? null : fromString
  }
  return null
}

const coerceStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const items = value.filter((item): item is string => typeof item === "string")
  return items.length > 0 ? items : undefined
}

const coerceOptionalString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined
  const result = String(value).trim()
  return result.length > 0 ? result : undefined
}

const mapProduct = (id: string, data?: DocumentData | null): Product | null => {
  if (!data) return null

  const createdAt = coerceDate(data.createdAt) ?? new Date()
  const updatedAt = coerceDate(data.updatedAt) ?? createdAt

  const nutritionalInfo = data.nutritionalInfo && typeof data.nutritionalInfo === "object"
    ? {
        calories: data.nutritionalInfo.calories !== undefined ? Number(data.nutritionalInfo.calories) : undefined,
        fat: data.nutritionalInfo.fat !== undefined ? Number(data.nutritionalInfo.fat) : undefined,
        omega3: data.nutritionalInfo.omega3 !== undefined ? Number(data.nutritionalInfo.omega3) : undefined,
        protein: data.nutritionalInfo.protein !== undefined ? Number(data.nutritionalInfo.protein) : undefined,
      }
    : undefined

  const images = coerceStringArray(data.images)
  const tags = coerceStringArray(data.tags)
  const preparationTips = coerceStringArray(data.preparationTips)

  return {
    id,
    name: data.name ?? "",
    description: data.description ?? "",
    price: Number(data.price ?? 0),
    imageUrl: data.imageUrl ?? (images?.[0] ?? undefined),
    category: data.category ?? "Sin categoria",
    stock: Number(data.stock ?? 0),
    images,
    rating: data.rating !== undefined ? Number(data.rating) : undefined,
    unit: data.unit ?? "",
    origin: data.origin ?? undefined,
    freshness: data.freshness !== undefined ? Number(data.freshness) : undefined,
    nutritionalInfo,
    tags,
    minOrder: data.minOrder !== undefined ? Number(data.minOrder) : undefined,
    maxOrder: data.maxOrder !== undefined ? Number(data.maxOrder) : undefined,
    createdAt,
    updatedAt,
    availableQuantity: data.availableQuantity !== undefined ? Number(data.availableQuantity) : undefined,
    reviews: data.reviews !== undefined ? Number(data.reviews) : undefined,
    storageInstructions: data.storageInstructions ?? undefined,
    preparationTips,
    featured: Boolean(data.featured),
  }
}

const mapOrder = (id: string, data?: DocumentData | null): Order | null => {
  if (!data) return null

  const createdAt = coerceDate(data.createdAt) ?? new Date()
  const updatedAt = coerceDate(data.updatedAt) ?? createdAt

  const items = Array.isArray(data.items)
    ? data.items
        .map((item) =>
          item && typeof item === "object"
            ? {
                productId: String(item.productId ?? ""),
                name: String(item.name ?? ""),
                quantity: Number(item.quantity ?? 0),
                price: Number(item.price ?? 0),
              }
            : null,
        )
        .filter((item): item is OrderItem => item !== null)
    : []

  const contact = (() => {
    const value = data.contact
    if (!value || typeof value !== "object") return undefined
    const details = value as Record<string, unknown>
    return {
      firstName: String(details.firstName ?? ""),
      lastName: String(details.lastName ?? ""),
      email: String(details.email ?? ""),
      phone: coerceOptionalString(details.phone),
      companyName: coerceOptionalString(details.companyName),
      taxId: coerceOptionalString(details.taxId),
      address: String(details.address ?? ""),
      city: String(details.city ?? ""),
      state: String(details.state ?? ""),
      zipCode: String(details.zipCode ?? ""),
      deliveryNotes: coerceOptionalString(details.deliveryNotes),
      preferredDeliveryTime: coerceOptionalString(details.preferredDeliveryTime),
    }
  })()

  return {
    id,
    userId: String(data.userId ?? ""),
    items,
    total: Number(data.total ?? data.totalAmount ?? 0),
    status: (data.status as OrderStatus) ?? "pending",
    createdAt,
    updatedAt,
    userDisplayName: data.userDisplayName ?? undefined,
    totalAmount: Number(data.totalAmount ?? data.total ?? 0),
    contact,
  }
}

const mapCategory = (id: string, data?: DocumentData | null): Category | null => {
  if (!data) return null

  return {
    id,
    name: data.name ?? "",
  }
}

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"))

  return onSnapshot(
    productsQuery,
    (snapshot) => {
      const products = snapshot.docs
        .map((docSnapshot) => mapProduct(docSnapshot.id, docSnapshot.data()))
        .filter((product): product is Product => product !== null)
      callback(products)
    },
    (error) => {
      console.error("Error subscribing to products:", error)
      callback([])
    },
  )
}

export const getProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(collection(db, "products"))
  return snapshot.docs
    .map((docSnapshot) => mapProduct(docSnapshot.id, docSnapshot.data()))
    .filter((product): product is Product => product !== null)
}

export const getProductById = async (id: string): Promise<Product | null> => {
  const productRef = doc(db, "products", id)
  const snapshot = await getDoc(productRef)
  if (!snapshot.exists()) return null

  return mapProduct(snapshot.id, snapshot.data())
}

export const createProduct = async (data: ProductInput): Promise<string> => {
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const docRef = await addDoc(collection(db, "products"), payload)
  return docRef.id
}

export const updateProduct = async (productId: string, data: Partial<ProductInput>) => {
  const productRef = doc(db, "products", productId)
  await updateDoc(productRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const deleteProduct = async (productId: string) => {
  await deleteDoc(doc(db, "products", productId))
}

export const subscribeToCategories = (callback: (categories: Category[]) => void) => {
  const categoriesQuery = query(collection(db, "categories"), orderBy("name", "asc"))

  return onSnapshot(
    categoriesQuery,
    (snapshot) => {
      const categories = snapshot.docs
        .map((docSnapshot) => mapCategory(docSnapshot.id, docSnapshot.data()))
        .filter((category): category is Category => category !== null)
      callback(categories)
    },
    (error) => {
      console.error("Error subscribing to categories:", error)
      callback([])
    },
  )
}

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"))

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      const orders = snapshot.docs
        .map((docSnapshot) => mapOrder(docSnapshot.id, docSnapshot.data()))
        .filter((order): order is Order => order !== null)
      callback(orders)
    },
    (error) => {
      console.error("Error subscribing to orders:", error)
      callback([])
    },
  )
}


export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map((docSnapshot) => mapOrder(docSnapshot.id, docSnapshot.data()))
    .filter((order): order is Order => order !== null)
}

export const subscribeToUserOrders = (userId: string, callback: (orders: Order[]) => void) => {
  const withOrderBy = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"))

  let unsub = onSnapshot(
    withOrderBy,
    (snapshot) => {
      const orders = snapshot.docs
        .map((docSnapshot) => mapOrder(docSnapshot.id, docSnapshot.data()))
        .filter((order): order is Order => order !== null)
      callback(orders)
    },
    (error) => {
      console.error("Error subscribing to user orders (will try fallback without orderBy):", error)
      // Fallback without orderBy to avoid composite index requirement
      try {
        unsub()
      } catch {}
      const withoutOrderBy = query(collection(db, "orders"), where("userId", "==", userId))
      unsub = onSnapshot(
        withoutOrderBy,
        (snapshot2) => {
          const orders = snapshot2.docs
            .map((docSnapshot) => mapOrder(docSnapshot.id, docSnapshot.data()))
            .filter((order): order is Order => order !== null)
          // Manually sort by createdAt desc if available
          orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          callback(orders)
        },
        (error2) => {
          console.error("Fallback user orders subscription failed:", error2)
          callback([])
        },
      )
    },
  )

  return () => unsub()
}

export const createOrder = async (data: OrderInput): Promise<string> => {
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const docRef = await addDoc(collection(db, "orders"), payload)
  return docRef.id
}

export const updateOrder = async (orderId: string, data: OrderUpdate) => {
  const orderRef = doc(db, "orders", orderId)
  await updateDoc(orderRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}
export const logSearchQuery = async (searchTerm: string, userId?: string) => {
  await addDoc(collection(db, "analytics"), {
    type: "search",
    query: searchTerm,
    userId: userId ?? null,
    timestamp: serverTimestamp(),
  })
}







