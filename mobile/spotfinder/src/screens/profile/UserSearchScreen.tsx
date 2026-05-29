import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Keyboard,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ProfileStackParamList } from '../../types';
import { searchUsers, UserSearchResult } from '../../api/users';
import { useTheme, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'UserSearch'>;

export function UserSearchScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
    // Auto-focus input
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchUsers(trimmed);
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSearch(text), 320);
    },
    [doSearch],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  }, []);

  const handlePressUser = useCallback(
    (userId: string) => {
      Keyboard.dismiss();
      navigation.push('UserProfile', { userId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: UserSearchResult }) => (
      <TouchableOpacity
        style={[s.row, { borderBottomColor: colors.borderLight }]}
        onPress={() => handlePressUser(item.id)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={[s.avatarWrap, { backgroundColor: colors.surfaceElevated }]}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={s.avatar} />
          ) : (
            <View style={[s.avatarFallback, { backgroundColor: colors.accentSoft }]}>
              <Text style={[s.avatarInitial, { color: colors.accent }]}>
                {(item.displayName || item.username).charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={s.info}>
          <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]} numberOfLines={1}>
            {item.displayName || item.username}
          </Text>
          <Text style={[typography.caption, { color: colors.textTertiary, marginTop: 1 }]} numberOfLines={1}>
            @{item.username}
          </Text>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={16} color={colors.icon} />
      </TouchableOpacity>
    ),
    [colors, handlePressUser],
  );

  const emptyContent = searched && !loading ? (
    <View style={s.emptyWrap}>
      <View style={[s.emptyIcon, { backgroundColor: colors.surfaceElevated }]}>
        <Ionicons name="person-outline" size={28} color={colors.icon} />
      </View>
      <Text style={[typography.bodyDim, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' }]}>
        {t('userSearch.notFound', { query: query.trim() })}
      </Text>
    </View>
  ) : !searched ? (
    <View style={s.emptyWrap}>
      <View style={[s.emptyIcon, { backgroundColor: colors.surfaceElevated }]}>
        <Ionicons name="search-outline" size={28} color={colors.icon} />
      </View>
      <Text style={[typography.bodyDim, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' }]}>
        {t('userSearch.hint')}
      </Text>
    </View>
  ) : null;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* ── Header ── */}
        <View style={[s.header, { borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity
            onPress={() => { Keyboard.dismiss(); navigation.goBack(); }}
            style={[s.backBtn, { backgroundColor: colors.surfaceElevated }]}
            accessibilityRole="button"
            accessibilityLabel="Geri"
          >
            <Ionicons name="arrow-back" size={18} color={colors.text} />
          </TouchableOpacity>

          <Text style={[typography.titleM, { color: colors.text, flex: 1, marginLeft: spacing.md }]}>
            {t('userSearch.title')}
          </Text>
        </View>

        {/* ── Search input ── */}
        <View style={[s.searchWrap, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
          <View style={[
            s.searchBox,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.glassBorder,
            },
          ]}>
            <Ionicons name="search" size={18} color={colors.icon} style={{ marginLeft: spacing.md }} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={handleChangeText}
              placeholder={t('userSearch.placeholder')}
              placeholderTextColor={colors.textTertiary}
              style={[s.input, { color: colors.text }]}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginRight: spacing.md }} />
            ) : query.length > 0 ? (
              <TouchableOpacity onPress={handleClear} style={{ marginRight: spacing.md }}>
                <Ionicons name="close-circle" size={18} color={colors.icon} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* ── Results ── */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={emptyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={results.length === 0 ? { flex: 1 } : { paddingBottom: 40 }}
        />

      </Animated.View>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 46;

const s = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchWrap: {},
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 48,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
  },
  info: { flex: 1 },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
