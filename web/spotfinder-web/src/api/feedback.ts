import { apiClient } from './client';

export type FeedbackCategory =
  | 'PlaceRequest'
  | 'LabelRequest'
  | 'BugReport'
  | 'FeatureRequest'
  | 'Other';

export async function submitFeedback(category: FeedbackCategory, message: string): Promise<void> {
  await apiClient.post('/api/feedback', { category, message });
}
