import { supabase } from '../../../lib/supabase';
import type { IStorageRepository } from './IStorageRepository';

export class SupabaseStorageRepository implements IStorageRepository {
  async uploadFile(bucket: string, path: string, file: Blob, mimeType: string): Promise<string> {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(path, file, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload to storage: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete from storage: ${error.message}`);
    }
  }
}
