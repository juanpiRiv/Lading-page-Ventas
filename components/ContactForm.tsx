"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Phone, MapPin, Send, Clock, CheckCircle } from "lucide-react"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: "", email: "", phone: "", company: "", message: "" })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section id="contacto" className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 text-balance">Contactanos</h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto text-pretty leading-relaxed">
            ¿Tenés un negocio y querés trabajar con nosotros? Hablemos sobre nuestros productos y condiciones
            comerciales.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div className="flex items-start space-x-4 group">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl flex-shrink-0 group-hover:bg-blue-100 transition-colors duration-300">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Teléfono</h3>
                <p className="text-neutral-600 mb-1">+54 11 4000-0000</p>
                <p className="text-neutral-600">+54 11 4000-0001</p>
                <p className="text-sm text-neutral-500 mt-2">Lun-Vie: 8:00-18:00</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl flex-shrink-0 group-hover:bg-blue-100 transition-colors duration-300">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Email</h3>
                <p className="text-neutral-600 mb-1">ventas@pescaderiaargentina.com</p>
                <p className="text-neutral-600">info@pescaderiaargentina.com</p>
                <p className="text-sm text-neutral-500 mt-2">Respuesta en 24hs</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl flex-shrink-0 group-hover:bg-blue-100 transition-colors duration-300">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Dirección</h3>
                <p className="text-neutral-600 mb-1">Victoria, Entre Rios</p>
                <p className="text-neutral-600">Argentina</p>
                <p className="text-sm text-neutral-500 mt-2"></p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl flex-shrink-0 group-hover:bg-blue-100 transition-colors duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Horarios de Atención</h3>
                <p className="text-neutral-600 mb-1">Lunes a Viernes: 8:00 - 18:00</p>
                <p className="text-neutral-600 mb-1">Sábados: 8:00 - 14:00</p>
                <p className="text-neutral-600">Domingos: Cerrado</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-10 shadow-sm border border-neutral-100 hover:shadow-lg transition-shadow duration-300">
            {isSubmitted ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-neutral-900 mb-2">¡Mensaje Enviado!</h3>
                <p className="text-neutral-600">Te contactaremos dentro de las próximas 24 horas.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-3">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-neutral-300"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-3">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-neutral-300"
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-3">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-neutral-300"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-neutral-700 mb-3">
                      Empresa
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-neutral-300"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-3">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none hover:border-neutral-300"
                    placeholder="Contanos sobre tu negocio y qué productos te interesan..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-700 hover:bg-red-600 disabled:bg-neutral-400 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Mensaje</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
