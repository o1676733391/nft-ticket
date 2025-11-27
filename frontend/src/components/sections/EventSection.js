import React from 'react';
import { View, FlatList, Dimensions, StyleSheet } from 'react-native';
import BaseCard from '../common/BaseCard';
import SectionTitle from '../common/SectionTitle';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDE_MARGIN = 80;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - SIDE_MARGIN * 2, 1320);

export default function EventSection({ title, data, onPressItem }) {
  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <SectionTitle title={title} />

        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <BaseCard
              image={item.image}
              width={260}
              height={320}
              showArrow={index === data.length - 1}
              onPress={() => onPressItem(item)}
              containerStyle={{ marginRight: 18 }}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 26,
    alignItems: 'center',
  },
  container: {
    width: CONTAINER_WIDTH,
  },
});
