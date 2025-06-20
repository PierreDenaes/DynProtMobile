"use client"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import Icon from "react-native-vector-icons/MaterialIcons"

import { useAuth } from "../hooks/useAuth"
import { useSettings } from "../contexts/SettingsContext"
import { getTheme } from "../utils/themes"
import LoadingScreen from "../screens/LoadingScreen"
import AuthScreen from "../screens/AuthScreen"
import OnboardingScreen from "../screens/OnboardingScreen"
import DashboardScreen from "../screens/DashboardScreen"
import ChatScreen from "../screens/ChatScreen"
import ProfileScreen from "../screens/ProfileScreen"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const MainTabs = () => {
  const { isDarkMode, t } = useSettings()
  const theme = getTheme(isDarkMode)
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = ""

          if (route.name === "Dashboard") {
            iconName = "dashboard"
          } else if (route.name === "Chat") {
            iconName = "chat"
          } else if (route.name === "Profile") {
            iconName = "person"
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: t('nav.dashboard') }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: t('nav.assistant') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('nav.profile') }} />
    </Tab.Navigator>
  )
}

const AppNavigator = () => {
  const { user, isOnboarded, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : !isOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  )
}

export default AppNavigator
