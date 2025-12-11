// src/screens/OrganizerScannerScreen.js
// Camera temporarily disabled - using placeholder
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function OrganizerScannerScreen({ navigation }) {
  const [ticketCode, setTicketCode] = useState('');
  const [lastScannedTicket, setLastScannedTicket] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  const handleManualCheckin = async () => {
    if (!ticketCode.trim()) {
      Alert.alert('Loi', 'Vui long nhap ma ve');
      return;
    }

    const mockResult = {
      success: true,
      ticket: {
        id: ticketCode,
        eventName: 'Music Festival 2025',
        ticketType: 'VIP',
        buyerName: 'Nguyen Van A',
        checkedInAt: new Date().toISOString(),
      }
    };

    setLastScannedTicket(mockResult.ticket);
    setScanHistory(prev => [mockResult.ticket, ...prev].slice(0, 10));
    setTicketCode('');

    Alert.alert('Check-in thanh cong!', 'Ve: ' + mockResult.ticket.ticketType);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quet ve Check-in</Text>
        <Text style={styles.headerSubtitle}>Nhap ma ve de check-in</Text>
      </View>

      <View style={styles.cameraPlaceholder}>
        <MaterialCommunityIcons name="qrcode-scan" size={80} color="#374151" />
        <Text style={styles.placeholderText}>Tinh nang quet QR dang duoc cap nhat</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhap ma ve..."
          placeholderTextColor="#6b7280"
          value={ticketCode}
          onChangeText={setTicketCode}
        />
        <TouchableOpacity style={styles.checkInButton} onPress={handleManualCheckin}>
          <FontAwesome5 name="check" size={20} color="#fff" />
          <Text style={styles.checkInButtonText}>Check-in</Text>
        </TouchableOpacity>
      </View>

      {lastScannedTicket && (
        <View style={styles.lastTicket}>
          <Text style={styles.lastTicketTitle}>Ve vua check-in:</Text>
          <Text style={styles.lastTicketInfo}>
            {lastScannedTicket.ticketType} - {lastScannedTicket.buyerName}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  content: { paddingBottom: 100 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  cameraPlaceholder: {
    height: 280,
    backgroundColor: '#1f2937',
    marginHorizontal: 20,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  placeholderText: { color: '#9ca3af', fontSize: 16, marginTop: 16, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 12 },
  input: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#374151',
  },
  checkInButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkInButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  lastTicket: { backgroundColor: '#064e3b', marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 12 },
  lastTicketTitle: { color: '#6ee7b7', fontSize: 12, marginBottom: 4 },
  lastTicketInfo: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
