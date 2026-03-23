import { apiClient } from './client';
import { ApiResponse } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PresignedUrlResponse {
  /** Short-lived PUT URL (S3 / Azure Blob) */
  uploadUrl: string;
  /** Permanent CDN URL to store in the post record */
  fileUrl: string;
}

export type UploadProgressCallback = (fraction: number) => void;

// ── API helpers ───────────────────────────────────────────────────────────────

/**
 * Ask the backend for a presigned upload URL.
 */
export async function getUploadUrl(contentType: string): Promise<PresignedUrlResponse> {
  const { data } = await apiClient.post<ApiResponse<PresignedUrlResponse>>(
    '/api/media/upload-url',
    { contentType },
  );
  if (!data.success || !data.data) throw new Error('Could not obtain upload URL');
  return data.data;
}

/**
 * Upload via fetch — no progress events.
 * Kept as a fallback for environments where XHR is unavailable.
 */
export async function uploadFileToStorage(
  uploadUrl: string,
  localUri: string,
  contentType: string,
): Promise<void> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const putResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': contentType },
  });

  if (!putResponse.ok) {
    throw new Error(`Upload failed: ${putResponse.status}`);
  }
}

/**
 * Phase 8.3 — Upload via XHR for real-time upload progress events.
 * `onProgress` receives a value 0–1 as bytes are sent.
 *
 * Uses native XHR instead of fetch so we get `upload.onprogress` callbacks.
 * Does NOT include the Bearer token header — talking directly to S3/Blob.
 */
export async function uploadFileToStorageWithProgress(
  uploadUrl: string,
  localUri: string,
  contentType: string,
  onProgress: UploadProgressCallback,
): Promise<void> {
  // Fetch the local file as a Blob first
  const fileResponse = await fetch(localUri);
  const blob = await fileResponse.blob();

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);

    // Progress events — fired as chunks are sent
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded / event.total);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(1); // ensure we reach 100%
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload network error')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

    xhr.send(blob);
  });
}

/**
 * Full CDN upload pipeline with optional progress reporting.
 * 1. Get presigned URL from backend
 * 2. PUT file directly to storage (with XHR progress if callback supplied)
 * 3. Return the permanent CDN URL
 */
export async function uploadImage(
  localUri: string,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  const { uploadUrl, fileUrl } = await getUploadUrl('image/jpeg');

  if (onProgress) {
    await uploadFileToStorageWithProgress(uploadUrl, localUri, 'image/jpeg', onProgress);
  } else {
    await uploadFileToStorage(uploadUrl, localUri, 'image/jpeg');
  }

  return fileUrl;
}
