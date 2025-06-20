"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"

interface AppState {
  notifications: Array<{ id: number; message: string; type: string }>
  settings: {
    theme: string
    notifications: boolean
    language: string
  }
}

interface AppContextType extends AppState {
  addNotification: (notification: { message: string; type: string }) => void
  removeNotification: (id: number) => void
  updateSettings: (newSettings: Partial<AppState["settings"]>) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const initialState: AppState = {
  notifications: [],
  settings: {
    theme: "light",
    notifications: true,
    language: "fr",
  },
}

type AppAction =
  | { type: "ADD_NOTIFICATION"; payload: { id: number; message: string; type: string } }
  | { type: "REMOVE_NOTIFICATION"; payload: number }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppState["settings"]> }

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      }
    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      }
    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      }
    default:
      return state
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const addNotification = (notification: { message: string; type: string }) => {
    const id = Date.now()
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: { ...notification, id },
    })

    setTimeout(() => {
      dispatch({ type: "REMOVE_NOTIFICATION", payload: id })
    }, 5000)
  }

  const removeNotification = (id: number) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id })
  }

  const updateSettings = (newSettings: Partial<AppState["settings"]>) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: newSettings })
  }

  const value: AppContextType = {
    ...state,
    addNotification,
    removeNotification,
    updateSettings,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
