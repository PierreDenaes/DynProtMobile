import type React from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { LineChart } from "react-native-chart-kit"

interface ProgressData {
  date: string
  total_proteins: number
  daily_protein_goal: number
  progress_percent: number
}

interface ProgressChartProps {
  data: ProgressData[]
  theme: {
    card: string
    text: string
    primary: string
    border: string
    textMuted: string
  }
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data = [] }) => {
  const screenWidth = Dimensions.get("window").width

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyText}>Pas encore de données pour cette semaine</Text>
      </View>
    )
  }

  // Process data for the last 7 days
  const last7Days = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    const dayData = data.find((d) => d.date === dateStr) || {
      date: dateStr,
      total_proteins: 0,
      daily_protein_goal: data[0]?.daily_protein_goal || 100,
      progress_percent: 0,
    }

    last7Days.push({
      ...dayData,
      dayName: date.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 2),
      dayNumber: date.getDate(),
    })
  }

  const chartData = {
    labels: last7Days.map((d) => `${d.dayNumber}`),
    datasets: [
      {
        data: last7Days.map((d) => d.total_proteins),
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: last7Days.map((d) => d.daily_protein_goal),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2,
        withDots: false,
      },
    ],
    legend: ["Consommé", "Objectif"],
  }

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#2563eb",
    },
    propsForLabels: {
      fontSize: 12,
    },
  }

  // Calculate stats
  const averageDaily = Math.round(last7Days.reduce((sum, day) => sum + day.total_proteins, 0) / 7)
  const goalsAchieved = last7Days.filter((day) => day.progress_percent >= 100).length
  const averageProgress = Math.round(last7Days.reduce((sum, day) => sum + day.progress_percent, 0) / 7)

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={screenWidth - 64}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        yAxisSuffix="g"
        segments={4}
      />

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{averageDaily}g</Text>
          <Text style={styles.statLabel}>Moyenne/jour</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{goalsAchieved}/7</Text>
          <Text style={styles.statLabel}>Objectifs atteints</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{averageProgress}%</Text>
          <Text style={styles.statLabel}>Progression moyenne</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
})

export default ProgressChart
