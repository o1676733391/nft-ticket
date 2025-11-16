import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function EventsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
      <Text style={styles.subtitle}>Discover upcoming events</Text>
      {/* TODO: Implement event listing */}
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
