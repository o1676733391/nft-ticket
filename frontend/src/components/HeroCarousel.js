import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import RemoteImage from "./RemoteImage";

export default function HeroCarousel({ heroBanners }) {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  // Mobile First: Design for mobile (width < 768), then adapt for larger screens
  const isTabletOrDesktop = screenWidth >= 768;
  
  // Responsive values based on screen width
  const SIDE_MARGIN = isTabletOrDesktop ? 20 : 16;
  const CONTAINER_WIDTH = Math.min(screenWidth - SIDE_MARGIN * 2, 1320);
  
  const CARD_GAP = isTabletOrDesktop ? 24 : 0;
  const CARDS_PER_SLIDE = isTabletOrDesktop ? 2 : 1;
  const CARD_WIDTH = isTabletOrDesktop ? (CONTAINER_WIDTH - CARD_GAP) / 2 : CONTAINER_WIDTH;
  const CARD_HEIGHT = isTabletOrDesktop ? 300 : Math.min(screenWidth * 1.5, 550);

  // Group slides based on platform
  const slides = [];
  for (let i = 0; i < heroBanners.length; i += CARDS_PER_SLIDE) {
    slides.push(heroBanners.slice(i, i + CARDS_PER_SLIDE));
  }

  const totalSlides = slides.length;

  const goToSlide = (i) => {
    scrollRef.current.scrollTo({
      x: i * CONTAINER_WIDTH,
      animated: true,
    });
    setIndex(i);
  };

  const onScroll = (e) => {
    const slide = Math.round(e.nativeEvent.contentOffset.x / CONTAINER_WIDTH);
    setIndex(slide);
  };

  const styles = createStyles(isTabletOrDesktop, CONTAINER_WIDTH, CARD_WIDTH, CARD_HEIGHT, CARD_GAP);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ width: totalSlides * CONTAINER_WIDTH }}
      >
        {slides.map((slide, slideIndex) => (
          <View key={slideIndex} style={[styles.slide, { width: CONTAINER_WIDTH }]}>
            {slide.map((item) => {
              console.log('HeroCarousel rendering card:', item.title, 'has image:', !!item.image);
              return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => navigation.navigate("EventDetail", { event: item })}
              >
                {/* Image Container - Top 60% */}
                <View style={styles.imageContainer}>
                  {item.image ? (
                    <RemoteImage 
                      source={{ uri: item.image }}
                      style={styles.image}
                      resizeMode="cover"
                      onError={(e) => console.error('HeroCarousel ❌ Error loading:', item.title)}
                      onLoad={() => console.log('HeroCarousel ✅ Loaded:', item.title)}
                    />
                  ) : (
                    <RemoteImage 
                      source={require("../../asset/concert-show-performance.jpg")}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  )}
                </View>

                {/* Content Container - Bottom 40% */}
                <View style={styles.contentContainer}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

                  <View style={styles.infoRow}>
                    <Text style={styles.icon}>📅</Text>
                    <Text style={styles.dateText}>{item.date}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.icon}>📍</Text>
                    <Text style={styles.locationText}>{item.location || 'Đang cập nhật'}</Text>
                  </View>

                  {item.venue_name && (
                    <Text style={styles.address} numberOfLines={3}>
                      {item.venue_name}
                    </Text>
                  )}

                  <Text style={styles.priceLabel}>Giá từ</Text>
                  <Text style={styles.price}>{(item.price || 'Liên hệ').replace('Từ ', '')}</Text>

                  <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => navigation.navigate("EventDetail", { event: item })}
                  >
                    <Text style={styles.buyButtonText}>Mua vé ngay</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Show arrow buttons only on tablet/desktop */}
      {isTabletOrDesktop && index > 0 && (
        <TouchableOpacity
          style={[styles.arrowButton, styles.leftArrow]}
          onPress={() => goToSlide(index - 1)}
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
      )}

      {isTabletOrDesktop && index < totalSlides - 1 && (
        <TouchableOpacity
          style={[styles.arrowButton, styles.rightArrow]}
          onPress={() => goToSlide(index + 1)}
        >
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      )}

      <View style={styles.dotContainer}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const createStyles = (isTabletOrDesktop, containerWidth, cardWidth, cardHeight, cardGap) => StyleSheet.create({
  wrapper: {
    marginTop: isTabletOrDesktop ? 20 : 12,
    width: containerWidth,
    alignSelf: "center",
    position: "relative",
  },

  slide: {
    flexDirection: "row",
    gap: cardGap,
  },

  card: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: isTabletOrDesktop ? 14 : 16,
    overflow: "hidden",
    backgroundColor: "#1f2937",
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },

  imageContainer: {
    width: "100%",
    height: "60%",
    // backgroundColor removed - was covering image
  },

  image: {
    width: "100%",
    height: "100%",
  },

  contentContainer: {
    flex: 1,
    padding: isTabletOrDesktop ? 20 : 16,
    backgroundColor: "#1f2937",
  },

  title: {
    color: '#fff',
    fontSize: isTabletOrDesktop ? 32 : 18,
    fontWeight: '800',
    marginBottom: isTabletOrDesktop ? 16 : 8,
    letterSpacing: 0.3,
    lineHeight: isTabletOrDesktop ? 38 : 24,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTabletOrDesktop ? 8 : 4,
  },

  icon: {
    fontSize: isTabletOrDesktop ? 16 : 13,
    marginRight: 5,
  },

  dateText: {
    color: '#e5e7eb',
    fontSize: isTabletOrDesktop ? 15 : 12,
    fontWeight: '600',
  },

  locationText: {
    color: '#10b981',
    fontSize: isTabletOrDesktop ? 15 : 12,
    fontWeight: '700',
  },

  address: {
    color: '#9ca3af',
    fontSize: isTabletOrDesktop ? 13 : 10,
    lineHeight: isTabletOrDesktop ? 18 : 14,
    marginBottom: isTabletOrDesktop ? 16 : 6,
    marginTop: 2,
  },

  priceLabel: {
    color: '#9ca3af',
    fontSize: isTabletOrDesktop ? 14 : 11,
    marginBottom: 2,
    fontWeight: '500',
  },

  price: {
    color: '#10b981',
    fontSize: isTabletOrDesktop ? 28 : 28,
    fontWeight: '900',
    marginBottom: isTabletOrDesktop ? 16 : 8,
    letterSpacing: 0.5,
  },

  buyButton: {
    backgroundColor: '#10b981',
    paddingVertical: isTabletOrDesktop ? 12 : 10,
    paddingHorizontal: isTabletOrDesktop ? 20 : 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    minHeight: isTabletOrDesktop ? undefined : 42,
    elevation: 4,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  buyButtonText: {
    color: '#fff',
    fontSize: isTabletOrDesktop ? 15 : 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  detailButton: {
    position: "absolute",
    bottom: isTabletOrDesktop ? 16 : 12,
    left: isTabletOrDesktop ? 16 : 12,
    backgroundColor: "#fff",
    paddingHorizontal: isTabletOrDesktop ? 16 : 12,
    paddingVertical: isTabletOrDesktop ? 8 : 6,
    borderRadius: 6,
    minHeight: isTabletOrDesktop ? undefined : 36,
    justifyContent: "center",
  },

  detailText: {
    fontSize: isTabletOrDesktop ? 14 : 13,
    fontWeight: "600",
    color: "#333",
  },

  arrowButton: {
    position: "absolute",
    top: cardHeight / 2 - 20,
    backgroundColor: "#00000055",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
  },

  leftArrow: { left: -5 },
  rightArrow: { right: -5 },

  arrowText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },

  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: isTabletOrDesktop ? 20 : 12,
    gap: isTabletOrDesktop ? 10 : 8,
  },

  dot: {
    width: isTabletOrDesktop ? 10 : 8,
    height: isTabletOrDesktop ? 10 : 8,
    backgroundColor: "#666",
    borderRadius: 10,
  },

  dotActive: {
    backgroundColor: "#1ec27f",
  },
});
