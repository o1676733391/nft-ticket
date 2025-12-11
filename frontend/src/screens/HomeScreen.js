// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, View, RefreshControl, ActivityIndicator, Text, StyleSheet } from "react-native";

import Header from "../components/Header";
import { useAuth } from '../context/AuthContext';
import TopMenu from "../components/TopMenu";
import HeroCarousel from "../components/HeroCarousel";
import EventSection from "../components/sections/EventSection";
import TrendingSection from "../components/sections/TrendingSection";
import ForYouSection from "../components/sections/ForYouSection";
import WeekendTabsSection from "../components/sections/WeekendTabsSection";
import HorizontalEventSection from "../components/sections/HorizontalEventSection";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import * as mobileApi from "../services/mobileApi";

export default function HomeScreen({ navigation }) {
  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'register'
  const [loading, setLoading] = useState(false); // Start with false to show UI immediately
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const auth = useAuth();

  // Load events from API
  const loadEvents = useCallback(async () => {
    try {
      const data = await mobileApi.getEvents({ limit: 50 });
      const eventList = data.events || data || [];
      console.log('HomeScreen: Loaded', eventList.length, 'events');
      setEvents(eventList);
    } catch (error) {
      console.error('Load events error:', error);
      console.error('Error details:', error.response?.data || error.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  // Transform API event to display format
  const transformEvent = (event) => {
    let minPrice = 0;
    if (event.ticket_templates?.length > 0) {
      const prices = event.ticket_templates.map(t => Number(t.price_token) || 0);
      minPrice = Math.min(...prices);
    }

    // Determine image source - return string URL, not object
    const imageUrl = event.banner_url || event.thumbnail_url || null;

    // Debug: Log EVERY event to catch the problematic one
    console.log('🔍 transformEvent:', {
      id: event.id,
      title: event.title?.substring(0, 30),
      banner_url: event.banner_url,
      thumbnail_url: event.thumbnail_url,
      imageUrl: imageUrl,
      imageUrl_type: typeof imageUrl,
      imageUrl_isObject: typeof imageUrl === 'object',
      imageUrl_value: JSON.stringify(imageUrl),
    });

    const transformed = {
      ...event, // Spread first to get all properties
      // Then override with clean values
      id: event.id,
      title: event.title,
      date: formatDate(event.start_date),
      location: event.location || 'Đang cập nhật',
      locationText: event.venue_name || event.location,
      price: minPrice > 0 ? `Từ ${formatCurrency(minPrice)}` : 'Miễn phí',
      image: imageUrl, // This will override any 'image' from ...event
      banner_url: event.banner_url,
      thumbnail_url: event.thumbnail_url,
    };
    
    // Log the final transformed object
    console.log('✅ transformed.image:', transformed.image, 'type:', typeof transformed.image);
    
    return transformed;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Đang cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  // Get different event categories - all from API
  const getSpecialEvents = () => events.slice(0, 4).map(transformEvent);
  const getTrendingEvents = () => events.slice(0, 6).map(transformEvent);
  const getForYouEvents = () => events.slice(0, 8).map(transformEvent);
  const getWeekendEvents = () => {
    const now = new Date();
    const thisWeekend = events.filter(e => {
      const eventDate = new Date(e.start_date);
      const dayOfWeek = eventDate.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    });
    return thisWeekend.length > 0 ? thisWeekend.slice(0, 6).map(transformEvent) : events.slice(0, 6).map(transformEvent);
  };
  const getMonthEvents = () => {
    const now = new Date();
    const thisMonth = events.filter(e => {
      const eventDate = new Date(e.start_date);
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    });
    return thisMonth.length > 0 ? thisMonth.slice(0, 6).map(transformEvent) : events.slice(0, 6).map(transformEvent);
  };
  const getMusicEvents = () => {
    const filtered = events.filter(e => e.category === 'Âm nhạc' || e.category === 'Nhạc sống');
    return filtered.length > 0 ? filtered.slice(0, 8).map(transformEvent) : events.slice(0, 8).map(transformEvent);
  };
  const getTheaterEvents = () => {
    const filtered = events.filter(e => e.category === 'Sân khấu' || e.category === 'Sân khấu & Nghệ thuật');
    return filtered.length > 0 ? filtered.slice(0, 8).map(transformEvent) : events.slice(0, 8).map(transformEvent);
  };
  const getOtherEvents = () => {
    const filtered = events.filter(e => e.category === 'Thể thao' || e.category === 'Khác' || e.category === 'other');
    return filtered.length > 0 ? filtered.slice(0, 8).map(transformEvent) : events.slice(0, 8).map(transformEvent);
  };

  const getHeroBanners = () => {
    return events.slice(0, 5).map(event => {
      const imageUrl = event.banner_url || event.thumbnail_url || null;
      console.log('🎯 getHeroBanners - Event:', event.title?.substring(0, 30), 'Image:', imageUrl);
      
      return {
        ...event, // Spread first
        // Then override with clean values
        id: event.id,
        title: event.title,
        date: formatDate(event.start_date),
        location: event.location || 'Đang cập nhật',
        venue_name: event.venue_name,
        price: transformEvent(event).price,
        image: imageUrl, // Return string URL, not object
      };
    });
  };

  const handleLoginSuccess = (user) => {
    setAuthMode(null);
    const userType = user?.acc_type || user?.accType;
    if (userType === 'organizer') {
      navigation.reset({ index: 0, routes: [{ name: 'OrganizerMain' }] });
    }
  };

  // Show demo data immediately while loading from API

  return (
    <View style={{ flex: 1, backgroundColor: "#111827" }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" colors={['#10b981']} />
        }
      >
        <Header user={auth.user} onLoginPress={() => setAuthMode("login")} onLogout={() => auth.logout()} />
        <TopMenu />

        <View style={{ paddingHorizontal: 12 }}>
          <HeroCarousel heroBanners={getHeroBanners()} />
        </View>

        <EventSection
          title="Sự kiện đặc biệt"
          data={getSpecialEvents()}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item, eventId: item.id })}
        />

        <TrendingSection
          title="Sự kiện xu hướng"
          data={getTrendingEvents()}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item, eventId: item.id })}
        />

        <ForYouSection
          title="Dành cho bạn"
          data={getForYouEvents()}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item, eventId: item.id })}
        />

        <WeekendTabsSection
          weekendData={getWeekendEvents()}
          monthData={getMonthEvents()}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item, eventId: item.id })}
          onPressMore={(activeTab) => navigation.navigate("SearchResult", { query: "", category: activeTab === 'weekend' ? 'Cuối tuần này' : 'Tháng này' })}
        />

        <HorizontalEventSection
          title="Nhạc sống"
          data={getMusicEvents()}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item, eventId: item.id })}
          onPressMore={() => navigation.navigate("SearchResult", { query: "", category: "Nhạc sống" })}
        />

        <HorizontalEventSection
          title="Sân khấu & Nghệ thuật"
          data={getTheaterEvents()}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item, eventId: item.id })}
          onPressMore={() => navigation.navigate("SearchResult", { query: "", category: "Sân khấu & Nghệ thuật" })}
        />

        <HorizontalEventSection
          title="Thể loại khác"
          data={getOtherEvents()}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item, eventId: item.id })}
          onPressMore={() => navigation.navigate("SearchResult", { query: "", category: "Thể loại khác" })}
        />

        <View style={{ height: 40 }} />
        <Footer />
      </ScrollView>

      {authMode === "login" && (
        <LoginModal
          onClose={() => setAuthMode(null)}
          onSwitchToRegister={() => setAuthMode("register")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {authMode === "register" && (
        <RegisterModal
          onClose={() => setAuthMode(null)}
          onSwitchToLogin={() => setAuthMode("login")}
          onRegisterSuccess={handleLoginSuccess}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9ca3af', marginTop: 12, fontSize: 14 },
});
