import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Check authentication status
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/events" />;
  }

  return <Redirect href="/(auth)/login" />;
}
