import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SearchStackParamList } from '../types';
import { SearchScreen } from '../screens/places/SearchScreen';
import { PlaceDetailScreen } from '../screens/places/PlaceDetailScreen';

const Stack = createNativeStackNavigator<SearchStackParamList>();

export function SearchNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="PlaceDetail"
        component={PlaceDetailScreen}
        options={{ title: 'Place', headerBackTitle: '' }}
      />
    </Stack.Navigator>
  );
}
