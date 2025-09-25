"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<"customer" | "admin">
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
      // Redirect to a default page or show an access denied message
      router.push("/portal") // Redirect non-admin to portal
      return
    }
  }, [user, userProfile, loading, router, allowedRoles])

  if (loading || !user || (allowedRoles && !userProfile) || (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    )
  }

  return <>{children}</>
}
