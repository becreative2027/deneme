const CLOUD_NAME = 'dnwylcwex';
const UPLOAD_PRESET = 'spotfinder_posts';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export type UploadProgressCallback = (fraction: number) => void;

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

/**
 * Upload a local image URI to Cloudinary.
 * Uses fetch + FormData — the standard approach in React Native.
 * Progress is simulated (fetch doesn't support real upload progress in RN).
 */
export async function uploadImageToCloudinary(
  localUri: string,
  onProgress?: UploadProgressCallback,
  folder = 'spotfinder/posts',
): Promise<CloudinaryUploadResult> {
  onProgress?.(0.1);

  const formData = new FormData();
  // React Native FormData file object — uri, type and name are required
  formData.append('file', {
    uri: localUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as any);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  onProgress?.(0.2);

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type — let fetch set it with the correct boundary
  });

  onProgress?.(0.9);

  if (!response.ok) {
    const body = await response.text();
    let message = `Upload failed: ${response.status}`;
    try {
      const json = JSON.parse(body);
      message = json?.error?.message ?? message;
    } catch {}
    throw new Error(message);
  }

  const data = await response.json();
  onProgress?.(1);

  return {
    secureUrl: data.secure_url,
    publicId:  data.public_id,
  };
}

/**
 * Convenience wrapper — returns just the secure URL string.
 */
export async function uploadImage(
  localUri: string,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  const { secureUrl } = await uploadImageToCloudinary(localUri, onProgress);
  return secureUrl;
}
