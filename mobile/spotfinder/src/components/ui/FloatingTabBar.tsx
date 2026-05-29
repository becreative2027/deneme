import React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme';
import { shadow } from '../../theme';
import { useWishlistStore } from '../../store/wishlistStore';

// Tab bar blur & color constants
const BLUR_INTENSITY_LIGHT = 65;
const BLUR_INTENSITY_DARK  = 85;
const ICON_INACTIVE_DARK   = 'rgba(255,255,255,0.60)';
const ICON_ACTIVE_DARK     = '#fff';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, [IconName, IconName]> = {
  FeedTab:     ['home',     'home-outline'],
  SearchTab:   ['search',   'search-outline'],
  WishlistTab: ['bookmark', 'bookmark-outline'],
  ProfileTab:  ['person',   'person-outline'],
};

const BAR_HEIGHT = 56;

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const wishlistCount = useWishlistStore((s) => s.placeIds.length);

  const leftTabs  = state.routes.filter((_, i) => i < 2);
  const createRoute = state.routes[2];
  const rightTabs = state.routes.filter((_, i) => i > 2);
  const createFocused = state.index === 2;

  const renderTab = (route: typeof state.routes[number]) => {
    const idx = state.routes.indexOf(route);
    const isFocused = state.index === idx;
    const [activeIcon, inactiveIcon] = TAB_ICONS[route.name] ?? ['ellipse', 'ellipse-outline'];
    const color = isDark
      ? (isFocused ? ICON_ACTIVE_DARK : ICON_INACTIVE_DARK)
      : (isFocused ? colors.accent : colors.icon);

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
    };

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.tabBtn}
        accessibilityRole="button"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={route.name.replace('Tab', '')}
      >
        <View style={[
          styles.tabInner,
          isFocused && { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : colors.accentSoft },
        ]}>
          <Ionicons name={isFocused ? activeIcon : inactiveIcon} size={22} color={color} />
        </View>
        {route.name === 'WishlistTab' && wishlistCount > 0 && (
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        )}
      </TouchableOpacity>
    );
  };

  const barContent = (
    <View style={styles.barInner}>
      {/* Left tabs */}
      <View style={styles.side}>{leftTabs.map(renderTab)}</View>

      {/* Centre Create */}
      <TouchableOpacity
        onPress={() => {
          if (createFocused) {
            // X button — close CreatePost, go back to Feed
            navigation.navigate('FeedTab' as any);
            return;
          }
          const event = navigation.emit({ type: 'tabPress', target: createRoute.key, canPreventDefault: true });
          if (!event.defaultPrevented) navigation.navigate(createRoute.name);
        }}
        activeOpacity={0.85}
        style={styles.createWrap}
        accessibilityRole="button"
        accessibilityLabel="Gönderi paylaş"
      >
        <LinearGradient
          colors={[colors.accent, colors.accentDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.createBtn, shadow.amber, createFocused && { opacity: 0.85 }]}
        >
          <Ionicons name={createFocused ? 'close' : 'add'} size={28} color={colors.accentOnAccent} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Right tabs */}
      <View style={styles.side}>{rightTabs.map(renderTab)}</View>
    </View>
  );

  const barHeight = BAR_HEIGHT + insets.bottom;

  return (
    <View
      style={styles.container}
      pointerEvents="box-none"
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={isDark ? BLUR_INTENSITY_DARK : BLUR_INTENSITY_LIGHT}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.bar,
            { borderColor: isDark ? 'rgba(255,255,255,0.10)' : colors.tabBarBorder, height: barHeight, paddingBottom: insets.bottom },
          ]}
        >
          {/* Extra dark scrim so icons pop over full-screen video */}
          {isDark && (
            <View style={styles.darkScrim} pointerEvents="none" />
          )}
          {barContent}
        </BlurView>
      ) : (
        <View
          style={[
            styles.bar,
            {
              backgroundColor: colors.tabBar,
              borderColor: colors.tabBarBorder,
              height: barHeight,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {barContent}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    height: BAR_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  barInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
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
    minWidth: 44,
    minHeight: 44,
  },
  tabInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createWrap: {
    marginHorizontal: 4,
  },
  createBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
});
