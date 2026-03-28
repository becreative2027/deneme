export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  placeId: string;
  placeName: string;
  placeCity: string;
  caption?: string;
  imageUrl?: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Place {
  id: string;
  name: string;
  categoryName: string;
  city: string;
  country: string;
  address: string;
  imageUrl?: string;
  averageRating: number;
  reviewCount: number;
  description?: string;
  labels: string[];
  trendScore?: number;
  parkingStatus?: string;
  menuUrl?: string;
  menuImageUrls?: string[];
  districtName?: string;
  latitude?: number;
  longitude?: number;
  favoriteCount?: number;
  wishlistCount?: number;
}

export interface FeedPage {
  items: Post[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface PlaceSearchResponse {
  items: Place[];
  totalCount: number;
}

export interface RecommendationItem {
  place: Place;
  score: number;
  reason?: string;
}

export interface RecommendationResponse {
  recommendations: RecommendationItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  message?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  displayName: string;
  password: string;
}

export interface CreatePostRequest {
  placeId: string;
  caption?: string;
  imageUrl?: string;
}

export interface PlaceSearchRequest {
  query?: string;
  labelIds?: number[];
  matchMode?: 'ANY' | 'ALL';
  pageSize?: number;
  page?: number;
  langId?: number;
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
