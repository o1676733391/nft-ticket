import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import SearchResultScreen from "../screens/SearchResultScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MyTicketsScreen from "../screens/MyTicketsScreen";
import CreateEventScreen from "../screens/CreateEventScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#111319" },
      }}
    >
      {/* HOME */}
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* CHI TIẾT SỰ KIỆN */}
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{
          headerShown: false,
          headerTitle: "",
          headerTransparent: true,
          headerTintColor: "#fff",
        }}
      />

      <Stack.Screen name="SearchResult" component={SearchResultScreen} />


      <Stack.Screen name="Profile" component={ProfileScreen} />
   
      <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
