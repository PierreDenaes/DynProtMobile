"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextStyle,
  ViewStyle,
  StyleProp,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { useAuth } from "../hooks/useAuth"

const ACTIVITY_LEVELS = [
  { value: "Sédentaire", label: "Sédentaire (peu ou pas d'exercice)" },
  { value: "Légèrement actif", label: "Légèrement actif (exercice léger 1-3 jours/semaine)" },
  { value: "Modérément actif", label: "Modérément actif (exercice modéré 3-5 jours/semaine)" },
  { value: "Très actif", label: "Très actif (exercice intense 6-7 jours/semaine)" },
  { value: "Extrêmement actif", label: "Extrêmement actif (exercice très intense, travail physique)" },
]

const MAIN_OBJECTIVES = [
  { value: "Maintenir mon poids actuel", label: "Maintenir mon poids actuel" },
  { value: "Perdre du poids / Définition musculaire", label: "Perdre du poids / Définition musculaire" },
  { value: "Prendre de la masse musculaire", label: "Prendre de la masse musculaire" },
  { value: "Améliorer mes performances sportives", label: "Améliorer mes performances sportives" },
]

const OnboardingScreen = () => {
  const { registerProfile } = useAuth()
  const [formData, setFormData] = useState({
    prenom: "",
    age: "",
    poids: "",
    niveau_activite: "",
    objectif_principal: "",
    daily_protein_goal: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.prenom.trim()) newErrors.prenom = "Prénom requis"
    if (!formData.age || Number.parseInt(formData.age) < 1 || Number.parseInt(formData.age) > 120) {
      newErrors.age = "Âge valide requis"
    }
    if (!formData.poids || Number.parseFloat(formData.poids) < 1 || Number.parseFloat(formData.poids) > 500) {
      newErrors.poids = "Poids valide requis"
    }
    if (!formData.niveau_activite) newErrors.niveau_activite = "Niveau d'activité requis"
    if (!formData.objectif_principal) newErrors.objectif_principal = "Objectif principal requis"
    if (
      !formData.daily_protein_goal ||
      Number.parseInt(formData.daily_protein_goal) < 1 ||
      Number.parseInt(formData.daily_protein_goal) > 500
    ) {
      newErrors.daily_protein_goal = "Objectif protéines valide requis"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      await registerProfile({
        ...formData,
        age: Number.parseInt(formData.age),
        poids: Number.parseFloat(formData.poids),
        daily_protein_goal: Number.parseInt(formData.daily_protein_goal),
      })
    } catch (error) {
      console.error("Profile registration failed:", error)
      setErrors({ general: "Erreur lors de la configuration du profil. Veuillez réessayer." })
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏋️</Text>
          <Text style={styles.title}>Bienvenue sur DynProt</Text>
          <Text style={styles.subtitle}>
            Configurons votre profil nutritionnel pour optimiser votre apport en protéines
          </Text>
        </View>

        <View style={styles.form}>
          {errors.general ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.prenom && styles.inputError
                ] as StyleProp<TextStyle>}
                value={formData.prenom}
                onChangeText={(value) => handleChange("prenom", value)}
                placeholder="Votre prénom"
                autoCapitalize="words"
              />
              {errors.prenom ? <Text style={styles.fieldError}>{errors.prenom}</Text> : null}
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Âge *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.age && styles.inputError
                ] as StyleProp<TextStyle>}
                value={formData.age}
                onChangeText={(value) => handleChange("age", value)}
                placeholder="Votre âge"
                keyboardType="numeric"
              />
              {errors.age ? <Text style={styles.fieldError}>{errors.age}</Text> : null}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Poids actuel (kg) *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.poids && styles.inputError
                ] as StyleProp<TextStyle>}
                value={formData.poids}
                onChangeText={(value) => handleChange("poids", value)}
                placeholder="Votre poids"
                keyboardType="decimal-pad"
              />
              {errors.poids ? <Text style={styles.fieldError}>{errors.poids}</Text> : null}
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Objectif protéines (g) *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.daily_protein_goal && styles.inputError
                ] as StyleProp<TextStyle>}
                value={formData.daily_protein_goal}
                onChangeText={(value) => handleChange("daily_protein_goal", value)}
                placeholder="Ex: 120"
                keyboardType="numeric"
              />
              {errors.daily_protein_goal ? <Text style={styles.fieldError}>{errors.daily_protein_goal}</Text> : null}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Niveau d'activité *</Text>
            <View style={[
              styles.pickerContainer,
              errors.niveau_activite ? styles.inputError : {}
            ] as StyleProp<ViewStyle>}>
              <Picker
                selectedValue={formData.niveau_activite}
                onValueChange={(value) => handleChange("niveau_activite", value)}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionnez votre niveau" value="" />
                {ACTIVITY_LEVELS.map((level) => (
                  <Picker.Item key={level.value} label={level.label} value={level.value} />
                ))}
              </Picker>
            </View>
            {errors.niveau_activite ? <Text style={styles.fieldError}>{errors.niveau_activite}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Objectif principal *</Text>
            <View style={[
              styles.pickerContainer,
              errors.objectif_principal && styles.inputError
            ] as StyleProp<ViewStyle>}>
              <Picker
                selectedValue={formData.objectif_principal}
                onValueChange={(value) => handleChange("objectif_principal", value)}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionnez votre objectif" value="" />
                {MAIN_OBJECTIVES.map((obj) => (
                  <Picker.Item key={obj.value} label={obj.label} value={obj.value} />
                ))}
              </Picker>
            </View>
            {errors.objectif_principal ? <Text style={styles.fieldError}>{errors.objectif_principal}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Configuration en cours..." : "🚀 Commencer mon suivi DynProt"}
            </Text>
          </TouchableOpacity>
        </View>

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
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
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
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 20,
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    width: "48%",
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  picker: {
    height: 50,
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
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
})

export default OnboardingScreen
