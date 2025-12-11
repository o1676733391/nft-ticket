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
        {image ? (
          <Image 
            source={
              typeof image === 'string' 
                ? { uri: image } 
                : typeof image === 'number' 
                  ? image 
                  : image?.uri 
                    ? { uri: image.uri }
                    : require("../../../asset/concert-show-performance.jpg")
            }
            style={styles.image}
            resizeMode="cover"
            onError={(e) => console.error('BaseCard ❌ Error:', image, 'Type:', typeof image)}
            onLoadStart={() => console.log('BaseCard Loading:', typeof image === 'string' ? image : 'local')}
            onLoad={() => console.log('BaseCard ✅ Loaded')}
          />
        ) : (
          <Image 
            source={require("../../../asset/concert-show-performance.jpg")}
            style={styles.image}
            resizeMode="cover"
          />
        )}

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
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
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
    fontSize: isMobile ? 64 : 88,
    fontWeight: '900',
    color: '#10b98155',
    zIndex: 1,
  },

  arrowOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 12,
  },

  arrowCircle: {
    width: isMobile ? 48 : 40,
    height: isMobile ? 48 : 40,
    borderRadius: isMobile ? 24 : 20,
    backgroundColor: 'rgba(16,185,129,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  arrowText: {
    color: '#fff',
    fontSize: isMobile ? 22 : 20,
    fontWeight: '700',
  },

  title: {
    marginTop: isMobile ? 10 : 12,
    color: '#fff',
    fontSize: isMobile ? 14 : 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  price: {
    marginTop: 5,
    color: '#10b981',
    fontSize: isMobile ? 14 : 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  dateIcon: {
    marginRight: 6,
    fontSize: isMobile ? 14 : 16,
  },

  dateText: {
    color: '#d1d5db',
    fontSize: isMobile ? 13 : 14,
    fontWeight: '500',
  },
});
