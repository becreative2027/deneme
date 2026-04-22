import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import { FeedNavigator } from './FeedNavigator';
import { SearchNavigator } from './SearchNavigator';
import { CreatePostScreen } from '../screens/posts/CreatePostScreen';
import { WishlistNavigator } from './WishlistNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { useWishlistStore } from '../store/wishlistStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ACTIVE   = '#6c63ff';
const INACTIVE = '#b0b0b0';
const BAR_H    = 64;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, [IconName, IconName]> = {
  FeedTab:     ['home',     'home-outline'],
  SearchTab:   ['search',   'search-outline'],
  WishlistTab: ['bookmark', 'bookmark-outline'],
  ProfileTab:  ['person',   'person-outline'],
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const wishlistCount = useWishlistStore((s) => s.placeIds.length);

  // Split into left pair and right pair around the centre Create button
  const leftTabs  = state.routes.filter((_, i) => i < 2);
  const rightTabs = state.routes.filter((_, i) => i > 2);

  const renderTab = (route: typeof state.routes[number]) => {
    const isFocused = state.index === state.routes.indexOf(route);
    const [activeIcon, inactiveIcon] = TAB_ICONS[route.name] ?? ['ellipse', 'ellipse-outline'];
    const color = isFocused ? ACTIVE : INACTIVE;

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
    };

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        activeOpacity={0.7}
        style={s.tabBtn}
      >
        <View style={[s.tabInner, isFocused && s.tabInnerActive]}>
          <Ionicons name={isFocused ? activeIcon : inactiveIcon} size={24} color={color} />
        </View>
        {/* Wishlist dot badge */}
        {route.name === 'WishlistTab' && wishlistCount > 0 && (
          <View style={s.dot} />
        )}
      </TouchableOpacity>
    );
  };

  const createRoute = state.routes[2];
  const createFocused = state.index === 2;

  return (
    <View style={[s.barWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={s.bar}>
        {/* Left tabs */}
        <View style={s.side}>{leftTabs.map(renderTab)}</View>

        {/* Centre Create button */}
        <TouchableOpacity
          onPress={() => {
            const event = navigation.emit({ type: 'tabPress', target: createRoute.key, canPreventDefault: true });
            if (!createFocused && !event.defaultPrevented) navigation.navigate(createRoute.name);
          }}
          activeOpacity={0.85}
          style={s.createWrap}
        >
          <View style={[s.createBtn, createFocused && s.createBtnActive]}>
            <Ionicons name={createFocused ? 'close' : 'add'} size={28} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Right tabs */}
        <View style={s.side}>{rightTabs.map(renderTab)}</View>
      </View>
    </View>
  );
}

export function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
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

const s = StyleSheet.create({
  barWrap: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 36,
    height: BAR_H,
    paddingHorizontal: 6,
    shadowColor: '#1a1040',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.13,
    shadowRadius: 28,
    elevation: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },

  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  tabInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInnerActive: {
    backgroundColor: `${ACTIVE}12`,
  },

  dot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: ACTIVE,
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  createWrap: {
    marginHorizontal: 4,
  },
  createBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: ACTIVE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACTIVE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  createBtnActive: {
    backgroundColor: '#5550d4',
  },
});
