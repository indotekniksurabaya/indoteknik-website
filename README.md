# PT INDO TEKNIK EMPATBELAS — Corporate Profile Website

Website profil perusahaan resmi untuk **PT INDO TEKNIK EMPATBELAS**, kontraktor spesialis sistem proteksi kebakaran dan pekerjaan mekanikal elektrikal (ME) berstandar internasional NFPA & SNI sejak 2002.

---

## 📂 Struktur File Modular (VS Code Ready)

Proyek ini telah dipisahkan per fungsi dan per halaman (*page*) agar pemeliharaan (*maintenance*) menjadi sangat mudah, terstruktur, dan bersih dari komentar script:

```text
C:\Project Web\INDOTEKNIK\
├── index.html              # Halaman Beranda / Landing Page Utama
├── tentang.html            # Halaman Profil Perusahaan, Sejarah & Visi Misi
├── layanan.html            # Halaman 6 Layanan Spesialis Terperinci
├── standar.html            # Halaman Standar NFPA 13, 14, 20, 72, 2001 & SNI K3
├── portofolio.html         # Halaman Galeri Portofolio Proyek Interaktif
├── estimator.html          # Halaman Kalkulator Kebutuhan Proteksi Kebakaran
├── berita.html             # Halaman Berita & Edukasi Teknis
├── kontak.html             # Halaman Kontak Resmi, Alamat Workshop & Form RFQ
│
├── INDOTEKNIK.MD           # Dokumen referensi desain tokens v1.2.0
├── Code.gs                 # Controller Google Apps Script (doGet & doPost)
├── package.json            # Konfigurasi npm & Vite
├── vite.config.js          # Multi-page configuration Vite
│
└── src/
    ├── css/
    │   ├── tokens.css      # Variabel warna Deep Blue, Yellow, spacing, radius
    │   ├── components.css  # Tombol siku, kartu flat, overlay deep blue, navbar
    │   └── style.css       # Master stylesheet penghubung tokens & components
    │
    └── js/
        ├── navbar.js       # Logika navigasi desktop & drawer mobile
        ├── scroll.js       # Logika tombol floating action (FAB) scroll to top
        ├── filter.js       # Logika filter kategori portofolio proyek
        ├── estimator.js    # Logika kalkulasi kapasitas pompa, reservoir & timeline
        ├── form.js         # Logika validasi formulir RFQ & WhatsApp redirect
        ├── modal.js        # Logika pop-up modal konsultasi & unduh profil
        ├── toast.js        # Logika notifikasi alert toast
        └── main.js         # Entry point utama yang menginisialisasi modul
```

---

## 🎨 Implementasi Aturan Desain (INDOTEKNIK.MD)

* **Palet Warna**:
  * **Primary**: `#093180` (Deep Blue)
  * **Secondary**: `#ffc107` (Yellow Accent)
  * **Background & Surface**: `#ffffff` (Pure White)
  * **Surface 2**: `#f3f4f6`
  * **Border**: `#e5e7eb`
* **Sharp Edges (Sudut Siku 90°)**:
  * Seluruh tombol, kartu informasi, kolom input, dan container gambar menggunakan `radius: 0` (tanpa lengkungan).
  * Satu-satunya elemen bulat adalah tombol floating FAB *scroll to top* (`rounded-full`) sesuai aturan dokumen desain.
* **Elevasi Flat**:
  * Menggunakan pemisah border tipis 1px murni tanpa drop-shadow tebal.

---

## 🚀 Menjalankan Proyek di VS Code

1. Buka folder proyek di VS Code:
   ```powershell
   cd "C:\Project Web\INDOTEKNIK"
   code .
   ```

2. Jalankan server lokal:
   ```powershell
   npm run dev
   ```
   Akses `http://localhost:5173` pada browser.

3. Build untuk produksi:
   ```powershell
   npm run build
   ```
   Seluruh halaman multi-page akan ter-bundle otomatis ke dalam folder `dist/`.
