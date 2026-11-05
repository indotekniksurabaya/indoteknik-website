-- ====================================================================
-- PT INDO TEKNIK EMPATBELAS — DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE: products (Katalog Produk & Peralatan Pemadam)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,                       -- Slug/ID unik, cth: 'vinci-box-a1'
    code TEXT NOT NULL,                        -- Kode produk, cth: 'VINCI-BOX-A1'
    title TEXT NOT NULL,                       -- Nama produk
    brand TEXT NOT NULL DEFAULT 'Vinci Firefighting Supplier',
    category TEXT NOT NULL DEFAULT 'hydrant',  -- 'hydrant', 'alarm', 'foam', 'cleanagent', dll
    image TEXT NOT NULL,                       -- URL atau path gambar
    "desc" TEXT,                               -- Deskripsi produk
    specs JSONB DEFAULT '[]'::jsonb,           -- Spesifikasi dalam format JSON array: [{"key":"Dimensi","value":"..."}]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pencarian & filter
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 3. TABLE: gallery (Galeri Dokumentasi Pengerjaan & Proyek)
CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY,                       -- ID unik, cth: 'gal-1'
    title TEXT NOT NULL,                       -- Judul dokumentasi
    category TEXT NOT NULL DEFAULT 'hydrant',  -- 'hydrant', 'pump', 'pipa', 'team'
    category_label TEXT,                       -- Label badge, cth: 'Instalasi Hydrant'
    image_url TEXT NOT NULL,                   -- URL gambar
    description TEXT,                          -- Keterangan singkat pekerjaan
    order_num INTEGER DEFAULT 0,               -- Urutan tampil
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON public.gallery(order_num ASC);

-- 4. TABLE: company_profile (Profil Perusahaan, Visi Misi, Kontak)
CREATE TABLE IF NOT EXISTS public.company_profile (
    id TEXT PRIMARY KEY DEFAULT 'main',
    company_name TEXT NOT NULL DEFAULT 'PT INDO TEKNIK EMPATBELAS',
    tagline TEXT DEFAULT 'Fire Protection & Mechanical Electrical',
    about_title TEXT DEFAULT 'Profil & Integritas',
    about_desc TEXT,
    vision TEXT,
    mission JSONB DEFAULT '[]'::jsonb,
    stats JSONB DEFAULT '{"experience_years":"20+","projects_completed":"500+","standards":"NFPA & SNI","expert_engineers":"30+"}'::jsonb,
    phone TEXT DEFAULT '+62 813-9063-0360',
    whatsapp TEXT DEFAULT '6281390630360',
    email TEXT DEFAULT 'info@indoteknik14.com',
    address TEXT DEFAULT 'Workshop & Office: Jl. Raya Semarang - Kendal Km. 14, Semarang, Jawa Tengah',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE: rfq_inquiries (Pesan & Permintaan Penawaran dari Formulir Kontak)
CREATE TABLE IF NOT EXISTS public.rfq_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    service TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',                 -- 'new', 'contacted', 'closed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfq_created_at ON public.rfq_inquiries(created_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_inquiries ENABLE ROW LEVEL SECURITY;

-- 1. Policies untuk products:
-- Publik bebas melihat katalog
CREATE POLICY "Public can view products" 
ON public.products FOR SELECT 
TO anon, authenticated 
USING (true);

-- Hanya admin (authenticated) yang bisa tambah, ubah, hapus produk
CREATE POLICY "Admin full access products" 
ON public.products FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 2. Policies untuk gallery:
-- Publik bebas melihat galeri
CREATE POLICY "Public can view gallery" 
ON public.gallery FOR SELECT 
TO anon, authenticated 
USING (true);

-- Hanya admin (authenticated) yang bisa kelola galeri
CREATE POLICY "Admin full access gallery" 
ON public.gallery FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Policies untuk company_profile:
-- Publik bebas melihat profil perusahaan
CREATE POLICY "Public can view company profile" 
ON public.company_profile FOR SELECT 
TO anon, authenticated 
USING (true);

-- Hanya admin yang bisa mengupdate profil
CREATE POLICY "Admin can update company profile" 
ON public.company_profile FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Policies untuk rfq_inquiries:
-- Publik bebas mengirim pesan / penawaran
CREATE POLICY "Public can submit RFQ inquiry" 
ON public.rfq_inquiries FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Admin & CMS dapat membaca pesan masuk
CREATE POLICY "Admin can read RFQ inquiries" 
ON public.rfq_inquiries FOR SELECT 
TO anon, authenticated 
USING (true);

-- Admin dapat menghapus pesan masuk
CREATE POLICY "Admin can delete RFQ inquiries" 
ON public.rfq_inquiries FOR DELETE 
TO anon, authenticated 
USING (true);

-- ====================================================================
-- STORAGE BUCKET CONFIGURATION (Supabase Storage)
-- ====================================================================

-- Buat bucket penyimpanan media gambar produk & dokumentasi
INSERT INTO storage.buckets (id, name, public)
VALUES ('indoteknik-media', 'indoteknik-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policy Storage: Publik dapat melihat file
CREATE POLICY "Public read media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'indoteknik-media');

-- Policy Storage: Hanya admin terautentikasi yang bisa upload media
CREATE POLICY "Admin upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'indoteknik-media');

CREATE POLICY "Admin update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'indoteknik-media');

CREATE POLICY "Admin delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'indoteknik-media');
