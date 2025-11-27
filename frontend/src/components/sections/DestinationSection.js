import React from 'react';
import { View, FlatList, StyleSheet,Text  } from 'react-native';
import BaseCard from '../common/BaseCard';
import SectionTitle from '../common/SectionTitle';

export default function DestinationSection({ title, data }) {
  return (
    <View style={styles.section}>
      <SectionTitle title={title} />

      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <BaseCard
            image={item.image}
            width={160}
            height={110}
            showOverlay
            containerStyle={{ marginRight: 12 }}
          >
            <Text style={styles.label}>{item.title}</Text>
          </BaseCard>
        )}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  section: { marginTop: 18 },
  label: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    color: '#fff',
    fontWeight: '700',
  },
});
