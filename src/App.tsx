import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "react-native"
import { AuthProvider } from "./context/AuthContext"
import { AppProvider } from "./context/AppContext"
import { SettingsProvider, useSettings } from "./contexts/SettingsContext"
import AppNavigator from "./navigation/AppNavigator"

const AppContent = () => {
  const { isDarkMode } = useSettings()
  
  return (
    <NavigationContainer>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? "#0f172a" : "#ffffff"} 
      />
      <AppNavigator />
    </NavigationContainer>
  )
}

const App = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </SettingsProvider>
  )
}

export default App
