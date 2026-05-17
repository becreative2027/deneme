import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { getToken } from '../utils/storage';
import { setAuthToken } from '../api/client';
import { getMe } from '../api/users';
import { linking } from '../utils/deepLinks';
import { navigationRef } from './navigationRef';
import { useNotificationPermissionPrompt } from '../hooks/useNotifications';
import { NotificationReceiver } from '../components/NotificationReceiver';
import { NotificationPermissionModal } from '../components/NotificationPermissionModal';
import { useToast } from '../components/Toast';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { SplashScreen } from '../screens/SplashScreen';
import { UsernameSetupScreen } from '../screens/auth/UsernameSetupScreen';
import { useWishlistStore } from '../store/wishlistStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ── Notification permission flow ──────────────────────────────────────────────
function NotificationManager() {
  const { showToast } = useToast();
  const { showModal, handleAllow, handleDismiss } = useNotificationPermissionPrompt(
    (msg) => showToast(msg, 'info'),
  );
  return (
    <NotificationPermissionModal
      visible={showModal}
      onAllow={handleAllow}
      onDismiss={handleDismiss}
    />
  );
}

// ── Root navigator ────────────────────────────────────────────────────────────

export function RootNavigator() {
  const { isAuthenticated, setHydrated, isHydrated, logout, needsUsernameSetup } = useAuthStore();
  const hydrateWishlist = useWishlistStore((s) => s.hydrate);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          setAuthToken(token);
          const user = await getMe();
          useAuthStore.setState({
            token,
            user,
            isAuthenticated: true,
            needsUsernameSetup: /^user\d*$/.test(user.username ?? ''),
          });
        }
      } catch {
        await logout();
      } finally {
        await hydrateWishlist();
        setHydrated();
        setIsBooting(false);
      }
    })();
  }, []);

  if (isBooting || !isHydrated) {
    return <SplashScreen />;
  }

  const navTheme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: '#ffffff' },
  };

  return (
    <NavigationContainer ref={navigationRef} linking={linking} theme={navTheme}>
      {isAuthenticated && (
        <>
          <NotificationManager />
          <NotificationReceiver />
        </>
      )}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated && needsUsernameSetup ? (
          <Stack.Screen name="UsernameSetup" component={UsernameSetupScreen} />
        ) : isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
