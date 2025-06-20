import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useColorScheme } from 'react-native'

interface SettingsContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
  language: 'fr' | 'en'
  setLanguage: (lang: 'fr' | 'en') => void
  t: (key: string) => string
}

type TranslationKeys = 
  | 'nav.dashboard'
  | 'nav.chat'
  | 'nav.profile'
  | 'profile.title'
  | 'profile.subtitle'
  | 'profile.settings'
  | 'profile.personalInfo'
  | 'profile.personalizedTips'
  | 'profile.edit'
  | 'profile.save'
  | 'profile.cancel'
  | 'profile.firstName'
  | 'profile.email'
  | 'profile.age'
  | 'profile.weight'
  | 'profile.activityLevel'
  | 'profile.mainGoal'
  | 'profile.dailyGoal'
  | 'profile.proteinsPerDay'
  | 'profile.notifications'
  | 'profile.darkMode'
  | 'profile.language'
  | 'profile.logout'
  | 'profile.tips.goal'
  | 'profile.tips.sources'
  | 'profile.tips.distribution'
  | 'dashboard.title'
  | 'dashboard.welcome'
  | 'dashboard.dailyProgress'
  | 'dashboard.weeklyProgress'
  | 'dashboard.meals'
  | 'dashboard.logMeal'
  | 'dashboard.proteinGoal'
  | 'dashboard.consumed'
  | 'dashboard.remaining'
  | 'dashboard.grams'
  | 'dashboard.day'
  | 'dashboard.week'
  | 'dashboard.month'
  | 'dashboard.breakfast'
  | 'dashboard.lunch'
  | 'dashboard.dinner'
  | 'dashboard.snack'
  | 'dashboard.proteinContent'
  | 'dashboard.days.monday'
  | 'dashboard.days.tuesday'
  | 'dashboard.days.wednesday'
  | 'dashboard.days.thursday'
  | 'dashboard.days.friday'
  | 'dashboard.days.saturday'
  | 'dashboard.days.sunday'
  | 'dashboard.resetMeals'
  | 'dashboard.status.congrats'
  | 'dashboard.status.keepGoing'
  | 'dashboard.status.goodStart'
  | 'dashboard.status.letsGo'
  | 'dashboard.noMeals.title'
  | 'dashboard.noMeals.subtitle'
  | 'dashboard.quickFacts.title'
  | 'dashboard.quickFacts.proteinPerKg'
  | 'dashboard.quickFacts.proteinPerKgValue'
  | 'dashboard.quickFacts.bestTime'
  | 'dashboard.quickFacts.bestTimeValue'
  | 'dashboard.quickFacts.maxPerMeal'
  | 'dashboard.quickFacts.maxPerMealValue'
  | 'dashboard.dailyTips.title'
  | 'dashboard.dailyTips.variety'
  | 'dashboard.dailyTips.hydration'
  | 'chat.title'
  | 'chat.placeholder'
  | 'chat.send'
  | 'chat.mute'
  | 'chat.unmute'
  | 'chat.thinking'
  | 'chat.error'
  | 'chat.welcome'
  | 'chat.suggestions.goal'
  | 'chat.suggestions.sources'
  | 'chat.suggestions.meal'
  | 'chat.suggestions.vegetarian'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.save'
  | 'common.cancel'
  | 'common.confirm'
  | 'common.delete'
  | 'common.edit'

type Translations = {
  [key in 'fr' | 'en']: {
    [K in TranslationKeys]: string
  }
}

const translations: Translations = {
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.chat': 'Assistant',
    'nav.profile': 'Profil',
    // Profile screen
    'profile.title': 'Mon Profil',
    'profile.subtitle': 'Gérez vos informations personnelles',
    'profile.settings': 'Paramètres',
    'profile.personalInfo': 'Informations personnelles',
    'profile.personalizedTips': 'Conseils personnalisés',
    'profile.edit': 'Modifier',
    'profile.save': 'Enregistrer',
    'profile.cancel': 'Annuler',
    'profile.firstName': 'Prénom',
    'profile.email': 'Email',
    'profile.age': 'Âge',
    'profile.weight': 'Poids',
    'profile.activityLevel': "Niveau d'activité",
    'profile.mainGoal': 'Objectif principal',
    'profile.dailyGoal': 'Objectif quotidien',
    'profile.proteinsPerDay': 'de protéines par jour',
    'profile.notifications': 'Notifications',
    'profile.darkMode': 'Mode sombre',
    'profile.language': 'Langue',
    'profile.logout': 'Déconnexion',
    'profile.tips.goal': 'Pour un objectif de {goal}g de protéines par jour, visez environ {perMeal}g par repas',
    'profile.tips.sources': 'Variez vos sources de protéines entre animales et végétales pour un meilleur équilibre nutritionnel',
    'profile.tips.distribution': 'Répartissez votre apport en protéines tout au long de la journée pour une meilleure absorption',
    // Dashboard screen
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bonjour {name} !',
    'dashboard.dailyProgress': 'Progression du jour',
    'dashboard.weeklyProgress': 'Progression hebdomadaire',
    'dashboard.meals': 'Mes repas',
    'dashboard.logMeal': 'Enregistrer un repas',
    'dashboard.proteinGoal': 'Objectif de protéines',
    'dashboard.consumed': 'Consommées',
    'dashboard.remaining': 'Restantes',
    'dashboard.grams': 'g',
    'dashboard.day': 'jour',
    'dashboard.week': 'semaine',
    'dashboard.month': 'mois',
    'dashboard.breakfast': 'Petit-déjeuner',
    'dashboard.lunch': 'Déjeuner',
    'dashboard.dinner': 'Dîner',
    'dashboard.snack': 'Collation',
    'dashboard.proteinContent': '{amount}g de protéines',
    'dashboard.days.monday': 'Lun',
    'dashboard.days.tuesday': 'Mar',
    'dashboard.days.wednesday': 'Mer',
    'dashboard.days.thursday': 'Jeu',
    'dashboard.days.friday': 'Ven',
    'dashboard.days.saturday': 'Sam',
    'dashboard.days.sunday': 'Dim',
    'dashboard.resetMeals': '🔄 Réinitialiser',
    'dashboard.status.congrats': '🎉 Félicitations ! Objectif atteint !',
    'dashboard.status.keepGoing': '💪 Presque là !',
    'dashboard.status.goodStart': '👍 Bon début !',
    'dashboard.status.letsGo': '🚀 C\'est parti !',
    'dashboard.noMeals.title': 'Aucun repas enregistré aujourd\'hui',
    'dashboard.noMeals.subtitle': 'Appuyez sur + pour ajouter votre premier repas',
    'dashboard.quickFacts.title': '💡 Le saviez-vous ?',
    'dashboard.quickFacts.proteinPerKg': 'Protéines par kg',
    'dashboard.quickFacts.proteinPerKgValue': '1.6-2.2g',
    'dashboard.quickFacts.bestTime': 'Meilleur moment',
    'dashboard.quickFacts.bestTimeValue': 'Après l\'effort',
    'dashboard.quickFacts.maxPerMeal': 'Par repas max',
    'dashboard.quickFacts.maxPerMealValue': '25-30g',
    'dashboard.dailyTips.title': '🎯 Conseils du jour',
    'dashboard.dailyTips.variety': 'Variez vos sources de protéines',
    'dashboard.dailyTips.hydration': 'N\'oubliez pas de vous hydrater',
    // Chat screen
    'chat.title': 'Assistant Protéines',
    'chat.placeholder': 'Posez votre question...',
    'chat.send': 'Envoyer',
    'chat.mute': 'Couper le son',
    'chat.unmute': 'Activer le son',
    'chat.thinking': 'Je réfléchis...',
    'chat.error': 'Une erreur est survenue',
    'chat.welcome': "Bonjour ! Je suis votre assistant nutritionnel spécialisé en protéines. Comment puis-je vous aider aujourd'hui ?",
    'chat.suggestions.goal': 'Quel est mon objectif de protéines ?',
    'chat.suggestions.sources': 'Quelles sont les meilleures sources de protéines ?',
    'chat.suggestions.meal': 'Que puis-je manger pour atteindre mon objectif ?',
    'chat.suggestions.vegetarian': 'Options végétariennes riches en protéines ?',
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier'
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.chat': 'Assistant',
    'nav.profile': 'Profile',
    // Profile screen
    'profile.title': 'My Profile',
    'profile.subtitle': 'Manage your personal information',
    'profile.settings': 'Settings',
    'profile.personalInfo': 'Personal Information',
    'profile.personalizedTips': 'Personalized Tips',
    'profile.edit': 'Edit',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.firstName': 'First Name',
    'profile.email': 'Email',
    'profile.age': 'Age',
    'profile.weight': 'Weight',
    'profile.activityLevel': 'Activity Level',
    'profile.mainGoal': 'Main Goal',
    'profile.dailyGoal': 'Daily Goal',
    'profile.proteinsPerDay': 'proteins per day',
    'profile.notifications': 'Notifications',
    'profile.darkMode': 'Dark Mode',
    'profile.language': 'Language',
    'profile.logout': 'Log Out',
    'profile.tips.goal': 'For a goal of {goal}g of protein per day, aim for about {perMeal}g per meal',
    'profile.tips.sources': 'Vary your protein sources between animal and plant-based for better nutritional balance',
    'profile.tips.distribution': 'Distribute your protein intake throughout the day for better absorption',
    // Dashboard screen
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Hello {name}!',
    'dashboard.dailyProgress': 'Daily Progress',
    'dashboard.weeklyProgress': 'Weekly Progress',
    'dashboard.meals': 'My Meals',
    'dashboard.logMeal': 'Log a Meal',
    'dashboard.proteinGoal': 'Protein Goal',
    'dashboard.consumed': 'Consumed',
    'dashboard.remaining': 'Remaining',
    'dashboard.grams': 'g',
    'dashboard.day': 'day',
    'dashboard.week': 'week',
    'dashboard.month': 'month',
    'dashboard.breakfast': 'Breakfast',
    'dashboard.lunch': 'Lunch',
    'dashboard.dinner': 'Dinner',
    'dashboard.snack': 'Snack',
    'dashboard.proteinContent': '{amount}g protein',
    'dashboard.days.monday': 'Mon',
    'dashboard.days.tuesday': 'Tue',
    'dashboard.days.wednesday': 'Wed',
    'dashboard.days.thursday': 'Thu',
    'dashboard.days.friday': 'Fri',
    'dashboard.days.saturday': 'Sat',
    'dashboard.days.sunday': 'Sun',
    'dashboard.resetMeals': '🔄 Reset',
    'dashboard.status.congrats': '🎉 Congratulations! Goal achieved!',
    'dashboard.status.keepGoing': '💪 Almost there!',
    'dashboard.status.goodStart': '👍 Good start!',
    'dashboard.status.letsGo': '🚀 Let\'s go!',
    'dashboard.noMeals.title': 'No meals recorded today',
    'dashboard.noMeals.subtitle': 'Tap + to add your first meal',
    'dashboard.quickFacts.title': '💡 Did you know?',
    'dashboard.quickFacts.proteinPerKg': 'Protein per kg',
    'dashboard.quickFacts.proteinPerKgValue': '1.6-2.2g',
    'dashboard.quickFacts.bestTime': 'Best time',
    'dashboard.quickFacts.bestTimeValue': 'After workout',
    'dashboard.quickFacts.maxPerMeal': 'Max per meal',
    'dashboard.quickFacts.maxPerMealValue': '25-30g',
    'dashboard.dailyTips.title': '🎯 Daily Tips',
    'dashboard.dailyTips.variety': 'Vary your protein sources',
    'dashboard.dailyTips.hydration': 'Remember to stay hydrated',
    // Chat screen
    'chat.title': 'Protein Assistant',
    'chat.placeholder': 'Ask your question...',
    'chat.send': 'Send',
    'chat.mute': 'Mute',
    'chat.unmute': 'Unmute',
    'chat.thinking': 'Thinking...',
    'chat.error': 'An error occurred',
    'chat.welcome': "Hello! I'm your nutritional assistant specialized in proteins. How can I help you today?",
    'chat.suggestions.goal': 'What is my protein goal?',
    'chat.suggestions.sources': 'What are the best protein sources?',
    'chat.suggestions.meal': 'What can I eat to reach my goal?',
    'chat.suggestions.vegetarian': 'Vegetarian high-protein options?',
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit'
  }
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')

  useEffect(() => {
    // Load saved settings
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem('darkMode')
      const savedLanguage = await AsyncStorage.getItem('language')
      
      if (savedDarkMode !== null) {
        setIsDarkMode(savedDarkMode === 'true')
      }
      
      if (savedLanguage !== null) {
        setLanguage(savedLanguage as 'fr' | 'en')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    try {
      await AsyncStorage.setItem('darkMode', newMode.toString())
    } catch (error) {
      console.error('Error saving dark mode:', error)
    }
  }

  const handleSetLanguage = async (lang: 'fr' | 'en') => {
    setLanguage(lang)
    try {
      await AsyncStorage.setItem('language', lang)
    } catch (error) {
      console.error('Error saving language:', error)
    }
  }

  const t = (key: string): string => {
    const translation = translations[language] as Record<string, string>
    return translation[key] || key
  }

  return (
    <SettingsContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      language,
      setLanguage: handleSetLanguage,
      t,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
