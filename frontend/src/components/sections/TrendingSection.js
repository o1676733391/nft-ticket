import React from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions, Text } from 'react-native';
import BaseCard from '../common/BaseCard';
import SectionTitle from '../common/SectionTitle';

export default function TrendingSection({ title, data, onPressItem }) {
  const { width: screenWidth } = useWindowDimensions();
  const isTabletOrDesktop = screenWidth >= 768;
  
  const SIDE_MARGIN = isTabletOrDesktop ? 80 : 16;
  const CONTAINER_WIDTH = Math.min(screenWidth - SIDE_MARGIN * 2, 1320);
  const cardWidth = isTabletOrDesktop ? 360 : 280;
  const cardHeight = isTabletOrDesktop ? 150 : 120;
  const rankFontSize = isTabletOrDesktop ? 96 : 64;
  const rankLeftOffset = isTabletOrDesktop ? 40 : 24;

  return (
    <View style={[styles.section, { marginTop: isTabletOrDesktop ? 32 : 20 }]}>
      <View style={[styles.container, { width: isTabletOrDesktop ? CONTAINER_WIDTH : screenWidth }]}>
        <SectionTitle title={title} icon="🔥" />

        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: isTabletOrDesktop ? 0 : 16 }}
          renderItem={({ item, index }) => {
            const rank = index + 1;
            const isLast = index === data.length - 1;

            return (
              <View style={[styles.itemWrapper, { height: cardHeight + 20, marginRight: isTabletOrDesktop ? 40 : 24 }]}>
                {/* Rank number */}
                <Text style={[styles.rank, { fontSize: rankFontSize, color: '#10b981' }]}>{rank}</Text>

                <BaseCard
                  image={item.image}
                  width={cardWidth}
                  height={cardHeight}
                  showArrow={isLast}
                  onPress={() => onPressItem(item)}
                  containerStyle={[styles.cardWrapper, { marginLeft: rankLeftOffset }]}
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
    alignItems: 'center',
  },
  container: {},

  itemWrapper: {
    justifyContent: 'center',
    position: 'relative',
  },

  rank: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    fontWeight: '900',
    zIndex: -1,
  },

  cardWrapper: {},
});
