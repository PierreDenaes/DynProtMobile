"use client"

import { useState, useEffect, useCallback } from "react"
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import { useAuth } from "./useAuth"
import { api } from "../services/api"

interface Message {
  message_content: string
  sender_type: "user" | "ai"
  timestamp: string
  metadata?: any
}

export const useChat = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [currentSound, setCurrentSound] = useState<Sound | null>(null)

  // Enable audio playback in silent mode
  Sound.setCategory('Playback');

  const stopSpeaking = useCallback(() => {
    if (currentSound) {
      currentSound.stop(() => {
        currentSound.release();
      });
      setCurrentSound(null);
    }
  }, [currentSound]);

  const speak = useCallback(async (text: string) => {
    if (!text) return;
    
    // Stop any existing sound before playing new one
    stopSpeaking();
    
    try {
      const response = await api.post('/chat/speech', { text });
      if (response.success && response.audioContent) {
        // Create a temporary file path
        const path = `${RNFS.DocumentDirectoryPath}/temp_audio_${Date.now()}.mp3`;
        
        // Write the Base64 audio to a file
        await RNFS.writeFile(path, response.audioContent, 'base64');
        
        // Load and play the sound from the file
        const sound = new Sound(path, '', (error) => {
          if (error) {
            console.log('Failed to load the sound', error);
            // Clean up the temporary file
            RNFS.unlink(path).catch(() => {});
            return;
          }
          
          // Store the sound instance
          setCurrentSound(sound);
          
          // Play the sound
          sound.play((success) => {
            if (success) {
              console.log('Successfully finished playing');
            } else {
              console.log('Playback failed due to audio decoding errors');
            }
            // Release the audio player resource and delete the temp file
            sound.release();
            setCurrentSound(null);
            RNFS.unlink(path).catch(() => {});
          });
        });
      }
    } catch (error) {
      console.error('Speech generation failed:', error);
    }
  }, [stopSpeaking]);

  useEffect(() => {
    if (user) {
      fetchChatHistory()
    }
  }, [user])

  const fetchChatHistory = async () => {
    try {
      const response = await api.get(`/chat/history/${user?.user_id}?limit=20`)
      setMessages(response.messages || [])
    } catch (error) {
      console.error("Failed to fetch chat history:", error)
    }
  }

  const sendMessage = async (message: string, image: any | null) => {
    try {
      setLoading(true);

      // Add user message to the chat immediately
      if (message || image) {
        const userMessage: Message = {
          message_content: message,
          sender_type: 'user',
          timestamp: new Date().toISOString(),
          metadata: image ? { imageUri: image.uri } : undefined,
        };
        setMessages((prev) => [...prev, userMessage]);
      }

      let response;
      if (image) {
        // Create FormData only when an image is present
        const formData = new FormData();
        formData.append('userId', user?.user_id || '');
        formData.append('message', message);
        formData.append('image', {
          uri: image.uri,
          type: image.type,
          name: image.fileName || 'image.jpg',
        } as any);
        response = await api.post('/chat/message/image', formData);
      } else {
        // Send as plain JSON if no image
        response = await api.post('/chat/message', {
          userId: user?.user_id,
          message: message,
        });
      }

      if (response && response.success) {
        const aiMessage: Message = {
          message_content: response.response,
          sender_type: 'ai',
          timestamp: new Date().toISOString(),
          metadata: response.analysis,
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Generate and play speech for the AI response
        await speak(aiMessage.message_content);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        message_content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        sender_type: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refreshHistory: fetchChatHistory,
    speak,
    stopSpeaking,
  }
}
