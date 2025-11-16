import { View, Text, StyleSheet } from 'react-native';

export default function TicketsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tickets</Text>
      <Text style={styles.subtitle}>Your NFT tickets</Text>
      {/* TODO: Implement ticket listing with QR codes */}
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
