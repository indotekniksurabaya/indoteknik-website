// PT INDO TEKNIK EMPATBELAS — ADMIN CMS CONTROLLER
import {
  clearSupabaseConfig,
  deleteGalleryItem,
  deleteInquiry,
  deleteProduct,
  getAdminSession,
  getCompanyProfile,
  getGallery,
  getInquiries,
  getProducts,
  getSupabaseCredentials,
  isSupabaseConfigured,
  loginAdmin,
  logoutAdmin,
  onAuthStateChange,
  saveGalleryItem,
  saveProduct,
  saveSupabaseConfig,
  updateCompanyProfile,
  uploadMedia
} from '../lib/supabase.js';

// Elements
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const supabaseWarningBadge = document.getElementById('supabaseWarningBadge');
const statusBadgeText = document.getElementById('statusBadgeText');

// Toast notification helper
function showAdminToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-[#10b981] text-white',
    warning: 'bg-[#ffc107] text-[#111827]',
    error: 'bg-[#ef4444] text-white',
    info: 'bg-[#093180] text-white'
  };

  toast.className = `${bgColors[type] || bgColors.info} p-4 border border-black/10 shadow-xl text-xs font-bold flex items-center justify-between gap-3 transition-all duration-300 transform translate-y-4 opacity-0`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="text-current opacity-75 hover:opacity-100" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// State
let allProducts = [];
let allGallery = [];
let currentTab = 'catalog';

// ==========================================
// 1. INITIALIZATION & AUTHENTICATION
// ==========================================

async function initAdmin() {
  const configured = isSupabaseConfigured();
  if (!configured && supabaseWarningBadge) {
    supabaseWarningBadge.classList.remove('hidden');
    if (statusBadgeText) statusBadgeText.textContent = 'Mode Offline (Demo)';
  }

  // Check existing session or demo login
  const session = await getAdminSession();
  const demoActive = sessionStorage.getItem('indoteknik_admin_demo') === 'true';

  if (session || demoActive) {
    showDashboard(session?.user?.email || 'Admin Demo');
  } else {
    showLogin();
  }

  // Auth state change listener
  onAuthStateChange((event, s) => {
    if (event === 'SIGNED_IN' && s) {
      showDashboard(s.user.email);
    } else if (event === 'SIGNED_OUT') {
      if (!sessionStorage.getItem('indoteknik_admin_demo')) {
        showLogin();
      }
    }
  });

  setupEventListeners();
}

function showLogin() {
  if (loginView) loginView.classList.remove('hidden');
  if (dashboardView) dashboardView.classList.add('hidden');
}

function showDashboard(email = '') {
  if (loginView) loginView.classList.add('hidden');
  if (dashboardView) dashboardView.classList.remove('hidden');

  loadProductsTable();
  loadGalleryGrid();
  loadCompanyProfile();
  loadInquiriesTable();
}

// ==========================================
// 2. TAB SWITCHING
// ==========================================

function switchTab(tabId) {
  currentTab = tabId;

  document.querySelectorAll('.admin-tab').forEach(tab => {
    if (tab.getAttribute('data-tab') === tabId) {
      tab.classList.add('active', 'text-[#093180]', 'border-[#093180]');
      tab.classList.remove('text-[#6b7280]', 'border-transparent');
    } else {
      tab.classList.remove('active', 'text-[#093180]', 'border-[#093180]');
      tab.classList.add('text-[#6b7280]', 'border-transparent');
    }
  });

  const tabContents = {
    catalog: document.getElementById('tabContentCatalog'),
    gallery: document.getElementById('tabContentGallery'),
    company: document.getElementById('tabContentCompany'),
    inquiries: document.getElementById('tabContentInquiries')
  };

  Object.entries(tabContents).forEach(([key, el]) => {
    if (el) {
      if (key === tabId) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });
}

// ==========================================
// 3. CATALOG / PRODUCTS MANAGEMENT
// ==========================================

async function loadProductsTable() {
  const tbody = document.getElementById('adminProductsTableBody');
  const countEl = document.getElementById('tabCountProducts');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Memuat data produk...</td></tr>`;

  try {
    allProducts = await getProducts();
    if (countEl) countEl.textContent = allProducts.length;

    renderProductsRows(allProducts);
  } catch (err) {
    console.error('Failed to load products:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-rose-500">Gagal memuat produk.</td></tr>`;
  }
}

function renderProductsRows(items) {
  const tbody = document.getElementById('adminProductsTableBody');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Tidak ada produk yang cocok.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(p => `
    <tr class="hover:bg-gray-50 transition-colors">
      <td class="py-3 px-4">
        <div class="w-12 h-12 bg-white border border-[#e5e7eb] p-1 flex items-center justify-center overflow-hidden">
          <img src="${p.image}" alt="${p.title}" class="max-w-full max-h-full object-contain" onerror="this.src='../images/Fire-Hydrant-Yellow.png'">
        </div>
      </td>
      <td class="py-3 px-4 font-semibold text-[#111827]">
        <div class="text-[10px] text-[#093180] font-bold tracking-wider uppercase">${p.code}</div>
        <div class="text-xs line-clamp-1">${p.title}</div>
      </td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#e6ecf5] text-[#093180]">
          ${p.category}
        </span>
      </td>
      <td class="py-3 px-4 text-[#4b5563] text-xs">${p.brand || '-'}</td>
      <td class="py-3 px-4 text-[#6b7280] text-[11px]">
        ${Array.isArray(p.specs) ? `${p.specs.length} Parameter` : '0 Parameter'}
      </td>
      <td class="py-3 px-4 text-right whitespace-nowrap">
        <button class="btn-edit-prod px-2.5 py-1 text-xs font-semibold bg-[#e6ecf5] text-[#093180] hover:bg-[#093180] hover:text-white transition-colors mr-1" data-id="${p.id}">
          Edit
        </button>
        <button class="btn-del-prod px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors" data-id="${p.id}">
          Hapus
        </button>
      </td>
    </tr>
  `).join('');

  // Attach row actions
  tbody.querySelectorAll('.btn-edit-prod').forEach(b => {
    b.addEventListener('click', () => openEditProductModal(b.getAttribute('data-id')));
  });
  tbody.querySelectorAll('.btn-del-prod').forEach(b => {
    b.addEventListener('click', () => handleDeleteProduct(b.getAttribute('data-id')));
  });
}

function openAddProductModal() {
  const modal = document.getElementById('productModal');
  const title = document.getElementById('productModalTitle');
  const form = document.getElementById('productForm');
  const specsContainer = document.getElementById('specsContainer');

  if (!modal || !form) return;

  form.reset();
  document.getElementById('prodEditMode').value = 'create';
  document.getElementById('prodId').disabled = false;
  title.textContent = 'Tambah Produk Baru';

  if (specsContainer) {
    specsContainer.innerHTML = '';
    addSpecRow('Dimensi', '');
    addSpecRow('Material', '');
    addSpecRow('Finishing', '');
  }

  modal.classList.remove('hidden');
}

function openEditProductModal(id) {
  const prod = allProducts.find(p => p.id === id);
  if (!prod) return;

  const modal = document.getElementById('productModal');
  const title = document.getElementById('productModalTitle');
  const specsContainer = document.getElementById('specsContainer');

  document.getElementById('prodEditMode').value = 'edit';
  const idInput = document.getElementById('prodId');
  idInput.value = prod.id;
  idInput.disabled = true;

  document.getElementById('prodCode').value = prod.code || '';
  document.getElementById('prodTitle').value = prod.title || '';
  document.getElementById('prodCategory').value = prod.category || 'hydrant';
  document.getElementById('prodBrand').value = prod.brand || 'Vinci Firefighting Supplier';
  document.getElementById('prodImage').value = prod.image || '';
  document.getElementById('prodDesc').value = prod.desc || '';

  if (specsContainer) {
    specsContainer.innerHTML = '';
    const specs = Array.isArray(prod.specs) ? prod.specs : [];
    if (specs.length > 0) {
      specs.forEach(s => addSpecRow(s.key, s.value));
    } else {
      addSpecRow('Dimensi', '');
    }
  }

  title.textContent = `Edit Produk: ${prod.code}`;
  modal.classList.remove('hidden');
}

function addSpecRow(key = '', val = '') {
  const container = document.getElementById('specsContainer');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'spec-row flex items-center gap-2';
  row.innerHTML = `
    <input type="text" placeholder="Parameter (cth: Dimensi)" value="${key}" class="spec-key w-1/3 text-xs p-2 border border-[#e5e7eb] outline-none">
    <input type="text" placeholder="Nilai (cth: 66 x 52 cm)" value="${val}" class="spec-val flex-1 text-xs p-2 border border-[#e5e7eb] outline-none">
    <button type="button" class="btn-remove-spec p-2 text-rose-500 hover:text-rose-700" title="Hapus baris">✕</button>
  `;

  row.querySelector('.btn-remove-spec').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

async function handleProductFormSubmit(e) {
  e.preventDefault();

  const mode = document.getElementById('prodEditMode').value;
  const id = document.getElementById('prodId').value.trim();
  const code = document.getElementById('prodCode').value.trim();
  const title = document.getElementById('prodTitle').value.trim();
  const category = document.getElementById('prodCategory').value;
  const brand = document.getElementById('prodBrand').value.trim();
  let image = document.getElementById('prodImage').value.trim();
  const desc = document.getElementById('prodDesc').value.trim();

  // Specs array
  const specs = [];
  document.querySelectorAll('.spec-row').forEach(row => {
    const k = row.querySelector('.spec-key')?.value.trim();
    const v = row.querySelector('.spec-val')?.value.trim();
    if (k && v) specs.push({ key: k, value: v });
  });

  if (!id || !code || !title) {
    showAdminToast('ID, Kode, dan Nama Produk wajib diisi.', 'warning');
    return;
  }

  if (!image) {
    image = 'images/catalog/products/vinci_hydrant_box_a1.jpg';
  }

  const productData = { id, code, title, category, brand, image, desc, specs };

  try {
    if (isSupabaseConfigured()) {
      await saveProduct(productData);
      showAdminToast(`Produk ${code} berhasil disimpan ke Supabase!`, 'success');
    } else {
      // Offline mode update
      const existingIdx = allProducts.findIndex(p => p.id === id);
      if (existingIdx >= 0) allProducts[existingIdx] = productData;
      else allProducts.unshift(productData);
      showAdminToast(`Produk ${code} tersimpan di memori (Mode Offline).`, 'info');
    }

    document.getElementById('productModal').classList.add('hidden');
    loadProductsTable();
  } catch (err) {
    console.error('Save product error:', err);
    showAdminToast(`Gagal menyimpan produk: ${err.message}`, 'error');
  }
}

async function handleDeleteProduct(id) {
  const prod = allProducts.find(p => p.id === id);
  const confirmDel = confirm(`Apakah Anda yakin ingin menghapus produk "${prod?.title || id}"?`);
  if (!confirmDel) return;

  try {
    if (isSupabaseConfigured()) {
      await deleteProduct(id);
      showAdminToast(`Produk berhasil dihapus dari Supabase.`, 'success');
    } else {
      allProducts = allProducts.filter(p => p.id !== id);
      showAdminToast(`Produk dihapus (Mode Offline).`, 'info');
    }
    loadProductsTable();
  } catch (err) {
    console.error('Delete error:', err);
    showAdminToast(`Gagal menghapus produk: ${err.message}`, 'error');
  }
}

// ==========================================
// 4. GALLERY MANAGEMENT
// ==========================================

async function loadGalleryGrid() {
  const grid = document.getElementById('adminGalleryGrid');
  const countEl = document.getElementById('tabCountGallery');
  if (!grid) return;

  grid.innerHTML = `<div class="col-span-full p-8 text-center text-gray-500">Memuat galeri dokumentasi...</div>`;

  try {
    allGallery = await getGallery();
    if (countEl) countEl.textContent = allGallery.length;

    renderGalleryGrid(allGallery);
  } catch (err) {
    console.error('Load gallery error:', err);
    grid.innerHTML = `<div class="col-span-full p-8 text-center text-rose-500">Gagal memuat galeri.</div>`;
  }
}

function renderGalleryGrid(items) {
  const grid = document.getElementById('adminGalleryGrid');
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = `<div class="col-span-full p-8 text-center text-gray-500">Belum ada foto dokumentasi.</div>`;
    return;
  }

  grid.innerHTML = items.map(g => `
    <div class="bg-white border border-[#e5e7eb] flex flex-col justify-between overflow-hidden">
      <div class="relative aspect-video bg-gray-100 overflow-hidden">
        <img src="${g.image_url}" alt="${g.title}" class="w-full h-full object-cover" onerror="this.src='../images/Fire-Hydrant-Yellow.png'">
        <span class="absolute top-2 left-2 px-2 py-0.5 bg-[#093180] text-white text-[10px] font-bold uppercase">
          ${g.category_label || g.category}
        </span>
      </div>
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 class="font-bold text-xs text-[#111827] line-clamp-1 mb-1">${g.title}</h4>
          <p class="text-[11px] text-[#6b7280] line-clamp-2 leading-relaxed">${g.description || ''}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-[#f3f4f6] flex items-center justify-between">
          <span class="text-[10px] text-[#9ca3af]">Urutan: #${g.order_num || 0}</span>
          <div class="flex items-center gap-2">
            <button class="btn-edit-gal text-xs font-semibold text-[#093180] hover:underline" data-id="${g.id}">Edit</button>
            <span class="text-gray-300">|</span>
            <button class="btn-del-gal text-xs font-semibold text-rose-600 hover:underline" data-id="${g.id}">Hapus</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.btn-edit-gal').forEach(b => {
    b.addEventListener('click', () => openEditGalleryModal(b.getAttribute('data-id')));
  });
  grid.querySelectorAll('.btn-del-gal').forEach(b => {
    b.addEventListener('click', () => handleDeleteGallery(b.getAttribute('data-id')));
  });
}

function openAddGalleryModal() {
  const modal = document.getElementById('galleryModal');
  const title = document.getElementById('galleryModalTitle');
  const form = document.getElementById('galleryForm');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('galId').value = `gal-${Date.now()}`;
  title.textContent = 'Tambah Dokumentasi Proyek';
  modal.classList.remove('hidden');
}

function openEditGalleryModal(id) {
  const item = allGallery.find(g => g.id === id);
  if (!item) return;

  const modal = document.getElementById('galleryModal');
  const title = document.getElementById('galleryModalTitle');

  document.getElementById('galId').value = item.id;
  document.getElementById('galTitle').value = item.title || '';
  document.getElementById('galCategory').value = item.category || 'hydrant';
  document.getElementById('galCategoryLabel').value = item.category_label || '';
  document.getElementById('galImageUrl').value = item.image_url || '';
  document.getElementById('galDesc').value = item.description || '';

  title.textContent = `Edit Dokumentasi: ${item.title}`;
  modal.classList.remove('hidden');
}

async function handleGalleryFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('galId').value;
  const title = document.getElementById('galTitle').value.trim();
  const category = document.getElementById('galCategory').value;
  const category_label = document.getElementById('galCategoryLabel').value.trim() || category;
  const image_url = document.getElementById('galImageUrl').value.trim();
  const description = document.getElementById('galDesc').value.trim();

  if (!title || !image_url) {
    showAdminToast('Judul dan Gambar dokumentasi wajib diisi.', 'warning');
    return;
  }

  const galData = { id, title, category, category_label, image_url, description, order_num: allGallery.length + 1 };

  try {
    if (isSupabaseConfigured()) {
      await saveGalleryItem(galData);
      showAdminToast('Dokumentasi tersimpan ke Supabase!', 'success');
    } else {
      const idx = allGallery.findIndex(g => g.id === id);
      if (idx >= 0) allGallery[idx] = galData;
      else allGallery.unshift(galData);
      showAdminToast('Dokumentasi tersimpan (Mode Offline).', 'info');
    }

    document.getElementById('galleryModal').classList.add('hidden');
    loadGalleryGrid();
  } catch (err) {
    console.error('Save gallery error:', err);
    showAdminToast(`Gagal menyimpan galeri: ${err.message}`, 'error');
  }
}

async function handleDeleteGallery(id) {
  const confirmDel = confirm('Hapus dokumentasi proyek ini?');
  if (!confirmDel) return;

  try {
    if (isSupabaseConfigured()) {
      await deleteGalleryItem(id);
      showAdminToast('Dokumentasi berhasil dihapus.', 'success');
    } else {
      allGallery = allGallery.filter(g => g.id !== id);
      showAdminToast('Dokumentasi dihapus (Mode Offline).', 'info');
    }
    loadGalleryGrid();
  } catch (err) {
    console.error('Delete gallery error:', err);
    showAdminToast(`Gagal menghapus: ${err.message}`, 'error');
  }
}

// ==========================================
// 5. COMPANY PROFILE MANAGEMENT
// ==========================================

async function loadCompanyProfile() {
  try {
    const cp = await getCompanyProfile();
    if (!cp) return;

    if (document.getElementById('cpName')) document.getElementById('cpName').value = cp.company_name || '';
    if (document.getElementById('cpTagline')) document.getElementById('cpTagline').value = cp.tagline || '';
    if (document.getElementById('cpDesc')) document.getElementById('cpDesc').value = cp.about_desc || '';
    if (document.getElementById('cpVision')) document.getElementById('cpVision').value = cp.vision || '';
    if (document.getElementById('cpPhone')) document.getElementById('cpPhone').value = cp.phone || '';
    if (document.getElementById('cpEmail')) document.getElementById('cpEmail').value = cp.email || '';
    if (document.getElementById('cpStandards')) document.getElementById('cpStandards').value = cp.stats?.standards || 'NFPA & SNI';
    if (document.getElementById('cpAddress')) document.getElementById('cpAddress').value = cp.address || '';
  } catch (err) {
    console.error('Error loading company profile:', err);
  }
}

async function handleCompanyProfileSubmit(e) {
  e.preventDefault();

  const profile = {
    company_name: document.getElementById('cpName').value.trim(),
    tagline: document.getElementById('cpTagline').value.trim(),
    about_desc: document.getElementById('cpDesc').value.trim(),
    vision: document.getElementById('cpVision').value.trim(),
    phone: document.getElementById('cpPhone').value.trim(),
    whatsapp: document.getElementById('cpPhone').value.trim().replace(/[^0-9]/g, ''),
    email: document.getElementById('cpEmail').value.trim(),
    address: document.getElementById('cpAddress').value.trim(),
    stats: {
      standards: document.getElementById('cpStandards').value.trim(),
      experience_years: '20+',
      projects_completed: '500+',
      expert_engineers: '30+'
    }
  };

  try {
    if (isSupabaseConfigured()) {
      await updateCompanyProfile(profile);
      showAdminToast('Profil perusahaan berhasil diperbarui di Supabase!', 'success');
    } else {
      showAdminToast('Profil perusahaan diperbarui di memori browser.', 'info');
    }
  } catch (err) {
    console.error('Update company error:', err);
    showAdminToast(`Gagal menyimpan profil: ${err.message}`, 'error');
  }
}

// ==========================================
// 6. INQUIRIES / RFQ MESSAGES MANAGEMENT
// ==========================================

async function loadInquiriesTable() {
  const tbody = document.getElementById('adminInquiriesTableBody');
  const countEl = document.getElementById('tabCountInquiries');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Memuat pesan masuk...</td></tr>`;

  try {
    const list = await getInquiries();
    if (countEl) countEl.textContent = list.length;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Belum ada pesan RFQ masuk. Formulir kontak dari website akan otomatis tercatat di sini.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(item => {
      const dateStr = item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-';
      const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
      const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo Bapak/Ibu ${item.name}, terima kasih telah menghubungi PT INDO TEKNIK EMPATBELAS mengenai penawaran proteksi kebakaran.`)}`;

      return `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="py-3 px-4 text-[#6b7280] text-[11px] whitespace-nowrap">${dateStr}</td>
          <td class="py-3 px-4 font-bold text-[#111827]">
            <div>${item.name}</div>
            <div class="text-[11px] text-[#093180] font-medium">${item.company || 'Perorangan'}</div>
          </td>
          <td class="py-3 px-4 text-xs font-semibold text-[#111827]">${item.phone}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#e6ecf5] text-[#093180]">
              ${item.service || 'Umum'}
            </span>
          </td>
          <td class="py-3 px-4 text-xs text-[#4b5563] max-w-xs leading-relaxed">
            ${item.message}
          </td>
          <td class="py-3 px-4 text-right whitespace-nowrap">
            <a href="${waUrl}" target="_blank" class="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors mr-1 inline-flex items-center gap-1">
              <span>WhatsApp</span>
            </a>
            <button class="btn-del-inquiry px-2 py-1 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors" data-id="${item.id}">
              Hapus
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-del-inquiry').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.getAttribute('data-id');
        if (confirm('Hapus riwayat pesan penawaran ini?')) {
          await deleteInquiry(id);
          showAdminToast('Pesan dihapus.', 'info');
          loadInquiriesTable();
        }
      });
    });

  } catch (err) {
    console.error('Error loading inquiries:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Supabase offline: Tabel RFQ belum terhubung.</td></tr>`;
  }
}

// ==========================================
// 7. EVENT LISTENERS SETUP
// ==========================================

function setupEventListeners() {
  // Login form
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value.trim();
      const password = document.getElementById('loginPassword')?.value.trim();

      const btn = document.getElementById('loginSubmitBtn');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Memverifikasi Kredensial...';

      try {
        if (isSupabaseConfigured()) {
          await loginAdmin(email, password);
          showAdminToast('Login berhasil!', 'success');
        } else {
          // Demo bypass
          sessionStorage.setItem('indoteknik_admin_demo', 'true');
          showAdminToast('Masuk dalam Mode Demo CMS (Supabase belum di-link).', 'warning');
          showDashboard(email);
        }
      } catch (err) {
        console.error('Login error:', err);
        showAdminToast(`Gagal login: ${err.message}`, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });
  }

  // Logout button
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', async () => {
      sessionStorage.removeItem('indoteknik_admin_demo');
      try {
        await logoutAdmin();
      } catch (e) {}
      showAdminToast('Anda telah keluar dari CMS.', 'info');
      showLogin();
    });
  }

  // Tab navigation
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      if (tabId) switchTab(tabId);
    });
  });

  // Product modal triggers
  const btnOpenAddProduct = document.getElementById('btnOpenAddProduct');
  if (btnOpenAddProduct) btnOpenAddProduct.addEventListener('click', openAddProductModal);

  const closeProductModalBtn = document.getElementById('closeProductModalBtn');
  const cancelProductBtn = document.getElementById('cancelProductBtn');
  const closeProductModal = () => document.getElementById('productModal')?.classList.add('hidden');
  if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);
  if (cancelProductBtn) cancelProductBtn.addEventListener('click', closeProductModal);

  const btnAddSpecRow = document.getElementById('btnAddSpecRow');
  if (btnAddSpecRow) btnAddSpecRow.addEventListener('click', () => addSpecRow('', ''));

  const productForm = document.getElementById('productForm');
  if (productForm) productForm.addEventListener('submit', handleProductFormSubmit);

  // Product image file upload to Supabase Storage
  const prodImageFile = document.getElementById('prodImageFile');
  if (prodImageFile) {
    prodImageFile.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const uploadStatus = document.getElementById('prodUploadStatus');
      if (uploadStatus) uploadStatus.classList.remove('hidden');

      try {
        if (isSupabaseConfigured()) {
          const publicUrl = await uploadMedia(file, 'products');
          document.getElementById('prodImage').value = publicUrl;
          showAdminToast('Gambar berhasil diupload ke Supabase Storage!', 'success');
        } else {
          showAdminToast('Upload storage memerlukan Supabase URL & Anon Key aktif.', 'warning');
        }
      } catch (err) {
        console.error('Upload failed:', err);
        showAdminToast(`Upload gagal: ${err.message}`, 'error');
      } finally {
        if (uploadStatus) uploadStatus.classList.add('hidden');
      }
    });
  }

  // Gallery modal triggers
  const btnOpenAddGallery = document.getElementById('btnOpenAddGallery');
  if (btnOpenAddGallery) btnOpenAddGallery.addEventListener('click', openAddGalleryModal);

  const closeGalleryModalBtn = document.getElementById('closeGalleryModalBtn');
  const cancelGalleryBtn = document.getElementById('cancelGalleryBtn');
  const closeGalleryModal = () => document.getElementById('galleryModal')?.classList.add('hidden');
  if (closeGalleryModalBtn) closeGalleryModalBtn.addEventListener('click', closeGalleryModal);
  if (cancelGalleryBtn) cancelGalleryBtn.addEventListener('click', closeGalleryModal);

  const galleryForm = document.getElementById('galleryForm');
  if (galleryForm) galleryForm.addEventListener('submit', handleGalleryFormSubmit);

  // Gallery image file upload
  const galImageFile = document.getElementById('galImageFile');
  if (galImageFile) {
    galImageFile.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        if (isSupabaseConfigured()) {
          const publicUrl = await uploadMedia(file, 'gallery');
          document.getElementById('galImageUrl').value = publicUrl;
          showAdminToast('Foto dokumentasi berhasil diupload ke Supabase Storage!', 'success');
        } else {
          showAdminToast('Upload storage memerlukan Supabase URL & Anon Key aktif.', 'warning');
        }
      } catch (err) {
        showAdminToast(`Upload gagal: ${err.message}`, 'error');
      }
    });
  }

  // Company profile form
  const companyProfileForm = document.getElementById('companyProfileForm');
  if (companyProfileForm) companyProfileForm.addEventListener('submit', handleCompanyProfileSubmit);

  // Refresh Inquiries button
  const btnRefreshInquiries = document.getElementById('btnRefreshInquiries');
  if (btnRefreshInquiries) btnRefreshInquiries.addEventListener('click', loadInquiriesTable);

  // Search & Filter in Catalog
  const adminSearchProduct = document.getElementById('adminSearchProduct');
  const adminFilterCategory = document.getElementById('adminFilterCategory');

  const applyAdminProductFilter = () => {
    const q = adminSearchProduct?.value.trim().toLowerCase() || '';
    const cat = adminFilterCategory?.value || 'all';

    const filtered = allProducts.filter(p => {
      const matchCat = cat === 'all' || p.category === cat;
      const matchQuery = !q || p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });

    renderProductsRows(filtered);
  };

  if (adminSearchProduct) adminSearchProduct.addEventListener('input', applyAdminProductFilter);
  if (adminFilterCategory) adminFilterCategory.addEventListener('change', applyAdminProductFilter);

  // Settings modal
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const openSettingsBtnLogin = document.getElementById('openSettingsBtnLogin');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
  const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
  const btnSaveConfig = document.getElementById('btnSaveConfig');
  const btnClearConfig = document.getElementById('btnClearConfig');

  const openSettings = () => {
    const { url, anonKey } = getSupabaseCredentials();
    document.getElementById('cfgUrl').value = url || '';
    document.getElementById('cfgAnonKey').value = anonKey || '';
    settingsModal?.classList.remove('hidden');
  };

  const closeSettings = () => settingsModal?.classList.add('hidden');

  if (openSettingsBtn) openSettingsBtn.addEventListener('click', openSettings);
  if (openSettingsBtnLogin) openSettingsBtnLogin.addEventListener('click', openSettings);
  if (closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', closeSettings);
  if (cancelSettingsBtn) cancelSettingsBtn.addEventListener('click', closeSettings);

  if (btnSaveConfig) {
    btnSaveConfig.addEventListener('click', () => {
      const url = document.getElementById('cfgUrl')?.value.trim();
      const key = document.getElementById('cfgAnonKey')?.value.trim();
      if (!url || !key) {
        showAdminToast('URL dan Anon Key wajib diisi.', 'warning');
        return;
      }
      saveSupabaseConfig(url, key);
      showAdminToast('Kredensial Supabase berhasil disimpan!', 'success');
      closeSettings();
      window.location.reload();
    });
  }

  if (btnClearConfig) {
    btnClearConfig.addEventListener('click', () => {
      if (confirm('Hapus kredensial Supabase yang tersimpan di browser ini?')) {
        clearSupabaseConfig();
        showAdminToast('Kredensial dihapus.', 'info');
        closeSettings();
        window.location.reload();
      }
    });
  }
}

// Start
document.addEventListener('DOMContentLoaded', initAdmin);
