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
} from "react-native";
import { registerWithEmail } from '../services/emailAuth';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  
  const isWeb = Platform.OS === 'web';

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
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.fieldGroup}>
            <TextInput
              placeholder="Username"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.fieldGroup}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, (!email || !password) && styles.disabledBtn]}
            onPress={async () => {
              if (!email || !password) return;
              setIsLoading(true);
              try {
                const { user } = await registerWithEmail(email, password, username);
                setUser(user, null);
                Toast.show({
                  type: 'success',
                  text1: 'Registration Successful!',
                  text2: 'Welcome to Ticketbox'
                });
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
            }}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={onSwitchToLogin}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    color: "#4b5563",
  },
  header: {
    backgroundColor: "#19c48a",
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  body: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  googleBtnTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1d4ed8",
    borderRadius: 6,
    paddingVertical: 10,
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  googleTextTop: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 8,
    color: "#6b7280",
    fontSize: 13,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  errorBox: {
    borderWidth: 1,
    borderColor: "#f97373",
    backgroundColor: "#fef2f2",
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
  },
  errorTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  errorIcon: {
    color: "#ef4444",
    marginRight: 6,
    fontSize: 14,
  },
  errorTitle: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 13,
  },
  errorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
  },
  errorDot: {
    color: "#ef4444",
    marginRight: 6,
    fontSize: 10,
    marginTop: 2,
  },
  errorText: {
    color: "#991b1b",
    fontSize: 13,
    flexShrink: 1,
  },
  linkLogin: {
    marginTop: 4,
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "600",
  },
  cfRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cfIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#ecfdf3",
  },
  cfText: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "600",
  },
  primaryBtn: {
    marginTop: 14,
    backgroundColor: "#19c48a",
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryBtn: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#667eea",
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryText: {
    color: "#667eea",
    fontWeight: "600",
    fontSize: 15,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  linkRow: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    color: "#6b7280",
  },
  linkTextBold: {
    color: "#19c48a",
    fontWeight: "700",
  },
});
