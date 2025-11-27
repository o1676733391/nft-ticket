// src/components/SectionBanner.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SectionBanner() {
  return (
    <View style={styles.row}>
      <View style={[styles.card, styles.cardLeft]}>
        <Text style={styles.title}>Ưu đãi mỗi ngày</Text>
        <Text style={styles.sub}>Giảm trực tiếp 200K</Text>
      </View>
      <View style={[styles.card, styles.cardRight]}>
        <Text style={styles.title}>Ưu đãi VPBank Day</Text>
        <Text style={styles.sub}>Giảm trực tiếp 300K</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
  },
  cardLeft: {
    backgroundColor: '#dbeafe',
    marginRight: 8,
  },
  cardRight: {
    backgroundColor: '#fef3c7',
    marginLeft: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  sub: {
    marginTop: 4,
    fontSize: 12,
    color: '#4b5563',
  },
});
