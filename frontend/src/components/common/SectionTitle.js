import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

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
    marginBottom: 14,
  },
  icon: {
    fontSize: 20,
    marginRight: 6,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
