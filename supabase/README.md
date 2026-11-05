# Panduan Konfigurasi Supabase (Free Tier) — PT INDO TEKNIK EMPATBELAS

Dokumen ini memandu langkah-langkah menyiapkan database Supabase Free Tier untuk CMS dan Frontend website INDOTEKNIK.

---

## 1. Buat Project Supabase Gratis
1. Buka [https://supabase.com](https://supabase.com) dan masuk menggunakan akun GitHub Anda (**Continue with GitHub**).
2. Klik tombol **New Project**.
3. Isi informasi project:
   - **Name**: `indoteknik`
   - **Database Password**: Buat password yang kuat dan catat.
   - **Region**: Pilih **Singapore (ap-southeast-1)** agar paling cepat diakses dari Indonesia.
   - **Pricing Plan**: **Free Plan** ($0/month).
4. Klik **Create new project** dan tunggu 1-2 menit hingga database aktif.

---

## 2. Eksekusi Schema & Seed Database (1-Click SQL Editor)
1. Pada menu navigasi sebelah kiri di Supabase Dashboard, klik ikon **SQL Editor**.
2. Klik **New Query**.
3. Buka file [`schema.sql`](./schema.sql), salin (copy) seluruh isinya, tempel (paste) ke SQL Editor, lalu klik tombol **Run** (atau `Ctrl+Enter`).
   - *Ini akan membuat tabel `products`, `gallery`, `company_profile`, `rfq_inquiries`, Row Level Security (RLS), dan storage bucket.*
4. Buka file [`seed.sql`](./seed.sql), salin isinya, tempel ke SQL Editor, lalu klik tombol **Run**.
   - *Ini akan langsung mengisi data default 32 produk pemadam, 11 foto dokumentasi proyek, dan informasi perusahaan.*

---

## 3. Buat Akun Admin CMS
1. Di menu sebelah kiri Supabase Dashboard, klik menu **Authentication** > **Users**.
2. Klik tombol **Add user** > **Create user**.
3. Masukkan:
   - **User Email**: misal `admin@indoteknik14.com`
   - **User Password**: password admin yang Anda inginkan
   - Centang **Auto Confirm User?** agar langsung aktif tanpa perlu verifikasi email.
4. Klik **Create user**. Akun ini yang akan Anda gunakan untuk login ke CMS di `/admin/`.

---

## 4. Ambil Kredensial URL & Anon Key
1. Buka menu **Project Settings** (ikon gerigi di kiri bawah) > **API**.
2. Salin 2 nilai berikut:
   - **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
   - **Project API Keys** (anon/public): `eyJhbGciOi...`
3. Tempelkan kredensial ini pada:
   - **Cloudflare Pages**: Masuk ke Cloudflare Dashboard > Pages > Settings > Environment variables > Tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
   - **Pengujian Lokal / CMS Browser**: Masuk ke halaman `/admin/` > klik **Setting Supabase** > masukkan URL & Anon Key > Simpan.
