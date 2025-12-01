import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native-web";

import { useNavigation } from "@react-navigation/native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - 40, 1320);

const CARD_WIDTH = (CONTAINER_WIDTH - 24) / 2;
const CARD_HEIGHT = 300;

export default function HeroCarousel({ heroBanners }) {
  const navigation = useNavigation();   // ⭐ Lấy navigation
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  const slides = [];
  for (let i = 0; i < heroBanners.length; i += 2) {
    slides.push(heroBanners.slice(i, i + 2));
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
            {slide.map((item) => (
              <View key={item.id} style={styles.card}>
                <Image source={item.image} style={styles.image} />

                {/* ⭐ NÚT XEM CHI TIẾT  */}
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() =>
                    navigation.navigate("EventDetail", { event: item })
                  }
                >
                  <Text style={styles.detailText}>Xem chi tiết</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {index > 0 && (
        <TouchableOpacity
          style={[styles.arrowButton, styles.leftArrow]}
          onPress={() => goToSlide(index - 1)}
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
      )}

      {index < totalSlides - 1 && (
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

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
    width: CONTAINER_WIDTH,
    alignSelf: "center",
    position: "relative",
  },

  slide: {
    flexDirection: "row",
    gap: 24,
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#000",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  detailButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },

  detailText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  arrowButton: {
    position: "absolute",
    top: CARD_HEIGHT / 2 - 20,
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
    marginTop: 20,
    gap: 10,
  },

  dot: {
    width: 10,
    height: 10,
    backgroundColor: "#666",
    borderRadius: 10,
  },

  dotActive: {
    backgroundColor: "#1ec27f",
  },
});
