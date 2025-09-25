"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationSystemProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

const NotificationItem = ({
  notification,
  onRemove,
}: { notification: Notification; onRemove: (id: string) => void }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    if (notification.duration) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onRemove(notification.id), 300)
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.duration, onRemove])

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="text-green-600" size={20} />
      case "error":
        return <AlertCircle className="text-red-600" size={20} />
      case "warning":
        return <AlertTriangle className="text-yellow-600" size={20} />
      case "info":
        return <Info className="text-blue-600" size={20} />
    }
  }

  const getStyles = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className={`rounded-lg border p-4 shadow-sm ${getStyles()}`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            {notification.action && (
              <Button
                onClick={notification.action.onClick}
                variant="outline"
                size="sm"
                className="mt-2 h-8 text-xs bg-transparent"
              >
                {notification.action.label}
              </Button>
            )}
          </div>
          <Button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onRemove(notification.id), 300)
            }}
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 opacity-60 hover:opacity-100"
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onRemove={onRemove} />
      ))}
    </div>
  )
}

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications((prev) => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const showSuccess = (title: string, message: string, duration = 5000) => {
    addNotification({ type: "success", title, message, duration })
  }

  const showError = (title: string, message: string, duration = 7000) => {
    addNotification({ type: "error", title, message, duration })
  }

  const showInfo = (title: string, message: string, duration = 5000) => {
    addNotification({ type: "info", title, message, duration })
  }

  const showWarning = (title: string, message: string, duration = 6000) => {
    addNotification({ type: "warning", title, message, duration })
  }

  return {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }
}
