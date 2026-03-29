export type UserRole = 'User' | 'PlaceOwner' | 'Admin' | 'SuperAdmin';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  ownedPlaceIds: string[];
}

export interface AuthState {
  token: string | null;
  user: AdminUser | null;
}

export interface PlaceTag { id: number; name: string; }

export interface Place {
  id: string;
  name: string;
  cityName?: string;
  districtName?: string;
  cityId?: number;
  districtId?: number;
  rating?: number;
  favoriteCount?: number;
  wishlistCount?: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
  parkingStatus?: string;
  isDeleted: boolean;
  labels?: PlaceTag[];
}

export interface PlaceLabel {
  labelId: number;
  key: string;
  displayName: string;
  weight: number;
}

export interface Label {
  id: number;
  key: string;
  categoryId: number;
  categoryName?: string;
  isActive: boolean;
  translations?: { languageId: number; displayName: string }[];
}

export interface Category {
  id: number;
  key: string;
  displayName: string;
  labels: Label[];
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

export interface Review {
  id: string;
  placeId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface City {
  id: number;
  name: string;
  countryId: number;
}

export interface District {
  id: number;
  name: string;
  cityId: number;
}

export interface RuntimeConfig {
  key: string;
  value: string;
  updatedAt: string;
  changedBy: string;
}

export interface FeatureFlag {
  key: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  target?: string;
  updatedAt: string;
}

export interface PlaceOwnershipEntry {
  userId: string;
  placeId: string;
  grantedAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Decodes a JWT payload without verifying the signature (client-side only). */
export function decodeJwt(token: string): Record<string, unknown> {
  const [, payload] = token.split('.');
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = atob(base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '='));
  return JSON.parse(json);
}

export function parseAdminUser(token: string): AdminUser {
  const payload = decodeJwt(token);
  const role = (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    payload.role) as string;
  const ownedRaw = (payload['owned_places'] as string | undefined) ?? '';
  return {
    id: payload.sub as string,
    email: payload.email as string,
    role: role as UserRole,
    ownedPlaceIds: ownedRaw ? ownedRaw.split(',').filter(Boolean) : [],
  };
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'Admin' || role === 'SuperAdmin';
}
