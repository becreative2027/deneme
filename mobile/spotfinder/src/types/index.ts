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
  districtName?: string;
  latitude?: number;
  longitude?: number;
  categoryId?: string;
  categoryName: string;
  labels: string[];
  averageRating: number;
  reviewCount: number;
  imageUrl?: string;
  trendScore?: number;
  parkingStatus?: string;
  menuUrl?: string;
  menuImageUrls?: string[];
  priceLevel?: number;
  venueType?: string;
  favoriteCount?: number;
  wishlistCount?: number;
}

export interface PlaceSearchRequest {
  query?: string;
  labelIds?: number[];
  matchMode?: 'ANY' | 'ALL';
  pageSize?: number;
  page?: number;
  langId?: number;
  priceLevels?: number[];
  venueTypes?: string[];
}

export interface PlaceSearchResponse {
  items: Place[];
  totalCount: number;
}

export interface FilterLabel {
  id: number;
  key: string;
  displayName: string;
}

export interface FilterCategory {
  id: number;
  key: string;
  displayName: string;
  labels: FilterLabel[];
}

export interface RecommendationItem {
  place: Place;
  score: number;
}

export interface RecommendationResponse {
  recommendations: RecommendationItem[];
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

export type ProfileStackParamList = {
  OwnProfile: undefined;
  PlaceDetail: { placeId: string };
  UserProfile: { userId: string };
  EditProfile: undefined;
};

export type WishlistStackParamList = {
  Wishlist: undefined;
  PlaceDetail: { placeId: string };
};

export type MainTabParamList = {
  FeedTab: NavigatorScreenParams<FeedStackParamList> | undefined;
  SearchTab: NavigatorScreenParams<SearchStackParamList> | undefined;
  CreatePost: undefined;
  WishlistTab: NavigatorScreenParams<WishlistStackParamList> | undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  UsernameSetup: undefined;
};
