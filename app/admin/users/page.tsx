"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, UserCheck, UserX } from "lucide-react"
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { type UserProfile } from "@/contexts/AuthContext"

export default function AdminUsersPage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile?.role === "admin") {
      const q = query(collection(db, "users"))
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedUsers: UserProfile[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as UserProfile
          return {
            ...data,
            createdAt: data.createdAt, // createdAt is already a Date object
            updatedAt: data.updatedAt, // updatedAt is already a Date object
          }
        })
        setUsers(fetchedUsers)
        setLoading(false)
      })
      return () => unsubscribe()
    } else {
      setLoading(false)
    }
  }, [userProfile])

  const handleUpdateUserRole = async (uid: string, newRole: "customer" | "admin") => {
    try {
      const userRef = doc(db, "users", uid)
      await updateDoc(userRef, { role: newRole })
      // The subscription will automatically update the state
    } catch (error) {
      console.error("Error updating user role:", error)
      alert("Error al actualizar el rol del usuario.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando usuarios...
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => router.push("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
        </Button>
        <h1 className="text-4xl font-bold mb-8">Gestión de Usuarios</h1>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay usuarios para mostrar.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID de Usuario</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.uid.slice(0, 8)}</TableCell>
                      <TableCell>{user.displayName || "N/A"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role === "admin" ? "Administrador" : "Cliente"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role === "customer" ? (
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateUserRole(user.uid, "admin")}>
                            <UserCheck className="h-4 w-4 text-green-600 mr-2" />
                            Hacer Admin
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateUserRole(user.uid, "customer")}>
                            <UserX className="h-4 w-4 text-red-600 mr-2" />
                            Hacer Cliente
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
