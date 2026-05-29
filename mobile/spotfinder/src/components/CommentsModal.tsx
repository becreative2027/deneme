import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Avatar } from './Avatar';
import { formatRelativeTime } from '../utils/formatters';
import { getPostComments, createComment, PostComment } from '../api/posts';

const PRIMARY = '#6c63ff';

interface Props {
  visible: boolean;
  onClose: () => void;
  postId: string;
  onCommentAdded?: () => void;
  onPressUser?: (userId: string) => void;
}

export function CommentsModal({ visible, onClose, postId, onCommentAdded, onPressUser }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading]   = useState(false);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const inputRef = useRef<TextInput>(null);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const data = await getPostComments(postId);
      setComments(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (visible) load();
    else { setComments([]); setText(''); }
  }, [visible, load]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await createComment(postId, trimmed);
      setText('');
      onCommentAdded?.();
      await load();
    } catch {
      Alert.alert(t('comments.errorTitle'), t('comments.sendError'));
    } finally {
      setSending(false);
    }
  };

  const renderComment = useCallback(({ item }: { item: PostComment }) => (
    <View style={s.commentRow}>
      <Avatar
        uri={item.avatarUrl}
        name={item.displayName ?? item.username}
        size={32}
        onPress={item.userId ? () => onPressUser?.(item.userId!) : undefined}
      />
      <View style={s.commentBody}>
        <View style={s.commentHeader}>
          <Text style={s.commentName}>{item.displayName ?? item.username}</Text>
          <Text style={s.commentTime}>{formatRelativeTime(item.createdAt)}</Text>
        </View>
        <Text style={s.commentText}>{item.text}</Text>
      </View>
    </View>
  ), []);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={s.backdrop} onPress={onClose} activeOpacity={1} />

        <View style={[s.sheet, { paddingBottom: insets.bottom + 8 }]}>
          {/* Handle */}
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerTitle}>{t('comments.title')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close-circle" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>

          {/* List */}
          {loading ? (
            <View style={s.center}>
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : comments.length === 0 ? (
            <View style={s.center}>
              <Ionicons name="chatbubble-outline" size={36} color="#ddd" />
              <Text style={s.emptyText}>{t('comments.empty')}</Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 380 }}
            />
          )}

          {/* Input */}
          <View style={s.inputRow}>
            <TextInput
              ref={inputRef}
              style={s.input}
              placeholder={t('comments.placeholder')}
              placeholderTextColor="#bbb"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[s.sendBtn, (!text.trim() || sending) && s.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || sending}
              activeOpacity={0.8}
            >
              {sending
                ? <ActivityIndicator color="#fff" size="small" />
                : <Ionicons name="send" size={16} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },

  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 20,
  },

  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#e0e0e0', alignSelf: 'center', marginBottom: 12,
  },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 8,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111' },

  center: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 13, color: '#aaa', textAlign: 'center' },

  listContent: { paddingHorizontal: 16, paddingBottom: 8 },

  commentRow: {
    flexDirection: 'row', gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f2f2f2',
  },
  commentBody:   { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  commentName:   { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  commentTime:   { fontSize: 11, color: '#bbb' },
  commentText:   { fontSize: 14, color: '#333', lineHeight: 20 },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    borderWidth: 1, borderColor: '#e8e8e8', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 14, color: '#333', maxHeight: 100,
    backgroundColor: '#fafafa',
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
