import { apiClient } from './client';

export type ReportTargetType = 'Post' | 'User' | 'Place' | 'Review';

export async function reportContent(
  targetType: ReportTargetType,
  targetId: string,
  reason?: string,
): Promise<void> {
  await apiClient.post('/api/report', { targetType, targetId, reason });
}
