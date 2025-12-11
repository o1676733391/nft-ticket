import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

const isMobile = Platform.OS === 'android' || Platform.OS === 'ios';

export default function VerticalEventCard({
  event,
  onPress,
  width = isMobile ? 280 : 400,
  height = isMobile ? 450 : 600,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { width, height }]}
    >
      {/* Background Image */}
      {event.image ? (
        <Image 
          source={{ uri: event.image }} 
          style={styles.image}
          resizeMode="cover"
          onError={(e) => {
            console.error('VerticalEventCard ❌ Error:', event.title);
            console.error('  URL:', event.image);
            console.error('  Error:', e.nativeEvent?.error);
          }}
          onLoadStart={() => console.log('VerticalEventCard 🔄 Loading:', event.title)}
          onLoad={() => console.log('VerticalEventCard ✅ Loaded:', event.title)}
        />
      ) : (
        <Image 
          source={require("../../../asset/concert-show-performance.jpg")} 
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {/* Dark Overlay */}
      <View style={styles.overlay} />

      {/* Content Overlay */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{event.title}</Text>

        {/* Date */}
        <View style={styles.infoRow}>
          <Text style={styles.icon}>📅</Text>
          <Text style={styles.dateText}>{event.date}</Text>
        </View>

        {/* Location */}
        <View style={styles.infoRow}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.locationText}>{event.location || event.locationText || 'Đang cập nhật'}</Text>
        </View>

        {/* Address */}
        {event.address && (
          <Text style={styles.address} numberOfLines={3}>
            {event.address}
          </Text>
        )}

        {/* Price Label */}
        <Text style={styles.priceLabel}>Giá từ</Text>
        <Text style={styles.price}>{event.price.replace('Từ ', '')}</Text>

        {/* Buy Button */}
        <TouchableOpacity
          style={styles.buyButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buyButtonText}>Mua vé ngay</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: isMobile ? 16 : 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  content: {
    flex: 1,
    padding: isMobile ? 20 : 24,
    justifyContent: 'flex-end',
  },

  title: {
    color: '#fff',
    fontSize: isMobile ? 28 : 36,
    fontWeight: 'bold',
    marginBottom: isMobile ? 16 : 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isMobile ? 8 : 10,
  },

  icon: {
    fontSize: isMobile ? 16 : 18,
    marginRight: 8,
  },

  dateText: {
    color: '#fff',
    fontSize: isMobile ? 14 : 16,
    fontWeight: '500',
  },

  locationText: {
    color: '#22c55e',
    fontSize: isMobile ? 14 : 16,
    fontWeight: '600',
  },

  address: {
    color: '#d1d5db',
    fontSize: isMobile ? 12 : 14,
    lineHeight: isMobile ? 18 : 20,
    marginBottom: isMobile ? 16 : 20,
  },

  priceLabel: {
    color: '#d1d5db',
    fontSize: isMobile ? 14 : 16,
    marginBottom: 4,
  },

  price: {
    color: '#22c55e',
    fontSize: isMobile ? 24 : 32,
    fontWeight: 'bold',
    marginBottom: isMobile ? 16 : 20,
  },

  buyButton: {
    backgroundColor: '#22c55e',
    paddingVertical: isMobile ? 12 : 14,
    paddingHorizontal: isMobile ? 20 : 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
    minHeight: isMobile ? 44 : undefined,
  },

  buyButtonText: {
    color: '#fff',
    fontSize: isMobile ? 15 : 16,
    fontWeight: 'bold',
  },
});
