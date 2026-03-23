import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { getToken } from '../utils/storage';
import { setAuthToken } from '../api/client';
import { getMe } from '../api/users';
import { linking } from '../utils/deepLinks';
import { navigationRef } from './navigationRef';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationReceiver } from '../components/NotificationReceiver';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { SplashScreen } from '../screens/SplashScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ── Notification token registrar ──────────────────────────────────────────────
// Rendered only when authenticated — calls useNotifications() once.
function NotificationRegistrar() {
  useNotifications();
  return null;
}

// ── Root navigator ────────────────────────────────────────────────────────────

export function RootNavigator() {
  const { isAuthenticated, setHydrated, isHydrated, logout } = useAuthStore();
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          setAuthToken(token);
          const user = await getMe();
          useAuthStore.setState({ token, user, isAuthenticated: true });
        }
      } catch {
        await logout();
      } finally {
        setHydrated();
        setIsBooting(false);
      }
    })();
  }, []);

  if (isBooting || !isHydrated) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
    >
      {isAuthenticated && (
        <>
          {/* Registers push token with backend */}
          <NotificationRegistrar />
          {/* Handles foreground (toast) + tap (deep link) notification events */}
          <NotificationReceiver />
        </>
      )}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
