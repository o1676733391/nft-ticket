import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function OrganizerSidebar() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Organizer Center</Text>

      <View style={styles.menu}>
        <TouchableOpacity style={[styles.menuItem, styles.menuItemActive]} activeOpacity={0.8}>
          <Text style={styles.menuIcon}>📅</Text>
          <Text style={[styles.menuText, styles.menuTextActive]}>Sự kiện của tôi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
          <Text style={styles.menuIcon}>📄</Text>
          <Text style={styles.menuText}>Quản lý báo cáo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
          <Text style={styles.menuIcon}>📘</Text>
          <Text style={styles.menuText}>Điều khoản cho Ban tổ chức</Text>
        </TouchableOpacity>
      </View>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    paddingVertical: 24,
    paddingHorizontal: 18,
    backgroundColor: '#072018',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.02)',
    // stretch to fill parent's height so the colored panel runs down
    alignSelf: 'stretch',
    height: '100%',
  },
  title: {
    color: '#22c55e',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
  },
  menu: {
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  menuItemActive: {
    backgroundColor: 'rgba(34,197,94,0.08)',
  },
  menuIcon: {
    width: 28,
    textAlign: 'center',
    marginRight: 10,
    fontSize: 16,
  },
  menuText: {
    color: '#cbd5e1',
    fontSize: 15,
  },
  menuTextActive: {
    color: '#22c55e',
    fontWeight: '600',
  },
  langBox: {
    marginTop: 24,
  },
  langLabel: {
    color: '#94a3b8',
    marginBottom: 8,
  },
  langBtn: {
    backgroundColor: '#0b1220',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  langBtnText: {
    color: '#cbd5e1',
    fontWeight: '700',
  },
});
