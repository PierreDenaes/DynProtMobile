import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  SafeAreaView,
} from "react-native"
import { useAuth } from "../hooks/useAuth"
import { useSettings } from "../contexts/SettingsContext"
import Icon from "react-native-vector-icons/MaterialIcons"
import { getTheme } from "../utils/themes"

const ProfileScreen: React.FC = () => {
  const { user, logout, updateUserGoal } = useAuth()
  const { isDarkMode, toggleDarkMode, language, setLanguage, t } = useSettings()
  const theme = getTheme(isDarkMode)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.prenom || "",
    weight: user?.poids?.toString() || "",
    activityLevel: user?.niveau_activite || "",
    objective: user?.objectif_principal || "",
    dailyProteinGoal: user?.daily_protein_goal?.toString() || "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.prenom || "",
        weight: user.poids?.toString() || "",
        activityLevel: user.niveau_activite || "",
        objective: user.objectif_principal || "",
        dailyProteinGoal: user.daily_protein_goal?.toString() || "",
      })
    }
  }, [user])

  const handleSave = async () => {
    try {
      // For now, we can only update the protein goal through the API
      const newGoal = parseFloat(formData.dailyProteinGoal)
      if (!isNaN(newGoal) && newGoal > 0) {
        await updateUserGoal(newGoal)
      }
      setIsEditing(false)
      Alert.alert("Succès", "Objectif mis à jour avec succès")
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil")
    }
  }

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('profile.cancel'), style: "cancel" },
        { text: t('profile.logout'), onPress: () => logout() },
      ]
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.headerBackground,
      paddingVertical: 20,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 5,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    content: {
      flex: 1,
    },
    section: {
      backgroundColor: theme.surface,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 15,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    infoLabel: {
      fontSize: 16,
      color: theme.textSecondary,
      flex: 1,
    },
    infoValue: {
      fontSize: 16,
      color: theme.text,
      fontWeight: "500",
      flex: 2,
      textAlign: "right",
    },
    input: {
      fontSize: 16,
      color: theme.text,
      fontWeight: "500",
      flex: 2,
      textAlign: "right",
      borderBottomWidth: 1,
      borderBottomColor: theme.primary,
      paddingVertical: 5,
    },
    editButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 20,
    },
    button: {
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 25,
      flexDirection: "row",
      alignItems: "center",
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
    cancelButton: {
      backgroundColor: theme.border,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 5,
    },
    editButton: {
      position: "absolute",
      top: 20,
      right: 20,
      backgroundColor: theme.primary,
      padding: 10,
      borderRadius: 20,
    },
    tipItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 15,
    },
    tipIcon: {
      fontSize: 20,
      marginRight: 10,
      marginTop: 2,
    },
    tipText: {
      flex: 1,
      fontSize: 15,
      color: theme.textSecondary,
      lineHeight: 22,
    },
    settingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    settingLabel: {
      fontSize: 16,
      color: theme.text,
    },
    logoutButton: {
      backgroundColor: theme.danger,
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 30,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: "center",
    },
    logoutButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    languageContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    languageButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      marginLeft: 8,
    },
    languageButtonActive: {
      backgroundColor: theme.primary,
    },
    languageButtonInactive: {
      backgroundColor: theme.border,
    },
    languageButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "500",
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('profile.subtitle')}</Text>
        {!isEditing && (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Icon name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.firstName')}</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                editable={false} // Can't edit name through API yet
              />
            ) : (
              <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
                {user?.prenom || "-"}
              </Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.email')}</Text>
            <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
              {user?.email || "-"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.age')}</Text>
            <Text style={styles.infoValue}>{user?.age || "-"} ans</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.weight')}</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.weight}
                onChangeText={(text) => setFormData({ ...formData, weight: text })}
                keyboardType="numeric"
                editable={false} // Can't edit weight through API yet
              />
            ) : (
              <Text style={styles.infoValue}>{user?.poids || "-"} kg</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.activityLevel')}</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.activityLevel}
                onChangeText={(text) => setFormData({ ...formData, activityLevel: text })}
                editable={false} // Can't edit activity level through API yet
              />
            ) : (
              <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
                {user?.niveau_activite || "-"}
              </Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.mainGoal')}</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.objective}
                onChangeText={(text) => setFormData({ ...formData, objective: text })}
                editable={false} // Can't edit objective through API yet
              />
            ) : (
              <Text style={styles.infoValue} numberOfLines={2} ellipsizeMode="tail">
                {user?.objectif_principal || "-"}
              </Text>
            )}
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>{t('profile.dailyGoal')}</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.dailyProteinGoal}
                onChangeText={(text) => setFormData({ ...formData, dailyProteinGoal: text })}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.infoValue}>
                {user?.daily_protein_goal || "-"} g {t('profile.proteinsPerDay')}
              </Text>
            )}
          </View>

          {isEditing && (
            <View style={styles.editButtonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Icon name="close" size={20} color="#666" />
                <Text style={[styles.buttonText, { color: "#666" }]}>{t('profile.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Icon name="check" size={20} color="#fff" />
                <Text style={styles.buttonText}>{t('profile.save')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Personalized Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.personalizedTips')}</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              Pour un objectif de {user?.daily_protein_goal || 100}g de protéines par jour,
              visez environ {Math.round((user?.daily_protein_goal || 100) / 3)}g par repas
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🥗</Text>
            <Text style={styles.tipText}>
              Variez vos sources de protéines entre animales et végétales pour un meilleur équilibre
              nutritionnel
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>⏰</Text>
            <Text style={styles.tipText}>
              Répartissez votre apport en protéines tout au long de la journée pour une meilleure
              absorption
            </Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('profile.notifications')}</Text>
            <Switch value={true} />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('profile.darkMode')}</Text>
            <Switch 
              value={isDarkMode} 
              onValueChange={toggleDarkMode}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.settingLabel}>{t('profile.language')}</Text>
            <View style={styles.languageContainer}>
              <TouchableOpacity 
                style={[
                  styles.languageButton, 
                  language === 'fr' ? styles.languageButtonActive : styles.languageButtonInactive
                ]}
                onPress={() => setLanguage('fr')}
              >
                <Text style={styles.languageButtonText}>FR</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.languageButton, 
                  language === 'en' ? styles.languageButtonActive : styles.languageButtonInactive
                ]}
                onPress={() => setLanguage('en')}
              >
                <Text style={styles.languageButtonText}>EN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen
