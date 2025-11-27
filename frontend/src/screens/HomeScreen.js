// src/screens/HomeScreen.js
import React, { useState } from "react";
import { ScrollView, View } from "react-native";

import Header from "../components/Header";
import { useAuth } from '../context/AuthContext';
import TopMenu from "../components/TopMenu";
import HeroCarousel from "../components/HeroCarousel";
import EventSection from "../components/sections/EventSection";
import TrendingSection from "../components/sections/TrendingSection";
import ForYouSection from "../components/sections/ForYouSection";
import WeekendTabsSection from "../components/sections/WeekendTabsSection";
import HorizontalEventSection from "../components/sections/HorizontalEventSection";
import LocationSection from "../components/sections/LocationSection";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import { homeData } from "../data/homeData";

export default function HomeScreen({ navigation }) {
  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'register'
  const auth = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: "#111827" }}>
      <ScrollView>
        <Header user={auth.user} onLoginPress={() => setAuthMode("login")} onLogout={() => auth.logout()} />
        <TopMenu />

        <View style={{ paddingHorizontal: 12 }}>
          <HeroCarousel heroBanners={homeData.heroBanners} />
        </View>

        <EventSection
          title="Sự kiện đặc biệt"
          data={homeData.specialEvents}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item })}
        />

        <TrendingSection
          title="Sự kiện xu hướng"
          data={homeData.trendingEvents}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item })}
        />

        <ForYouSection
          title="Dành cho bạn"
          data={homeData.forYouEvents}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item })}
        />

        <WeekendTabsSection
          weekendData={homeData.weekendEvents}
          monthData={homeData.monthEvents}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item })}
          onPressMore={(activeTab) => navigation.navigate("SearchResult", { query: "", category: activeTab === 'weekend' ? 'Cuối tuần này' : 'Tháng này' })}
        />

        <HorizontalEventSection
          title="Nhạc sống"
          data={homeData.liveMusicEvents}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item })}
          onPressMore={() => navigation.navigate("SearchResult", { query: "", category: "Nhạc sống" })}
        />

        <HorizontalEventSection
          title="Sân khấu & Nghệ thuật"
          data={homeData.stageArtEvents}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item })}
          onPressMore={() => navigation.navigate("SearchResult", { query: "", category: "Sân khấu & Nghệ thuật" })}
        />

        <HorizontalEventSection
          title="Thể loại khác"
          data={homeData.otherCategoryEvents}
          onPressItem={(item) => navigation.navigate("EventDetail", { event: item })}
          onPressMore={() => navigation.navigate("SearchResult", { query: "", category: "Thể loại khác" })}
        />

        <LocationSection
          title="Điểm đến thú vị"
          data={homeData.featuredDestinations}
          onPressItem={(item) => {
            const cityMap = {
              "Tp. Hồ Chí Minh": "hcm",
              "Hà Nội": "hn",
              "Đà Lạt": "dl",
              "Vị trí khác": "other",
            };
            const loc = cityMap[item.title] || "all";
            navigation.navigate("SearchResult", { query: "", location: loc });
          }}
        />

        <View style={{ height: 40 }} />
        <Footer />
      </ScrollView>

      {authMode === "login" && (
        <LoginModal
          onClose={() => setAuthMode(null)}
          onSwitchToRegister={() => setAuthMode("register")}
          onLoginSuccess={(user) => {
            auth.login(user);
            setAuthMode(null);
            navigation.navigate("Home");
          }}
        />
      )}

      {authMode === "register" && (
        <RegisterModal
          onClose={() => setAuthMode(null)}
          onSwitchToLogin={() => setAuthMode("login")}
        />
      )}
    </View>
  );
}
