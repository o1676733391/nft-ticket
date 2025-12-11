import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { useAuthStore } from './src/store/authStore';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';

console.log('Full App.js loaded');

function AppContent() {
  console.log('AppContent rendering');
  return (
    <>
      <RootNavigator />
      <Toast />
    </>
  );
}

export default function App() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, []);

  console.log('Full App rendering');
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NavigationContainer>
  );
}
