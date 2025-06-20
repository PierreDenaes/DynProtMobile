"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, SafeAreaView, useWindowDimensions } from "react-native"
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
  const { t, isDarkMode } = useSettings()
  const theme = getTheme(isDarkMode)
  const { width } = useWindowDimensions()
  const isLargeScreen = width > 500
  const styles = getStyles(theme, isDarkMode)

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
                <MealEntry 
                  key={meal.id} 
                  meal={meal} 
                  onDelete={handleMealDeleted} 
                  theme={theme}
                />
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
        <View style={[styles.quickStatsGrid, isLargeScreen && styles.quickStatsGridRow]}>
          <View style={[styles.quickStatsCard, isLargeScreen && styles.quickStatsCardHalf]}>
            <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.text }]}>
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
          </View>

          <View style={[styles.quickStatsCard, isLargeScreen && styles.quickStatsCardHalf]}>
            <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.text }]}>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any, isDarkMode: boolean) => {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      fontSize: 48,
      marginBottom: 16,
      color: theme.primary,
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    header: {
      marginBottom: 24,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      flexWrap: 'wrap',
      gap: 8,
    },
    cardHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    resetButton: {
      backgroundColor: theme.surfaceVariant,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    resetButtonText: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    dateText: {
      color: theme.textSecondary,
      marginRight: 8,
      fontSize: 14,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    blueCard: {
      backgroundColor: theme.primaryLight,
    },
    greenCard: {
      backgroundColor: theme.successLight,
    },
    purpleCard: {
      backgroundColor: theme.secondaryLight,
    },
    statCardText: {
      color: isDarkMode ? theme.text : theme.text,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 4,
      color: isDarkMode ? theme.background : theme.text,
    },
    statLabel: {
      fontSize: 12,
      color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : theme.textSecondary,
    },

    progressContainer: {
      marginBottom: 24,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 14,
      color: theme.text,
    },
    progressPercent: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: '600',
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: theme.surfaceVariant,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: 4,
    },
    statusContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginTop: 16,
      width: '100%',
      flexWrap: 'wrap',
    },
    statusText: {
      // Ancien style conservé pour compatibilité
      fontSize: 14,
      color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : theme.textSecondary,
      fontWeight: '500',
      textAlign: 'center',
    },
    progressInfoText: {
      fontSize: 12,
      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : theme.textSecondary,
      marginTop: 4,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
      color: theme.textSecondary,
    },
    emptyText: {
      fontSize: 16,
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    mealsList: {
      marginTop: 12,
    },
    quickStatsGrid: {
      flexDirection: 'column',
      marginBottom: 16,
      gap: 12,
    },
    quickStatsGridRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    quickStatsCard: {
      width: '100%',
    },
    quickStatsCardHalf: {
      width: '48%',
    },
    infoList: {
      marginTop: 8,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      flex: 1,
      marginRight: 8,
    },
    infoValue: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
      textAlign: 'right',
      maxWidth: '60%',
    },
    tipsList: {
      marginTop: 8,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    tipIcon: {
      marginRight: 8,
      marginTop: 2,
    },
    tipText: {
      fontSize: 14,
      color: theme.text,
      flex: 1,
      lineHeight: 20,
    },
  });
};

export default DashboardScreen;
