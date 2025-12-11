import React from 'react';
import { View, FlatList, useWindowDimensions, StyleSheet } from 'react-native';
import BaseCard from '../common/BaseCard';
import SectionTitle from '../common/SectionTitle';

export default function EventSection({ title, data, onPressItem }) {
  const { width: screenWidth } = useWindowDimensions();
  const isTabletOrDesktop = screenWidth >= 768;
  
  const SIDE_MARGIN = isTabletOrDesktop ? 80 : 16;
  const CONTAINER_WIDTH = Math.min(screenWidth - SIDE_MARGIN * 2, 1320);
  const cardWidth = isTabletOrDesktop ? 260 : 180;
  const cardHeight = isTabletOrDesktop ? 320 : 220;
  const cardSpacing = isTabletOrDesktop ? 18 : 12;

  return (
    <View style={[styles.section, { marginTop: isTabletOrDesktop ? 26 : 20 }]}>
      <View style={[styles.container, { width: isTabletOrDesktop ? CONTAINER_WIDTH : screenWidth }]}>
        <SectionTitle title={title} />

        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: isTabletOrDesktop ? 0 : 16 }}
          renderItem={({ item, index }) => (
            <BaseCard
              image={item.image}
              width={cardWidth}
              height={cardHeight}
              showArrow={index === data.length - 1}
              onPress={() => onPressItem(item)}
              containerStyle={{ marginRight: cardSpacing }}
            />
          )}
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
});
