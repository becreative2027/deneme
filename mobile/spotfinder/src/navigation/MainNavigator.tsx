import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import { FeedNavigator } from './FeedNavigator';
import { SearchNavigator } from './SearchNavigator';
import { CreatePostScreen } from '../screens/posts/CreatePostScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ACTIVE_COLOR = '#6c63ff';
const INACTIVE_COLOR = '#aaa';

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: { borderTopWidth: 0.5, borderTopColor: '#e0e0e0', backgroundColor: '#fff' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<keyof MainTabParamList, [string, string]> = {
            FeedTab: ['home', 'home-outline'],
            SearchTab: ['search', 'search-outline'],
            CreatePost: ['add-circle', 'add-circle-outline'],
            ProfileTab: ['person', 'person-outline'],
          };
          const [active, inactive] = icons[route.name];
          const name = focused ? active : inactive;
          return <Ionicons name={name as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="FeedTab" component={FeedNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="SearchTab" component={SearchNavigator} options={{ title: 'Search' }} />
      <Tab.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: 'Post', tabBarLabel: 'Post' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile', headerShown: false }}
      />
    </Tab.Navigator>
  );
}
