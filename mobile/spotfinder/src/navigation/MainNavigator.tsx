import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { FeedNavigator } from './FeedNavigator';
import { SearchNavigator } from './SearchNavigator';
import { CreatePostScreen } from '../screens/posts/CreatePostScreen';
import { WishlistNavigator } from './WishlistNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { FloatingTabBar } from '../components/ui/FloatingTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="FeedTab"     component={FeedNavigator} />
      <Tab.Screen name="SearchTab"   component={SearchNavigator} />
      <Tab.Screen name="CreatePost"  component={CreatePostScreen} />
      <Tab.Screen name="WishlistTab" component={WishlistNavigator} />
      <Tab.Screen name="ProfileTab"  component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
