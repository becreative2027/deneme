import { adminClient } from './adminClient';
import type { PagedResult, Place, FilterCategory, Review } from '@/lib/types';

// ── Places ────────────────────────────────────────────────────────────────

export async function getPlaces(page = 1, pageSize = 20): Promise<PagedResult<Place>> {
  const { data } = await adminClient.post('/api/places/search', {
    languageId: 1,
    page,
    pageSize,
  });
  // SearchPlaces response: { data: { items, totalCount } } or { items, totalCount }
  const inner = data?.data ?? data;
  const rawItems: any[] = inner?.items ?? inner?.places ?? [];
  return {
    items: rawItems.map((p: any) => ({
      id: p.id,
      name: p.name ?? '—',
      cityName: p.cityName,
      districtName: p.districtName,
      cityId: p.cityId,
      districtId: p.districtId,
      rating: p.rating,
      latitude: p.latitude,
      longitude: p.longitude,
      parkingStatus: p.parkingStatus,
      isDeleted: p.isDeleted ?? false,
      labels: Array.isArray(p.labels)
        ? p.labels.map((l: any) => ({ id: l.id, name: l.name }))
        : [],
    })),
    totalCount: inner?.totalCount ?? inner?.total ?? 0,
    page,
    pageSize,
  };
}

export async function getPlaceDetail(placeId: string) {
  const { data } = await adminClient.get(`/api/places/${placeId}`);
  return data;
}

export interface AdminCreatePlaceInput {
  cityId?: number;
  districtId?: number;
  latitude?: number;
  longitude?: number;
  parkingStatus?: string;
  name: string;
  languageId?: number;
  // Media — applied via updatePlaceMedia after creation
  coverImageUrl?: string;
  menuUrl?: string;
  menuImageUrls?: string[];
}

export async function createPlaceAdmin(input: AdminCreatePlaceInput): Promise<string> {
  const body = {
    cityId: input.cityId,
    districtId: input.districtId,
    latitude: input.latitude,
    longitude: input.longitude,
    parkingStatus: input.parkingStatus ?? 'unavailable',
    translations: [{ languageId: input.languageId ?? 1, name: input.name }],
  };
  const { data } = await adminClient.post('/api/admin/places', body);
  return data?.data ?? data;
}

export interface AdminUpdatePlaceInput {
  cityId?: number;
  districtId?: number;
  latitude?: number;
  longitude?: number;
  parkingStatus?: string;
}

export async function updatePlaceAdmin(placeId: string, input: AdminUpdatePlaceInput): Promise<void> {
  await adminClient.put(`/api/admin/places/${placeId}`, input);
}

export async function deletePlaceAdmin(placeId: string): Promise<void> {
  await adminClient.delete(`/api/admin/places/${placeId}`);
}

// ── Reviews ────────────────────────────────────────────────────────────────

export async function getPlaceReviews(placeId: string, page = 1, pageSize = 20) {
  const { data } = await adminClient.get(`/api/places/${placeId}/reviews`, { params: { page, pageSize } });
  return data;
}

export async function deleteReviewAdmin(placeId: string, reviewId: string): Promise<void> {
  await adminClient.delete(`/api/places/${placeId}/reviews/${reviewId}`);
}

// ── Labels ────────────────────────────────────────────────────────────────

export async function getFilters(langId = 1): Promise<{ categories: FilterCategory[] }> {
  const { data } = await adminClient.get('/api/filters', { params: { langId } });
  return data?.data ?? data;
}

export interface CreateLabelInput {
  categoryId: number;
  key: string;
  displayNameTr: string;
  displayNameEn: string;
}

export async function createLabelAdmin(input: CreateLabelInput): Promise<number> {
  const body = {
    categoryId: input.categoryId,
    key: input.key,
    translations: [
      { languageId: 1, displayName: input.displayNameTr },
      { languageId: 2, displayName: input.displayNameEn },
    ],
  };
  const { data } = await adminClient.post('/api/admin/labels', body);
  return data?.data ?? data;
}

export async function updateLabelAdmin(labelId: number, key?: string, isActive?: boolean): Promise<void> {
  await adminClient.put(`/api/admin/labels/${labelId}`, { key, isActive });
}

export async function assignLabelToPlace(labelId: number, placeId: string, weight = 1.0): Promise<void> {
  await adminClient.post(`/api/admin/labels/${labelId}/places/${placeId}`, { weight });
}

// ── Users ─────────────────────────────────────────────────────────────────

export interface AdminUserRow {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export async function searchUsers(q: string, page = 1, pageSize = 20) {
  const { data } = await adminClient.get('/api/users/search', { params: { q, page, pageSize } });
  // Response: { users: [...], totalCount, page, pageSize } — normalize to { items, totalCount }
  return {
    items: data?.users ?? data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
  };
}

export async function setUserRole(userId: string, role: number): Promise<void> {
  await adminClient.put(`/api/users/${userId}/role`, { role });
}

// ── Ownership ─────────────────────────────────────────────────────────────

export async function grantOwnership(userId: string, placeId: string): Promise<void> {
  await adminClient.post('/api/users/ownership', { userId, placeId });
}

export async function revokeOwnership(userId: string, placeId: string): Promise<void> {
  await adminClient.delete(`/api/users/ownership/${userId}/${placeId}`);
}

export async function getOwnedPlaces(userId: string): Promise<string[]> {
  const { data } = await adminClient.get(`/api/users/${userId}/owned-places`);
  return data;
}

export async function getAllOwnedPlaceIds(): Promise<string[]> {
  const { data } = await adminClient.get('/api/users/ownership/owned-place-ids');
  return data;
}

export async function createPlaceOwnerUser(
  email: string,
  username: string,
  password: string,
  placeId: string,
): Promise<{ userId: string; email: string }> {
  const { data } = await adminClient.post('/api/users/place-owner', { email, username, password, placeId });
  return data;
}


// ── Geo ───────────────────────────────────────────────────────────────────

export interface GeoCity { id: number; name: string; }
export interface GeoDistrict { id: number; name: string; }

export async function getCities(countryId = 1): Promise<GeoCity[]> {
  const { data } = await adminClient.get(`/api/cities/by-country/${countryId}?langId=1`);
  const inner = data?.data ?? data;
  return (Array.isArray(inner) ? inner : []).map((c: any) => ({ id: c.id, name: c.name }));
}

export async function getDistricts(cityId: number): Promise<GeoDistrict[]> {
  const { data } = await adminClient.get(`/api/districts/by-city/${cityId}?langId=1`);
  const inner = data?.data ?? data;
  return (Array.isArray(inner) ? inner : []).map((d: any) => ({ id: d.id, name: d.name }));
}

export async function createCityAdmin(countryId: number, name: string): Promise<number> {
  const { data } = await adminClient.post('/api/admin/geo/cities', { countryId, name });
  return data?.data ?? data;
}

export async function createDistrictAdmin(cityId: number, name: string): Promise<number> {
  const { data } = await adminClient.post('/api/admin/geo/districts', { cityId, name });
  return data?.data ?? data;
}

// ── Config ────────────────────────────────────────────────────────────────

export async function getRuntimeConfigs() {
  const { data } = await adminClient.get('/api/admin/config');
  return data?.data ?? data;
}

export async function upsertRuntimeConfig(key: string, value: string, changedBy: string, reason: string) {
  await adminClient.put(`/api/admin/config/runtime/${key}`, {
    value,
    changedBy,
    changeReason: reason,
    requiresApproval: false,
  });
}

export async function getFeatureFlags() {
  const { data } = await adminClient.get('/api/admin/config');
  return data?.flags ?? data?.data?.flags ?? [];
}

export async function upsertFeatureFlag(
  key: string,
  isEnabled: boolean,
  rolloutPercentage: number,
  changedBy: string,
  reason: string,
) {
  await adminClient.put(`/api/admin/config/flags/${key}`, {
    isEnabled,
    rolloutPercentage,
    changedBy,
    changeReason: reason,
  });
}

// ── Moderation ────────────────────────────────────────────────────────────

export async function getPendingModeration(page = 1, pageSize = 20) {
  const { data } = await adminClient.get('/api/admin/moderation/pending', { params: { page, pageSize } });
  return data?.data ?? data;
}

export async function reviewModerationItem(id: string, approve: boolean, adminId: string, note?: string) {
  await adminClient.post(`/api/admin/moderation/${id}/review`, { adminId, approve, note });
}

// ── Feedback ───────────────────────────────────────────────────────────────

export async function getFeedback(reviewed?: boolean, page = 1, pageSize = 30) {
  const { data } = await adminClient.get('/api/admin/feedback', {
    params: { reviewed, page, pageSize },
  });
  const inner = data?.data ?? data;
  return { items: inner?.items ?? [], totalCount: inner?.totalCount ?? 0 };
}

export async function markFeedbackReviewed(id: string) {
  await adminClient.patch(`/api/admin/feedback/${id}/review`);
}

// ── Place Owner ────────────────────────────────────────────────────────────

export async function updatePlaceMedia(
  placeId: string,
  coverImageUrl?: string | null,
  menuUrl?: string | null,
  menuImageUrls?: string[] | null,
): Promise<void> {
  await adminClient.put(`/api/owner/places/${placeId}`, {
    coverImageUrl: coverImageUrl ?? null,
    menuUrl:       menuUrl       ?? null,
    menuImageUrls: menuImageUrls ?? null,
  });
}

export async function ownerAssignLabel(placeId: string, labelId: number): Promise<void> {
  await adminClient.post(`/api/owner/places/${placeId}/labels/${labelId}`);
}

export async function ownerRemoveLabel(placeId: string, labelId: number): Promise<void> {
  await adminClient.delete(`/api/owner/places/${placeId}/labels/${labelId}`);
}

// ── Place Notifications ────────────────────────────────────────────────────

export type NotificationAudience = 'Favorites' | 'Wishlist' | 'Nearby';

export async function sendPlaceNotification(
  placeId: string,
  title: string,
  body: string,
  type: string,
  audience: NotificationAudience,
) {
  const { data } = await adminClient.post('/api/admin/notifications', {
    placeId,
    title,
    body,
    type,
    audience,
  });
  return data?.data ?? data;
}

export async function getPlaceNotificationHistory(
  placeId: string,
  page = 1,
  pageSize = 20,
) {
  const { data } = await adminClient.get(`/api/admin/notifications/${placeId}`, {
    params: { page, pageSize },
  });
  return data?.data ?? data;
}

// ── Audit logs ────────────────────────────────────────────────────────────

export async function getAuditLogs(page = 1, pageSize = 30) {
  const { data } = await adminClient.get('/api/admin/audit-logs', { params: { page, pageSize } });
  const inner = data?.data ?? data;
  return { items: inner?.items ?? inner?.logs ?? [], totalCount: inner?.totalCount ?? 0 };
}
