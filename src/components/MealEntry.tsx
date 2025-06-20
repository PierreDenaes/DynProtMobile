"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { api } from "../services/api"

interface Meal {
  id: number
  produit: string
  proteines_apportees: number
  poids_estime: number
  methode: string
  timestamp: string
  description_visuelle?: string
  source?: string
}

interface MealEntryProps {
  meal: Meal
  onDelete: (mealId: number) => void
  theme: {
    surface: string
    text: string
    textSecondary: string
    primary: string
    border: string
    danger: string
  }
}

const MealEntry: React.FC<MealEntryProps> = ({ meal, onDelete, theme }) => {
  const styles = getStyles(theme);
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    Alert.alert("Supprimer le repas", "Êtes-vous sûr de vouloir supprimer ce repas ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true)
            await api.delete(`/meals/${meal.id}`)
            onDelete(meal.id)
          } catch (error) {
            console.error("Failed to delete meal:", error)
            Alert.alert("Erreur", "Erreur lors de la suppression du repas")
          } finally {
            setDeleting(false)
          }
        },
      },
    ])
  }

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMethodIcon = (method?: string): string => {
    switch (method?.toLowerCase()) {
      case "analyse d'image":
        return "📷"
      case "analyse textuelle":
        return "📝"
      default:
        return "🍽️"
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.methodIcon}>{getMethodIcon(meal.methode)}</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">{meal.produit}</Text>
            <Text style={styles.timestamp}>{formatTime(meal.timestamp)}</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleDelete} 
          disabled={deleting} 
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={theme.danger} />
          ) : (
            <Text style={styles.deleteIcon}>🗑️</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.nutritionInfo}>
          <View style={styles.nutritionItem}>
            <Text style={styles.proteinValue}>
              {meal.proteines_apportees || 0}g
            </Text>
            <Text style={styles.nutritionLabel}>
              de protéines
            </Text>
          </View>

          {meal.poids_estime && (
            <View style={styles.nutritionItem}>
              <Text style={styles.weightValue}>
                {meal.poids_estime}g
              </Text>
              <Text style={styles.nutritionLabel}>
                poids estimé
              </Text>
            </View>
          )}
        </View>

        <View style={styles.methodInfo}>
          <Text style={styles.methodLabel}>Méthode :</Text>
          <Text style={styles.methodValue} numberOfLines={1} ellipsizeMode="tail">
            {meal.methode}
          </Text>

          {meal.source && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.sourceValue} numberOfLines={1} ellipsizeMode="tail">
                {meal.source}
              </Text>
            </>
          )}
        </View>

        {meal.description_visuelle && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText} numberOfLines={3}>
              {meal.description_visuelle}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow || '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#6b7280",
  },
  deleteButton: {
    padding: 4,
    borderRadius: 4,
  },
  deleteIcon: {
    fontSize: 16,
  },
  content: {
    marginTop: 8,
  },
  nutritionInfo: {
    flexDirection: "row",
    marginBottom: 8,
  },
  nutritionItem: {
    marginRight: 24,
  },
  proteinValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
  },
  weightValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  methodInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  methodLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginRight: 4,
  },
  methodValue: {
    fontSize: 12,
    color: "#374151",
  },
  separator: {
    fontSize: 12,
    color: "#d1d5db",
    marginHorizontal: 8,
  },
  sourceValue: {
    fontSize: 12,
    color: theme.text,
  },
  descriptionContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: theme.background,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
  },
  descriptionText: {
    fontSize: 13,
    color: theme.text,
    lineHeight: 18,
  },
})

export default MealEntry
