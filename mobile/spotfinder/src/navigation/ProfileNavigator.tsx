import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { PlaceDetailScreen } from '../screens/places/PlaceDetailScreen';
import { UserSearchScreen } from '../screens/profile/UserSearchScreen';
import { FeedbackScreen } from '../screens/profile/FeedbackScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ gestureEnabled: true, fullScreenGestureEnabled: true }}>
      <Stack.Screen name="OwnProfile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PlaceDetail"
        component={PlaceDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserProfile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserSearch"
        component={UserSearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
