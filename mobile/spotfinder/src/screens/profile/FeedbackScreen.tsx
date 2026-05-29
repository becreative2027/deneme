import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ProfileStackParamList } from '../../types';
import { submitFeedback, FeedbackCategory } from '../../api/feedback';
import { useToast } from '../../components/Toast';
import { useTheme, spacing, typography } from '../../theme';
import { GlassCard, AmberButton, AmberInput } from '../../components/ui';

type Props = { navigation: NativeStackNavigationProp<ProfileStackParamList, 'Feedback'> };

const CATEGORY_ICONS: Record<FeedbackCategory, string> = {
  PlaceRequest: 'location-outline',
  LabelRequest: 'pricetag-outline',
  BugReport: 'bug-outline',
  FeatureRequest: 'bulb-outline',
  Other: 'chatbubble-outline',
};

export function FeedbackScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<FeedbackCategory>('PlaceRequest');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const { showToast } = useToast();

  const CATEGORIES: { key: FeedbackCategory; label: string; icon: string; description: string }[] = [
    { key: 'PlaceRequest', label: t('feedback.categories.PlaceRequest.label'), icon: CATEGORY_ICONS.PlaceRequest, description: t('feedback.categories.PlaceRequest.description') },
    { key: 'BugReport', label: t('feedback.categories.BugReport.label'), icon: CATEGORY_ICONS.BugReport, description: t('feedback.categories.BugReport.description') },
    { key: 'FeatureRequest', label: t('feedback.categories.FeatureRequest.label'), icon: CATEGORY_ICONS.FeatureRequest, description: t('feedback.categories.FeatureRequest.description') },
    { key: 'Other', label: t('feedback.categories.Other.label'), icon: CATEGORY_ICONS.Other, description: t('feedback.categories.Other.description') },
  ];

  async function handleSubmit() {
    if (!message.trim()) {
      showToast(t('feedback.messageRequired'), 'warning');
      return;
    }
    if (message.trim().length < 10) {
      showToast(t('feedback.messageTooShort'), 'warning');
      return;
    }
    setLoading(true);
    try {
      await submitFeedback(selected, message.trim());
      showToast(t('feedback.success'), 'success');
      navigation.goBack();
    } catch {
      showToast(t('feedback.error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.titleM, { color: colors.text }]}>{t('feedback.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[typography.bodyDim, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
            {t('feedback.selectCategory')}
          </Text>

          {/* Category selector */}
          <View style={styles.categories}>
            {CATEGORIES.map((cat) => {
              const isSelected = selected === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setSelected(cat.key)}
                  activeOpacity={0.7}
                  style={[
                    styles.catCard,
                    {
                      backgroundColor: isSelected ? colors.accent + '18' : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.catIcon, { backgroundColor: isSelected ? colors.accent + '22' : colors.background }]}>
                    <Ionicons
                      name={cat.icon as any}
                      size={20}
                      color={isSelected ? colors.accent : colors.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.catLabel, { color: isSelected ? colors.accent : colors.text }]}>
                      {cat.label}
                    </Text>
                    <Text style={[styles.catDesc, { color: colors.textTertiary }]} numberOfLines={1}>
                      {cat.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[typography.bodyDim, { color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.xl }]}>
            {t('feedback.message')}
          </Text>

          <GlassCard strong style={styles.inputCard}>
            <AmberInput
              icon="create-outline"
              eyebrow={selected === 'PlaceRequest' ? t('feedback.eyebrowPlaceRequest') : t('feedback.eyebrowOther')}
              placeholder={
                selected === 'PlaceRequest'
                  ? t('feedback.placeholderPlaceRequest')
                  : t('feedback.placeholderOther')
              }
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              style={{ minHeight: 120 }}
            />
          </GlassCard>

          <AmberButton
            label={t('feedback.submit')}
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: spacing.lg }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  inner: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 40,
  },
  categories: { gap: spacing.sm },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: { fontSize: 14, fontWeight: '600' },
  catDesc: { fontSize: 12, marginTop: 2 },
  inputCard: { overflow: 'hidden' },
});
