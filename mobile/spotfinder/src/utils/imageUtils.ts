import * as ImageManipulator from 'expo-image-manipulator';

const MAX_WIDTH = 1080;
const COMPRESS_QUALITY = 0.7;

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  /** MIME type — always image/jpeg after processing */
  mimeType: 'image/jpeg';
}

/**
 * Resize (max 1080 px wide) and compress (0.7) a picked image URI.
 * Returns a new local URI pointing to the optimised JPEG.
 *
 * Phase 8.2 — replaces raw base64 passthrough with proper compress step.
 */
export async function processImageForUpload(uri: string): Promise<ProcessedImage> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_WIDTH } }],
    {
      compress: COMPRESS_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    mimeType: 'image/jpeg',
  };
}
