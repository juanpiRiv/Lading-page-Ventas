"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Building, Waves, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return;
    }

    if (passwordStrength < 3) { // Require at least "Fuerte"
      setError("La contraseña debe contener al menos 8 caracteres, una mayúscula, un número y un símbolo.")
      return;
    }

    setIsLoading(true)
    setError("") // Clear previous errors

    try {
      await signUp(formData.email, formData.password, formData.name, formData.company)
      router.push("/portal")
    } catch (error: any) {
      setError(error.message || "Error al crear la cuenta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "password") {
      let strength = 0
      if (value.length >= 8) strength++
      if (/[A-Z]/.test(value)) strength++
      if (/[0-9]/.test(value)) strength++
      if (/[^A-Za-z0-9]/.test(value)) strength++
      setPasswordStrength(strength)
    }
  }

  const getPasswordStrengthColor = (level: number) => {
    if (level === 0) return "bg-red-500";
    if (level === 1) return "bg-orange-500";
    if (level === 2) return "bg-yellow-500";
    if (level === 3) return "bg-blue-500";
    if (level === 4) return "bg-green-500";
    return "bg-slate-300";
  };

  const getPasswordStrengthText = (level: number) => {
    if (level === 0) return "Muy débil";
    if (level === 1) return "Débil";
    if (level === 2) return "Regular";
    if (level === 3) return "Fuerte";
    if (level === 4) return "Muy fuerte";
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white relative overflow-hidden pt-16">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-r from-blue-100/10 to-transparent rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-all duration-300 mb-8 group backdrop-blur-sm"
          >
            <ArrowLeft
              size={16}
              className="transition-all duration-300 group-hover:-translate-x-2 group-hover:scale-110"
            />
            <span className="font-medium">Volver al inicio</span>
          </Link>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-fade-in-up hover:shadow-3xl transition-all duration-500">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <Waves className="text-white group-hover:animate-bounce" size={28} />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
                Crear Cuenta
              </h1>
              <p className="text-slate-600 font-medium">Únete a nuestro portal de clientes</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-semibold text-sm">
                  Nombre Completo
                </Label>
                <div className="relative group">
                  <User
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "name" ? "text-blue-600 scale-110" : "text-slate-400"
                    }`}
                    size={18}
                  />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-12 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 rounded-xl bg-slate-50/50 hover:bg-white font-medium"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">
                  Correo Electrónico
                </Label>
                <div className="relative group">
                  <Mail
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "email" ? "text-blue-600 scale-110" : "text-slate-400"
                    }`}
                    size={18}
                  />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-12 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 rounded-xl bg-slate-50/50 hover:bg-white font-medium"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-slate-700 font-semibold text-sm">
                  Empresa
                </Label>
                <div className="relative group">
                  <Building
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "company" ? "text-blue-600 scale-110" : "text-slate-400"
                    }`}
                    size={18}
                  />
                  <Input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    onFocus={() => setFocusedField("company")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-12 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 rounded-xl bg-slate-50/50 hover:bg-white font-medium"
                    placeholder="Tu Empresa S.A."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">
                  Contraseña
                </Label>
                <div className="relative group">
                  <Lock
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "password" ? "text-blue-600 scale-110" : "text-slate-400"
                    }`}
                    size={18}
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-12 pr-12 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 rounded-xl bg-slate-50/50 hover:bg-white font-medium"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all duration-300 hover:scale-110"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength ? getPasswordStrengthColor(level) : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-medium text-slate-600">{getPasswordStrengthText(passwordStrength)}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold text-sm">
                  Confirmar Contraseña
                </Label>
                <div className="relative group">
                  <Lock
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "confirmPassword" ? "text-blue-600 scale-110" : "text-slate-400"
                    }`}
                    size={18}
                  />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-12 pr-12 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 rounded-xl bg-slate-50/50 hover:bg-white font-medium"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all duration-300 hover:scale-110"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <CheckCircle
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-500"
                      size={18}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-2 border-slate-300 text-blue-600 focus:ring-blue-500/20 transition-all duration-200"
                  required
                />
                <span className="text-sm text-slate-600 font-medium leading-relaxed">
                  Acepto los{" "}
                  <Link
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 hover:underline decoration-2 underline-offset-2"
                  >
                    términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 hover:underline decoration-2 underline-offset-2"
                  >
                    política de privacidad
                  </Link>
                </span>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creando cuenta...</span>
                  </div>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-600 font-medium">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 hover:underline decoration-2 underline-offset-2"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
