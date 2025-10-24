"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Trash2 } from "lucide-react"

import type { Category, Product, ProductInput } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

const optionalNumber = (message?: string) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined
      }
      const parsed = Number(value)
      return Number.isNaN(parsed) ? value : parsed
    },
    z
      .number({
        message: message ?? "Ingresa un nmero vlido.",
      })
      .optional(),
  )

const productFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  description: z
    .string()
    .min(10, "La descripcin debe tener al menos 10 caracteres."),
  category: z.string().min(1, "Selecciona una categora."),
  price: z.coerce
    .number({ message: "Ingresa un precio vlido." })
    .nonnegative("El precio no puede ser negativo."),
  stock: z.coerce
    .number({ message: "Ingresa un stock vlido." })
    .int("El stock debe ser un nmero entero.")
    .nonnegative("El stock no puede ser negativo."),
  unit: z.string().min(1, "Ingresa la unidad."),
  origin: z.string().optional(),
  imageUrl: z
    .string()
    .url("Ingresa una URL vlida.")
    .optional()
    .or(z.literal("")),
  images: z.string().optional(),
  tags: z.string().optional(),
  minOrder: optionalNumber(),
  maxOrder: optionalNumber(),
  freshness: optionalNumber("Ingresa un valor entre 0 y 10."),
  storageInstructions: z.string().optional(),
  preparationTips: z.string().optional(),
  featured: z.boolean().default(false),
  calories: optionalNumber(),
  protein: optionalNumber(),
  fat: optionalNumber(),
  omega3: optionalNumber(),
})

export type ProductFormSchema = z.infer<typeof productFormSchema>

export type ProductFormPayload = Omit<ProductInput, "createdAt" | "updatedAt">

export interface ProductFormProps {
  mode: "create" | "edit"
  categories: Category[]
  initialProduct?: Product
  onSubmit: (payload: ProductFormPayload) => Promise<void>
  onDelete?: () => Promise<void>
  isLoadingCategories?: boolean
}

const emptyDefaults: ProductFormSchema = {
  name: "",
  description: "",
  category: "",
  price: 0,
  stock: 0,
  unit: "",
  origin: "",
  imageUrl: "",
  images: "",
  tags: "",
  minOrder: undefined,
  maxOrder: undefined,
  freshness: undefined,
  storageInstructions: "",
  preparationTips: "",
  featured: false,
  calories: undefined,
  protein: undefined,
  fat: undefined,
  omega3: undefined,
}

const parseListInput = (value?: string) => {
  if (!value) return undefined
  const items = value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
  return items.length > 0 ? items : undefined
}

const parseNumber = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return undefined
  return value
}

export default function ProductForm({
  mode,
  categories,
  initialProduct,
  onSubmit,
  onDelete,
  isLoadingCategories,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const defaultValues = useMemo<ProductFormSchema>(() => {
    if (!initialProduct) return emptyDefaults

    return {
      name: initialProduct.name,
      description: initialProduct.description,
      category: initialProduct.category,
      price: initialProduct.price,
      stock: initialProduct.stock,
      unit: initialProduct.unit,
      origin: initialProduct.origin ?? "",
      imageUrl: initialProduct.imageUrl ?? "",
      images: initialProduct.images?.join("\n") ?? "",
      tags: initialProduct.tags?.join(", ") ?? "",
      minOrder: initialProduct.minOrder,
      maxOrder: initialProduct.maxOrder,
      freshness: initialProduct.freshness,
      storageInstructions: initialProduct.storageInstructions ?? "",
      preparationTips: initialProduct.preparationTips?.join("\n") ?? "",
      featured: initialProduct.featured ?? false,
      calories: initialProduct.nutritionalInfo?.calories,
      protein: initialProduct.nutritionalInfo?.protein,
      fat: initialProduct.nutritionalInfo?.fat,
      omega3: initialProduct.nutritionalInfo?.omega3,
    }
  }, [initialProduct])

  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    mode: "onSubmit",
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const handleSubmit = async (values: ProductFormSchema) => {
    const payload: ProductFormPayload = {
      name: values.name.trim(),
      description: values.description.trim(),
      category: values.category,
      price: values.price,
      stock: values.stock,
      unit: values.unit.trim(),
      featured: values.featured,
    }

    if (values.origin?.trim()) {
      payload.origin = values.origin.trim()
    }

    if (values.imageUrl && values.imageUrl.trim()) {
      payload.imageUrl = values.imageUrl.trim()
    } else if (initialProduct?.imageUrl && !values.imageUrl?.trim()) {
      payload.imageUrl = ""
    }

    const images = parseListInput(values.images)
    if (images) {
      payload.images = images
    } else if (
      initialProduct?.images?.length &&
      !values.images?.trim()
    ) {
      payload.images = []
    }

    const tags = parseListInput(values.tags)
    if (tags) {
      payload.tags = tags
    } else if (initialProduct?.tags?.length && !values.tags?.trim()) {
      payload.tags = []
    }

    const preparationTips = parseListInput(values.preparationTips)
    if (preparationTips) {
      payload.preparationTips = preparationTips
    } else if (
      initialProduct?.preparationTips?.length &&
      !values.preparationTips?.trim()
    ) {
      payload.preparationTips = []
    }

    const nutritionalInfo = {
      calories: parseNumber(values.calories),
      protein: parseNumber(values.protein),
      fat: parseNumber(values.fat),
      omega3: parseNumber(values.omega3),
    }

    if (
      nutritionalInfo.calories !== undefined ||
      nutritionalInfo.protein !== undefined ||
      nutritionalInfo.fat !== undefined ||
      nutritionalInfo.omega3 !== undefined
    ) {
      payload.nutritionalInfo = nutritionalInfo
    }

    if (values.minOrder !== undefined) {
      payload.minOrder = values.minOrder
    }

    if (values.maxOrder !== undefined) {
      payload.maxOrder = values.maxOrder
    }

    if (values.freshness !== undefined) {
      payload.freshness = values.freshness
    }

    if (values.storageInstructions?.trim()) {
      payload.storageInstructions = values.storageInstructions.trim()
    }

    setIsSubmitting(true)
    try {
      await onSubmit(payload)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  const isBusy = isSubmitting || isDeleting

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Crear producto" : "Editar producto"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="grid gap-6"
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Salmn Patagnico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categora</FormLabel>
                    <Select
                      disabled={isLoadingCategories}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (ARS)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock disponible</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: kg, unidad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origen</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Patagonia Argentina" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripcin</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Describe el producto, usos recomendados y beneficios."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagen destacada (URL)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/imagen.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Puedes dejarlo vaco si utilizars la galera inferior.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Galera (URLs separadas por coma o enter)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="URL 1&#10;URL 2" {...field} />
                    </FormControl>
                    <FormDescription>
                      Los enlaces se almacenarn como una lista de imgenes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiquetas</FormLabel>
                    <FormControl>
                      <Input placeholder="premium, fresco, mar" {...field} />
                    </FormControl>
                    <FormDescription>
                      Separa cada etiqueta con coma o salto de lnea.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-neutral-200 p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Producto destacado</FormLabel>
                      <FormDescription>
                        Muestra el producto como destacado en el catlogo.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid gap-6 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="minOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pedido mnimo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ej: 0.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pedido mximo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ej: 5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="freshness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frescura (0-10)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid gap-6 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caloras (por unidad)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protenas (g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grasas (g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="omega3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Omega-3 (g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="storageInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrucciones de conservacin</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Ej: Mantener refrigerado entre 0C y 4C."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preparationTips"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sugerencias de preparacin</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Cada sugerencia en una lnea distinta."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {mode === "edit" && onDelete ? (
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={isBusy}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar producto
                    </>
                  )}
                </Button>
              ) : (
                <div />
              )}

              <Button type="submit" disabled={isBusy}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : mode === "create" ? (
                  "Crear producto"
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

