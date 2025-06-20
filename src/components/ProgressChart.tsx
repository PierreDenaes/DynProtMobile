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

const ProgressChart: React.FC<ProgressChartProps> = ({ data = [], theme }) => {
  const styles = getStyles(theme);
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
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${theme.text === '#000000' ? '0, 0, 0' : '255, 255, 255'}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${theme.text === '#000000' ? '0, 0, 0' : '255, 255, 255'}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.primary,
    },
    propsForLabels: {
      fontSize: 12,
      fill: theme.text,
    },
    propsForVerticalLabels: {
      fill: theme.text,
    },
    propsForHorizontalLabels: {
      fill: theme.text,
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
        withOuterLines={false}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        yAxisSuffix="g"
        segments={4}
        fromZero
        formatYLabel={(value) => `${Math.round(Number(value))}`}
        xLabelsOffset={-10}
        yLabelsOffset={5}
        withShadow={false}
        withDots={true}
        withVerticalLines={false}
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

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    color: theme.textMuted,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
  },
});

export default ProgressChart
