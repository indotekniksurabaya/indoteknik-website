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

/**
 * Normalizes any image/media path so that relative assets are loaded from the root domain ('/images/...')
 * and remote HTTP/HTTPS/data URLs remain untouched.
 */
export function normalizeMediaUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  if (trimmed.startsWith('../')) {
    return '/' + trimmed.replace(/^(\.\.\/)+/, '');
  }
  return '/' + trimmed;
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
    return Object.values(fallbackProducts).map(p => ({
      ...p,
      image: normalizeMediaUrl(p.image)
    }));
  }

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.info('Supabase products empty or error, using fallback:', error?.message);
      return Object.values(fallbackProducts).map(p => ({
        ...p,
        image: normalizeMediaUrl(p.image)
      }));
    }

    return data.map(p => ({
      ...p,
      image: normalizeMediaUrl(p.image)
    }));
  } catch (err) {
    console.warn('Fetch products failed:', err);
    return Object.values(fallbackProducts).map(p => ({
      ...p,
      image: normalizeMediaUrl(p.image)
    }));
  }
}

export async function getProductById(id) {
  const client = getSupabaseClient();
  if (!client) {
    const prod = fallbackProducts[id];
    return prod ? { ...prod, image: normalizeMediaUrl(prod.image) } : null;
  }

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      const prod = fallbackProducts[id];
      return prod ? { ...prod, image: normalizeMediaUrl(prod.image) } : null;
    }

    return {
      ...data,
      image: normalizeMediaUrl(data.image)
    };
  } catch (err) {
    const prod = fallbackProducts[id];
    return prod ? { ...prod, image: normalizeMediaUrl(prod.image) } : null;
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
    category: standardizeCategory(product.category || 'hydrant'),
    image: normalizeMediaUrl(product.image),
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
    return fallbackGallery.map(g => ({
      ...g,
      image_url: normalizeMediaUrl(g.image_url)
    }));
  }

  try {
    const { data, error } = await client
      .from('gallery')
      .select('*')
      .order('order_num', { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackGallery.map(g => ({
        ...g,
        image_url: normalizeMediaUrl(g.image_url)
      }));
    }

    return data.map(g => ({
      ...g,
      image_url: normalizeMediaUrl(g.image_url)
    }));
  } catch (err) {
    return fallbackGallery.map(g => ({
      ...g,
      image_url: normalizeMediaUrl(g.image_url)
    }));
  }
}

export async function saveGalleryItem(item) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum dikonfigurasi.');

  const galleryData = {
    id: item.id || `gal-${Date.now()}`,
    title: item.title,
    category: standardizeCategory(item.category),
    category_label: item.category_label || item.category,
    image_url: normalizeMediaUrl(item.image_url),
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
// CATEGORY STANDARDIZATION HELPER
// ==========================================

export function standardizeCategory(input) {
  if (!input || typeof input !== 'string') return { slug: 'umum', label: 'Umum' };
  
  // Clean whitespace & dashes
  const trimmed = input.trim().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');
  if (!trimmed) return { slug: 'umum', label: 'Umum' };

  // Slug: lowercase kebab-case (a-z0-9-)
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  // Label: Title Case (e.g. "Fire Hydrant System", "Pipa & Fitting")
  const label = trimmed
    .split(' ')
    .map(w => {
      const lower = w.toLowerCase();
      if (lower === '&' || lower === 'dan' || lower === 'and') return '&';
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');

  return { slug: slug || 'umum', label: label || 'Umum' };
}

// ==========================================
// 3. COMPANY PROFILE API
// ==========================================

const LOCAL_PROFILE_KEY = 'indoteknik_company_profile';

export async function getCompanyProfile() {
  const getLocalProfile = () => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_PROFILE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          return {
            ...fallbackCompanyProfile,
            ...parsed,
            stats: { ...fallbackCompanyProfile.stats, ...(parsed.stats || {}) }
          };
        }
      } catch (_) {}
    }
    return fallbackCompanyProfile;
  };

  const client = getSupabaseClient();
  if (!client) {
    return getLocalProfile();
  }

  try {
    const { data, error } = await client
      .from('company_profile')
      .select('*')
      .eq('id', 'main')
      .single();

    if (error || !data) {
      return getLocalProfile();
    }

    const merged = {
      ...fallbackCompanyProfile,
      ...data,
      stats: { ...fallbackCompanyProfile.stats, ...(data.stats || {}) }
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(merged));
      } catch (_) {}
    }

    return merged;
  } catch (err) {
    return getLocalProfile();
  }
}

export async function updateCompanyProfile(profile) {
  const dataToSave = {
    ...fallbackCompanyProfile,
    ...profile,
    id: 'main',
    stats: {
      ...fallbackCompanyProfile.stats,
      ...(profile.stats || {})
    },
    updated_at: new Date().toISOString()
  };

  // Cache locally immediately
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(dataToSave));
    } catch (_) {}
  }

  const client = getSupabaseClient();
  if (!client) return dataToSave;

  const { data, error } = await client
    .from('company_profile')
    .upsert(dataToSave)
    .select()
    .single();

  if (error) {
    console.warn('Supabase upsert company_profile failed, cached locally:', error);
    return dataToSave;
  }
  return data;
}

// ==========================================
// 4. RFQ / CONTACT INQUIRIES API
// ==========================================

const LOCAL_INQUIRIES_KEY = 'indoteknik_local_inquiries';

function getLocalInquiries() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveLocalInquiry(item) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalInquiries();
    current.unshift(item);
    localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(current.slice(0, 100)));
  } catch (_) {}
}

export async function submitInquiry(inquiry) {
  const client = getSupabaseClient();
  const inquiryRecord = {
    id: `rfq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: inquiry.name,
    company: inquiry.company || '',
    phone: inquiry.phone,
    email: inquiry.email || '',
    service: inquiry.service || '',
    message: inquiry.message,
    created_at: new Date().toISOString()
  };

  // Always save locally to ensure no inquiry is lost
  saveLocalInquiry(inquiryRecord);

  if (!client) {
    console.info('Supabase offline: RFQ recorded locally.');
    return { success: true, data: inquiryRecord };
  }

  try {
    // Note: Do NOT use .select() here because anon key does not have SELECT permission on rfq_inquiries
    const { error } = await client
      .from('rfq_inquiries')
      .insert([{
        name: inquiryRecord.name,
        company: inquiryRecord.company,
        phone: inquiryRecord.phone,
        email: inquiryRecord.email,
        service: inquiryRecord.service,
        message: inquiryRecord.message,
        created_at: inquiryRecord.created_at
      }]);

    if (error) {
      console.warn('Gagal menyimpan RFQ ke Supabase, tetap tersimpan lokal:', error.message);
      return { success: true, data: inquiryRecord, warning: error.message };
    }

    return { success: true, data: inquiryRecord };
  } catch (err) {
    console.warn('Gagal koneksi Supabase RFQ, tetap tersimpan lokal:', err.message);
    return { success: true, data: inquiryRecord, warning: err.message };
  }
}

export async function getInquiries() {
  const localList = getLocalInquiries();
  const client = getSupabaseClient();
  if (!client) return localList;

  try {
    const { data, error } = await client
      .from('rfq_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return localList;
    }

    // Merge Supabase items and local items (deduplicated by phone + message or timestamp)
    const map = new Map();
    data.forEach(item => {
      const key = `${item.phone}-${item.message}`;
      map.set(key, item);
    });
    localList.forEach(item => {
      const key = `${item.phone}-${item.message}`;
      if (!map.has(key)) {
        map.set(key, item);
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  } catch (err) {
    console.warn('Fetch inquiries error, returning local:', err);
    return localList;
  }
}

export async function deleteInquiry(id) {
  // Delete from local storage
  if (typeof window !== 'undefined') {
    try {
      const current = getLocalInquiries().filter(i => i.id !== id);
      localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(current));
    } catch (_) {}
  }

  // Delete from Supabase
  const client = getSupabaseClient();
  if (!client) return true;

  try {
    await client
      .from('rfq_inquiries')
      .delete()
      .eq('id', id);
  } catch (err) {
    console.warn('Supabase delete error:', err);
  }
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
