"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextStyle,
  ViewStyle,
  TextInputProps,
  StyleProp,
} from "react-native"
import { useAuth } from "../hooks/useAuth"

const AuthScreen = () => {
  const { login, register, loading, error } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    prenom: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email requis"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide"
    }

    if (!formData.password) {
      newErrors.password = "Mot de passe requis"
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
    }

    if (!isLogin) {
      if (!formData.prenom.trim()) {
        newErrors.prenom = "Prénom requis"
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
      }
    }

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        })
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          prenom: formData.prenom,
        })
      }
    } catch (error) {
      console.error("Auth error:", error)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      prenom: "",
    })
    setFormErrors({})
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏋️</Text>
          <Text style={styles.title}>{isLogin ? "Connexion" : "Inscription"}</Text>
          <Text style={styles.subtitle}>
            {isLogin ? "Connectez-vous à votre compte DynProt" : "Créez votre compte DynProt"}
          </Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={[
                  styles.input,
                  formErrors.prenom && styles.inputError
                ] as StyleProp<TextStyle>}
                value={formData.prenom}
                onChangeText={(value) => handleChange("prenom", value)}
                placeholder="Votre prénom"
                autoCapitalize="words"
              />
              {formErrors.prenom ? <Text style={styles.fieldError}>{formErrors.prenom}</Text> : null}
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[
                styles.input,
                formErrors.email && styles.inputError
              ] as StyleProp<TextStyle>}
              value={formData.email}
              onChangeText={(value) => handleChange("email", value)}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {formErrors.email ? <Text style={styles.fieldError}>{formErrors.email}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe *</Text>
            <TextInput
              style={[
                styles.input,
                formErrors.password && styles.inputError
              ] as StyleProp<TextStyle>}
              value={formData.password}
              onChangeText={(value) => handleChange("password", value)}
              placeholder="••••••••"
              secureTextEntry
            />
            {formErrors.password ? <Text style={styles.fieldError}>{formErrors.password}</Text> : null}
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmer le mot de passe *</Text>
              <TextInput
                style={[
                  styles.input,
                  formErrors.confirmPassword && styles.inputError
                ] as StyleProp<TextStyle>}
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange("confirmPassword", value)}
                placeholder="••••••••"
                secureTextEntry
              />
              {formErrors.confirmPassword ? <Text style={styles.fieldError}>{formErrors.confirmPassword}</Text> : null}
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? (isLogin ? "Connexion..." : "Inscription...") : isLogin ? "🔐 Se connecter" : "🚀 S'inscrire"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
          <Text style={styles.toggleButtonText}>
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>En continuant, vous acceptez nos conditions d'utilisation</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  inputError: {
    borderColor: "#dc2626",
  },
  fieldError: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  toggleButton: {
    alignItems: "center",
    marginBottom: 16,
  },
  toggleButtonText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "500",
  },
  disclaimer: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
})

export default AuthScreen
