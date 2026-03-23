import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FeedStackParamList } from '../types';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { PlaceDetailScreen } from '../screens/places/PlaceDetailScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator<FeedStackParamList>();

export function FeedNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Feed" component={FeedScreen} options={{ headerShown: false }} />
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
