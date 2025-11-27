import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_MARGIN = 80;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - SIDE_MARGIN * 2, 1320);

export default function OrganizerSection({ organizer }) {
  if (!organizer) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Ban tổ chức</Text>

      <View style={styles.box}>
        <Image source={organizer.logo} style={styles.logo} />

        <View style={styles.info}>
          <Text style={styles.name}>{organizer.name}</Text>

          <Text style={styles.text}>{organizer.company}</Text>
          <Text style={styles.text}>Mã Số Thuế: {organizer.taxCode}</Text>
          <Text style={styles.text}>Địa chỉ: {organizer.address}</Text>
          <Text style={styles.text}>Hotline: {organizer.hotline}</Text>
          <Text style={styles.text}>Email: {organizer.email}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: CONTAINER_WIDTH,
    marginTop: 40,
  },

  title: {
    color: "#22c55e",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
  },

  box: {
    flexDirection: "row",
    backgroundColor: "#2c333f",
    padding: 20,
    borderRadius: 12,
  },

  logo: {
    width: 140,
    height: 140,
    borderRadius: 10,
    marginRight: 20,
    resizeMode: "contain",
  },

  info: {
    flex: 1,
    justifyContent: "center",
  },

  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },

  text: {
    color: "#cbd5e1",
    fontSize: 15,
    marginBottom: 3,
  },
});
