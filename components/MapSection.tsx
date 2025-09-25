import Image from "next/image"
import { MapPin, Truck, Clock, Thermometer, Shield, Users } from "lucide-react"

export default function MapSection() {
  const fleetVehicles = [
    {
      type: "Camiones Chasis",
      icon: <Truck className="w-8 h-8" />,
      count: "12 Unidades",
      capacity: "8-15 Toneladas",
      features: ["Carrocería isotérmica", "Sistema de refrigeración", "GPS tracking"],
      description: "Ideales para entregas urbanas y distribución regional",
    },
    {
      type: "Balancines",
      icon: <Shield className="w-8 h-8" />,
      count: "8 Unidades",
      capacity: "20-25 Toneladas",
      features: ["Doble eje trasero", "Suspensión neumática", "Carga especializada"],
      description: "Para transporte de grandes volúmenes con máxima estabilidad",
    },
    {
      type: "Tractores + Semis Térmicos",
      icon: <Thermometer className="w-8 h-8" />,
      count: "15 Unidades",
      capacity: "30-40 Toneladas",
      features: ["Control de temperatura -18°C", "Monitoreo 24/7", "Certificación HACCP"],
      description: "Transporte de larga distancia con cadena de frío garantizada",
    },
  ]

  const distributionStats = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Cobertura Nacional",
      description: "23 provincias argentinas cubiertas",
      stat: "100%",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Tiempo de Entrega",
      description: "Promedio de entrega nacional",
      stat: "24-48h",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Conductores Certificados",
      description: "Personal especializado en transporte de alimentos",
      stat: "35+",
    },
  ]

  return (
    <section id="distribucion" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 text-balance">
            Nuestra Flota de Distribución
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto text-pretty leading-relaxed">
            Contamos con una flota especializada de vehículos refrigerados para garantizar la cadena de frío y la
            frescura de nuestros productos en todo el territorio nacional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {fleetVehicles.map((vehicle, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-neutral-100 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-blue-50 text-blue-600 p-4 rounded-xl w-fit mb-6 group-hover:bg-blue-100 transition-colors duration-300">
                {vehicle.icon}
              </div>

              <h3 className="text-xl font-bold text-neutral-900 mb-3">{vehicle.type}</h3>

              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {vehicle.count}
                </span>
                <span className="text-sm font-medium text-neutral-600">{vehicle.capacity}</span>
              </div>

              <p className="text-neutral-600 mb-6 text-sm leading-relaxed">{vehicle.description}</p>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Características:</h4>
                {vehicle.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-sm text-neutral-600">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in-up">
            <h3 className="text-3xl font-bold text-neutral-900 mb-8">Estadísticas de Distribución</h3>

            <div className="space-y-6">
              {distributionStats.map((stat, index) => (
                <div key={index} className="flex items-center space-x-6 group">
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl flex-shrink-0 group-hover:bg-red-100 transition-colors duration-300">
                    {stat.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-semibold text-neutral-900">{stat.title}</h4>
                      <span className="text-2xl font-bold text-red-600">{stat.stat}</span>
                    </div>
                    <p className="text-neutral-600 text-sm">{stat.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-red-50 rounded-2xl border border-neutral-100">
              <h4 className="text-lg font-semibold text-neutral-900 mb-3">Certificaciones y Garantías</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  SENASA Certificado
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  HACCP Implementado
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  ISO 22000
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Trazabilidad 100%
                </div>
              </div>
            </div>

            <button className="mt-8 bg-red-700 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
              Solicitar Cotización de Envío
            </button>
          </div>

          <div className="relative animate-scale-in">
            <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-lg border border-neutral-100">
              <Image
                src="/argentina-map-with-distribution-routes--logistics-.jpg"
                alt="Mapa de distribución Argentina con rutas de flota"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>

              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="text-sm font-semibold text-neutral-900 mb-2">Flota Activa</div>
                <div className="text-2xl font-bold text-blue-600">35</div>
                <div className="text-xs text-neutral-600">Vehículos en ruta</div>
              </div>

              <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="text-sm font-semibold text-neutral-900 mb-2">Temperatura</div>
                <div className="text-2xl font-bold text-red-600">-18°C</div>
                <div className="text-xs text-neutral-600">Promedio de flota</div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-red-600 rounded-full opacity-10 blur-2xl animate-pulse"></div>
            <div
              className="absolute -top-6 -left-6 w-24 h-24 bg-blue-600 rounded-full opacity-10 blur-xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  )
}
