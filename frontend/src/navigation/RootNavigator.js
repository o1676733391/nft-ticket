import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

import HomeScreen from "../screens/HomeScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import SearchResultScreen from "../screens/SearchResultScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MyTicketsScreen from "../screens/MyTicketsScreen";
import CreateEventScreen from "../screens/CreateEventScreen";
import CreateEventStep2Screen from "../screens/CreateEventStep2Screen";
import CreateEventStep3Screen from "../screens/CreateEventStep3Screen";
import CreateEventStep4Screen from "../screens/CreateEventStep4Screen";
import CheckoutScreen from "../screens/CheckoutScreen";
import TicketDetailScreen from "../screens/TicketDetailScreen";
import OrganizerNavigator from "./OrganizerNavigator";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Show loading while checking auth status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }
  
  // Determine initial route based on user type (check both acc_type and accType)
  const getInitialRoute = () => {
    const userType = user?.acc_type || user?.accType;
    if (isAuthenticated && userType === 'organizer') {
      return 'OrganizerMain';
    }
    return 'Home';
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRoute()}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#111319" },
      }}
    >
      {/* HOME */}
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* ORGANIZER NAVIGATOR (Tab Navigator) */}
      <Stack.Screen 
        name="OrganizerMain" 
        component={OrganizerNavigator}
        options={{ headerShown: false }}
      />

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
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateEventStep2"
        component={CreateEventStep2Screen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateEventStep3"
        component={CreateEventStep3Screen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateEventStep4"
        component={CreateEventStep4Screen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
