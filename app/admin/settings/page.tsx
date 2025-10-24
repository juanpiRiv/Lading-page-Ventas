"use client"

import { Settings } from "lucide-react"

import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-neutral-100 py-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">
              Configuracion
            </h1>
            <p className="text-neutral-600">
              Ajustes generales del portal de administracion.
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Pendiente de configuracion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-neutral-600">
              <p>
                Aun no definimos los parametros de configuracion global. Aqui
                podras administrarlos en el futuro:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Horarios de operacion y mensajes de contacto.</li>
                <li>Reglas de inventario y limites de compra.</li>
                <li>Preferencias de notificaciones y automatizaciones.</li>
              </ul>
              <Button disabled className="cursor-not-allowed">
                Proximamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
