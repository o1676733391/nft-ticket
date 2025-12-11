import React from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from "react-native";

export default function OrganizerSection({ organizer }) {
  if (!organizer) return null;
  
  const { width: screenWidth } = useWindowDimensions();
  const isTabletOrDesktop = screenWidth >= 768;
  
  const SIDE_MARGIN = isTabletOrDesktop ? 80 : 16;
  const CONTAINER_WIDTH = Math.min(screenWidth - SIDE_MARGIN * 2, 1320);

  return (
    <View style={[styles.wrapper, { 
      width: isTabletOrDesktop ? CONTAINER_WIDTH : screenWidth,
      marginTop: isTabletOrDesktop ? 40 : 24,
      paddingHorizontal: isTabletOrDesktop ? 0 : 16,
    }]}>
      <Text style={[styles.title, { 
        fontSize: isTabletOrDesktop ? 22 : 20,
        marginBottom: isTabletOrDesktop ? 14 : 12,
      }]}>Ban tổ chức</Text>

      <View style={[styles.box, { 
        flexDirection: isTabletOrDesktop ? "row" : "column",
        padding: isTabletOrDesktop ? 20 : 16,
        alignItems: isTabletOrDesktop ? "flex-start" : "center",
      }]}>
        <Image 
          source={organizer.logo} 
          style={[styles.logo, {
            width: isTabletOrDesktop ? 140 : 120,
            height: isTabletOrDesktop ? 140 : 120,
            marginRight: isTabletOrDesktop ? 20 : 0,
            marginBottom: isTabletOrDesktop ? 0 : 16,
          }]} 
        />

        <View style={[styles.info, {
          alignItems: isTabletOrDesktop ? "flex-start" : "flex-start",
          width: isTabletOrDesktop ? undefined : "100%",
        }]}>
          <Text style={[styles.name, { 
            fontSize: isTabletOrDesktop ? 20 : 18,
            textAlign: isTabletOrDesktop ? "left" : "left",
          }]}>{organizer.name}</Text>

          <Text style={[styles.text, { fontSize: isTabletOrDesktop ? 15 : 14 }]}>{organizer.company}</Text>
          <Text style={[styles.text, { fontSize: isTabletOrDesktop ? 15 : 14 }]}>Mã Số Thuế: {organizer.taxCode}</Text>
          <Text style={[styles.text, { fontSize: isTabletOrDesktop ? 15 : 14 }]}>Địa chỉ: {organizer.address}</Text>
          <Text style={[styles.text, { fontSize: isTabletOrDesktop ? 15 : 14 }]}>Hotline: {organizer.hotline}</Text>
          <Text style={[styles.text, { fontSize: isTabletOrDesktop ? 15 : 14 }]}>Email: {organizer.email}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},

  title: {
    color: "#10b981",
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  box: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  logo: {
    borderRadius: 12,
    resizeMode: "cover",
  },

  info: {
    flex: 1,
    justifyContent: "center",
  },

  name: {
    color: "#10b981",
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  text: {
    color: "#d1d5db",
    marginBottom: 6,
    lineHeight: 20,
  },
});
