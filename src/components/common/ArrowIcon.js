import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ArrowIcon() {
  return (
    <View style={styles.circle}>
      <Text style={styles.text}>{'>'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
