// src/components/LoginModal.js
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
import { loginWithWallet } from '../services/walletAuth';
import { loginWithEmail } from '../services/emailAuth';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';

export default function LoginModal({ onClose, onSwitchToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  
  const isWeb = Platform.OS === 'web';

  // Web: MetaMask Authentication
  if (isWeb) {
    return (
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Connect Wallet</Text>
            <View style={styles.mascot}>
              <Text style={{ fontSize: 26 }}>🦊</Text>
            </View>
          </View>

          <View style={styles.body}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={async () => {
                setIsLoading(true);
                try {
                  const { user, address } = await loginWithWallet();
                  setUser(user, address);
                  Toast.show({
                    type: 'success',
                    text1: 'Connected!',
                    text2: `Welcome ${address.slice(0, 6)}...${address.slice(-4)}`
                  });
                  if (onLoginSuccess) onLoginSuccess(user);
                  onClose();
                } catch (error) {
                  Toast.show({
                    type: 'error',
                    text1: 'Connection Failed',
                    text2: error.message
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>🦊 Connect MetaMask</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Mobile: Email/Password Authentication
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Login</Text>
          <Text style={styles.subtitle}>Welcome back!</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="your@email.com"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryBtn, (!email || !password) && styles.disabledBtn]}
            onPress={async () => {
              if (!email || !password) return;
              setIsLoading(true);
              try {
                const { user } = await loginWithEmail(email, password);
                setUser(user, null); // No wallet address for email auth
                Toast.show({
                  type: 'success',
                  text1: 'Login Successful!',
                  text2: `Welcome back, ${user.username || user.email}`
                });
                if (onLoginSuccess) onLoginSuccess(user);
                onClose();
              } catch (error) {
                Toast.show({
                  type: 'error',
                  text1: 'Login Failed',
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
              <Text style={styles.primaryText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={onSwitchToRegister}
          >
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerTextBold}>Register</Text>
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
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginRight: 46, // chừa chỗ cho mascot
  },
  mascot: {
    position: "absolute",
    right: 24,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fef9c3",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
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
  primaryBtn: {
    marginTop: 8,
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
  cfRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
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
  linkCenter: {
    marginTop: 6,
    textAlign: "center",
    color: "#2563eb",
    fontSize: 13,
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
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  googleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  footerText: {
    marginTop: 14,
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
  },
  registerLink: {
    marginTop: 16,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  registerTextBold: {
    color: "#19c48a",
    fontWeight: "700",
  },
});
