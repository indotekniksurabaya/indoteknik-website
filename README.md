# PT INDO TEKNIK EMPATBELAS — Corporate Profile & CMS Platform

Website resmi dan Content Management System (CMS) untuk **PT INDO TEKNIK EMPATBELAS**, kontraktor spesialis sistem proteksi kebakaran dan mekanikal elektrikal (ME) berstandar NFPA & SNI.

---

## 📂 Arsitektur Proyek (Frontend & Backend Terpisah)

Struktur folder kini telah dirapikan secara modular menjadi pemisahan yang bersih antara aset publik, frontend, CMS portal admin, dan konfigurasi database Supabase:

```text
C:\Project Web\INDOTEKNIK\
├── index.html                  # Halaman Beranda / Home
├── about.html                  # Profil Perusahaan & Visi Misi (formerly tentang.html)
├── portfolio.html              # Portofolio Proyek & Highlight (formerly portofolio.html)
├── gallery.html                # Galeri Dokumentasi Lapangan Interaktif (formerly galeri.html)
├── catalog.html                # Katalog Produk & Spesifikasi (formerly katalog.html)
├── contact.html                # Kontak Resmi, Alamat Workshop & Form RFQ (formerly kontak.html)
│
├── admin/                      # PORTAL CMS BACKEND (ADMIN DASHBOARD)
│   └── index.html              # Dashboard SPA (CRUD Katalog, Galeri, Profil, Pesan RFQ)
│
├── src/
│   ├── css/
│   │   ├── tokens.css          # Design tokens (Deep Blue, Yellow, Flat 90° sharp edges)
│   │   ├── components.css      # Komponen tombol, kartu, tabel, badge, modal
│   │   └── style.css           # Master stylesheet
│   │
│   ├── frontend/               # Modul Logika Website Publik
│   │   ├── navbar.js           # Navbar scroll effect & mobile drawer
│   │   ├── scroll.js           # Scroll progress bar & FAB to top
│   │   ├── catalog.js          # Dynamic catalog renderer (Supabase + fallback offline)
│   │   ├── gallery.js          # Dynamic gallery renderer & lightbox preview
│   │   ├── form.js             # Form RFQ kontak (simpan ke DB + forward WhatsApp)
│   │   ├── about.js            # Hydration data profil perusahaan
│   │   ├── modal.js            # Modal konsultasi teknis
│   │   ├── toast.js            # Toast alert notification
│   │   └── main.js             # Entry point frontend
│   │
│   ├── backend/                # Modul Logika CMS Portal Admin
│   │   └── admin.js            # Admin controller, auth, CRUD catalog, gallery, profile, inquiries
│   │
│   └── lib/                    # Shared Library & Service Layer
│       ├── supabase.js         # Supabase client singleton, REST API, storage, auth
│       └── fallback-data.js    # Data offline 32 produk pemadam & 11 galeri (zero downtime)
│
├── supabase/                   # Konfigurasi Database Supabase (Free Tier)
│   ├── schema.sql              # PostgreSQL DDL (Tabel, RLS policies, Storage bucket)
│   ├── seed.sql                # Seed script 32 produk pemadam lengkap dengan spesifikasi
│   └── README.md               # Panduan setup Supabase step-by-step
│
├── public/                     # Static Assets & Media
│   ├── _redirects              # Cloudflare Pages 301 redirects & admin rewrite
│   ├── images/                 # Gambar produk & dokumentasi
│   └── videos/                 # Video latar header
│
├── .env.example                # Template konfigurasi environment variable
├── package.json                # Dependencies & Vite build scripts
├── vite.config.js              # Multi-page bundler configuration (Frontend + Admin)
└── wrangler.json               # Cloudflare Pages deployment config
```

---

## 🛠️ Integrasi Teknologi
* **Frontend**: HTML5 Semantik, Modern Vanilla ES Modules, Tailwind CSS, Vite Bundler.
* **Backend / CMS**: Supabase Free Tier (PostgreSQL Database, Supabase Auth, Supabase Storage, RESTful API dengan Row Level Security).
* **Hosting & CDN**: Cloudflare Pages (Otomatis terhubung dengan GitHub CI/CD).
* **Domain**: Custom Domain dari Jagoan Hosting yang diarahkan ke Cloudflare DNS.

---

## 🚀 Panduan Setup & Deployment Step-by-Step

### 1. Setup Database Supabase (Free Tier)
1. Buka [https://supabase.com](https://supabase.com) dan login via GitHub.
2. Buat project baru dengan nama `indoteknik` (region **Singapore**).
3. Buka menu **SQL Editor**, jalankan isi file `supabase/schema.sql`, kemudian jalankan `supabase/seed.sql`.
4. Buka menu **Authentication** > **Users** > Klik **Add User** > Buat akun email & password untuk login Admin CMS.
5. Catat **Project URL** dan **Anon Key** dari menu **Project Settings > API**.

### 2. Push Kode ke GitHub
Pastikan git terhubung ke repository GitHub Anda:
```powershell
git add .
git commit -m "Refactor: separate frontend & backend, English page names, Supabase CMS integration"
git push -u origin main
```

### 3. Deploy di Cloudflare Pages
1. Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages**.
2. Klik **Create application** > tab **Pages** > **Connect to Git**.
3. Pilih repository GitHub Anda (`indoteknik`).
4. Pada **Build settings**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Pada bagian **Environment variables (advanced)**, tambahkan:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOi...`
6. Klik **Save and Deploy**. Cloudflare Pages akan otomatis mem-build seluruh website beserta portal CMS di `/admin/`.

### 4. Menghubungkan Domain dari Jagoan Hosting
1. Di Cloudflare Pages, buka project Anda > tab **Custom domains** > klik **Set up a custom domain**.
2. Masukkan nama domain yang Anda beli di Jagoan Hosting (misal: `indoteknik14.com` atau `www.indoteknik14.com`).
3. **Pilihan A (Rekomendasi Terbaik - Nameserver Cloudflare)**:
   - Tambahkan domain Anda ke Cloudflare DNS (Add Site).
   - Salin 2 Nameservers dari Cloudflare (misal: `amy.ns.cloudflare.com` & `bob.ns.cloudflare.com`).
   - Masuk ke Client Area **Jagoan Hosting** > **Domain Management** > **Manage Nameservers**.
   - Ubah nameserver menjadi nameserver Cloudflare tersebut.
   - *Keuntungan: SSL gratis otomatis aktif, proteksi DDoS penuh, dan propagasi DNS super cepat.*
4. **Pilihan B (CNAME Record di Jagoan Hosting)**:
   - Masuk ke cPanel / DNS Zone Editor Jagoan Hosting.
   - Tambahkan CNAME record:
     - **Name**: `www` (atau `@` jika provider mendukung CNAME flattening)
     - **Record / Target**: `<nama-project-anda>.pages.dev`
     - **TTL**: 14400 (atau default)

---

## 🔐 Cara Mengakses CMS Admin
1. Buka browser dan akses: `https://domainanda.com/admin/` (atau `http://localhost:5173/admin/` saat testing lokal).
2. Masukkan email dan password admin yang telah didaftarkan di Supabase Auth.
3. Fitur CMS yang tersedia:
   - **Katalog Produk**: Tambah produk baru, edit spesifikasi teknis, upload gambar langsung ke Supabase Storage, atau hapus produk.
   - **Galeri Dokumentasi**: Upload foto pekerjaan lapangan, atur kategori, dan beri keterangan proyek.
   - **Profil Perusahaan**: Perbarui visi misi, tagline, telepon, alamat, dan statistik pencapaian.
   - **Pesan Masuk (RFQ)**: Melihat pesan penawaran dari pelanggan lengkap dengan tombol balasan cepat langsung ke WhatsApp klien.
