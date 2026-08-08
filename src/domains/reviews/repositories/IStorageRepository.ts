export interface IStorageRepository {
  /**
   * Uploads a file to a specific bucket and returns the public URL.
   * @param bucket - The storage bucket name
   * @param path - The file path/name inside the bucket
   * @param file - The file Blob or File object
   * @param mimeType - The mime type (e.g. 'image/webp')
   */
  uploadFile(bucket: string, path: string, file: Blob, mimeType: string): Promise<string>;
  
  /**
   * Deletes a file from a specific bucket.
   */
  deleteFile(bucket: string, path: string): Promise<void>;
}
