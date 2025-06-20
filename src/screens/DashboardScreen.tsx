"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, SafeAreaView } from "react-native"
import { useAuth } from "../hooks/useAuth"
import { useSettings } from "../contexts/SettingsContext"
import { getTheme } from "../utils/themes"
import { api } from "../services/api"
import ProgressChart from "../components/ProgressChart"
import MealEntry from "../components/MealEntry"

interface Progress {
  total_proteins: number
  daily_protein_goal: number
  progress_percent: number
  prenom: string
}

interface Meal {
  id: number
  produit: string
  proteines_apportees: number
  poids_estime: number
  methode: string
  timestamp: string
  description_visuelle?: string
}

const DashboardScreen = () => {
  const { user } = useAuth()
  const { isDarkMode, t } = useSettings()
  const theme = getTheme(isDarkMode)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [weeklyProgress, setWeeklyProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [progressRes, mealsRes, weeklyRes] = await Promise.all([
        api.get(`/meals/progress/${user?.user_id}`),
        api.get(`/meals/${user?.user_id}`),
        api.get(`/meals/progress/weekly/${user?.user_id}`),
      ])

      setProgress(progressRes.progress)
      setMeals(mealsRes.meals)
      setWeeklyProgress(weeklyRes.weeklyProgress)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  const handleMealDeleted = (mealId: number) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== mealId))
    fetchDashboardData()
  }

  const handleResetMeals = async () => {
    Alert.alert(
      t('common.confirm'), 
      "Êtes-vous sûr de vouloir supprimer tous les repas d'aujourd'hui ?", 
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/meals/reset/${user?.user_id}`)
              fetchDashboardData()
              Alert.alert(t('common.success'), "Tous les repas ont été supprimés !")
            } catch (error) {
              console.error("Failed to reset meals:", error)
              Alert.alert(t('common.error'), "Erreur lors de la suppression des repas")
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={styles.logo}>🏋️</Text>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          {t('common.loading')}
        </Text>
      </View>
    )
  }

  const progressPercentage = progress ? (progress.total_proteins / progress.daily_protein_goal) * 100 : 0
  const remaining = progress ? Math.max(0, progress.daily_protein_goal - progress.total_proteins) : 0

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.text }]}>
            {t('dashboard.welcome').replace('{name}', user?.prenom || '')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('dashboard.title')}
          </Text>
        </View>

        {/* Progress Overview */}
        <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.text }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {t('dashboard.dailyProgress')}
            </Text>
            <View style={styles.cardHeaderRight}>
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                {new Date().toLocaleDateString("fr-FR")}
              </Text>
              {meals.length > 0 && (
                <TouchableOpacity onPress={handleResetMeals} style={styles.resetButton}>
                  <Text style={styles.resetButtonText}>{t('dashboard.resetMeals')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.blueCard]}>
              <Text style={[styles.statValue, { color: "#3b82f6" }]}>
                {progress?.daily_protein_goal || 0}{t('dashboard.grams')}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t('dashboard.proteinGoal')}
              </Text>
            </View>
            <View style={[styles.statCard, styles.greenCard]}>
              <Text style={[styles.statValue, { color: "#10b981" }]}>
                {progress?.total_proteins || 0}{t('dashboard.grams')}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t('dashboard.consumed')}
              </Text>
            </View>
            <View style={[styles.statCard, styles.purpleCard]}>
              <Text style={[styles.statValue, { color: "#8b5cf6" }]}>
                {remaining}{t('dashboard.grams')}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t('dashboard.remaining')}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                {t('dashboard.proteinGoal')}
              </Text>
              <Text style={[styles.progressPercent, { color: theme.textSecondary }]}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            <View style={[styles.progressBarContainer, { backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(progressPercentage, 100)}%`,
                    backgroundColor: progressPercentage >= 100 ? "#10b981" : "#3b82f6",
                  },
                ]}
              />
            </View>
          </View>

          {/* Status Message */}
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                {
                  color: progressPercentage >= 100 ? "#10b981" : theme.text,
                },
              ]}
            >
              {progressPercentage >= 100
                ? t('dashboard.status.congrats')
                : progressPercentage >= 75
                ? t('dashboard.status.keepGoing')
                : progressPercentage >= 50
                ? t('dashboard.status.goodStart')
                : t('dashboard.status.letsGo')}
            </Text>
          </View>
        </View>

        {/* Meals Section */}
        <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.text }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {t('dashboard.meals')}
          </Text>
          {meals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {t('dashboard.noMeals.title')}
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                {t('dashboard.noMeals.subtitle')}
              </Text>
            </View>
          ) : (
            <View style={styles.mealsList}>
              {meals.map((meal) => (
                <MealEntry key={meal.id} meal={meal} onDelete={handleMealDeleted} />
              ))}
            </View>
          )}
        </View>

        {/* Weekly Progress */}
        <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.text }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {t('dashboard.weeklyProgress')}
          </Text>
          <ProgressChart data={weeklyProgress} theme={{
            card: theme.surface,
            text: theme.text,
            primary: theme.primary,
            border: theme.border,
            textMuted: theme.textSecondary
          }} />
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsGrid}>
          <View style={[styles.card, { flex: 1, marginRight: 8, backgroundColor: theme.surface, shadowColor: theme.text }]}>
            <Text style={[styles.cardTitle, { color: theme.text, fontSize: 18 }]}>
              {t('dashboard.quickFacts.title')}
            </Text>
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  {t('dashboard.quickFacts.proteinPerKg')}
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {t('dashboard.quickFacts.proteinPerKgValue')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  {t('dashboard.quickFacts.bestTime')}
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {t('dashboard.quickFacts.bestTimeValue')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  {t('dashboard.quickFacts.maxPerMeal')}
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {t('dashboard.quickFacts.maxPerMealValue')}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { flex: 1, marginLeft: 8, backgroundColor: theme.surface, shadowColor: theme.text }]}>
            <Text style={[styles.cardTitle, { color: theme.text, fontSize: 18 }]}>
              {t('dashboard.dailyTips.title')}
            </Text>
            <View style={styles.tipsList}>
              <View style={styles.tipRow}>
                <Text style={styles.tipIcon}>🥚</Text>
                <Text style={[styles.tipText, { color: theme.text }]}>
                  {t('dashboard.dailyTips.variety')}
                </Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipIcon}>💧</Text>
                <Text style={[styles.tipText, { color: theme.text }]}>
                  {t('dashboard.dailyTips.hydration')}
                </Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipIcon}>⏰</Text>
                <Text style={[styles.tipText, { color: theme.text }]}>
                  {t('profile.tips.distribution')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 14,
    marginRight: 12,
  },
  resetButton: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  blueCard: {
    backgroundColor: "#eff6ff",
  },
  greenCard: {
    backgroundColor: "#f0fdf4",
  },
  purpleCard: {
    backgroundColor: "#faf5ff",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressPercent: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
  },
  statusContainer: {
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  emptySubtext: {
    fontSize: 14,
  },
  mealsList: {
    marginTop: 12,
  },
  quickStatsGrid: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 20,
  },
  infoList: {
    marginTop: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  tipsList: {
    marginTop: 12,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
})

export default DashboardScreen
