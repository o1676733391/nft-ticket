import { View, Text, StyleSheet } from 'react-native';

export default function MarketplaceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Marketplace</Text>
      <Text style={styles.subtitle}>Buy and sell tickets</Text>
      {/* TODO: Implement marketplace listing */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
});
