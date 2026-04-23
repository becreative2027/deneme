import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { PlaceDetailScreen } from '../screens/places/PlaceDetailScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OwnProfile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PlaceDetail"
        component={PlaceDetailScreen}
        options={{ title: 'Place', headerBackTitle: '' }}
      />
      <Stack.Screen
        name="UserProfile"
        component={ProfileScreen}
        options={{ title: 'Profile', headerBackTitle: '' }}
      />
    </Stack.Navigator>
  );
}
