import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WishlistStackParamList } from '../types';
import { WishlistScreen } from '../screens/wishlist/WishlistScreen';
import { PlaceDetailScreen } from '../screens/places/PlaceDetailScreen';

const Stack = createNativeStackNavigator<WishlistStackParamList>();

export function WishlistNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' }, gestureEnabled: true, fullScreenGestureEnabled: true }}>
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
    </Stack.Navigator>
  );
}
