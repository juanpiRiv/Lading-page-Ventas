"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export interface UserProfile { // Export UserProfile
  uid: string
  email: string
  displayName: string
  company?: string
  phone?: string
  address?: string
  role: "customer" | "admin"
  createdAt: Date
  updatedAt?: Date // Add updatedAt to the interface
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string, company?: string) => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user ? user.uid : "null"); // Log auth state change
      setUser(user)

      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserProfile({
            ...data,
            createdAt: data.createdAt.toDate(), // Convert Firestore Timestamp to Date object
            updatedAt: data.updatedAt ? data.updatedAt.toDate() : undefined, // Convert updatedAt if it exists
          } as UserProfile);
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Error signing in:", error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  const signUp = async (email: string, password: string, displayName: string, company?: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)

      await updateProfile(user, { displayName })

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName,
        company,
        role: "customer",
        createdAt: new Date(),
        updatedAt: new Date(), // Set updatedAt on creation
      }

      await setDoc(doc(db, "users", user.uid), userProfile)
      setUserProfile(userProfile)
    } catch (error: any) {
      console.error("Error signing up:", error);
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  const logout = async () => {
    try {
      console.log("Attempting to log out..."); // Log logout attempt
      await signOut(auth)
      setUser(null) // Explicitly clear user state
      setUserProfile(null) // Explicitly clear userProfile state
      console.log("Logout successful. User state cleared."); // Log successful logout
    } catch (error: any) {
      console.error("Error logging out:", error);
      throw new Error("Error al cerrar sesión. Por favor, inténtalo de nuevo.");
    }
  }

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return

    const updatedProfile = { ...userProfile, ...data }
    await setDoc(doc(db, "users", user.uid), updatedProfile, { merge: true })
    setUserProfile(updatedProfile as UserProfile)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper function to get user-friendly Firebase error messages
const getFirebaseErrorMessage = (error: any): string => {
  switch (error.code) {
    case "auth/invalid-email":
      return "El formato del correo electrónico es inválido."
    case "auth/user-disabled":
      return "El usuario ha sido deshabilitado."
    case "auth/user-not-found":
      return "No se encontró ningún usuario con este correo electrónico."
    case "auth/wrong-password":
      return "La contraseña es incorrecta."
    case "auth/email-already-in-use":
      return "El correo electrónico ya está en uso."
    case "auth/operation-not-allowed":
      return "La operación no está permitida."
    case "auth/weak-password":
      return "La contraseña es demasiado débil."
    default:
      return "Ocurrió un error inesperado. Por favor, inténtalo de nuevo."
  }
}
