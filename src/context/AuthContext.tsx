"use client"

import type React from "react"
import { createContext, useReducer, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { api } from "../services/api"

interface User {
  user_id: string
  email: string
  prenom: string
  age?: number
  poids?: number
  niveau_activite?: string
  objectif_principal?: string
  daily_protein_goal?: number
  onboarding_completed: boolean
}

interface AuthState {
  user: User | null
  isOnboarded: boolean
  loading: boolean
  error: string | null
  token: string | null
}

interface AuthContextType extends AuthState {
  login: (credentials: { email: string; password: string }) => Promise<User>
  register: (userData: { email: string; password: string; prenom: string }) => Promise<User>
  registerProfile: (profileData: any) => Promise<User>
  logout: () => void
  updateUserGoal: (newGoal: number) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

const initialState: AuthState = {
  user: null,
  isOnboarded: false,
  loading: true,
  error: null,
  token: null,
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_TOKEN"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "LOGOUT" }

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isOnboarded: !!action.payload?.onboarding_completed,
        loading: false,
        error: null,
      }
    case "SET_TOKEN":
      return { ...state, token: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "LOGOUT":
      return { ...initialState, loading: false }
    default:
      return state
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    loadStoredAuth()
  }, [])

  const loadStoredAuth = async () => {
    try {
      const [savedToken, savedUser] = await Promise.all([
        AsyncStorage.getItem("dynprot_token"),
        AsyncStorage.getItem("dynprot_user"),
      ])

      if (savedToken && savedUser) {
        const user = JSON.parse(savedUser)
        dispatch({ type: "SET_USER", payload: user })
        dispatch({ type: "SET_TOKEN", payload: savedToken })
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    } catch (error) {
      console.error("Error loading stored auth:", error)
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "SET_ERROR", payload: "" })

      const response = await api.post("/auth/login", credentials)
      const { user, token } = response

      dispatch({ type: "SET_USER", payload: user })
      dispatch({ type: "SET_TOKEN", payload: token })

      await AsyncStorage.setItem("dynprot_user", JSON.stringify(user))
      await AsyncStorage.setItem("dynprot_token", token)

      return user
    } catch (error: any) {
      console.error("Login error:", error)
      const errorMessage = error.response?.data?.error || "Connexion échouée"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      throw error
    }
  }

  const register = async (userData: { email: string; password: string; prenom: string }): Promise<User> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "SET_ERROR", payload: "" })

      const response = await api.post("/auth/register", userData)
      const { user, token } = response

      dispatch({ type: "SET_USER", payload: user })
      dispatch({ type: "SET_TOKEN", payload: token })

      await AsyncStorage.setItem("dynprot_user", JSON.stringify(user))
      await AsyncStorage.setItem("dynprot_token", token)

      return user
    } catch (error: any) {
      console.error("Registration error:", error)
      const errorMessage = error.response?.data?.error || "Inscription échouée"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      throw error
    }
  }

  const registerProfile = async (profileData: any): Promise<User> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const response = await api.post("/auth/register-profile", {
        ...profileData,
        user_id: state.user?.user_id,
      })

      const updatedUser = {
        ...state.user!,
        ...response.user,
        onboarding_completed: true,
      }

      dispatch({ type: "SET_USER", payload: updatedUser })
      await AsyncStorage.setItem("dynprot_user", JSON.stringify(updatedUser))

      return updatedUser
    } catch (error: any) {
      console.error("Profile registration error:", error)
      dispatch({ type: "SET_ERROR", payload: "Configuration du profil échouée" })
      throw error
    }
  }

  const logout = async () => {
    await AsyncStorage.multiRemove(["dynprot_user", "dynprot_token"])
    dispatch({ type: "LOGOUT" })
  }

  const updateUserGoal = async (newGoal: number): Promise<void> => {
    try {
      if (!state.user?.user_id) {
        throw new Error("User ID is missing")
      }

      console.log(`Updating protein goal to ${newGoal}g for user ${state.user.user_id}`)
      
      const response = await api.put(`/users/goal/${state.user.user_id}`, {
        daily_protein_goal: newGoal,
      })

      console.log('Update goal response:', response)

      if (!response) {
        throw new Error('No response from server')
      }

      if (response.error) {
        throw new Error(response.details || response.error || 'Failed to update protein goal')
      }

      const updatedUser = { 
        ...state.user, 
        daily_protein_goal: newGoal 
      }
      
      dispatch({ type: "SET_USER", payload: updatedUser })
      await AsyncStorage.setItem("dynprot_user", JSON.stringify(updatedUser))
      console.log('Successfully updated protein goal')
    } catch (error: any) {
      console.error("Error updating protein goal:", error)
      
      // Extraire le message d'erreur de différentes façons selon la structure de l'erreur
      let errorMessage = 'Une erreur est survenue lors de la mise à jour de l\'objectif de protéines'
      
      if (error.response?.data?.details) {
        errorMessage = error.response.data.details
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      console.log('Error details:', { 
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      throw new Error(errorMessage)
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    registerProfile,
    logout,
    updateUserGoal,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
