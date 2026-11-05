-- ====================================================================
-- PT INDO TEKNIK EMPATBELAS — SEED DATA (POPULATE DEFAULT CONTENT)
-- ====================================================================

-- 1. COMPANY PROFILE SEED
INSERT INTO public.company_profile (
    id, company_name, tagline, about_title, about_desc, vision, mission, stats, phone, whatsapp, email, address
) VALUES (
    'main',
    'PT INDO TEKNIK EMPATBELAS',
    'Fire Protection & Mechanical Electrical',
    'Profil & Integritas',
    'Mitra kontraktor spesialis sistem proteksi kebakaran, instalasi perpipaan hidran, sprinkler, dan mekanikal elektrikal berskala komersial maupun fasilitas industri di seluruh Indonesia.',
    'Menjadi kontraktor proteksi kebakaran dan mekanikal elektrikal terdepan di Indonesia dengan mengutamakan standar keselamatan tertinggi (NFPA & SNI).',
    '["Memberikan solusi rekayasa proteksi kebakaran terintegrasi dengan standar internasional.", "Menyediakan produk berkualitas tinggi, bersertifikasi, dan teruji keandalannya.", "Memberikan pelayanan profesional, tepat waktu, dan berorientasi pada keselamatan jiwa."]'::jsonb,
    '{"experience_years": "20+", "projects_completed": "500+", "standards": "NFPA & SNI", "expert_engineers": "30+"}'::jsonb,
    '+62 813-9063-0360',
    '6281390630360',
    'info@indoteknik14.com',
    'Workshop & Office: Jl. Raya Semarang - Kendal Km. 14, Semarang, Jawa Tengah'
) ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    tagline = EXCLUDED.tagline,
    about_desc = EXCLUDED.about_desc;

-- 2. GALLERY DOCUMENTATION SEED
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

-- 3. PRODUCTS CATALOG SEED (32 DATA PRODUK LENGKAP DENGAN SPESIFIKASI)
INSERT INTO public.products (id, code, title, brand, category, image, "desc", specs)
VALUES
(
    'vinci-box-a1',
    'VINCI-BOX-A1',
    'HYDRANT BOX TYPE A1 (INDOOR)',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_hydrant_box_a1.jpg',
    'Kotak hidran dalam ruangan (indoor) untuk penyimpanan selang pemadam dan nozzle, dibuat dari plat mild steel tebal dengan proses degreasing, phosphating, zincromate primer, dan finishing powder coating red signal.',
    '[{"key": "Dimensi", "value": "66 (T) x 52 (P) x 15 (L) cm"}, {"key": "Material", "value": "1.2 mm Mild Steel Plate"}, {"key": "Finishing", "value": "Top Coat Powder Coating Red Signal"}, {"key": "Proses Pengecatan", "value": "Dust Remover, Phosphating & Zincromate Primer"}, {"key": "Opsi Pintu", "value": "Plat Baja / Kaca Tempered + Kunci Kancing"}, {"key": "Aplikasi", "value": "Gedung Komersial, Kantor, Apartemen, Koridor"}]'::jsonb
),
(
    'vinci-box-a2',
    'VINCI-BOX-A2',
    'HYDRANT BOX TYPE A2 (INDOOR)',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_hydrant_box_a2.jpg',
    'Kotak hidran indoor kapasitas standar untuk menampung selang 1.5 Inch x 30 Meter, nozzle, dan landing valve. Finishing cat oven tahan benturan dan karat.',
    '[{"key": "Dimensi", "value": "100 (T) x 80 (P) x 18 (L) cm"}, {"key": "Material", "value": "1.2 mm Mild Steel Plate"}, {"key": "Finishing", "value": "Powder Coating Red Signal"}, {"key": "Kelengkapan Rak", "value": "Kompatibel Hose Rack 1.5 Inch"}, {"key": "Opsi Pintu", "value": "Pintu Plat Solid / Kaca Transparan"}, {"key": "Standar", "value": "NFPA 14 & Dinas Pemadam Kebakaran"}]'::jsonb
),
(
    'vinci-box-b',
    'VINCI-BOX-B',
    'HYDRANT BOX TYPE B (INDOOR)',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_hydrant_box_b.jpg',
    'Kotak hidran indoor ukuran besar yang dilengkapi kompartemen khusus di bagian atas untuk pemasangan manual push station, alarm bell, dan lampu indikator sistem alarm.',
    '[{"key": "Dimensi", "value": "125 (T) x 75 (P) x 18 (L) cm"}, {"key": "Material", "value": "1.2 mm Mild Steel Plate"}, {"key": "Finishing", "value": "Powder Coating Red Signal"}, {"key": "Kompartemen Atas", "value": "Slot Lubang Fire Alarm Set (Bell, Lamp, Push)"}, {"key": "Kapasitas", "value": "Selang 1.5 Inch, Nozzle, Valve & Alarm Set"}, {"key": "Aplikasi", "value": "Gedung Bertingkat, Rumah Sakit, Hotel, Mall"}]'::jsonb
),
(
    'vinci-box-c',
    'VINCI-BOX-C',
    'HYDRANT BOX TYPE C (OUTDOOR)',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_hydrant_box_c.jpg',
    'Kotak hidran luar ruangan (outdoor) tahan cuaca ekstrem lengkap dengan sepasang kaki penopang tiang, kisi ventilasi air, dan sistem kunci tahan karat.',
    '[{"key": "Dimensi", "value": "95 (T) x 66 (P) x 20 (L) cm"}, {"key": "Penopang Kaki", "value": "Pipa Hollow Heavy Duty Standar"}, {"key": "Material", "value": "1.2 mm Mild Steel Plate"}, {"key": "Finishing", "value": "Double Powder Coating Weatherproof Red"}, {"key": "Kapasitas", "value": "1 Roll 2.5 Inch, 1 Roll 1.5 Inch, Nozzle & Kunci Hidran"}, {"key": "Aplikasi", "value": "Halaman Pabrik, Kawasan Industri, Kilang Minyak, Dermaga"}]'::jsonb
),
(
    'vinci-hp-13a',
    'VINCI-HP-13A',
    'HYDRANT PILLAR 1-WAY (H-13A)',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_hydrant_pillar_1way.jpg',
    'Pilar hidran luar gedung satu jalur outlet (one-way) bertekanan tinggi dengan katup buka-tutup mandiri, material besi cor tahan korosi, dan sambungan cepat Machino/VDH.',
    '[{"key": "Model / Tipe", "value": "H-13A (1-Way Outlet)"}, {"key": "Ukuran Inlet", "value": "3 Inch (DN80) Flange Standar"}, {"key": "Ukuran Outlet", "value": "1 x 2.5 Inch Machino / VDH"}, {"key": "Material Bodi", "value": "Cast Iron / Ductile Iron Heavy Duty"}, {"key": "Tekanan Kerja", "value": "10 - 16 Bar (145 - 232 PSI)"}, {"key": "Tekanan Uji", "value": "20 Bar Hydrostatic Tested"}, {"key": "Finishing", "value": "Red Epoxy Powder Coating"}]'::jsonb
),
(
    'vinci-hp-14a',
    'VINCI-HP-14A',
    'HYDRANT PILLAR TWO-WAY (H-14A)',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_hydrant_pillar_2way.jpg',
    'Pilar hidran luar gedung dua jalur outlet (two-way) bertekanan tinggi untuk jaringan proteksi utama kawasan, lengkap dengan tutup kuningan berantai pengaman baja.',
    '[{"key": "Model / Tipe", "value": "H-14A (Two-Way Outlet)"}, {"key": "Ukuran Inlet", "value": "4 Inch (DN100) Flange Standar"}, {"key": "Ukuran Outlet", "value": "2 x 2.5 Inch (DN65) Machino / VDH"}, {"key": "Material Bodi", "value": "Cast Iron / Ductile Iron Heavy Duty"}, {"key": "Tekanan Kerja", "value": "10 - 16 Bar (145 - 232 PSI)"}, {"key": "Tekanan Uji", "value": "20 Bar Hydrostatic Tested"}, {"key": "Aksesoris", "value": "Brass Cap Rantai Baja Tahan Karat"}, {"key": "Standar", "value": "NFPA 24 & Standar Dinas Pemadam Kebakaran"}]'::jsonb
),
(
    'vinci-sc-s7a',
    'VINCI-SC-S7A',
    'SIAMESE CONNECTION TYPE S-7A / S-11',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_siamese_connection.jpg',
    'Koneksi injeksi pasokan air mobil pemadam ke pipa tegak sprinkler dan hidran gedung, dilengkapi katup searah (clapper/check valve) internal kuningan.',
    '[{"key": "Tipe Pemasangan", "value": "S-7A Wall Mounted / S-11 Standpipe"}, {"key": "Inlet", "value": "2 x 2.5 Inch Machino Coupling"}, {"key": "Outlet", "value": "4 Inch (DN100) Flange Connection"}, {"key": "Material", "value": "Full Heavy Brass / Bronze Cast"}, {"key": "Tekanan Kerja", "value": "10 Kg/cm² (10 Bar)"}, {"key": "Tekanan Uji", "value": "15 - 20 Kg/cm² Hydrostatic"}, {"key": "Finishing", "value": "Polished Brass & Red Accents"}]'::jsonb
),
(
    'vinci-hr-01',
    'VINCI-HR-01',
    'FIRE HOSE REEL SWING TYPE (VHR-1-R)',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_hose_reel.jpg',
    'Gulungan selang putar 180 derajat untuk tanggap darurat api awal di dalam gedung. Air dapat langsung dialirkan tanpa harus menggelar seluruh panjang selang.',
    '[{"key": "Model / Tipe", "value": "VHR-1-R Swing Arm Type"}, {"key": "Ukuran Selang", "value": "1 Inch x 30 Meter (100 Feet) Semi-Rigid"}, {"key": "Ketebalan Bodi", "value": "3 mm Solid Steel Drum"}, {"key": "Tekanan Kerja", "value": "15 Kg/cm²"}, {"key": "Tekanan Pecah", "value": "45 Kg/cm² (Bursting Pressure)"}, {"key": "Kelengkapan", "value": "Stop Valve Kuningan, Nozzle Jet/Spray, Hose Clip"}]'::jsonb
),
(
    'vinci-yc-25',
    'VINCI-YC-25',
    '''Y'' CONNECTION / DIVIDING BREECHING (AP-25X2)',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_y_connection.jpg',
    'Sambungan cabang dua jalur untuk membagi satu sumber aliran selang pemadam menjadi dua jalur serang terpisah dengan tuas katup mandiri.',
    '[{"key": "Model / Tipe", "value": "AP-25X2 Two-Way Dividing Breeching"}, {"key": "Inlet", "value": "2.5 Inch Machino Quick Coupling"}, {"key": "Outlet", "value": "2 x 1.5 Inch atau 2 x 2.5 Inch Machino"}, {"key": "Material", "value": "High Tensile Aluminium Alloy"}, {"key": "Tekanan Kerja", "value": "10 - 16 Kg/cm²"}, {"key": "Tekanan Uji", "value": "20 Kg/cm²"}, {"key": "Finishing", "value": "Anodized Red Signal"}]'::jsonb
),
(
    'vinci-hr-rack',
    'VINCI-HR-RACK',
    'FIRE HOSE RACK (ALLOY COMB)',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_hose_rack.jpg',
    'Rak sisir lipat gantung untuk penataan selang kanvas di dalam kotak hidran gedung agar tersusun rapi dan langsung terurai cepat saat ditarik.',
    '[{"key": "Ukuran Selang", "value": "1.5 Inch & 2.5 Inch"}, {"key": "Kapasitas", "value": "1 Roll Selang Panjang 20m - 30m"}, {"key": "Material Sisir", "value": "High Grade Aluminium Alloy"}, {"key": "Mekanisme", "value": "Swing Arm Swivel Pin bergerak 90° keluar box"}, {"key": "Finishing", "value": "Anodized Polished Metal"}]'::jsonb
),
(
    'vinci-hv-16k',
    'VINCI-HV-16K',
    'HYDRANT LANDING VALVE 10K / 16K',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_hydrant_valve.jpg',
    'Katup penyalur hidran utama berstandar industri dengan roda putar merah ergonomis dan bodi kuningan tahan tekanan tinggi.',
    '[{"key": "Pilihan Ukuran", "value": "1.5 Inch, 2 Inch, 2.5 Inch"}, {"key": "Rating Tekanan", "value": "JIS 10K / 16K (Working s/d 16 Bar)"}, {"key": "Material Bodi", "value": "Heavy Forged Brass / Bronze Cast"}, {"key": "Handwheel", "value": "Red Cast Iron Ergonomis"}, {"key": "Finishing", "value": "Chrome Plated / Polish Brass"}, {"key": "Koneksi", "value": "Inlet Drat BSP, Outlet Machino / VDH"}]'::jsonb
),
(
    'vinci-noz-str',
    'VINCI-NOZ-STR',
    'BRANCHPIPE WITH STRAIGHT NOZZLE',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_branchpipe_nozzle.jpg',
    'Pipa nozel pancar lurus aliran terpusat untuk penetrasi api jarak jauh bertekanan stabil pada operasi pemadaman luar maupun dalam gedung.',
    '[{"key": "Pilihan Ukuran", "value": "1.5 Inch & 2.5 Inch"}, {"key": "Material Bodi", "value": "Full Polished Brass / Cast Bronze"}, {"key": "Finishing", "value": "Mirror Polish Protective Coating"}, {"key": "Tipe Sambungan", "value": "Machino Quick Coupling / VDH"}, {"key": "Karakter Pancar", "value": "Jet Stream Terarah Jarak Jauh > 25m"}]'::jsonb
),
(
    'vinci-noz-var',
    'VINCI-NOZ-VAR',
    'VARIABLE HEAD NOZZLE (FOG / JET)',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_variable_nozzle.jpg',
    'Nozel semprot multi-posisi yang dapat diubah secara instan dari pancaran lurus terpusat ke mode kabut pelindung radiasi panas.',
    '[{"key": "Pilihan Ukuran", "value": "1.5 Inch & 2.5 Inch"}, {"key": "Pola Semprot", "value": "Straight Jet, Wide Angle Fog, Shut-Off"}, {"key": "Material", "value": "High Strength Aluminium Alloy & Brass"}, {"key": "Finishing", "value": "Hard Anodized Anti-Wear Treatment"}, {"key": "Koneksi", "value": "Machino Quick Coupling"}]'::jsonb
),
(
    'vinci-hse-k13',
    'VINCI-HSE-K13',
    'FIRE HOSE KANVAS 13K (WHITE CANVAS)',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_fire_hose_kanvas.jpg',
    'Selang pemadam kanvas putih rajutan polyester filament berkekuatan tarik tinggi dengan lapisan karet sintetis EPDM di bagian dalam.',
    '[{"key": "Diameter", "value": "1.5 Inch, 2 Inch, 2.5 Inch"}, {"key": "Panjang Roll", "value": "20 Meter & 30 Meter"}, {"key": "Tekanan Kerja", "value": "13 Kg/cm² (13 Bar / 190 PSI)"}, {"key": "Tekanan Pecah", "value": "39 Kg/cm² (Bursting Pressure 39 Bar)"}, {"key": "Jaket Luar", "value": "100% High-Tenacity Polyester Circular Weave"}, {"key": "Kopling", "value": "Alloy Machino Coupling Terpasang Klem"}]'::jsonb
),
(
    'vinci-hse-r20',
    'VINCI-HSE-R20',
    'FIRE HOSE RUBBER NITRILE 20K (HEAVY DUTY)',
    'Vinci Firefighting Supplier',
    'hydrant',
    '/images/catalog/products/vinci_fire_hose_rubber.jpg',
    'Selang pemadam karet nitril sintetis merah heavy duty tahan abrasi, gesekan aspal, minyak, zat kimia keras, dan paparan sinar matahari terik.',
    '[{"key": "Diameter", "value": "1.5 Inch, 2 Inch, 2.5 Inch"}, {"key": "Panjang Roll", "value": "20 Meter & 30 Meter"}, {"key": "Tekanan Kerja", "value": "20 Kg/cm² (20 Bar / 290 PSI)"}, {"key": "Tekanan Pecah", "value": "60 Kg/cm² (Bursting Pressure 60 Bar)"}, {"key": "Ketahanan", "value": "Tahan Minyak, Bahan Kimia, Ozon & Suhu Tinggi"}, {"key": "Kopling", "value": "Heavy Duty Machino Coupling Brass / Alloy"}]'::jsonb
),
(
    'al-cfp-mcfa',
    'AL-CFP-MCFA',
    'CONVENTIONAL FIRE ALARM PANEL CFP SERIES',
    'ALERTA Fire Alarm System',
    'alarm',
    '/images/catalog/products/alerta_alarm_panel.jpg',
    'Panel kontrol master fire alarm konvensional (MCFA) berbasis mikroprosesor modern dengan pilihan 4, 8, 16 hingga 32 zona deteksi gedung.',
    '[{"key": "Kapasitas Zona", "value": "CFP-704 (4 Zone), 708 (8Z), 716 (16Z), 732 (32Z)"}, {"key": "Tegangan Utama", "value": "220V AC ± 10%, 50/60 Hz"}, {"key": "Tegangan Sistem", "value": "24V DC Internal Bus"}, {"key": "Baterai Cadangan", "value": "2 x 12V Sealed Lead Acid Battery Backup Otomatis"}, {"key": "Output Sirkuit", "value": "2 Sirkuit Sounder 24V DC Terproteksi Sekring"}, {"key": "Fitur Operasional", "value": "Zone Isolation, Walk Test, Fault Monitor, Relay Kontak"}, {"key": "Sertifikasi", "value": "EN54-2, EN54-4 & CE Certified"}]'::jsonb
),
(
    'al-sd601',
    'AL-SD601',
    'PHOTOELECTRIC SMOKE DETECTOR AL-SD601',
    'ALERTA Fire Alarm System',
    'alarm',
    '/images/catalog/products/alerta_smoke_sd601.jpg',
    'Detektor asap optik presisi tinggi dengan ruang deteksi inframerah untuk merespons partikel asap kebakaran tahap awal secara cepat dan minim false alarm.',
    '[{"key": "Tegangan Operasi", "value": "9V - 33V DC Operasional"}, {"key": "Arus Standby", "value": "≤ 45 µA pada 24V DC"}, {"key": "Arus Alarm", "value": "≤ 45 mA pada 24V DC"}, {"key": "Sensitivitas Asap", "value": "0.15 - 0.3 dB/m (Sesuai EN54-7)"}, {"key": "Indikator Visual", "value": "Dual 360° Omnidirectional Red LED"}, {"key": "Cakupan Area", "value": "Hingga 80 m² pada ketinggian 6 - 12m"}, {"key": "Material", "value": "ABS Fire Retardant Flameproof White"}]'::jsonb
),
(
    'al-sd501',
    'AL-SD501',
    'PHOTOELECTRIC SMOKE DETECTOR AL-SD501',
    'ALERTA Fire Alarm System',
    'alarm',
    '/images/catalog/products/alerta_smoke_sd501.jpg',
    'Detektor asap konvensional profil ramping (ultra-slim) dengan jaring pelindung anti serangga dan debu, kompatibel dengan segala MCFA 24V DC.',
    '[{"key": "Tegangan Kerja", "value": "12V - 28V DC"}, {"key": "Arus Pengawasan", "value": "≤ 50 µA"}, {"key": "Teknologi Sensor", "value": "Infrared Optical Scattering Chamber"}, {"key": "Proteksi Chamber", "value": "Mesh Screen Anti-Serangga & Debu"}, {"key": "Base Dudukan", "value": "Twist-Lock Universal Base Mount"}, {"key": "Sertifikasi", "value": "CE, EN54-7 Approved"}]'::jsonb
),
(
    'al-d223',
    'AL-D223',
    'SINGLE STATION SMOKE & HEAT DETECTOR D-223',
    'ALERTA Fire Alarm System',
    'alarm',
    '/images/catalog/products/alerta_detector_d223.jpg',
    'Detektor kombinasi asap optik dan sensor panas mandiri (stand-alone) ditenagai baterai 9V dengan sirine alarm internal 85dB tanpa memerlukan kabel panel.',
    '[{"key": "Tipe Daya", "value": "Baterai Mandiri 9V DC (Alkaline / Heavy Duty)"}, {"key": "Output Suara", "value": "≥ 85 dB(A) pada jarak 3 Meter"}, {"key": "Sensor Ganda", "value": "Photoelectric Chamber + Termistor Panas 57°C"}, {"key": "Fitur", "value": "Test/Hush Button, Low Battery Warning Chirp"}, {"key": "Aplikasi", "value": "Kamar Hotel, Ruang Arsip, Rumah Sakit, Rumah Tinggal"}]'::jsonb
),
(
    'al-hd306',
    'AL-HD306',
    'RATE OF RISE HEAT DETECTOR AL-HD306',
    'ALERTA Fire Alarm System',
    'alarm',
    '/images/catalog/products/alerta_heat_hd306.jpg',
    'Detektor panas kombinasi laju kenaikan suhu (Rate of Rise) dan batas suhu mutlak, ideal untuk area dapur, ruang genset, ruang boiler, dan bengkel.',
    '[{"key": "Respon Laju Panas", "value": "Aktif bila suhu naik ≥ 8°C per menit"}, {"key": "Batas Suhu Tetap", "value": "58°C (136°F) Absolute Threshold"}, {"key": "Tegangan Kerja", "value": "12V - 30V DC"}, {"key": "Material Kontak", "value": "Silver Alloy Contact Anti Oksidasi"}, {"key": "Cakupan Area", "value": "Hingga 50 m²"}, {"key": "Sertifikasi", "value": "EN54-5 Class A1R Certified"}]'::jsonb
),
(
    'al-hd307',
    'AL-HD307',
    'FIXED TEMPERATURE HEAT DETECTOR AL-HD307',
    'ALERTA Fire Alarm System',
    'alarm',
    '/images/catalog/products/alerta_heat_hd307.jpg',
    'Detektor panas suhu tetap yang aktif saat temperatur ruangan mencapai batas 70°C, kebal terhadap perubahan suhu harian yang fluktuatif.',
    '[{"key": "Titik Suhu Aktif", "value": "70°C (158°F) / Opsi 60°C"}, {"key": "Tegangan Kerja", "value": "12V - 30V DC"}, {"key": "Arus Standby", "value": "0 µA (Dry Contact Bimetal)"}, {"key": "Elemen Sensor", "value": "High Precision Bimetal Snap Disc"}, {"key": "Fitur Reset", "value": "Auto-Reset setelah suhu kembali normal"}, {"key": "Standar", "value": "EN54-5 Class B Approved"}]'::jsonb
),
(
    'al-fb6',
    'AL-FB6',
    'FIRE ALARM BELL 6 INCH AL-FB6',
    'ALERTA Fire Alarm System',
    'alarm',
    '/images/catalog/products/alerta_alarm_bell_fb6.jpg',
    'Bel alarm kebakaran elektrik bodi baja padat dengan suara nyaring tembus dinding 95dB untuk evakuasi darurat gedung bertingkat.',
    '[{"key": "Diameter Gong", "value": "6 Inch (152 mm)"}, {"key": "Tegangan Kerja", "value": "24V DC Polarized"}, {"key": "Konsumsi Arus", "value": "≤ 25 mA"}, {"key": "Kekuatan Suara", "value": "≥ 95 dB(A) pada jarak 3 Meter"}, {"key": "Motor Penggerak", "value": "Miniature Permanent Magnet High Torque DC Motor"}, {"key": "Material Gong", "value": "Die Cast Steel Finish Red Powder Coating"}, {"key": "Sertifikasi", "value": "EN54-3 Certified"}]'::jsonb
),
(
    'al-fl3',
    'AL-FL3',
    'LED REMOTE INDICATOR LAMP AL-FL3',
    'ALERTA Fire Alarm System',
    'alarm',
    '/images/catalog/products/alerta_indicator_lamp_fl3.jpg',
    'Lampu indikator LED eksternal yang dipasang di atas pintu ruangan terkunci untuk menandai detektor kebakaran mana yang sedang aktif di dalam.',
    '[{"key": "Tegangan Operasi", "value": "12V - 28V DC"}, {"key": "Sumber Cahaya", "value": "Super Bright Wide Angle Red LED"}, {"key": "Konsumsi Arus", "value": "≤ 15 mA"}, {"key": "Material", "value": "Flame-Retardant ABS Base & Acrylic Red Lens"}, {"key": "Pemasangan", "value": "Wall Flush Mount di atas pintu"}]'::jsonb
),
(
    'al-ps1',
    'AL-PS1',
    'MANUAL PUSH STATION AL-PS1',
    'ALERTA Fire Alarm System',
    'alarm',
    '/images/catalog/products/alerta_push_station_ps1.jpg',
    'Stasiun pemicu alarm darurat manual tipe tekan-tarik dua langkah (dual action) untuk mencegah aktivasi akibat benturan tidak sengaja.',
    '[{"key": "Mekanisme Aksi", "value": "Dual Action (Push Plate & Pull Down)"}, {"key": "Tegangan Operasi", "value": "12V - 30V DC (Kontak Relay Max 30V 1A)"}, {"key": "Material Casing", "value": "Die-Cast Aluminium Alloy / Polycarbonate Red"}, {"key": "Mekanisme Reset", "value": "Kunci Khusus (Key Reset Mechanism)"}, {"key": "Standar", "value": "NFPA 72 & EN54-11 Compliant"}]'::jsonb
),
(
    'al-fp1',
    'AL-FP1',
    'RESETTABLE MANUAL CALL POINT AL-FP1',
    'ALERTA Fire Alarm System',
    'alarm',
    '/images/catalog/products/alerta_call_point_fp1.jpg',
    'Tombol darurat manual fleksibel yang dapat di-reset kembali menggunakan kunci uji tanpa perlu mengganti kaca pecah setelah aktivasi.',
    '[{"key": "Tipe Elemen", "value": "Non-Breaking Resettable Plastic Flexi-Element"}, {"key": "Kapasitas Kontak", "value": "12V - 30V DC / 250V AC 3A Switch"}, {"key": "Indikator Status", "value": "LED Merah & Bendera Mekis Kuning"}, {"key": "Proteksi Cover", "value": "Flip Cover Transparan Anti-False Alarm"}, {"key": "Sertifikasi", "value": "EN54-11 & CE Marked"}]'::jsonb
),
(
    'al-alrml',
    'AL-ALRML',
    'VERTICAL FIXED FOAM BLADDER TANK ALRML',
    'ALERTA Foam Equipment',
    'foam',
    '/images/catalog/products/alerta_foam_tank_vertical.jpg',
    'Tangki pencampur konsentrat busa pemadam tipe vertikal bertekanan air (balanced pressure bladder tank) dengan kantung karet sintetis tahan konsentrat AFFF/AR-AFFF.',
    '[{"key": "Kapasitas Bejana", "value": "200L, 300L, 500L, 1000L, 2000L s/d 5000 Liters"}, {"key": "Tekanan Kerja", "value": "0.8 - 1.2 MPa (8 - 12 Bar)"}, {"key": "Rasio Proporsional", "value": "3% atau 6% Automatic Proportioning"}, {"key": "Rentang Debit Aliran", "value": "4 LPS hingga 64 LPS (Flow Rate Range)"}, {"key": "Material Bejana", "value": "Carbon Steel Pressure Vessel ASME Code"}, {"key": "Material Bladder", "value": "Buna-N Synthetic Rubber Bladder Elastis"}, {"key": "Standar Flensa", "value": "Proportioner ANSI 150# / BS4504 / GB Flange"}]'::jsonb
),
(
    'al-alrm',
    'AL-ALRM',
    'HORIZONTAL FIXED FOAM BLADDER TANK ALRM',
    'ALERTA Foam Equipment',
    'foam',
    '/images/catalog/products/alerta_foam_tank_horizontal.jpg',
    'Tangki busa horizontal kapasitas besar untuk proteksi kilang minyak, depo bahan bakar, helipad, dan hanggar pesawat dengan stabilitas gravitasi rendah.',
    '[{"key": "Kapasitas Bejana", "value": "1000L, 2000L, 3000L, 5000L, 8000L s/d 10000 Liters"}, {"key": "Tekanan Kerja", "value": "0.8 - 1.2 MPa (8 - 12 Bar)"}, {"key": "Rasio Pencampuran", "value": "3% atau 6% Presisi Tinggi"}, {"key": "Rentang Debit Aliran", "value": "16 LPS hingga 100 LPS"}, {"key": "Pipa & Katup", "value": "Carbon Steel Standar (Opsi Stainless Steel SS304)"}, {"key": "Katup Pengaman", "value": "Safety Relief Valve Brass / SS304"}, {"key": "Finishing Luar", "value": "Industrial Polyurethane Red Paint Coating"}]'::jsonb
),
(
    'al-sl-28',
    'AL-SL-28',
    'PORTABLE INLINE FOAM EDUCTOR AL-SL-28B / 28S',
    'ALERTA Foam Equipment',
    'foam',
    '/images/catalog/products/alerta_foam_eductor.jpg',
    'Eductor venturi portabel berbahan kuningan untuk mencampur konsentrat busa secara induksi otomatis dari jerigen ke aliran selang pemadam.',
    '[{"key": "Ukuran Koneksi", "value": "2.5 Inch (AL-SL-28B) & 1.5 Inch (AL-SL-28S)"}, {"key": "Debit Aliran", "value": "200 LPM & 400 LPM @ 7 Bar"}, {"key": "Konsentrasi Busa", "value": "Dial Switch Metering 3% & 6%"}, {"key": "Material Bodi", "value": "Cor Kuningan Kokoh (Heavy Brass Body)"}, {"key": "Material Kopling", "value": "Aluminium Machino / NST Quick Lock"}, {"key": "Perlengkapan", "value": "Pick-Up Suction Hose Transparan & Ball Valve Nipple"}]'::jsonb
),
(
    'al-ig-sys',
    'AL-IG-SYS',
    'INERT GAS CLEAN AGENT SYSTEM (IG-55 / 100 / 541)',
    'ALERTA Clean Agent Suppression',
    'cleanagent',
    '/images/catalog/products/alerta_inert_gas_cylinder.jpg',
    'Sistem pemadam api gas bersih tanpa residu ramah lingkungan (ODP 0, GWP 0) dengan teknologi 300 bar untuk perlindungan data center, genset, dan arsip berharga.',
    '[{"key": "Jenis Agen Gas", "value": "IG-55 (50% N₂ + 50% Ar), IG-100 (100% N₂), IG-541"}, {"key": "Teknologi Tekanan", "value": "300 Bar (Hemat ruang tabung hingga 40% dibanding 200 Bar)"}, {"key": "Dampak Lingkungan", "value": "Zero ODP, Zero GWP, Atmospheric Lifetime 0 Hari"}, {"key": "Keamanan Personil", "value": "Aman untuk Area Berpenghuni (Safe Evacuation)"}, {"key": "Tekanan Distribusi", "value": "Calibrated Restrictor membatasi tekanan pipa ≤ 60 Bar"}, {"key": "Sertifikasi", "value": "NFPA 2001, ISO 14520, TFRI Approved"}]'::jsonb
),
(
    'al-dymp',
    'AL-DYMP',
    'EXTINGUISHING CYLINDER GROUP DYMP80/30 & 140/30',
    'ALERTA Clean Agent Suppression',
    'cleanagent',
    '/images/catalog/products/alerta_inert_gas_system.jpg',
    'Kelompok tabung gas bersih baja seamless bertekanan tinggi 300 bar lengkap dengan katup silinder presisi tinggi, manifold, dan selang fleksibel discharge.',
    '[{"key": "Volume Silinder", "value": "80 Liter (DYMP80/30) & 140 Liter (DYMP140/30)"}, {"key": "Tekanan Desain", "value": "300 Bar pada 15°C"}, {"key": "Tekanan Uji Hidro", "value": "450 Bar Hydrostatic Tested"}, {"key": "Katup Silinder", "value": "Forged Brass High Flow Valve + Pressure Gauge"}, {"key": "Selang Fleksibel", "value": "High Pressure Flexible Hose + Built-in Check Valve"}, {"key": "Rentang Suhu", "value": "-20°C hingga +50°C"}]'::jsonb
),
(
    'al-popc-noz',
    'AL-POPC-NOZ',
    'CALIBRATED RADIAL DISCHARGE NOZZLE POPC',
    'ALERTA Clean Agent Suppression',
    'cleanagent',
    '/images/catalog/products/alerta_discharge_nozzle.jpg',
    'Nozel sembur gas bersih terkalibrasi hidrolik yang menyebarkan gas secara merata dalam waktu kurang dari 60 detik tanpa turbulensi berbahaya.',
    '[{"key": "Ukuran Model", "value": "POPC15 (1/2\"), POPC20 (3/4\"), POPC25 (1\") s/d POPC65 (2-1/2\")"}, {"key": "Pilihan Material", "value": "Stainless Steel AISI 304 / Brass"}, {"key": "Pola Semburan", "value": "360° Radial Ceiling Mount & 180° Sidewall Mount"}, {"key": "Waktu Pelepasan", "value": "Total Discharge ≤ 60 Detik (NFPA 2001 Standar)"}, {"key": "Tekanan Maksimal", "value": "60 Bar Downstream Restrictor"}]'::jsonb
),
(
    'al-ext-pnl',
    'AL-EXT-PNL',
    'EXTINGUISHING GAS CONTROL PANEL & ACTUATION',
    'ALERTA Clean Agent Suppression',
    'cleanagent',
    '/images/catalog/products/alerta_control_panel.jpg',
    'Panel pelepasan gas otomatis cross-zoning dengan aktuator solenoid elektro-pneumatik, delay timer countdown, manual release switch, dan abort button.',
    '[{"key": "Logika Pelepasan", "value": "Cross-Zoning Dual Optical/Heat (Coincidence Logic)"}, {"key": "Waktu Tunda Delay", "value": "0 - 60 Detik Digital Countdown Timer"}, {"key": "Aktuator Solenoid", "value": "DYRF15/36.6 Solenoid Actuator + Manual Pilot Lever"}, {"key": "Sensor Pengawas", "value": "Discharge Pressure Switch Monitor"}, {"key": "Catu Daya", "value": "220V AC Input dengan Baterai Cadangan 24V DC Internal"}, {"key": "Standar", "value": "NFPA 2001 & EN12094-1 Compliant"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    brand = EXCLUDED.brand,
    category = EXCLUDED.category,
    image = EXCLUDED.image,
    "desc" = EXCLUDED."desc",
    specs = EXCLUDED.specs,
    updated_at = NOW();
