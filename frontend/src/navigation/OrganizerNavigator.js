// src/navigation/OrganizerNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import OrganizerDashboardScreen from '../screens/OrganizerDashboardScreen';
import OrganizerEventsScreen from '../screens/OrganizerEventsScreen';
import CreateEventMobileScreen from '../screens/CreateEventMobileScreen';
import OrganizerScannerScreen from '../screens/OrganizerScannerScreen';
import OrganizerProfileScreen from '../screens/OrganizerProfileScreen';

const Tab = createBottomTabNavigator();

export default function OrganizerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="OrgDashboard"
        component={OrganizerDashboardScreen}
        options={{
          tabBarLabel: 'Tổng quan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="OrgEvents"
        component={OrganizerEventsScreen}
        options={{
          tabBarLabel: 'Sự kiện',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="calendar-alt" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="OrgCreate"
        component={CreateEventMobileScreen}
        options={{
          tabBarLabel: 'Tạo mới',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.createButton, focused && styles.createButtonActive]}>
              <FontAwesome5 name="plus" size={20} color="#fff" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="OrgScanner"
        component={OrganizerScannerScreen}
        options={{
          tabBarLabel: 'Quét vé',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="qrcode-scan" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="OrgProfile"
        component={OrganizerProfileScreen}
        options={{
          tabBarLabel: 'Tài khoản',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-circle" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1f2937',
    borderTopColor: '#374151',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 8,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonActive: {
    backgroundColor: '#059669',
  },
});
