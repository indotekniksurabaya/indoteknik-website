-- ====================================================================
-- PT INDO TEKNIK EMPATBELAS — SUPABASE SQL EDITOR SCRIPT
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda:
-- 1. Buka https://supabase.com/dashboard/project/asdapivwgwihgbxjedzu/sql
-- 2. Paste semua query ini lalu klik RUN
-- ====================================================================

-- 1. PASTIKAN TABEL COMPANY PROFILE ADA DENGAN STRUKTUR LENGKAP
CREATE TABLE IF NOT EXISTS public.company_profile (
    id TEXT PRIMARY KEY DEFAULT 'main',
    company_name TEXT NOT NULL DEFAULT 'PT INDO TEKNIK EMPATBELAS',
    tagline TEXT DEFAULT 'Fire Protection & Mechanical Electrical',
    about_title TEXT DEFAULT 'Profil & Integritas',
    about_desc TEXT,
    vision TEXT,
    mission JSONB DEFAULT '[]'::jsonb,
    stats JSONB DEFAULT '{}'::jsonb,
    phone TEXT DEFAULT '+62 813-9063-0360',
    whatsapp TEXT DEFAULT '6281390630360',
    email TEXT DEFAULT 'info@indoteknik14.com',
    address TEXT DEFAULT 'Dusun Pekojo, RT 02/RW 02, Desa Tunggalpager, Kec. Pungging, Kab. Mojokerto, Jawa Timur 61384',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ATUR ROW LEVEL SECURITY (RLS) AGAR CMS BISA EDIT & SIMPAN DENGAN AMAN
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy Company Profile (Bisa dibaca publik & diedit dari CMS)
DROP POLICY IF EXISTS "Public can view company profile" ON public.company_profile;
DROP POLICY IF EXISTS "Admin can update company profile" ON public.company_profile;
DROP POLICY IF EXISTS "Allow all update company profile" ON public.company_profile;

CREATE POLICY "Public can view company profile" 
ON public.company_profile FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow all update company profile" 
ON public.company_profile FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- Policy Products (Katalog)
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Admin full access products" ON public.products;
DROP POLICY IF EXISTS "Allow full access products" ON public.products;

CREATE POLICY "Public can view products" 
ON public.products FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow full access products" 
ON public.products FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- Policy Gallery (Dokumentasi)
DROP POLICY IF EXISTS "Public can view gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admin full access gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow full access gallery" ON public.gallery;

CREATE POLICY "Public can view gallery" 
ON public.gallery FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow full access gallery" 
ON public.gallery FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- Policy RFQ Inquiries (Formulir Kontak & Inbox Pesan Masuk)
DROP POLICY IF EXISTS "Public can submit RFQ inquiry" ON public.rfq_inquiries;
DROP POLICY IF EXISTS "Admin can read RFQ inquiries" ON public.rfq_inquiries;
DROP POLICY IF EXISTS "Admin can delete RFQ inquiries" ON public.rfq_inquiries;

CREATE POLICY "Public can submit RFQ inquiry" 
ON public.rfq_inquiries FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Admin can read RFQ inquiries" 
ON public.rfq_inquiries FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Admin can delete RFQ inquiries" 
ON public.rfq_inquiries FOR DELETE 
TO anon, authenticated 
USING (true);

-- 3. INSERT ATAU PERBARUI DATA PROFIL DEFAULT DENGAN 4 CARD ABOUT & 3 CARD BERANDA
INSERT INTO public.company_profile (
    id,
    company_name,
    tagline,
    about_title,
    about_desc,
    vision,
    mission,
    stats,
    phone,
    whatsapp,
    email,
    address,
    updated_at
) VALUES (
    'main',
    'PT INDO TEKNIK EMPATBELAS',
    'Fire Protection & Mechanical Electrical',
    'Profil & Integritas',
    'Mitra kontraktor spesialis sistem proteksi kebakaran, instalasi perpipaan hidran, sprinkler, dan mekanikal elektrikal berskala komersial maupun fasilitas industri di seluruh Indonesia.',
    'Menjadi kontraktor proteksi kebakaran dan mekanikal elektrikal terdepan di Indonesia dengan mengutamakan standar keselamatan tertinggi (NFPA & SNI).',
    '[
        "Memberikan solusi rekayasa proteksi kebakaran terintegrasi dengan standar internasional.",
        "Menyediakan produk berkualitas tinggi, bersertifikasi, dan teruji keandalannya.",
        "Memberikan pelayanan profesional, tepat waktu, dan berorientasi pada keselamatan jiwa."
    ]'::jsonb,
    '{
        "experience_years": "20+",
        "experience_label": "Tahun Pengalaman",
        "projects_completed": "500+",
        "projects_label": "Proyek Selesai",
        "standards": "NFPA & SNI",
        "standards_label": "Standar Resmi",
        "expert_engineers": "30+",
        "engineers_label": "Engineer Ahli",
        "vision_title": "VISI PERUSAHAAN",
        "vision_footer": "KOMITMEN PROFESIONALISME",
        "safety_title": "STANDAR MUTU & K3L",
        "safety_desc": "Setiap instalasi dikerjakan dengan kepatuhan penuh terhadap standar keselamatan kerja, regulasi teknis Standar Nasional Indonesia (SNI), dan acuan National Fire Protection Association (NFPA).",
        "safety_points": [
            "Penerapan Ketat Budaya Zero Accident K3L",
            "Kepatuhan Standar NFPA & Regulasi SNI",
            "Pengujian Hydrotest & Kelaikan Operasional"
        ],
        "safety_footer": "KEANDALAN TERUJI",
        "service_title": "LINGKUP KEAHLIAN",
        "service_desc": "Menyediakan pengadaan material bersertifikat, fabrikasi pipa, instalasi lapangan terpadu, hingga komisioning pengujian sistem pemadam dan pompa bertekanan tinggi.",
        "service_points": [
            "Fire Hydrant & Automatic Sprinkler",
            "Fire Pump Room NFPA 20 & Diesel Engine",
            "Clean Agent FM-200 & Fire Alarm Addressable"
        ],
        "service_footer": "SOLUSI TERINTEGRASI",
        "home_card1_title": "Badan Usaha Resmi",
        "home_card1_desc": "Mitra kontraktor berbadan hukum dengan keahlian teknis khusus pada sistem proteksi kebakaran, perpipaan, dan mekanikal elektrikal gedung industri.",
        "home_card1_footer": "Integritas & Presisi",
        "home_card2_title": "Standar NFPA & SNI",
        "home_card2_desc": "Kepatuhan mutlak pada regulasi keselamatan kerja K3L Zero Accident, standar internasional NFPA, serta pengujian kelayakan teknis hydrotest.",
        "home_card2_footer": "Standar Teruji",
        "home_card3_title": "Solusi Terintegrasi",
        "home_card3_desc": "Layanan menyeluruh meliputi instalasi fire hydrant, sprinkler, clean agent suppression, perakitan fire pump room, hingga maintenance berkala.",
        "home_card3_footer": "End-to-End Service"
    }'::jsonb,
    '+62 813-9063-0360',
    '6281390630360',
    'info@indoteknik14.com',
    'Dusun Pekojo, RT 02/RW 02, Desa Tunggalpager, Kec. Pungging, Kab. Mojokerto, Jawa Timur 61384',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    tagline = EXCLUDED.tagline,
    about_title = EXCLUDED.about_title,
    about_desc = EXCLUDED.about_desc,
    vision = EXCLUDED.vision,
    mission = EXCLUDED.mission,
    stats = EXCLUDED.stats,
    phone = EXCLUDED.phone,
    whatsapp = EXCLUDED.whatsapp,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    updated_at = NOW();
