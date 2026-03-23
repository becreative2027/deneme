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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useCreatePost } from '../../hooks/usePosts';
import { usePlaceSearch } from '../../hooks/usePlaces';
import { useToast } from '../../components/Toast';
import { useAnalytics } from '../../hooks/useAnalytics';
import { processImageForUpload } from '../../utils/imageUtils';
import { uploadImage } from '../../api/upload';
import { haptic } from '../../utils/haptics';
import { UploadProgressBar } from '../../components/UploadProgressBar';
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

  // Phase 8.1: prevent double-submit with a ref (faster than state)
  const isSubmittingRef = useRef(false);

  const createMutation = useCreatePost();
  const searchQuery = usePlaceSearch({ query: placeSearch, pageSize: 10 }, placeSearch.length > 1);
  const { showToast } = useToast();
  const { trackScreen, trackEvent } = useAnalytics();

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

  // ── Phase 8.2: pick + compress image ─────────────────────────────────────────

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Camera roll access is required to attach photos.', 'error');
      haptic.warning();
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,          // pick at full quality; we compress in processImageForUpload
    });

    if (!result.canceled && result.assets[0]) {
      try {
        setIsUploading(true);
        // Resize + compress to max 1080px / 0.7 quality
        const processed = await processImageForUpload(result.assets[0].uri);
        setImageUri(processed.uri);
        haptic.light();
      } catch {
        showToast('Could not process the selected image.', 'error');
        haptic.error();
      } finally {
        setIsUploading(false);
      }
    }
  }, [showToast]);

  // ── Phase 8.2: CDN upload + post create ───────────────────────────────────────

  const handlePost = useCallback(async () => {
    if (isSubmittingRef.current) return;

    if (!selectedPlace) {
      showToast('Select a place before posting.', 'warning');
      haptic.warning();
      return;
    }

    isSubmittingRef.current = true;

    try {
      // Phase 8.2: upload image to CDN first, then create post with URL
      let imageUrl: string | undefined;
      if (imageUri) {
        setIsUploading(true);
        setUploadProgress(0);
        try {
          // Phase 8.3: XHR upload with real-time progress reporting
          imageUrl = await uploadImage(imageUri, (fraction) => {
            setUploadProgress(fraction);
          });
        } catch {
          showToast('Image upload failed. Post will be shared without photo.', 'warning');
          haptic.warning();
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      }

      createMutation.mutate(
        {
          placeId: selectedPlace.id,
          caption: caption.trim() || undefined,
          // imageUrl takes precedence over base64 when CDN upload succeeded
          ...(imageUrl ? { imageUrl } : {}),
        },
        {
          onSuccess: () => {
            trackEvent('post_create', { placeId: selectedPlace.id });
            showToast('Post shared!', 'success');
            haptic.success();
            resetForm();
          },
          onError: (err: any) => {
            showToast(err.message ?? 'Post failed. Please try again.', 'error');
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
                <Image source={{ uri: imageUri }} style={styles.preview} />
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
            style={[styles.submitBtn, (!selectedPlace || isLoading) && styles.btnDisabled]}
            onPress={handlePost}
            disabled={isLoading || !selectedPlace}
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
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
  },
  preview: { width: '100%', height: '100%' },
  changePhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  changePhotoText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
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
