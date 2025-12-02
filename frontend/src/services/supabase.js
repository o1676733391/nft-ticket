// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured. Some features may not work.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: async (key) => {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return AsyncStorage.getItem(key);
      },
      setItem: async (key, value) => {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return AsyncStorage.setItem(key, value);
      },
      removeItem: async (key) => {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return AsyncStorage.removeItem(key);
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to upload image
export const uploadImage = async (uri, bucket = 'events', path) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileExt = uri.split('.').pop();
    const fileName = path || `${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, {
        contentType: `image/${fileExt}`,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Helper function to get public URL
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export default supabase;
