import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlaceReviews, addOrUpdateReview, ReviewDto } from '../api/reviews';
import { getUserProfile } from '../api/users';
import { useAuthStore } from '../store/authStore';
import { Avatar } from './Avatar';

const PRIMARY = '#6c63ff';

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} gün önce`;
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= rating ? 'star' : 'star-outline'}
          size={size}
          color={s <= rating ? '#f59e0b' : '#d1d5db'}
        />
      ))}
    </View>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={s.starPicker}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)} activeOpacity={0.7} style={s.starBtn}>
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={36}
            color={star <= value ? '#f59e0b' : '#d1d5db'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ReviewCard({ review, isMe }: { review: ReviewDto; isMe: boolean }) {
  return (
    <View style={[s.reviewCard, isMe && s.reviewCardMe]}>
      <View style={s.reviewHeader}>
        <Avatar uri={review.avatarUrl} name={review.displayName} size={36} />
        <View style={s.reviewMeta}>
          <View style={s.reviewNameRow}>
            <Text style={s.reviewName}>{review.displayName}</Text>
            {isMe && <View style={s.meBadge}><Text style={s.meBadgeText}>Ben</Text></View>}
          </View>
          <Text style={s.reviewUsername}>@{review.username}</Text>
        </View>
      </View>
      <View style={s.reviewRatingRow}>
        <StarRow rating={review.rating} size={13} />
        <Text style={s.reviewTime}>{timeAgo(review.createdAt)}</Text>
      </View>
      {review.comment ? (
        <Text style={s.reviewComment}>{review.comment}</Text>
      ) : null}
    </View>
  );
}

function WriteForm({
  placeId,
  existing,
  onDone,
}: {
  placeId: string;
  existing?: ReviewDto;
  onDone: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');

  const mutation = useMutation({
    mutationFn: () =>
      addOrUpdateReview(placeId, {
        userId: user!.id,
        username: user!.username,
        displayName: user!.displayName,
        avatarUrl: user?.avatarUrl,
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['placeReviews', placeId] });
      qc.invalidateQueries({ queryKey: ['places', placeId] });
      onDone();
    },
  });

  return (
    <View style={s.writeForm}>
      <Text style={s.writeTitle}>{existing ? 'Değerlendirmeni Güncelle' : 'Değerlendir'}</Text>
      <StarPicker value={rating} onChange={setRating} />
      <TextInput
        style={s.commentInput}
        value={comment}
        onChangeText={setComment}
        placeholder="Yorumunu yaz... (isteğe bağlı)"
        placeholderTextColor="#aaa"
        multiline
        maxLength={500}
        textAlignVertical="top"
      />
      <Text style={s.charCount}>{comment.length}/500</Text>
      <TouchableOpacity
        style={[s.submitBtn, (rating === 0 || mutation.isPending) && s.submitBtnDisabled]}
        onPress={() => mutation.mutate()}
        disabled={rating === 0 || mutation.isPending}
        activeOpacity={0.8}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={s.submitBtnText}>{existing ? 'Güncelle' : 'Gönder'}</Text>
        )}
      </TouchableOpacity>
      {mutation.isError && (
        <Text style={s.errorText}>
          {(mutation.error as any)?.response?.data?.message ??
            (mutation.error as any)?.response?.data?.title ??
            (mutation.error as any)?.message ??
            'Bir hata oluştu, tekrar dene.'}
        </Text>
      )}
    </View>
  );
}

interface Props {
  placeId: string;
  visible: boolean;
  onClose: () => void;
}

export function ReviewsModal({ placeId, visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [writeOpen, setWriteOpen] = useState(false);

  const query = useQuery({
    queryKey: ['placeReviews', placeId],
    queryFn: async () => {
      const page = await getPlaceReviews(placeId);
      // Fill in missing user info for each review
      const enriched = await Promise.all(
        page.items.map(async (r) => {
          if (r.displayName && r.username) return r;
          // Match against current logged-in user first (no extra API call)
          if (r.userId === user?.id) {
            return {
              ...r,
              displayName: user.displayName || r.displayName,
              username: user.username || r.username,
              avatarUrl: r.avatarUrl ?? user.avatarUrl,
            };
          }
          // Otherwise fetch user profile
          try {
            const profile = await getUserProfile(r.userId);
            return {
              ...r,
              displayName: profile.displayName || r.userId,
              username: profile.username || r.userId,
              avatarUrl: r.avatarUrl ?? profile.avatarUrl,
            };
          } catch {
            return r;
          }
        }),
      );
      return { ...page, items: enriched };
    },
    staleTime: 30_000,
    enabled: visible,
  });

  const reviews = query.data?.items ?? [];
  const myReview = reviews.find((r) => r.userId === user?.id);
  const others = reviews.filter((r) => r.userId !== user?.id);
  const displayList = myReview ? [myReview, ...others] : others;

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[s.container, { paddingBottom: insets.bottom }]}>
          {/* Handle */}
          <View style={s.handleWrap}>
            <View style={s.handle} />
          </View>

          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.headerTitle}>Değerlendirmeler</Text>
              {reviews.length > 0 && (
                <View style={s.headerMeta}>
                  <Ionicons name="star" size={13} color="#f59e0b" />
                  <Text style={s.headerAvg}>{avgRating.toFixed(1)}</Text>
                  <Text style={s.headerCount}>· {reviews.length} değerlendirme</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          {/* List */}
          {query.isLoading ? (
            <View style={s.centered}>
              <ActivityIndicator color={PRIMARY} size="large" />
            </View>
          ) : (
            <FlatList
              data={displayList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ReviewCard review={item} isMe={item.userId === user?.id} />
              )}
              ListEmptyComponent={
                <View style={s.centered}>
                  <Ionicons name="star-outline" size={40} color="#ddd" />
                  <Text style={s.emptyText}>Henüz değerlendirme yok</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Write review */}
          {user && (
            writeOpen ? (
              <WriteForm
                placeId={placeId}
                existing={myReview}
                onDone={() => setWriteOpen(false)}
              />
            ) : (
              <View style={s.writeToggle}>
                <TouchableOpacity
                  style={s.writeToggleBtn}
                  onPress={() => setWriteOpen(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="pencil-outline" size={16} color={PRIMARY} />
                  <Text style={s.writeToggleBtnText}>
                    {myReview ? 'Değerlendirmeni Düzenle' : 'Değerlendir'}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fff' },
  centered:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 40 },

  handleWrap:   { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd' },

  header:       { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  headerTitle:  { fontSize: 16, fontWeight: '700', color: '#111' },
  headerMeta:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  headerAvg:    { fontSize: 14, fontWeight: '700', color: '#333' },
  headerCount:  { fontSize: 12, color: '#aaa' },
  closeBtn:     { padding: 4, marginTop: 2 },

  reviewCard:   { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0' },
  reviewCardMe: { backgroundColor: '#f5f3ff' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewMeta:   { flex: 1 },
  reviewNameRow:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  reviewName:   { fontSize: 14, fontWeight: '600', color: '#111' },
  meBadge:      { backgroundColor: '#ede9fe', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  meBadgeText:  { fontSize: 10, fontWeight: '700', color: PRIMARY },
  reviewUsername:{ fontSize: 12, color: '#888', marginTop: 1 },
  reviewRatingRow:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  reviewTime:   { fontSize: 12, color: '#aaa' },
  reviewComment:{ fontSize: 14, color: '#444', lineHeight: 20 },

  emptyText:    { fontSize: 14, color: '#aaa' },

  // Write form
  writeToggle:      { padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee' },
  writeToggleBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: PRIMARY },
  writeToggleBtnText:{ fontSize: 14, fontWeight: '700', color: PRIMARY },

  writeForm:    { padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee' },
  writeTitle:   { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 14 },
  starPicker:   { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 16 },
  starBtn:      { padding: 4 },
  commentInput: { borderWidth: 1.5, borderColor: '#e5e5e5', borderRadius: 12, padding: 12, fontSize: 14, color: '#111', minHeight: 90, marginBottom: 4 },
  charCount:    { fontSize: 11, color: '#aaa', textAlign: 'right', marginBottom: 12 },
  submitBtn:    { backgroundColor: PRIMARY, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText:{ fontSize: 14, fontWeight: '700', color: '#fff' },
  errorText:    { fontSize: 12, color: '#ef4444', textAlign: 'center', marginTop: 8 },
});
