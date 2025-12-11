import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, useWindowDimensions } from 'react-native';
import BaseCard from '../common/BaseCard';

export default function WeekendTabsSection({ weekendData, monthData, onPressItem, onPressMore }) {
  const [active, setActive] = useState('weekend');
  const data = active === 'weekend' ? weekendData : monthData;
  const { width: screenWidth } = useWindowDimensions();
  const isTabletOrDesktop = screenWidth >= 768;
  
  const SIDE_MARGIN = isTabletOrDesktop ? 80 : 16;
  const CONTAINER_WIDTH = Math.min(screenWidth - SIDE_MARGIN * 2, 1320);
  const cardWidth = isTabletOrDesktop ? 360 : 280;
  const cardHeight = isTabletOrDesktop ? 170 : 140;
  const cardSpacing = isTabletOrDesktop ? 24 : 12;

  return (
    <View style={[styles.section, { marginTop: isTabletOrDesktop ? 32 : 20 }]}>
      <View style={[styles.container, { width: isTabletOrDesktop ? CONTAINER_WIDTH : screenWidth }]}>

        <View style={[styles.tabRow, { 
          marginBottom: isTabletOrDesktop ? 14 : 12,
          gap: isTabletOrDesktop ? 20 : 16,
          paddingHorizontal: isTabletOrDesktop ? 0 : 16,
        }]}>
          <TouchableOpacity onPress={() => setActive('weekend')}>
            <Text style={[
              styles.tabText, 
              { fontSize: isTabletOrDesktop ? 18 : 17 },
              active === 'weekend' && styles.activeTab
            ]}>
              Cuối tuần này
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActive('month')}>
            <Text style={[
              styles.tabText,
              { fontSize: isTabletOrDesktop ? 18 : 17 },
              active === 'month' && styles.activeTab
            ]}>
              Tháng này
            </Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          {isTabletOrDesktop && (
            <TouchableOpacity onPress={() => onPressMore && onPressMore(active)}>
              <Text style={styles.more}>Xem thêm ›</Text>
            </TouchableOpacity>
          )}
        </View>

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
              title={item.title}
              price={item.price}
              date={item.date}
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

  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  tabText: {
    color: '#9ca3af',
    fontWeight: '600',
  },

  activeTab: {
    color: '#fff',
    fontWeight: '800',
    borderBottomWidth: 3,
    borderColor: '#10b981',
    paddingBottom: 4,
  },

  more: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
  },
});
