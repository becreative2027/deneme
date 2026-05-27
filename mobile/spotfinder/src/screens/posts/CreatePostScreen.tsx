import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActionSheetIOS,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../types';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useCreatePost } from '../../hooks/usePosts';
import { useRatingPrompt } from '../../hooks/useRatingPrompt';
import { usePlaceSearch } from '../../hooks/usePlaces';
import { useToast } from '../../components/Toast';
import { useAnalytics } from '../../hooks/useAnalytics';
import { processImageForUpload } from '../../utils/imageUtils';
import { uploadImage } from '../../api/upload';
import { attachPostMedia } from '../../api/posts';
import { haptic } from '../../utils/haptics';
import { UploadProgressBar } from '../../components/UploadProgressBar';
import { CropModal } from '../../components/CropModal';
import { Place } from '../../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasUnsavedChanges(
  caption: string,
  imageUri: string | null,
  selectedPlace: Place | null,
): boolean {
  return !!(caption.trim() || imageUri || selectedPlace);
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function CreatePostScreen() {
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [placeSearch, setPlaceSearch] = useState('');
  const [showPlacePicker, setShowPlacePicker] = useState(false);
  // Phase 8.3: upload progress fraction 0–1 for UploadProgressBar
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [cropPendingUri, setCropPendingUri] = useState<string | null>(null);

  // Phase 8.1: prevent double-submit with a ref (faster than state)
  const isSubmittingRef = useRef(false);

  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const createMutation = useCreatePost();
  const searchQuery = usePlaceSearch({ query: placeSearch, pageSize: 10 }, placeSearch.length > 1);
  const { showToast } = useToast();
  const { trackScreen, trackEvent } = useAnalytics();
  const { trackAction } = useRatingPrompt();

  useEffect(() => {
    trackScreen('CreatePostScreen');
  }, []);

  // ── Phase 8.1: Unsaved-changes guard (Android back button) ──────────────────
  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (hasUnsavedChanges(caption, imageUri, selectedPlace)) {
          Alert.alert(
            'Discard changes?',
            'You have unsaved content. Are you sure you want to leave?',
            [
              { text: 'Keep editing', style: 'cancel' },
              { text: 'Discard', style: 'destructive', onPress: resetForm },
            ],
          );
          return true;
        }
        return false;
      };

      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [caption, imageUri, selectedPlace]),
  );

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function resetForm() {
    setCaption('');
    setImageUri(null);
    setSelectedPlace(null);
    setPlaceSearch('');
    setShowPlacePicker(false);
    setIsUploading(false);
    setUploadProgress(0);
    isSubmittingRef.current = false;
  }

  // ── Image pick / capture ──────────────────────────────────────────────────────

  const processAndSet = useCallback(async (uri: string) => {
    try {
      setIsUploading(true);
      const processed = await processImageForUpload(uri);
      setImageUri(processed.uri);
      haptic.light();
    } catch {
      showToast('Fotoğraf işlenemedi.', 'error');
      haptic.error();
    } finally {
      setIsUploading(false);
    }
  }, [showToast]);

  const launchCamera = useCallback(async () => {
    const available = await ImagePicker.getCameraPermissionsAsync()
      .then(() => true)
      .catch(() => false);

    if (!available) {
      showToast('Bu cihazda kamera kullanılamıyor.', 'error');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showToast('Kamera erişimi gerekiyor.', 'error');
      haptic.warning();
      return;
    }

    let result;
    try {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
    } catch {
      showToast('Kamera açılamadı.', 'error');
      return;
    }

    if (!result.canceled && result.assets[0]) {
      setCropPendingUri(result.assets[0].uri);
    }
  }, [showToast]);

  const launchGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Galeri erişimi gerekiyor.', 'error');
      haptic.warning();
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setCropPendingUri(result.assets[0].uri);
    }
  }, [showToast]);

  const pickImage = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['İptal', 'Kameradan Çek', 'Galeriden Seç'],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) launchCamera();
          if (idx === 2) launchGallery();
        },
      );
    } else {
      Alert.alert('Fotoğraf Ekle', '', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kameradan Çek', onPress: launchCamera },
        { text: 'Galeriden Seç', onPress: launchGallery },
      ]);
    }
  }, [launchCamera, launchGallery]);

  // ── Phase 8.2: CDN upload + post create ───────────────────────────────────────

  const handlePost = useCallback(async () => {
    if (isSubmittingRef.current) return;

    if (!imageUri) {
      showToast('Gönderi için fotoğraf zorunludur.', 'warning');
      haptic.warning();
      return;
    }

    if (!selectedPlace) {
      showToast('Mekan seçmeden gönderi paylaşamazsın.', 'warning');
      haptic.warning();
      return;
    }

    isSubmittingRef.current = true;

    try {
      // Step 1: Upload image to Cloudinary (0% → 60%)
      let imageUrl: string | undefined;
      if (imageUri) {
        setIsUploading(true);
        setUploadProgress(0);
        try {
          imageUrl = await uploadImage(imageUri, (fraction) => {
            setUploadProgress(fraction * 0.6);
          });
          setUploadProgress(0.6);
        } catch (err: any) {
          console.warn('[Upload error]', err?.message ?? err);
          showToast('Fotoğraf yüklenemedi. Gönderi fotoğrafsız paylaşılacak.', 'warning');
          haptic.warning();
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      }

      // Step 2: Create post record (without imageUrl in body — mirrors web flow)
      setUploadProgress(0.7);
      createMutation.mutate(
        {
          placeId: selectedPlace.id,
          caption: caption.trim() || undefined,
        },
        {
          onSuccess: async (postId: string) => {
            try {
              // Step 3: Attach Cloudinary URL to the post
              if (imageUrl && postId) {
                setUploadProgress(0.85);
                await attachPostMedia(postId, imageUrl);
                setUploadProgress(1);
              }
            } catch {
              // Image attachment failed but post exists — acceptable
            }
            trackEvent('post_create', { placeId: selectedPlace.id });
            trackAction();
            showToast('Gönderi paylaşıldı!', 'success');
            haptic.success();
            const sharedPlaceId = selectedPlace.id;
            resetForm();
            navigation.navigate('FeedTab', {
              screen: 'PlaceDetail',
              params: { placeId: sharedPlaceId },
            } as any);
          },
          onError: (err: any) => {
            showToast(err.message ?? 'Gönderi paylaşılamadı. Tekrar dene.', 'error');
            haptic.error();
            isSubmittingRef.current = false;
          },
        },
      );
    } catch {
      isSubmittingRef.current = false;
    }
  }, [selectedPlace, caption, imageUri, createMutation, showToast, trackEvent]);

  // ── Derived ───────────────────────────────────────────────────────────────────

  const isLoading = createMutation.isPending || isUploading;
  const isDirty = hasUnsavedChanges(caption, imageUri, selectedPlace);
  const captionNearLimit = caption.length > 450;

  const submitLabel = isUploading
    ? 'Uploading…'
    : createMutation.isPending
      ? 'Sharing…'
      : 'Share Post';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.heading}>New Post</Text>
            {isDirty && (
              <TouchableOpacity onPress={resetForm}>
                <Text style={styles.discardBtn}>Discard</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Photo picker */}
          <TouchableOpacity
            style={styles.photoPicker}
            onPress={pickImage}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isUploading && !createMutation.isPending ? (
              <View style={styles.photoPlaceholder}>
                <ActivityIndicator color="#6c63ff" size="large" />
                <Text style={styles.photoHint}>Processing…</Text>
              </View>
            ) : imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
                <View style={styles.changePhotoOverlay}>
                  <Ionicons name="camera" size={20} color="#fff" />
                  <Text style={styles.changePhotoText}>Change</Text>
                </View>
              </>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={36} color="#aaa" />
                <Text style={styles.photoHint}>Tap to add a photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Caption */}
          <TextInput
            style={[styles.captionInput, isLoading && styles.inputDisabled]}
            placeholder="Write a caption…"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
            placeholderTextColor="#bbb"
            editable={!isLoading}
          />
          <Text style={[styles.charCount, captionNearLimit && styles.charCountWarning]}>
            {caption.length}/500
          </Text>

          {/* Place selector */}
          <TouchableOpacity
            style={[
              styles.placeSelector,
              !selectedPlace && styles.placeSelectorEmpty,
              isLoading && styles.inputDisabled,
            ]}
            onPress={() => {
              if (!isLoading) {
                setShowPlacePicker((v) => !v);
                haptic.light();
              }
            }}
          >
            <Ionicons
              name="location-outline"
              size={18}
              color={selectedPlace ? '#6c63ff' : '#bbb'}
            />
            <Text style={[styles.placeSelectorText, !selectedPlace && styles.placePlaceholder]}>
              {selectedPlace ? selectedPlace.name : 'Select a place *'}
            </Text>
            {selectedPlace && (
              <TouchableOpacity hitSlop={8} onPress={() => setSelectedPlace(null)}>
                <Ionicons name="close-circle" size={16} color="#aaa" />
              </TouchableOpacity>
            )}
            <Ionicons
              name={showPlacePicker ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#ccc"
            />
          </TouchableOpacity>

          {showPlacePicker && (
            <View style={styles.placeDropdown}>
              <TextInput
                style={styles.placeSearchInput}
                placeholder="Search places…"
                value={placeSearch}
                onChangeText={setPlaceSearch}
                placeholderTextColor="#bbb"
                autoFocus
              />
              {searchQuery.isLoading && placeSearch.length > 1 ? (
                <ActivityIndicator color="#6c63ff" style={{ padding: 12 }} />
              ) : (searchQuery.data?.items ?? []).length === 0 && placeSearch.length > 1 ? (
                <Text style={styles.noResults}>No places found</Text>
              ) : (
                (searchQuery.data?.items ?? []).map((place) => (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.placeOption}
                    onPress={() => {
                      setSelectedPlace(place);
                      setShowPlacePicker(false);
                      setPlaceSearch('');
                      haptic.light();
                    }}
                  >
                    <Text style={styles.placeOptionName}>{place.name}</Text>
                    <Text style={styles.placeOptionCity}>{place.city}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Phase 8.3: Upload progress bar */}
          <UploadProgressBar progress={uploadProgress} visible={isUploading} />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, (!selectedPlace || !imageUri || isLoading) && styles.btnDisabled]}
            onPress={handlePost}
            disabled={isLoading || !selectedPlace || !imageUri}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <View style={styles.submitLoading}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitText}>{submitLabel}</Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Share Post</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom crop modal */}
      {cropPendingUri ? (
        <CropModal
          uri={cropPendingUri}
          visible
          onCancel={() => setCropPendingUri(null)}
          onCrop={(croppedUri) => {
            setCropPendingUri(null);
            processAndSet(croppedUri);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 20, paddingBottom: 40 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heading: { fontSize: 22, fontWeight: '800', color: '#1a1a2e' },
  discardBtn: { fontSize: 14, color: '#e74c3c', fontWeight: '600' },

  photoPicker: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
  },
  preview: { width: '100%', minHeight: 200, maxHeight: 500 },
  changePhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  changePhotoText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  photoPlaceholder: { flex: 1, minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoHint: { fontSize: 14, color: '#aaa' },

  captionInput: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  inputDisabled: { opacity: 0.5 },
  charCount: { fontSize: 11, color: '#ccc', textAlign: 'right', marginTop: 4, marginBottom: 14 },
  charCountWarning: { color: '#e74c3c' },

  placeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    backgroundColor: '#fafafa',
  },
  placeSelectorEmpty: { borderStyle: 'dashed', borderColor: '#d0d0d0' },
  placeSelectorText: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },
  placePlaceholder: { color: '#bbb', fontWeight: '400' },

  placeDropdown: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  placeSearchInput: {
    padding: 12,
    fontSize: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    color: '#333',
  },
  placeOption: {
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  placeOptionName: { fontSize: 14, fontWeight: '600', color: '#333' },
  placeOptionCity: { fontSize: 12, color: '#888', marginTop: 2 },
  noResults: { padding: 14, fontSize: 13, color: '#aaa', textAlign: 'center' },

  submitBtn: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: { opacity: 0.45 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  submitLoading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
