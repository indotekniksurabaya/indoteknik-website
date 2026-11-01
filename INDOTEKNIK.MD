---
name: PT INDO TEKNIK EMPATBELAS
description: Modern corporate landing page dengan clean layout, strong typography, dan sharp edges (Updated Deep Blue & Yellow Theme).
version: 1.2.0
source: visual-audit
mode: light
default-mode: light
style-direction: Minimalist / Grid-based Corporate
mood: professional, stable, trustworthy, energetic
comparable-to: Modern Consulting/Agency Portfolios
screen-type: Landing Page
target-platform: Google Apps Script Web App (HtmlService) — Tailwind v4 via CDN

# ============================================
# DESIGN TOKENS
# Consumed by index.html via Tailwind v4 @theme directive (CSS custom properties).
# Format: hex codes lowercase, rem-based sizing for typography & spacing.
# ============================================

colors:
  # Brand
  primary: "#093180" # purpose: main CTA, brand accent (Deep Blue)
  primary-hover: "#062460"
  primary-subtle: "#e6ecf5"
  secondary: "#ffc107" # purpose: secondary actions, highlights (Yellow)

  # Canvas
  background: "#ffffff" # Pure White
  surface: "#ffffff" # Pure White
  surface-2: "#f3f4f6"
  surface-hover: "#f9fafb"

  # Text
  text-primary: "#111827" # contrast vs background: 15.3:1 (WCAG AAA)
  text-secondary: "#4b5563"
  text-muted: "#9ca3af"
  text-on-primary: "#ffffff"
  text-on-dark: "#ffffff"

  # Lines
  border: "#e5e7eb"
  border-strong: "#d1d5db"

  # Semantic
  success: "#10b981"
  success-subtle: "#d1fae5"
  warning: "#f59e0b"
  warning-subtle: "#fef3c7"
  error: "#ef4444"
  error-subtle: "#fee2e2"
  info: "#3b82f6"
  info-subtle: "#dbeafe"

typography:
  font-family-display: "'Inter', system-ui, -apple-system, sans-serif"
  font-family-body: "'Inter', system-ui, -apple-system, sans-serif"
  font-family-mono: "ui-monospace, 'JetBrains Mono', monospace"

  display:
    size: "4rem" # 64px
    weight: 700
    line-height: 1.1
    letter-spacing: "-0.02em"
  h1:
    size: "3rem" # 48px
    weight: 700
    line-height: 1.15
    letter-spacing: "-0.02em"
  h2:
    size: "2.5rem" # 40px
    weight: 600
    line-height: 1.2
    letter-spacing: "-0.015em"
  h3:
    size: "1.5rem" # 24px
    weight: 600
    line-height: 1.3
  h4:
    size: "1.25rem" # 20px
    weight: 600
    line-height: 1.4
  body-lg:
    size: "1.125rem" # 18px
    weight: 400
    line-height: 1.6
  body:
    size: "1rem" # 16px
    weight: 400
    line-height: 1.6
  body-sm:
    size: "0.875rem" # 14px
    weight: 400
    line-height: 1.5
  label:
    size: "0.875rem"
    weight: 500
    line-height: 1.4
    letter-spacing: "0.01em"
  caption:
    size: "0.75rem" # 12px
    weight: 500
    line-height: 1.35
  numeric:
    feature: "tabular-nums"
    weight: 600

spacing:
  base: 8 # px grid unit
  scale:
    "0": "0"
    "0.5": "0.125rem" # 2px
    "1": "0.25rem" # 4px
    "2": "0.5rem" # 8px
    "3": "0.75rem" # 12px
    "4": "1rem" # 16px
    "5": "1.25rem" # 20px
    "6": "1.5rem" # 24px
    "8": "2rem" # 32px
    "10": "2.5rem" # 40px
    "12": "3rem" # 48px
    "16": "4rem" # 64px
    "20": "5rem" # 80px
    "24": "6rem" # 96px

radius:
  none: "0" # Dominan (Button, Cards)
  sm: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  "2xl": "1rem"
  full: "9999px" # Khusus FAB

shadow:
  none: "none"
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)"
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)"
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
  focus: "0 0 0 2px {colors.background}, 0 0 0 4px {colors.primary}"

motion:
  duration-fast: "150ms"
  duration-base: "200ms"
  duration-slow: "300ms"
  easing-standard: "cubic-bezier(0.4, 0, 0.2, 1)"
  easing-emphasized: "cubic-bezier(0.2, 0, 0, 1)"

breakpoints:
  sm: "640px"
  md: "768px"
  lg: "1024px"
  xl: "1280px"
  "2xl": "1536px"

layout:
  max-content-width: "1280px"
  sidebar-width: "280px"
  sidebar-collapsed-width: "64px"
  topbar-height: "80px"
  page-padding-x: "2rem"
  page-padding-y: "6rem"
  card-padding: "1.5rem"
  section-gap: "6rem" # 96px spacing antar seksi

# ============================================
# COMPONENT BEHAVIOR SPECS
# Resolved tokens — index.html generator pakai ini as authority.
# ============================================
components:
  button-primary:
    bg: "{colors.primary}"
    text: "{colors.text-on-primary}"
    padding: "0.75rem 1.5rem"
    radius: "{radius.none}"
    weight: 600
    font-size: "{typography.body-sm.size}"
    hover-bg: "{colors.primary-hover}"
    focus-ring: "{shadow.focus}"
    disabled-opacity: 0.5

  button-secondary:
    bg: "{colors.secondary}"
    text: "{colors.text-primary}"
    border: "none"
    padding: "0.75rem 1.5rem"
    radius: "{radius.none}"
    weight: 600
    hover-bg: "#e0a800"

  button-ghost:
    bg: "transparent"
    text: "{colors.primary}"
    padding: "0.5rem 1rem"
    radius: "{radius.none}"
    hover-bg: "{colors.primary-subtle}"

  nav-link:
    text: "{colors.text-primary}"
    weight: 600
    font-size: "{typography.body-sm.size}"
    hover-text: "{colors.primary}"

  image-card-blog:
    radius: "{radius.none}"
    overlay: "linear-gradient(to top, rgba(9,49,128,0.9) 0%, rgba(0,0,0,0) 60%)" # Deep blue tinted overlay
    text-color: "{colors.text-on-dark}"

  info-card:
    bg: "{colors.surface}"
    border: "1px solid {colors.border}"
    radius: "{radius.none}"
    padding: "{layout.card-padding}"
    shadow: "none"

  fab-scroll:
    bg: "{colors.background}"
    text: "{colors.primary}"
    border: "1px solid {colors.border}"
    radius: "{radius.full}"
    padding: "0.75rem"
    hover-bg: "{colors.primary-subtle}"
---

# 📖 OVERVIEW

Desain profile perusahaan PT INDO TEKNIK EMPATBELAS ini mengusung gaya _Modern Corporate_ dengan pendekatan sharp-edges (tanpa border radius) yang memberikan kesan kokoh, formal, dan tegas. Permainan whitespace yang luas diseimbangkan dengan tipografi yang besar dan dominan, serta penggunaan grid yang strict.

# 🎨 COLORS PHILOSOPHY

**Primary (`#093180` - Deep Blue)** — Membangun fondasi kepercayaan (trust), stabilitas, dan profesionalisme korporat. Dipakai sebagai warna dominan untuk tombol utama CTA dan elemen aksen logo.
**Secondary (`#ffc107` - Yellow)** — Berfungsi sebagai aksen kontras yang vibran. Sangat efektif untuk menarik perhatian pada elemen spesifik (seperti badge, highlight, atau CTA sekunder) tanpa mendominasi Deep Blue.
**Background & Surface (`#ffffff` - Pure White)** — Putih murni digunakan sebagai kanvas utama dan surface elemen (seperti kartu kontak) untuk memberikan kesan sangat bersih, _breathable_, dan menonjolkan kontras warna Deep Blue dan Yellow secara maksimal.

# 🔤 TYPOGRAPHY PHILOSOPHY

**Font choice:** Inter (atau sans-serif geometris sejenis) memberikan kejelasan baca yang tajam (crisp).
**Hierarchy rules:**

- Headline utama raksasa (sampai 4rem) ditekankan untuk _impact_ pertama.
- Navigasi atas dan tombol menggunakan huruf kapital (uppercase) atau font-weight tebal (600/700) untuk navigasi yang terstruktur.

# 📐 SPACING & LAYOUT PHILOSOPHY

**Base grid:** 8px grid.
**Whitespace:** Sangat generous. Section gap dirancang jauh (sekitar 96px/6rem) untuk memisahkan blok konten sepenuhnya.
**Grid Pattern:** Layout sering dipecah menjadi 3 kolom konsisten (seperti pada Berita dan Hubungi Kami) atau asymmetric bento-style pada gallery hero.

# 🟦 SHAPE & RADIUS PHILOSOPHY

**Strategy:** Sharp & Boxy (`radius: 0px`).
Semua kartu, foto, dan tombol utama menggunakan sudut 90 derajat yang tajam. Pengecualian mutlak hanya diberikan pada ikon FAB _scroll-to-top_ yang berbentuk lingkaran penuh sebagai indikator interaktif _floating_.

# 🌫️ ELEVATION PHILOSOPHY

**Strategy:** Flat Design.
Desain mengandalkan pemisahan elemen menggunakan layout (whitespace) murni di atas Pure White background. Elemen kartu dipisahkan dengan border tipis murni tanpa bayangan.

# 🧩 COMPONENT BEHAVIOR RULES

**Image Cards (Blog):** Memiliki layer _gradient overlay_ (kini dengan _tint_ Deep Blue gelap di bagian bawah) untuk memastikan teks putih selalu terbaca jelas, memberikan identitas warna yang menyatu dengan brand.
**Buttons:** Tidak menggunakan lengkungan sama sekali (sharp). Tombol sekunder (Yellow) digunakan secara berhati-hati agar tidak menyaingi CTA utama.

# 🚫 RULES TO NEVER BREAK

- Jangan pernah tambahkan `border-radius` (kecuali pada elemen floating bulat tertentu). Tetap pertahankan bentuk kotak/sharp.
- Jangan gunakan drop-shadow tebal pada card konten (tetap flat).
- Hindari penggunaan background off-white (kecuali batas terluar pemisah) agar tema Pure White tetap terjaga.

# ✅ RULES TO ALWAYS FOLLOW

- Gunakan Deep Blue (`#093180`) untuk tindakan utama dan Yellow (`#ffc107`) HANYA sebagai _highlighter_ atau status aksen.
- Pastikan jarak antar section (section-gap) sangat luas (minimum 5-6rem).
- Gunakan font weight 600/700 untuk elemen navigasi (Header dan link).

# 🔧 GAS INTEGRATION NOTES (untuk PROMPT B di sesi berikutnya)

- File ini di-consume oleh `index.html` (Tailwind v4 CDN) via `@theme` directive di inline `<style>`.
- Token color/radius/spacing di-export sebagai CSS custom properties (`--color-primary`, `--radius-md`, dll).
- Google Fonts di-load via `<link>` di `<head>` dengan preconnect ke `fonts.googleapis.com`.
- Tailwind v4 CDN: `<script src="https://cdn.tailwindcss.com"></script>` — support `@theme` di `<style type="text/tailwindcss">`.
- HtmlService strip beberapa attribute — gunakan pattern `<?!= include('css') ?>` kalau pisah file.
