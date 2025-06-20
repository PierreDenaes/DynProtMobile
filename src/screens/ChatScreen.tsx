"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native"
import { launchImageLibrary, type ImagePickerResponse, type ImageLibraryOptions } from "react-native-image-picker"
import Voice from "@react-native-voice/voice"
import { useChat } from "../hooks/useChat"
import { useAuth } from "../hooks/useAuth"
import { useSettings } from "../contexts/SettingsContext"
import { getTheme } from "../utils/themes"

const ChatScreen = () => {
  const { user } = useAuth()
  const { isDarkMode, t } = useSettings()
  const theme = getTheme(isDarkMode)
  const { messages, loading, sendMessage, refreshHistory, speak, stopSpeaking } = useChat()
  const [inputMessage, setInputMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    // Initialize Voice
    Voice.onSpeechStart = onSpeechStart
    Voice.onSpeechEnd = onSpeechEnd
    Voice.onSpeechResults = onSpeechResults
    Voice.onSpeechError = onSpeechError



    return () => {
      Voice.destroy().then(Voice.removeAllListeners)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (voiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.sender_type === "ai") {
        speak(lastMessage.message_content)
      }
    } else if (!voiceEnabled) {
      // Stop any ongoing speech when voice is disabled
      stopSpeaking()
    }
  }, [messages, voiceEnabled])

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  const onSpeechStart = () => {
    setIsListening(true)
  }

  const onSpeechEnd = () => {
    setIsListening(false)
  }

  const onSpeechResults = (e: any) => {
    if (e.value && e.value[0]) {
      setInputMessage(e.value[0])
      // Auto-submit after speech recognition
      setTimeout(() => {
        if (e.value[0].trim()) {
          handleSendMessage()
        }
      }, 500)
    }
  }

  const onSpeechError = (e: any) => {
    console.error("Speech recognition error:", e)
    setIsListening(false)
  }

  const toggleListening = async () => {
    if (isListening) {
      await Voice.stop()
    } else {
      try {
        await Voice.start("fr-FR")
      } catch (error) {
        console.error("Error starting voice recognition:", error)
        Alert.alert(t('common.error'), "Impossible de démarrer la reconnaissance vocale")
      }
    }
  }

  const toggleVoice = () => {
    const newVoiceEnabled = !voiceEnabled
    setVoiceEnabled(newVoiceEnabled)
    // Stop any ongoing speech if disabling voice
    if (!newVoiceEnabled) {
      stopSpeaking()
    }
  }

  const handleImagePicker = () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return
      }

      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0])
      }
    })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;

    // The FormData creation is now handled inside the useChat hook.
    // We just pass the raw values.
    await sendMessage(inputMessage, selectedImage);

    setInputMessage('');
    setSelectedImage(null);
  };

  const quickSuggestions = ["Où j'en suis ?", "J'ai mangé du poulet", "Nouvel objectif 150g", "Conseils protéines"]

  const handleQuickSuggestion = (suggestion: string) => {
    setInputMessage(suggestion)
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {t('chat.title')}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={refreshHistory} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>🔄</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleVoice} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>{voiceEnabled ? "🔊" : "🔇"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeIcon}>💬</Text>
              <Text style={[styles.welcomeTitle, { color: theme.text }]}>
                {t('chat.welcomeTitle')}
              </Text>
              <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
                {t('chat.welcomeText')}
              </Text>

              <View style={styles.featuresGrid}>
                <View style={[styles.featureCard, { backgroundColor: isDarkMode ? theme.surface : '#f8fafc' }]}>
                  <Text style={styles.featureIcon}>📸</Text>
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    Photo repas
                  </Text>
                </View>
                <View style={[styles.featureCard, { backgroundColor: isDarkMode ? theme.surface : '#f8fafc' }]}>
                  <Text style={styles.featureIcon}>🍽️</Text>
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    Scan aliments
                  </Text>
                </View>
                <View style={[styles.featureCard, { backgroundColor: isDarkMode ? theme.surface : '#f8fafc' }]}>
                  <Text style={styles.featureIcon}>📊</Text>
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    Suivi objectifs
                  </Text>
                </View>
                <View style={[styles.featureCard, { backgroundColor: isDarkMode ? theme.surface : '#f8fafc' }]}>
                  <Text style={styles.featureIcon}>💡</Text>
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    Conseils perso
                  </Text>
                </View>
              </View>

              <Text style={[styles.voiceHint, { color: theme.textSecondary }]}>
                💡 Astuce : Utilisez le micro pour dicter vos messages
              </Text>
            </View>
          ) : (
            <>
              {messages.map((message, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageContainer,
                    message.sender_type === "user" ? styles.userMessage : styles.aiMessage,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      message.sender_type === "user" 
                        ? [styles.userBubble, { backgroundColor: theme.primary }] 
                        : [styles.aiBubble, { backgroundColor: isDarkMode ? theme.surface : '#f3f4f6' }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.sender_type === "user" 
                          ? styles.userText 
                          : [styles.aiText, { color: theme.text }],
                      ]}
                    >
                      {message.message_content}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        { color: message.sender_type === "user" ? "#ffffff" : theme.textSecondary },
                      ]}
                    >
                      {new Date(message.timestamp).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              ))}

              {loading && (
                <View style={[styles.messageContainer, styles.aiMessage]}>
                  <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: isDarkMode ? theme.surface : '#f3f4f6' }]}>
                    <View style={styles.typingIndicator}>
                      <View style={[styles.typingDot, styles.typingDot1, { backgroundColor: theme.textSecondary }]} />
                      <View style={[styles.typingDot, styles.typingDot2, { backgroundColor: theme.textSecondary }]} />
                      <View style={[styles.typingDot, styles.typingDot3, { backgroundColor: theme.textSecondary }]} />
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Quick Suggestions */}
        {messages.length === 0 && (
          <View style={[styles.suggestionsContainer, { borderTopColor: theme.border }]}>
            <Text style={[styles.suggestionsTitle, { color: theme.textSecondary }]}>
              {t('chat.suggestions')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsList}>
              {quickSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleQuickSuggestion(suggestion)}
                  style={[styles.suggestionButton, { backgroundColor: isDarkMode ? theme.surface : '#f3f4f6' }]}
                >
                  <Text style={[styles.suggestionText, { color: theme.text }]}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Image Preview */}
        {selectedImage && (
          <View style={[styles.imagePreview, { borderTopColor: theme.border }]}>
            <View style={[styles.imagePreviewContent, { backgroundColor: isDarkMode ? theme.surface : '#dbeafe' }]}>
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
              <Text style={[styles.imagePreviewText, { color: theme.text }]}>
                {t('chat.imageReady')}
              </Text>
              <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeImageButton}>
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Voice Indicator */}
        {isListening && (
          <View style={[styles.voiceIndicator, { borderTopColor: theme.border }]}>
            <View style={[styles.voiceIndicatorContent, { backgroundColor: isDarkMode ? '#4c1d1d' : '#fef2f2' }]}>
              <View style={styles.recordingDot} />
              <Text style={styles.voiceIndicatorText}>
                {t('chat.listening')}
              </Text>
            </View>
          </View>
        )}

        {/* Input Container */}
        <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TouchableOpacity onPress={handleImagePicker} style={[styles.inputButton, { backgroundColor: isDarkMode ? theme.background : '#f3f4f6' }]}>
            <Text style={styles.inputButtonText}>📷</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleListening}
            style={[
              styles.inputButton,
              { backgroundColor: isDarkMode ? theme.background : '#f3f4f6' },
              isListening && styles.listeningButton,
            ]}
          >
            <Text style={styles.inputButtonText}>🎤</Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.textInput, { 
              backgroundColor: theme.background, 
              borderColor: theme.border,
              color: theme.text
            }]}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={theme.textSecondary}
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
          />

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() && !selectedImage}
            style={[
              styles.sendButton,
              { backgroundColor: theme.primary },
              (!inputMessage.trim() && !selectedImage) && [styles.sendButtonDisabled, { backgroundColor: theme.border }],
            ]}
          >
            <Text style={styles.sendButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerButtonText: {
    fontSize: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  voiceToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  voiceEnabled: {
    backgroundColor: "#dbeafe",
  },
  voiceDisabled: {
    backgroundColor: "#fef2f2",
  },
  voiceIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  voiceText: {
    fontSize: 12,
    fontWeight: "500",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 48,
  },
  welcomeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
  featureCard: {
    borderRadius: 8,
    padding: 12,
    margin: 4,
    alignItems: "center",
    width: 120,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    textAlign: "center",
  },
  voiceHint: {
    fontSize: 14,
    textAlign: "center",
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  aiMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: "#2563eb",
  },
  aiBubble: {
    backgroundColor: "#f3f4f6",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: "#ffffff",
  },
  aiText: {
    color: "#1f2937",
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  typingDot1: {
    // Animation would be added here
  },
  typingDot2: {
    // Animation would be added here
  },
  typingDot3: {
    // Animation would be added here
  },
  suggestionsContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  suggestionsTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  suggestionsList: {
    flexDirection: "row",
  },
  suggestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
  },
  imagePreview: {
    padding: 16,
    borderTopWidth: 1,
  },
  imagePreviewContent: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  imagePreviewText: {
    flex: 1,
    fontSize: 14,
  },
  removeImageButton: {
    padding: 4,
  },
  removeImageText: {
    color: "#dc2626",
    fontSize: 16,
  },
  voiceIndicator: {
    padding: 16,
    borderTopWidth: 1,
  },
  voiceIndicatorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#dc2626",
    marginRight: 8,
    // Animation would be added here
  },
  voiceIndicatorText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
  },
  inputButton: {
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
  },
  listeningButton: {
    backgroundColor: "#fef2f2",
  },
  inputButtonText: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    padding: 12,
    borderRadius: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 18,
  },
})

export default ChatScreen
