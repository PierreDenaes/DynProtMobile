import { View, Text, ActivityIndicator, StyleSheet } from "react-native"

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏋️</Text>
      <ActivityIndicator size="large" color="#2563eb" style={styles.spinner} />
      <Text style={styles.text}>Chargement...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  logo: {
    fontSize: 64,
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: "#64748b",
  },
})

export default LoadingScreen
