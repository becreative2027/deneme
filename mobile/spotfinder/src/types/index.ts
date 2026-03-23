// ── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfile;
}

// ── User / Profile ────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

// ── Place ─────────────────────────────────────────────────────────────────────

export interface Place {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  categoryName: string;
  labels: string[];
  averageRating: number;
  reviewCount: number;
  imageUrl?: string;
  trendScore?: number;
}

export interface PlaceSearchRequest {
  query?: string;
  categoryId?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
}

export interface PlaceSearchResponse {
  items: Place[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface PlaceRecommendation {
  place: Place;
  score: number;
  reasons: string[];
}

export interface RecommendationResponse {
  recommendations: PlaceRecommendation[];
  userId: string;
  generatedAt: string;
  debugInfo?: unknown;
}

// ── Post ──────────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  placeId: string;
  placeName: string;
  placeCity: string;
  imageUrl?: string;
  caption?: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface CreatePostRequest {
  placeId: string;
  caption?: string;
  /** Phase 8.1: direct base64 upload (fallback) */
  imageBase64?: string;
  /** Phase 8.2: CDN URL after presigned upload (preferred) */
  imageUrl?: string;
}

// ── Feed ──────────────────────────────────────────────────────────────────────

export interface FeedPage {
  items: Post[];
  cursor?: string;
  hasNextPage: boolean;
}

// ── API wrapper ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// ── Navigation types ─────────────────────────────────────────────────────────
// NavigatorScreenParams enables typed nested navigation (e.g. from notification handlers).

import type { NavigatorScreenParams } from '@react-navigation/native';

export type FeedStackParamList = {
  Feed: undefined;
  PlaceDetail: { placeId: string };
  UserProfile: { userId: string };
};

export type SearchStackParamList = {
  Search: undefined;
  PlaceDetail: { placeId: string };
};

export type MainTabParamList = {
  FeedTab: NavigatorScreenParams<FeedStackParamList> | undefined;
  SearchTab: NavigatorScreenParams<SearchStackParamList> | undefined;
  CreatePost: undefined;
  ProfileTab: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
};
