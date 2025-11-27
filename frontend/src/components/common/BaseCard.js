import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function BaseCard({
  image,
  width = 260,
  height = 100,
  borderRadius = 16,

  onPress = () => {},

  showArrow = false,
  showOverlay = false,
  showRank = null,

  title,
  price,
  date,

  children,

  containerStyle,
  cardStyle,
}) {
  return (
    <View style={[{ width }, containerStyle]}>
      {/* CARD */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[
          styles.card,
          { width, height, borderRadius },
          cardStyle,
        ]}
      >
        {/* IMAGE */}
        <Image source={image} style={styles.image} />

        {/* OVERLAY MỜ */}
        {showOverlay && <View style={styles.overlay} />}

        {/* RANK BIG NUMBER */}
        {showRank && (
          <Text style={styles.rank}>{showRank}</Text>
        )}

        {/* ARROW CIRCLE */}
        {showArrow && (
          <View style={styles.arrowOverlay}>
            <View style={styles.arrowCircle}>
              <Text style={styles.arrowText}>{'>'}</Text>
            </View>
          </View>
        )}

        {/* CUSTOM CHILDREN */}
        {children}
      </TouchableOpacity>

      {/* TITLE BELOW CARD */}
      {title && (
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
      )}

      {/* PRICE */}
      {price && (
        <Text style={styles.price}>{price}</Text>
      )}

      {/* DATE */}
      {date && (
        <View style={styles.dateRow}>
          <Text style={styles.dateIcon}>📅</Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>
      )}
    </View>
  );
}

/* ==============================
      STYLES
============================== */
const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    borderWidth: 0,
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  rank: {
    position: 'absolute',
    left: -6,
    bottom: -12,
    fontSize: 88,
    fontWeight: '900',
    color: '#22c55e55',
    zIndex: 1,
  },

  arrowOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 12,
  },

  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  arrowText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  title: {
    marginTop: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  price: {
    marginTop: 4,
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  dateIcon: {
    marginRight: 6,
  },

  dateText: {
    color: '#e5e7eb',
    fontSize: 13,
  },
});
