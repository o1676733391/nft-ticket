import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import BaseCard from '../common/BaseCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDE_MARGIN = 80;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - SIDE_MARGIN * 2, 1320);

export default function WeekendTabsSection({ weekendData, monthData, onPressItem, onPressMore }) {
  const [active, setActive] = useState('weekend');
  const data = active === 'weekend' ? weekendData : monthData;

  return (
    <View style={styles.section}>
      <View style={styles.container}>

        <View style={styles.tabRow}>
          <TouchableOpacity onPress={() => setActive('weekend')}>
            <Text style={[styles.tabText, active === 'weekend' && styles.activeTab]}>
              Cuối tuần này
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActive('month')}>
            <Text style={[styles.tabText, active === 'month' && styles.activeTab]}>
              Tháng này
            </Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity onPress={() => onPressMore && onPressMore(active)}>
            <Text style={styles.more}>Xem thêm ›</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <BaseCard
              image={item.image}
              width={360}
              height={170}
              title={item.title}
              price={item.price}
              date={item.date}
              showArrow={index === data.length - 1}
              onPress={() => onPressItem(item)}
              containerStyle={{ marginRight: 24 }}
            />
          )}
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

  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 20,
  },

  tabText: {
    fontSize: 18,
    color: '#ccc',
  },

  activeTab: {
    color: '#fff',
    fontWeight: '700',
    borderBottomWidth: 3,
    borderColor: '#16a34a',
    paddingBottom: 4,
  },

  more: {
    color: '#e5e7eb',
    fontSize: 16,
  },
});
