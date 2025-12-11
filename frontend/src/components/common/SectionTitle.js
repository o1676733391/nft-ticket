import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';

const isMobile = Platform.OS === 'android' || Platform.OS === 'ios';

export default function SectionTitle({ title, icon }) {
  return (
    <View style={styles.row}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isMobile ? 14 : 18,
    paddingHorizontal: isMobile ? 16 : 0,
  },
  icon: {
    fontSize: isMobile ? 20 : 22,
    marginRight: 8,
  },
  title: {
    color: '#fff',
    fontSize: isMobile ? 20 : 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
