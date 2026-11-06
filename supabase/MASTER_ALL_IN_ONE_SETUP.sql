-- ====================================================================
-- PT INDO TEKNIK EMPATBELAS — MASTER ALL-IN-ONE SUPABASE SETUP SCRIPT
-- ====================================================================
-- CARA PENGGUNAAN:
-- 1. Buka dashboard Supabase project baru Anda (supabase.com)
-- 2. Di menu sebelah kiri, klik "SQL Editor"
-- 3. Klik "+ New query"
-- 4. Salin (copy) SELURUH isi file ini, lalu paste ke SQL Editor
-- 5. Klik tombol hijau "RUN" di pojok kanan bawah
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL: products (Katalog Produk & Peralatan Pemadam)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT 'Vinci Firefighting Supplier',
    category TEXT NOT NULL DEFAULT 'hydrant',
    image TEXT NOT NULL,
    "desc" TEXT,
    specs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 3. TABEL: gallery (Galeri Dokumentasi Pengerjaan & Proyek)
CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'hydrant',
    category_label TEXT,
    image_url TEXT NOT NULL,
    description TEXT,
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON public.gallery(order_num ASC);

-- 4. TABEL: company_profile (Profil Perusahaan, Visi Misi, 4 Card About, Kontak)
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

-- 5. TABEL: rfq_inquiries (Pesan Masuk Permintaan Penawaran)
CREATE TABLE IF NOT EXISTS public.rfq_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    company TEXT,
    phone TEXT NOT NULL,
    service_type TEXT NOT NULL DEFAULT 'Umum',
    project_details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_rfq_created_at ON public.rfq_inquiries(created_at DESC);

-- 6. SETUP STORAGE BUCKETS (Untuk Upload Gambar Produk & Galeri dari CMS)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('products', 'products', true),
    ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Akses Gambar Publik
DROP POLICY IF EXISTS "Public view products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public view gallery bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to gallery bucket" ON storage.objects;

CREATE POLICY "Public view products bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'products');
CREATE POLICY "Public view gallery bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery');
CREATE POLICY "Allow upload to products bucket" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'products');
CREATE POLICY "Allow upload to gallery bucket" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'gallery');

-- 7. SETUP ROW LEVEL SECURITY (RLS) & PERMISSIONS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy Products
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Allow full access products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow full access products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Policy Gallery
DROP POLICY IF EXISTS "Public can view gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow full access gallery" ON public.gallery;
CREATE POLICY "Public can view gallery" ON public.gallery FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow full access gallery" ON public.gallery FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Policy Company Profile
DROP POLICY IF EXISTS "Public can view company profile" ON public.company_profile;
DROP POLICY IF EXISTS "Allow all update company profile" ON public.company_profile;
CREATE POLICY "Public can view company profile" ON public.company_profile FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all update company profile" ON public.company_profile FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Policy Inquiries
DROP POLICY IF EXISTS "Public can submit RFQ inquiry" ON public.rfq_inquiries;
DROP POLICY IF EXISTS "Admin can read RFQ inquiries" ON public.rfq_inquiries;
DROP POLICY IF EXISTS "Admin can delete RFQ inquiries" ON public.rfq_inquiries;
CREATE POLICY "Public can submit RFQ inquiry" ON public.rfq_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin can read RFQ inquiries" ON public.rfq_inquiries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can delete RFQ inquiries" ON public.rfq_inquiries FOR DELETE TO anon, authenticated USING (true);

-- 8. SEED DATA: COMPANY PROFILE LENGKAP
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
        "home_card3_footer": "End-to-End Service",
        "workshop_title": "Kantor Pusat & Workshop",
        "operational_area": "Jawa Timur & Seluruh Indonesia",
        "hours_workday": "08:00 - 17:00 WIB",
        "hours_saturday": "08:00 - 13:00 WIB",
        "hours_emergency": "Siaga 24 Jam"
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

-- 9. SEED DATA: 11 GALERI DOKUMENTASI PROYEK
INSERT INTO public.gallery (id, title, category, category_label, image_url, description, order_num)
VALUES
('gal-1', 'Instalasi Hydrant Pillar Outdoor', 'hydrant', 'Instalasi Hydrant', '/images/hydrant-pillar.jpg', 'Pemasangan pilar hidran two-way dilengkapi ball valve kuningan dan sambungan Machino 2.5 inci standar Dinas Pemadam.', 1),
('gal-2', 'Instalasi Hydrant Box & Alarm Valve Indoor', 'hydrant', 'Hydrant Box & Valve', '/images/hydrant-box-indoor.jpg', 'Pemasangan boks hidran tipe indoor lengkap dengan landing valve, nozzle, fire hose kanvas 30 meter, dan alarm valve otomatis.', 2),
('gal-3', 'Instalasi Fire Pump Room Lengkap', 'pump', 'Fire Pump NFPA 20', '/images/fire-pump-room.jpg', 'Ruang pompa kebakaran komprehensif mengintegrasikan Electric Pump, Diesel Engine Pump, dan Jockey Pump sesuai standar NFPA 20.', 3),
('gal-4', 'Pemasangan Foam Bladder Tank & Proporsional', 'pump', 'Sistem Busa Foam', '/images/foam-bladder-tank.jpg', 'Tangki proporsional busa pemadam vertikal untuk proteksi area penyimpanan bahan bakar cair dan cairan mudah terbakar.', 4),
('gal-5', 'Pengelasan Flange & Pipa Utama Hidran', 'pipa', 'Pengelasan Bersertifikat', '/images/welding-hydrant-pipe.jpg', 'Pekerjaan pengelasan penetrasi penuh pada sambungan pipa baja karbon Sch 40 menggunakan juru las bersertifikasi migas/depnaker.', 5),
('gal-6', 'Fabrikasi & Header Manifold Pipa', 'pipa', 'Fabrikasi Pipa', '/images/pipe-installation.jpg', 'Perakitan header pipa manifold diameter 8 hingga 10 inci untuk pembagian jalur sprinkler dan hidran gedung bertingkat.', 6),
('gal-7', 'Pengecatan Standar Merah Proteksi Kebakaran', 'pipa', 'Coating Tahan Karat', '/images/pipe-painting-uniform.jpg', 'Aplikasi primer zincromate dan top coat epoxy red signal untuk ketahanan pipa terhadap korosi atmosferik dan identifikasi visual darurat.', 7),
('gal-8', 'Perakitan & Wiring Panel Kontrol Pompa', 'pump', 'Panel Kelistrikan', '/images/control-panel-service.jpg', 'Penyusunan kabel kontrol otomatis, kontaktor bintang-segitiga (Star-Delta), dan pengujian pressure switch aktivasi pompa.', 8),
('gal-9', 'Pemeriksaan Mesin Pompa Diesel', 'pump', 'Mesin Pompa Diesel', '/images/diesel-pump-inspection.jpg', 'Inspeksi sistem starter elektrik ganda, sirkulasi pendingin radiator heat-exchanger, dan bahan bakar mesin diesel proteksi kebakaran.', 9),
('gal-10', 'Uji Semprot Hydrant & Fire Drill', 'team', 'Uji Commissioning', '/images/fire-drill-nozzle.jpg', 'Pengujian pancaran nosel bertekanan kerja 7 bar bersama tim K3 dan petugas keselamatan kerja klien industri.', 10),
('gal-11', 'Tim Engineer PT Indo Teknik Empatbelas', 'team', 'Tim Profesional', '/images/project-team-tanks.jpg', 'Tenaga ahli lapangan dengan perlengkapan APD lengkap siap memberikan instalasi, perawatan berkala, dan solusi proteksi kebakaran.', 11)
ON CONFLICT (id) DO NOTHING;

-- 10. SEED DATA: 32 KATALOG PRODUK & SPESIFIKASI LENGKAP
INSERT INTO public.products (id, code, title, brand, category, image, "desc", specs)
VALUES
('vinci-box-a1', 'VINCI-BOX-A1', 'HYDRANT BOX TYPE A1 (INDOOR)', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_hydrant_box_a1.jpg', 'Kotak hidran dalam ruangan (indoor) untuk penyimpanan selang pemadam dan nozzle, dibuat dari plat mild steel tebal dengan proses degreasing, phosphating, zincromate primer, dan finishing powder coating red signal.', '[{"key":"Dimensi","value":"66 (T) x 52 (P) x 15 (L) cm"},{"key":"Material","value":"1.2 mm Mild Steel Plate"},{"key":"Finishing","value":"Top Coat Powder Coating Red Signal"},{"key":"Proses Pengecatan","value":"Dust Remover, Phosphating & Zincromate Primer"},{"key":"Opsi Pintu","value":"Plat Baja / Kaca Tempered + Kunci Kancing"},{"key":"Aplikasi","value":"Gedung Komersial, Kantor, Apartemen, Koridor"}]'::jsonb),
('vinci-box-a2', 'VINCI-BOX-A2', 'HYDRANT BOX TYPE A2 (INDOOR)', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_hydrant_box_a2.jpg', 'Kotak hidran indoor kapasitas standar untuk menampung selang 1.5 Inch x 30 Meter, nozzle, dan landing valve. Finishing cat oven tahan benturan dan karat.', '[{"key":"Dimensi","value":"100 (T) x 80 (P) x 18 (L) cm"},{"key":"Material","value":"1.2 mm Mild Steel Plate Presisi"},{"key":"Finishing","value":"Powder Coating Oven Red Signal 3001"},{"key":"Kompartemen","value":"1.5 Inch Hose Rack + Nozzle Clip + Valve Slot"},{"key":"Kunci Pintu","value":"Flush Handle Lock / Push Button Lock"},{"key":"Instalasi","value":"Surface Wall Mounted / Semi-Recessed"}]'::jsonb),
('vinci-box-b', 'VINCI-BOX-B', 'HYDRANT BOX TYPE B (INDOOR)', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_hydrant_box_b.jpg', 'Kotak hidran indoor ukuran besar yang dilengkapi kompartemen khusus di bagian atas untuk pemasangan manual push station, alarm bell, dan lampu indikator sistem alarm.', '[{"key":"Dimensi","value":"125 (T) x 75 (P) x 18 (L) cm"},{"key":"Material","value":"1.6 mm Cold Rolled Steel Sheet"},{"key":"Finishing","value":"Polyester Epoxy Powder Coating Red"},{"key":"Panel Alarm","value":"Tersedia Dudukan Bell, Manual Station & Lampu Indikator"},{"key":"Standar NFPA","value":"Kepatuhan Standar NFPA 14 & Standar SNI 03-1745"},{"key":"Pintu","value":"Full Steel / Kaca dengan Sablon Tulisan HYDRANT"}]'::jsonb),
('vinci-box-c', 'VINCI-BOX-C', 'HYDRANT BOX TYPE C (OUTDOOR)', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_hydrant_box_c.jpg', 'Kotak hidran luar ruangan (outdoor) tahan cuaca ekstrem lengkap dengan sepasang kaki penopang tiang, kisi ventilasi air, dan sistem kunci tahan karat.', '[{"key":"Dimensi Boks","value":"95 (T) x 66 (P) x 20 (L) cm"},{"key":"Tinggi Kaki","value":"35 cm (Dudukan Plat Tebal Kokoh)"},{"key":"Material","value":"2.0 mm Hot Rolled Steel Tahan Korosi"},{"key":"Fitur Khusus","value":"Atap Kanopi Miring Penahan Air Hujan & Louvre Ventilasi"},{"key":"Peruntukan","value":"Area Pabrik, Kilang, Parkir Terbuka, Halaman Gedung"},{"key":"Aksesoris","value":"Kunci Master Key + Gantungan Selang & Nozel"}]'::jsonb),
('vinci-hp-13a', 'VINCI-HP-13A', 'HYDRANT PILLAR 1-WAY (H-13A)', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_hydrant_pillar_1way.jpg', 'Pilar hidran outlet tunggal bertekanan tinggi untuk penyaluran air pemadam kebakaran di area luar bangunan dengan konstruksi besi cor kokoh berstandar industri.', '[{"key":"Ukuran Inlet","value":"Flange JIS 10K 3 Inch atau 4 Inch"},{"key":"Ukuran Outlet","value":"1 x 2.5 Inch Machino / VDH Coupling"},{"key":"Material Body","value":"Ductile Iron / Cast Iron Grade A"},{"key":"Tekanan Uji Hydrotest","value":"25 Bar (360 PSI)"},{"key":"Tekanan Kerja Maksimal","value":"16 Bar (230 PSI)"},{"key":"Katup Pengendali","value":"Main Valve Spindle Kuningan Heavy Duty"},{"key":"Aplikasi","value":"Area Jalan Industri, Pergudangan, Pertambangan"}]'::jsonb),
('vinci-hp-14a', 'VINCI-HP-14A', 'HYDRANT PILLAR TWO-WAY (H-14A)', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_hydrant_pillar_2way.jpg', 'Pilar hidran dua jalur outlet independen dilengkapi ball valve kuningan berkualitas tinggi untuk manuver dua regu pemadam sekaligus secara simultan.', '[{"key":"Ukuran Inlet","value":"Flange JIS 10K 4 Inch Standard"},{"key":"Ukuran Outlet","value":"2 x 2.5 Inch Machino Coupling Kuningan"},{"key":"Material Badan","value":"Ductile Cast Iron Standar SNI / NFPA"},{"key":"Tekanan Pengujian","value":"25 Kgf/cm² (Hydrostatic Test)"},{"key":"Katup Pengeluaran","value":"2 x Ball Valve Kuningan 2.5 Inch"},{"key":"Warna Finishing","value":"Signal Red Epoxy Primer & Top Coat Tahan UV"},{"key":"Rekomendasi Debit","value":"500 - 1000 GPM pada 7 - 10 Bar"}]'::jsonb),
('vinci-sc-01', 'VINCI-SC-01', 'SIAMESE CONNECTION TWO-WAY (S-11A)', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_siamese_connection.jpg', 'Sambungan siamese pemadam kebakaran dinding/tiang untuk injeksi pasokan air bertekanan tinggi dari mobil pompa Dinas Pemadam ke jaringan pipa kering/basah gedung.', '[{"key":"Inlet Pemadam","value":"2 x 2.5 Inch Machino Quick Coupling Kuningan"},{"key":"Outlet Jaringan","value":"1 x 4 Inch Flange JIS 10K atau Drat NPT"},{"key":"Tipe Katup Internal","value":"Dual Clapper Non-Return Check Valve"},{"key":"Material Body","value":"Forged Brass Kuningan Tembaga Padat / Cast Bronze"},{"key":"Tekanan Kerja","value":"20 Bar (300 PSI)"},{"key":"Kelengkapan","value":"Plat Dinding Chrome Emboss SIAMESE CONNECTION"}]'::jsonb),
('vinci-v-nozzle', 'VINCI-VN-25', 'VARIABLE NOZZLE / SPRAY JET STREAM', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_variable_nozzle.jpg', 'Nosel pengatur semburan multifungsi yang dapat diatur putarannya dari pancaran lurus jarak jauh (jet stream) hingga tirai kabut pelindung radiasi panas (fog/spray).', '[{"key":"Ukuran Sambungan","value":"1.5 Inch dan 2.5 Inch Machino Standard"},{"key":"Material Logam","value":"Solid Aluminium Alloy Anodized & Brass Ring"},{"key":"Pola Semburan","value":"Full Jet Stream, Spray Lebar 120°, Shut-Off"},{"key":"Tekanan Kerja","value":"7 hingga 16 Bar"},{"key":"Pegangan","value":"Rubber Bumper Pelindung Benturan & Anti Slip"}]'::jsonb),
('vinci-bp-nozzle', 'VINCI-BN-25', 'BRUNCHPIPE / SMOOTH BORE JET NOZZLE', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_branchpipe_nozzle.jpg', 'Nosel jet lurus berkecepatan tinggi dengan tabung brunchpipe konikal untuk pancaran air bertekanan tinggi dengan jangkauan jarak tembak maksimal.', '[{"key":"Ukuran Coupling","value":"1.5 Inch & 2.5 Inch Machino"},{"key":"Ukuran Tip Nozel","value":"Tip Lubang 1/2 Inch, 5/8 Inch, 1 Inch"},{"key":"Bahan Material","value":"Cast Brass Kuningan Poles / Aluminium Cor"},{"key":"Jangkauan Pancar","value":"Lebih dari 35 Meter pada Tekanan 7 Bar"}]'::jsonb),
('vinci-val-25', 'VINCI-LV-25', 'LANDING HYDRANT VALVE 2.5 INCH', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_hydrant_valve.jpg', 'Katup pendarat hidran ulir kuningan tebal dengan sambungan outlet Machino untuk dipasang di dalam boks hidran gedung atau landing riser tangga darurat.', '[{"key":"Ukuran Drat Inlet","value":"2.5 Inch Male / Female BSP Thread"},{"key":"Ukuran Outlet","value":"2.5 Inch Machino Female Quick Coupling"},{"key":"Bahan Rangka","value":"Cast Bronze / Brass Kuningan Tahan Karat"},{"key":"Handwheel","value":"Cast Iron Finishing Red Baked Enamel"},{"key":"Tekanan Kerja","value":"16 Bar (230 PSI)"}]'::jsonb),
('vinci-hr-25', 'VINCI-HR-25', 'ALUMINIUM HOSE RACK SISIR SELANG', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_hose_rack.jpg', 'Rak sisir penggantung selang pemadam dalam boks hidran dengan sistem buka otomatis (auto-release) tanpa membuat selang terbelit saat ditarik darurat.', '[{"key":"Kapasitas Selang","value":"Selang 1.5 Inch Panjang 30 Meter"},{"key":"Jumlah Gigi Sisir","value":"24 Pin Lipatan Presisi"},{"key":"Material","value":"Aluminium Alloy Cor & Mild Steel Hanger"},{"key":"Fitur Khusus","value":"Mekanisme Pengunci Ayun Movable Swivel Arm"}]'::jsonb),
('vinci-fh-rub25', 'VINCI-FHR-25', 'FIRE HOSE RUBBER NITRILE RED 2.5 INCH', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_fire_hose_rubber.jpg', 'Selang pemadam kebakaran berlapis karet sintetis Nitrile heavy duty 3 lapis, tahan gesekan aspal, minyak, zat kimia industri, dan sengatan ozon.', '[{"key":"Diameter Dalam","value":"2.5 Inch (65 mm)"},{"key":"Panjang Roll","value":"20 Meter & 30 Meter"},{"key":"Material Selang","value":"100% Synthetic Nitrile Rubber Thru-The-Weave"},{"key":"Tekanan Kerja (WP)","value":"17 - 20 Bar (250 - 300 PSI)"},{"key":"Tekanan Pecah (BP)","value":"50 - 60 Bar (750 - 900 PSI)"},{"key":"Kopling Sambung","value":"Machino Brass / Aluminium Wire Binding"}]'::jsonb),
('vinci-fh-kan15', 'VINCI-FHK-15', 'FIRE HOSE KANVAS POLYESTER 1.5 INCH', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_fire_hose_kanvas.jpg', 'Selang pemadam rajutan benang polyester berkekuatan tarik tinggi dengan lapisan karet EPDM di bagian dalam, ringan, fleksibel, dan mudah digulung.', '[{"key":"Diameter Dalam","value":"1.5 Inch (38 mm)"},{"key":"Panjang Standar","value":"30 Meter (100 Feet)"},{"key":"Anyaman Luar","value":"100% High Tenacity Virgin Polyester Fiber"},{"key":"Lapisan Dalam","value":"Seamless High Grade Vulcanized EPDM Lining"},{"key":"Tekanan Kerja","value":"13 - 16 Bar (Tekanan Uji 25 Bar)"}]'::jsonb),
('vinci-reel-01', 'VINCI-HR-01', 'SWINGING FIRE HOSE REEL DRUM 1 INCH', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_hose_reel.jpg', 'Gulungan selang drum putar manual yang tersambung langsung ke pipa air bertekanan, siap digunakan seketika oleh penghuni gedung untuk pertolongan awal kebakaran.', '[{"key":"Ukuran Selang","value":"Semi-Rigid Rubber Hose 1 Inch x 30 Meter"},{"key":"Diameter Drum","value":"550 mm Plat Baja Merah Oven"},{"key":"Operasional","value":"Manual Swinging Arm Sudut Putar 180°"},{"key":"Tekanan Kerja","value":"12 Bar (175 PSI)"},{"key":"Nozel Ujung","value":"Shut-Off Jet / Spray Brass Nozzle 1 Inch"}]'::jsonb),
('vinci-y-conn', 'VINCI-YC-25', 'DIVIDING BREECHING / Y-CONNECTION VALVE', 'Vinci Firefighting Supplier', 'hydrant', '/images/catalog/products/vinci_y_connection.jpg', 'Fitting pemecah satu jalur pipa aliran air menjadi dua jalur selang pemadam sekaligus dengan dua katup putar bola independen.', '[{"key":"Inlet Utama","value":"1 x 2.5 Inch Machino Male"},{"key":"Outlet Cabang","value":"2 x 2.5 Inch Machino Female"},{"key":"Material Badan","value":"Solid Cast Brass Kuningan Heavy Duty"},{"key":"Sistem Katup","value":"Dual Ball Valve Pegangan Tuas Cepat"},{"key":"Tekanan Uji","value":"20 Bar"}]'::jsonb),
('alerta-bell-fb6', 'AL-FB6', 'FIRE ALARM BELL 6 INCH 24VDC', 'ALERTA Fire Alarm System', 'alarm', '/images/catalog/products/alerta_alarm_bell_fb6.jpg', 'Bel tanda bahaya kebakaran elektromagnetik berdentang keras 95 desibel dengan konsumsi arus listrik rendah dan daya tahan mekanikal tinggi.', '[{"key":"Tegangan Operasional","value":"24 VDC (Polarized for Line Monitoring)"},{"key":"Tingkat Suara (Output)","value":"Lebih dari 95 dB pada Jarak 3 Meter"},{"key":"Konsumsi Arus","value":"Maksimal 25 mA (Low Current Consumption)"},{"key":"Material Piringan","value":"Baja Campuran Finishing Merah Mengkilat"},{"key":"Diameter Gong","value":"6 Inch (150 mm)"},{"key":"Sertifikasi","value":"Standar EN54-3 & LPCB Approval"}]'::jsonb),
('alerta-lamp-fl3', 'AL-FL3', 'FIRE ALARM INDICATOR LAMP RED LED', 'ALERTA Fire Alarm System', 'alarm', '/images/catalog/products/alerta_indicator_lamp_fl3.jpg', 'Lampu indikator peringatan darurat LED merah sudut pandang lebar yang menyala berkedip terang saat terjadi sinyal bahaya dari panel alarm atau detektor.', '[{"key":"Tegangan Kerja","value":"24 VDC"},{"key":"Sumber Cahaya","value":"High Brightness Surface Mounted Red LED"},{"key":"Material Kap","value":"Polycarbonate Merah Transparan Tahan Panas"},{"key":"Sudut Visibilitas","value":"360 Derajat Horizontal"},{"key":"Konsumsi Arus","value":"Hanya 15 mA"}]'::jsonb),
('alerta-fap-05', 'AL-FAP05', 'CONVENTIONAL FIRE ALARM CONTROL PANEL', 'ALERTA Fire Alarm System', 'alarm', '/images/catalog/products/alerta_alarm_panel.jpg', 'Master Control Fire Alarm (MCFA) konvensional dengan pemantauan saluran kabel End-Of-Line (EOL), charger baterai cadangan otomatis, dan log riwayat gangguan.', '[{"key":"Jumlah Zona","value":"Tersedia 5 Zona, 10 Zona, hingga 30 Zona"},{"key":"Sumber Daya Utama","value":"220 VAC 50/60 Hz"},{"key":"Baterai Cadangan","value":"Built-in 2 x 12V 4.5Ah Sealed Lead Acid"},{"key":"Tegangan Sirkit Detektor","value":"24 VDC Nominal"},{"key":"Fitur Diagnostik","value":"Deteksi Kabel Putus, Konsleting, dan Ground Fault"}]'::jsonb),
('alerta-smk-501', 'AL-SD501', 'PHOTOELECTRIC SMOKE DETECTOR 24V', 'ALERTA Fire Alarm System', 'alarm', '/images/catalog/products/alerta_smoke_sd501.jpg', 'Sensor pendeteksi asap optikal ruang sensor infra-merah berpresisi tinggi untuk merespons partikel asap kebakaran lambat dan bara api secara akurat.', '[{"key":"Metode Sensor","value":"Optical Photoelectric Scattering Chamber"},{"key":"Tegangan Kerja","value":"12 - 30 VDC"},{"key":"Arus Standby","value":"Kurang dari 45 mikro-Ampere"},{"key":"Indikator Visual","value":"Dual LED Merah Menyala 360 Derajat saat Aktif"},{"key":"Area Cakupan","value":"Hingga 80 m² pada Ketinggian Plafon Standar"}]'::jsonb),
('alerta-smk-601', 'AL-SD601', 'SMOKE & FIXED HEAT COMBINATION DETECTOR', 'ALERTA Fire Alarm System', 'alarm', '/images/catalog/products/alerta_smoke_sd601.jpg', 'Detektor kombinasi cerdas sensor asap optik dan sensor suhu panas tetap (58°C) dalam satu perangkat untuk pencegahan alarm palsu di ruangan multifungsi.', '[{"key":"Sensor Ganda","value":"Photoelectric Chamber + NTC Thermistor"},{"key":"Titik Respon Panas","value":"Suhu Tetap 58 Derajat Celsius"},{"key":"Sensitivitas Asap","value":"Standar EN54-7 & UL 268"},{"key":"Kompatibilitas","value":"Universal 2-Wire Base Cocok untuk Semua MCFA"}]'::jsonb),
('alerta-heat-306', 'AL-HD306', 'RATE OF RISE HEAT DETECTOR (ROR)', 'ALERTA Fire Alarm System', 'alarm', '/images/catalog/products/alerta_heat_hd306.jpg', 'Sensor detektor kenaikan suhu panas mendadak (lebih dari 8°C per menit) berbasis diafragma ekspansi udara mekanikal untuk dapur kering, bengkel, dan ruang genset.', '[{"key":"Prinsip Kerja","value":"Pneumatic Air Expansion Metal Diaphragm"},{"key":"Titik Respon ROR","value":"Kenaikan Panas Melebihi 8.5°C per Menit"},{"key":"Mekanisme Reset","value":"Self-Restoring Otomatis saat Suhu Normal"},{"key":"Material Casing","value":"ABS Fire-Resistant Thermoplastic White"}]'::jsonb),
('alerta-heat-307', 'AL-HD307', 'FIXED TEMPERATURE HEAT DETECTOR 70°C', 'ALERTA Fire Alarm System', 'alarm', '/images/catalog/products/alerta_heat_hd307.jpg', 'Sensor panas batas suhu mutlak 70°C yang aktif ketika temperatur ruangan mencapai ambang batas batas aman akibat api terbuka atau gas pembakaran.', '[{"key":"Temperatur Respon","value":"Fixed 70°C (Tersedia opsi 60°C & 85°C)"},{"key":"Elemen Pengindera","value":"Bi-Metallic Strip Presisi Tinggi"},{"key":"Resistansi Suhu","value":"Cocok untuk Area Berdebu dan Ruangan Boiler"},{"key":"Standar Pengujian","value":"EN54-5 Class A2"}]'::jsonb),
('alerta-d223', 'AL-D223', 'UNIVERSAL DETECTOR MOUNTING BASE 2-WIRE', 'ALERTA Fire Alarm System', 'alarm', '/images/catalog/products/alerta_detector_d223.jpg', 'Dudukan basis soket detektor alarm dengan terminal kuningan berlapis perak dan pin pengunci anti-lepas untuk kemudahan instalasi di plafon gedung.', '[{"key":"Konfigurasi Kabel","value":"2-Wire Standard Loop Connection"},{"key":"Terminal Kontak","value":"Stainless Steel Spring Contacts Anti Korosi"},{"key":"Diameter Basis","value":"100 mm (Jarak Lubang Baut 50 - 75 mm)"},{"key":"Kompatibilitas","value":"Smoke SD501, SD601, Heat HD306, HD307"}]'::jsonb),
('alerta-ps-01', 'AL-PS1', 'MANUAL PULL STATION DUAL ACTION', 'ALERTA Fire Alarm System', 'alarm', '/images/catalog/products/alerta_push_station_ps1.jpg', 'Stasiun pemicu alarm darurat manual tipe tekan-tarik dua langkah (dual action) untuk mencegah aktivasi akibat benturan tidak sengaja.', '[{"key":"Mekanisme Aksi","value":"Dual Action (Push Plate & Pull Down)"},{"key":"Bahan Material","value":"Cast Aluminium Die-Cast Warna Merah Signal"},{"key":"Saklar Internal","value":"Form C Relay Contact (SPDT) Rating 2A 30VDC"},{"key":"Sistem Kunci","value":"Key Lock Reset Hex / Flat Key"}]'::jsonb),
('alerta-fp-01', 'AL-FP1', 'RESETTABLE MANUAL CALL POINT AL-FP1', 'ALERTA Fire Alarm System', 'alarm', '/images/catalog/products/alerta_call_point_fp1.jpg', 'Tombol darurat manual fleksibel yang dapat di-reset kembali menggunakan kunci uji tanpa perlu mengganti kaca pecah setelah aktivasi.', '[{"key":"Tipe Elemen","value":"Non-Breaking Resettable Plastic Flexi-Element"},{"key":"Indikasi Status","value":"Bendera Kuning Indikator Turun saat Tertekan"},{"key":"Aksesoris","value":"Termasuk Reset Test Key & Tutup Pelindung Bening"},{"key":"Pemasangan","value":"Flush Mount atau Surface Backbox"}]'::jsonb),
('alerta-ft-vert', 'AL-FT-V', 'VERTICAL FIXED FOAM BLADDER TANK ALRML', 'ALERTA Foam Equipment', 'foam', '/images/catalog/products/alerta_foam_tank_vertical.jpg', 'Tangki pencampur konsentrat busa pemadam tipe vertikal bertekanan air (balanced pressure bladder tank) dengan kantung karet sintetis tahan konsentrat AFFF/AR-AFFF.', '[{"key":"Kapasitas Bejana","value":"200L, 300L, 500L, 1000L, 2000L s/d 5000 Liters"},{"key":"Orientasi Bejana","value":"Vertikal dengan 3 Kaki Baja Penopang"},{"key":"Material Tangki","value":"Carbon Steel Pressure Vessel ASME Section VIII"},{"key":"Bahan Bladder","value":"Buna-N Synthetic Rubber Reinforced Nylon"},{"key":"Tekanan Uji Bejana","value":"16 Bar Hydrostatic Pressure"}]'::jsonb),
('alerta-ft-horiz', 'AL-FT-H', 'HORIZONTAL FIXED FOAM BLADDER TANK ALRM', 'ALERTA Foam Equipment', 'foam', '/images/catalog/products/alerta_foam_tank_horizontal.jpg', 'Tangki busa horizontal kapasitas besar untuk proteksi kilang minyak, depo bahan bakar, helipad, dan hanggar pesawat dengan stabilitas gravitasi rendah.', '[{"key":"Kapasitas Bejana","value":"1000L, 2000L, 3000L, 5000L, 8000L s/d 10000 Liters"},{"key":"Orientasi Desain","value":"Horizontal Saddle Base Heavy Duty"},{"key":"Proporsional Ratio","value":"1% hingga 6% Foam Proportioner Controller"},{"key":"Material Manifold","value":"Pipa Baja Sch 40 & Valve Stainless Steel"},{"key":"Aplikasi","value":"Tangki Timbun Minyak, Pelabuhan, Pabrik Kimia"}]'::jsonb),
('alerta-fe-28b', 'AL-SL28B', 'PORTABLE INLINE FOAM EDUCTOR AL-SL-28B / 28S', 'ALERTA Foam Equipment', 'foam', '/images/catalog/products/alerta_foam_eductor.jpg', 'Eductor venturi portabel berbahan kuningan untuk mencampur konsentrat busa secara induksi otomatis dari jerigen ke aliran selang pemadam.', '[{"key":"Ukuran Koneksi","value":"2.5 Inch (AL-SL-28B) & 1.5 Inch (AL-SL-28S)"},{"key":"Laju Aliran (Flow Rate)","value":"225 s/d 450 Liter per Menit (60 - 120 GPM)"},{"key":"Induction Rate","value":"Adjustable Metering Dial: 1%, 3%, 6%"},{"key":"Material Rangka","value":"Cast Bronze Kuningan dengan Pick-up Hose Transparan"},{"key":"Tekanan Masuk Minimum","value":"7 Bar untuk Pembentukan Busa Maksimal"}]'::jsonb),
('alerta-ig-55', 'AL-IG55', 'INERT GAS CLEAN AGENT SYSTEM (IG-55 / 100 / 541)', 'ALERTA Clean Agent Suppression', 'cleanagent', '/images/catalog/products/alerta_inert_gas_cylinder.jpg', 'Sistem pemadam api gas bersih tanpa residu ramah lingkungan (ODP 0, GWP 0) dengan teknologi 300 bar untuk perlindungan data center, genset, dan arsip berharga.', '[{"key":"Jenis Agen Gas","value":"IG-55 (50% N₂ + 50% Ar), IG-100 (100% N₂), IG-541"},{"key":"Tekanan Penyimpanan","value":"300 Bar (Teknologi VDS Approval 50L & 80L)"},{"key":"Waktu Pelepasan","value":"Desain Discharge Maksimal 60 Detik"},{"key":"Sifat Lingkungan","value":"Non-Conductive, Zero ODP, Zero GWP, No Residue"},{"key":"Standar Desain","value":"NFPA 2001 Standard on Clean Agent Extinguishing"}]'::jsonb),
('alerta-dymp-80', 'AL-DYMP80', 'EXTINGUISHING CYLINDER GROUP DYMP80/30 & 140/30', 'ALERTA Clean Agent Suppression', 'cleanagent', '/images/catalog/products/alerta_inert_gas_system.jpg', 'Kelompok tabung gas bersih baja seamless bertekanan tinggi 300 bar lengkap dengan katup silinder presisi tinggi, manifold, dan selang fleksibel discharge.', '[{"key":"Volume Silinder","value":"80 Liter (DYMP80/30) & 140 Liter (DYMP140/30)"},{"key":"Bahan Tabung","value":"Seamless High Strength Alloy Steel 34CrMo4"},{"key":"Tekanan Kerja Silinder","value":"300 Bar pada 15°C"},{"key":"Perangkat Keamanan","value":"Pressure Gauge Kontak Elektrik & Bursting Disc"},{"key":"Aktuasi Katup","value":"Solenoid Pilot Actuator & Manual Mechanical Lever"}]'::jsonb),
('alerta-nozzle-popc', 'AL-POPC25', 'CALIBRATED RADIAL DISCHARGE NOZZLE POPC', 'ALERTA Clean Agent Suppression', 'cleanagent', '/images/catalog/products/alerta_discharge_nozzle.jpg', 'Nozel sembur gas bersih terkalibrasi hidrolik yang menyebarkan gas secara merata dalam waktu kurang dari 60 detik tanpa turbulensi berbahaya.', '[{"key":"Ukuran Model","value":"POPC15 (1/2\"), POPC20 (3/4\"), POPC25 (1\") s/d POPC65 (2-1/2\")"},{"key":"Pola Sembur","value":"360° Radial Coverage & 180° Sidewall Coverage"},{"key":"Bahan Material","value":"Stainless Steel 304 / Kuningan Chrome Plated"},{"key":"Area Proteksi","value":"Radius hingga 5 Meter per Nozel pada Plafon Standar"}]'::jsonb),
('alerta-gas-ctrl', 'AL-GCP01', 'EXTINGUISHING GAS CONTROL PANEL & ACTUATION', 'ALERTA Clean Agent Suppression', 'cleanagent', '/images/catalog/products/alerta_control_panel.jpg', 'Panel pelepasan gas otomatis cross-zoning dengan aktuator solenoid elektro-pneumatik, delay timer countdown, manual release switch, dan abort button.', '[{"key":"Logika Pelepasan","value":"Cross-Zoning Dual Optical/Heat (Coincidence Logic)"},{"key":"Delay Timer Countdown","value":"Adjustable 0 - 60 Detik sebelum Pelepasan"},{"key":"Fasilitas Panel","value":"Key Switch Auto/Manual, Abort Hold Switch, Alarm Horn"},{"key":"Koneksi Output","value":"Solenoid Release Circuit 24VDC 2A, Siren, Flashing Strobe"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- SELESAI!
-- SEMUA TABEL, RLS PERMISSION, STORAGE BUCKET, DATA PRODUK (32), GALERI (11), DAN PROFIL PERUSAHAAN TELAH BERHASIL DI-SETUP!
