import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { useMe, useUpdateProfile } from '../../hooks/useProfile';
import { uploadImage } from '../../api/upload';
import { useToast } from '../../components/Toast';
import { AvatarRing, AmberButton, AmberInput } from '../../components/ui';
import { useTheme, radius, spacing, typography, shadow } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const meQuery = useMe();
  const profile = meQuery.data;

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(profile?.avatarUrl);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const updateMutation = useUpdateProfile();

  const handlePickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Fotoğraf seçmek için galeri erişimine izin verin.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setAvatarChanged(true);
    }
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      showToast('Ad soyad boş olamaz.', 'error');
      return;
    }

    try {
      let newAvatarUrl: string | undefined;

      if (avatarChanged && avatarUri) {
        setIsUploadingAvatar(true);
        try {
          newAvatarUrl = await uploadImage(avatarUri);
        } catch {
          showToast('Fotoğraf yüklenemedi.', 'error');
          return;
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      await updateMutation.mutateAsync({
        displayName: trimmedName,
        bio: bio.trim() || undefined,
        ...(newAvatarUrl ? { avatarUrl: newAvatarUrl } : {}),
      });

      showToast('Profil güncellendi.', 'success');
      navigation.goBack();
    } catch {
      showToast('Bir hata oluştu, tekrar dene.', 'error');
    }
  }, [displayName, bio, avatarUri, avatarChanged, updateMutation, showToast, navigation]);

  const isSaving = updateMutation.isPending || isUploadingAvatar;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Geri"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.titleM, { color: colors.text }]}>Profili Düzenle</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={s.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Kaydet"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text style={[typography.body, { color: colors.accent, fontWeight: '700' }]}>
              Kaydet
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={s.avatarSection}>
            <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8} style={s.avatarWrap}>
              <AvatarRing uri={avatarUri} size={96} />
              <View style={[s.cameraOverlay, { backgroundColor: colors.accent }]}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={[typography.caption, { color: colors.textTertiary, marginTop: spacing.sm }]}>
              Fotoğrafı değiştirmek için dokun
            </Text>
          </View>

          {/* Fields */}
          <View style={[s.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight }]}>
            {/* Username — read-only */}
            <View style={s.readOnlyRow}>
              <View style={[s.iconBadge, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <Ionicons name="at" size={17} color={colors.textSecondary} />
              </View>
              <View style={s.readOnlyText}>
                <Text style={[typography.eyebrow, { color: colors.textTertiary }]}>Kullanıcı adı</Text>
                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  @{profile?.username ?? ''}
                </Text>
              </View>
              <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
            </View>

            <View style={[s.divider, { backgroundColor: colors.borderLight }]} />

            {/* Display name */}
            <AmberInput
              icon="person-outline"
              eyebrow="Ad Soyad"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Adın ve soyadın"
              maxLength={60}
              returnKeyType="next"
              autoCorrect={false}
            />

            <View style={[s.divider, { backgroundColor: colors.borderLight }]} />

            {/* Bio */}
            <AmberInput
              icon="pencil-outline"
              eyebrow="Hakkında"
              value={bio}
              onChangeText={setBio}
              placeholder="Kendini kısaca tanıt..."
              maxLength={160}
              multiline
              numberOfLines={4}
              returnKeyType="done"
              containerStyle={{ alignItems: 'flex-start', paddingTop: spacing.md }}
            />
            <Text style={[s.charCount, { color: colors.textMuted }]}>
              {bio.length}/160
            </Text>
          </View>

          {/* Save button */}
          <AmberButton
            label={isSaving ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}
            variant="primary"
            onPress={handleSave}
            loading={isSaving}
            style={{ marginTop: spacing.xl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    minWidth: 60,
    alignItems: 'center',
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 60,
  },

  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarWrap: {
    position: 'relative',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  readOnlyText: { flex: 1 },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.md,
  },

  charCount: {
    textAlign: 'right',
    fontSize: 11,
    paddingRight: spacing.md,
    paddingBottom: spacing.sm,
  },
});
