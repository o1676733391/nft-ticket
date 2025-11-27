import React from 'react';
import { View, FlatList, StyleSheet, Dimensions, Text } from 'react-native';
import BaseCard from '../common/BaseCard';
import SectionTitle from '../common/SectionTitle';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDE_MARGIN = 80;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - SIDE_MARGIN * 2, 1320);

export default function TrendingSection({ title, data, onPressItem }) {
  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <SectionTitle title={title} icon="🔥" />

        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const rank = index + 1;
            const isLast = index === data.length - 1;

            return (
              <View style={styles.itemWrapper}>
                {/* Rank nhô ra bên trái */}
                <Text style={styles.rank}>{rank}</Text>

                <BaseCard
                  image={item.image}
                  width={360}
                  height={150}
                  showArrow={isLast}
                  onPress={() => onPressItem(item)}
                  containerStyle={styles.cardWrapper}
                />
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
    alignItems: 'center',
  },
  container: {
    width: CONTAINER_WIDTH,
  },

  // --- UPDATED FOR RANK ---
  itemWrapper: {
    marginRight: 40,
    height: 150 + 20,
    justifyContent: 'center',
    position: 'relative',
  },

  rank: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    fontSize: 96,
    fontWeight: '900',
    color: '#22c55e',
    zIndex: -1,
  },

  cardWrapper: {
    marginLeft: 40, 
  },
});
