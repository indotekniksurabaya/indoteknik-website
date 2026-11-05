// Supabase Client & Service Layer for PT INDO TEKNIK EMPATBELAS
import { createClient } from '@supabase/supabase-js';
import { fallbackCompanyProfile, fallbackGallery, fallbackProducts } from './fallback-data.js';

const STORAGE_KEY_URL = 'indoteknik_supabase_url';
const STORAGE_KEY_ANON = 'indoteknik_supabase_anon_key';

const DEFAULT_SUPABASE_URL = 'https://asdapivwgwihgbxjedzu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_6kaiJ-t5Hlbqyeb-ugS9vg_dz-fMknP';

export function getSupabaseCredentials() {
  const envUrl = import.meta.env?.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) || '' : '';

  const url = (envUrl && envUrl !== 'YOUR_SUPABASE_URL') ? envUrl : (localUrl || DEFAULT_SUPABASE_URL);
  const anonKey = (envKey && envKey !== 'YOUR_SUPABASE_ANON_KEY') ? envKey : (localKey || DEFAULT_SUPABASE_ANON_KEY);

  return { url: url.trim(), anonKey: anonKey.trim() };
}

let supabaseInstance = null;

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseCredentials();

  if (url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('Supabase initialization error, falling back to local data:', err);
      return null;
    }
  }

  return null;
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey);
}

export function saveSupabaseConfig(url, key) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, key.trim());
    supabaseInstance = null; // Reset instance so it picks up new creds
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    supabaseInstance = null;
  }
}

// ==========================================
// 1. PRODUCTS / CATALOG API
// ==========================================

export async function getProducts() {
  const client = getSupabaseClient();
  if (!client) {
    return Object.values(fallbackProducts);
  }

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.info('Supabase products empty or error, using fallback:', error?.message);
      return Object.values(fallbackProducts);
    }

    return data;
  } catch (err) {
    console.warn('Fetch products failed:', err);
    return Object.values(fallbackProducts);
  }
}

export async function getProductById(id) {
  const client = getSupabaseClient();
  if (!client) {
    return fallbackProducts[id] || null;
  }

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return fallbackProducts[id] || null;
    }

    return data;
  } catch (err) {
    return fallbackProducts[id] || null;
  }
}

export async function saveProduct(product) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum dikonfigurasi.');

  const productData = {
    id: product.id,
    code: product.code,
    title: product.title,
    brand: product.brand || 'Vinci Firefighting Supplier',
    category: product.category || 'hydrant',
    image: product.image,
    desc: product.desc || '',
    specs: product.specs || [],
    updated_at: new Date().toISOString()
  };

  const { data, error } = await client
    .from('products')
    .upsert(productData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum dikonfigurasi.');

  const { error } = await client
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ==========================================
// 2. GALLERY API
// ==========================================

export async function getGallery() {
  const client = getSupabaseClient();
  if (!client) {
    return fallbackGallery;
  }

  try {
    const { data, error } = await client
      .from('gallery')
      .select('*')
      .order('order_num', { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackGallery;
    }

    return data;
  } catch (err) {
    return fallbackGallery;
  }
}

export async function saveGalleryItem(item) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum dikonfigurasi.');

  const galleryData = {
    id: item.id || `gal-${Date.now()}`,
    title: item.title,
    category: item.category,
    category_label: item.category_label || item.category,
    image_url: item.image_url,
    description: item.description || '',
    order_num: item.order_num || 0,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await client
    .from('gallery')
    .upsert(galleryData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGalleryItem(id) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum dikonfigurasi.');

  const { error } = await client
    .from('gallery')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ==========================================
// 3. COMPANY PROFILE API
// ==========================================

export async function getCompanyProfile() {
  const client = getSupabaseClient();
  if (!client) {
    return fallbackCompanyProfile;
  }

  try {
    const { data, error } = await client
      .from('company_profile')
      .select('*')
      .eq('id', 'main')
      .single();

    if (error || !data) {
      return fallbackCompanyProfile;
    }

    return data;
  } catch (err) {
    return fallbackCompanyProfile;
  }
}

export async function updateCompanyProfile(profile) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum dikonfigurasi.');

  const dataToSave = {
    ...profile,
    id: 'main',
    updated_at: new Date().toISOString()
  };

  const { data, error } = await client
    .from('company_profile')
    .upsert(dataToSave)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// 4. RFQ / CONTACT INQUIRIES API
// ==========================================

export async function submitInquiry(inquiry) {
  const client = getSupabaseClient();
  if (!client) {
    console.info('Supabase offline: RFQ recorded locally in memory.');
    return { success: true, offline: true };
  }

  try {
    const { data, error } = await client
      .from('rfq_inquiries')
      .insert([{
        name: inquiry.name,
        company: inquiry.company || '',
        phone: inquiry.phone,
        email: inquiry.email || '',
        service: inquiry.service || '',
        message: inquiry.message,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.warn('Gagal menyimpan RFQ ke Supabase, tetap lanjut:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getInquiries() {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('rfq_inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteInquiry(id) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum dikonfigurasi.');

  const { error } = await client
    .from('rfq_inquiries')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ==========================================
// 5. MEDIA UPLOAD (SUPABASE STORAGE)
// ==========================================

export async function uploadMedia(file, folder = 'uploads') {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum dikonfigurasi.');

  const bucketName = 'indoteknik-media';
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

  const { data, error } = await client.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;

  const { data: urlData } = client.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// ==========================================
// 6. AUTHENTICATION (ADMIN CMS)
// ==========================================

export async function loginAdmin(email, password) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum dikonfigurasi. Masukkan URL & Anon Key di pengaturan.');

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function logoutAdmin() {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function getAdminSession() {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data: { session }, error } = await client.auth.getSession();
  if (error || !session) return null;
  return session;
}

export function onAuthStateChange(callback) {
  const client = getSupabaseClient();
  if (!client) return { unsubscribe: () => {} };

  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return subscription;
}
