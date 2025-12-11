// src/components/RegisterModal.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from '../context/AuthContext';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';

export default function RegisterModal({ onClose, onSwitchToLogin, onRegisterSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  
  const isWeb = Platform.OS === 'web';

  // Validation
  const isFormValid = () => {
    if (!email || !password || password.length < 6) return false;
    if (isOrganizer && !organizationName) return false;
    return true;
  };

  // For web, show message to use MetaMask
  if (isWeb) {
    return (
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Register</Text>
          </View>

          <View style={styles.body}>
            <Text style={{ textAlign: 'center', marginVertical: 20 }}>
              Please use MetaMask to connect on web.
            </Text>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onSwitchToLogin}>
              <Text style={styles.secondaryText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Mobile registration
  const handleRegister = async () => {
    if (!isFormValid()) return;
    
    setIsLoading(true);
    try {
      const { user } = await register({
        email,
        password,
        username,
        fullName,
        isOrganizer,
        organizationName: isOrganizer ? organizationName : null,
        organizationDescription: isOrganizer ? organizationDescription : null,
      });
      
      setUser(user, null);
      
      Toast.show({
        type: 'success',
        text1: 'Registration Successful!',
        text2: isOrganizer ? 'Welcome, Organizer!' : 'Welcome to Ticketbox'
      });
      
      if (onRegisterSuccess) {
        onRegisterSuccess(user);
      }
      onClose();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>
            {isOrganizer ? '🎪 Organizer Account' : '🎫 User Account'}
          </Text>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              placeholder="Your full name"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              placeholder="Choose a username"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              placeholder="your@email.com"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              placeholder="Min 6 characters"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Organizer Checkbox */}
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => setIsOrganizer(!isOrganizer)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, isOrganizer && styles.checkboxChecked]}>
              {isOrganizer && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.checkboxTextContainer}>
              <Text style={styles.checkboxLabel}>I am an Event Organizer</Text>
              <Text style={styles.checkboxHint}>
                Register as organizer to create and manage events
              </Text>
            </View>
          </TouchableOpacity>

          {/* Organizer Fields - Show when checkbox is checked */}
          {isOrganizer && (
            <View style={styles.organizerSection}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Organization Name *</Text>
                <TextInput
                  placeholder="Your company/organization name"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={organizationName}
                  onChangeText={setOrganizationName}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Organization Description</Text>
                <TextInput
                  placeholder="Tell us about your organization..."
                  placeholderTextColor="#9ca3af"
                  style={[styles.input, styles.textArea]}
                  value={organizationDescription}
                  onChangeText={setOrganizationDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          )}

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, !isFormValid() && styles.disabledBtn]}
            onPress={handleRegister}
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>
                {isOrganizer ? 'Register as Organizer' : 'Register'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity style={styles.linkRow} onPress={onSwitchToLogin}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
          
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  card: {
    width: 420,
    maxWidth: "90%",
    maxHeight: "85%",
    backgroundColor: "#1f2937",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 18,
    color: "#9ca3af",
  },
  header: {
    backgroundColor: "#10b981",
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: 450,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#111827",
    color: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  
  // Checkbox styles
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#6b7280",
    marginRight: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
  checkboxHint: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  
  // Organizer section
  organizerSection: {
    backgroundColor: "#10b98115",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#10b98133",
  },
  
  primaryBtn: {
    marginTop: 8,
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryBtn: {
    marginTop: 8,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: {
    color: "#10b981",
    fontWeight: "600",
    fontSize: 15,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  linkRow: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  linkTextBold: {
    color: "#10b981",
    fontWeight: "700",
  },
});
