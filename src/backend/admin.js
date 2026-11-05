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
    <button class="text-current opacity-75 hover:opacity-100 cursor-pointer" onclick="this.parentElement.remove()">✕</button>
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

// ==========================================
// CUSTOM CONFIRMATION MODAL (NO BROWSER POPUPS)
// ==========================================
function openConfirmDialog({ title, message, confirmText = 'Ya, Hapus', isDanger = true, onConfirm }) {
  let modal = document.getElementById('adminCustomConfirmModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'adminCustomConfirmModal';
    modal.className = 'fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-200';
    document.body.appendChild(modal);
  }

  const btnTheme = isDanger 
    ? 'bg-rose-600 hover:bg-rose-700 text-white' 
    : 'bg-[#093180] hover:bg-[#062460] text-white';

  modal.innerHTML = `
    <div class="relative bg-white border-2 border-[#093180] max-w-sm w-full shadow-2xl p-6 transform transition-all duration-200">
      <div class="flex items-center gap-3 pb-3 mb-4 border-b border-[#e5e7eb]">
        <div class="w-9 h-9 ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-[#093180]'} flex items-center justify-center font-bold text-base shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div>
          <span class="text-[10px] font-bold tracking-widest text-[#6b7280] uppercase block">Konfirmasi Tindakan</span>
          <h3 class="text-sm font-extrabold text-[#111827] uppercase tracking-tight">${title || 'Perhatian'}</h3>
        </div>
      </div>
      <p class="text-xs text-[#4b5563] leading-relaxed mb-6">${message}</p>
      <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f3f4f6]">
        <button id="btnCancelConfirmAction" class="px-4 py-2 text-xs font-semibold bg-white border border-[#e5e7eb] hover:bg-gray-100 text-[#374151] transition-colors cursor-pointer">
          Batal
        </button>
        <button id="btnProceedConfirmAction" class="px-4 py-2 text-xs font-bold uppercase tracking-wider ${btnTheme} transition-colors cursor-pointer shadow-sm">
          ${confirmText}
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  const close = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  document.getElementById('btnCancelConfirmAction')?.addEventListener('click', close);
  document.getElementById('btnProceedConfirmAction')?.addEventListener('click', () => {
    close();
    if (typeof onConfirm === 'function') onConfirm();
  });

  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
}

// ==========================================
// REUSABLE PAGINATION CONTROLS RENDERER
// ==========================================
function renderPaginationControls({ containerId, currentPage, totalItems, perPage, onPageChange }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalPages = Math.ceil(totalItems / perPage) || 1;
  if (totalItems <= perPage) {
    container.innerHTML = `
      <div class="text-xs text-[#6b7280]">
        Total <span class="font-bold text-[#111827]">${totalItems}</span> data
      </div>
      <div class="text-[11px] text-[#9ca3af]">Halaman 1 dari 1</div>
    `;
    return;
  }

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  let pageButtonsHtml = '';
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      const activeClass = i === currentPage 
        ? 'bg-[#093180] text-white font-bold border-[#093180]' 
        : 'bg-white text-[#374151] border-[#e5e7eb] hover:bg-gray-100';
      pageButtonsHtml += `
        <button class="pg-btn px-3 py-1.5 text-xs border ${activeClass} transition-colors cursor-pointer" data-page="${i}">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pageButtonsHtml += `<span class="px-1 text-gray-400 text-xs select-none">...</span>`;
    }
  }

  container.innerHTML = `
    <div class="text-xs text-[#6b7280]">
      Menampilkan <span class="font-bold text-[#111827]">${startItem}</span> - <span class="font-bold text-[#111827]">${endItem}</span> dari <span class="font-bold text-[#111827]">${totalItems}</span> data
    </div>
    <div class="flex items-center gap-1.5">
      <button class="pg-prev px-3 py-1.5 text-xs font-semibold bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer" ${currentPage === 1 ? 'disabled' : ''}>
        ← Sebelumnya
      </button>
      <div class="flex items-center gap-1">${pageButtonsHtml}</div>
      <button class="pg-next px-3 py-1.5 text-xs font-semibold bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer" ${currentPage === totalPages ? 'disabled' : ''}>
        Berikutnya →
      </button>
    </div>
  `;

  container.querySelectorAll('.pg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.getAttribute('data-page'), 10);
      if (p !== currentPage) onPageChange(p);
    });
  });

  container.querySelector('.pg-prev')?.addEventListener('click', () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  });

  container.querySelector('.pg-next')?.addEventListener('click', () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  });
}

// State
let allProducts = [];
let allGallery = [];
let allInquiries = [];
let currentTab = 'catalog';

let catalogPage = 1;
const CATALOG_PER_PAGE = 8;

let galleryPage = 1;
const GALLERY_PER_PAGE = 6;

let inquiriesPage = 1;
const INQUIRIES_PER_PAGE = 8;

// ==========================================
// 1. INITIALIZATION & AUTHENTICATION
// ==========================================

async function initAdmin() {
  const configured = isSupabaseConfigured();
  if (!configured && supabaseWarningBadge) {
    supabaseWarningBadge.classList.remove('hidden');
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
// 3. CATALOG / PRODUCTS MANAGEMENT (PAGINATION + LAZY LOAD)
// ==========================================

async function loadProductsTable() {
  const tbody = document.getElementById('adminProductsTableBody');
  const countEl = document.getElementById('tabCountProducts');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Memuat data produk...</td></tr>`;

  try {
    allProducts = await getProducts();
    if (countEl) countEl.textContent = allProducts.length;

    catalogPage = 1;
    applyAdminProductFilter();
  } catch (err) {
    console.error('Failed to load products:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-rose-500">Gagal memuat produk.</td></tr>`;
  }
}

function renderProductsRows(filteredItems) {
  const tbody = document.getElementById('adminProductsTableBody');
  if (!tbody) return;

  if (filteredItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Tidak ada produk yang cocok.</td></tr>`;
    const pag = document.getElementById('adminProductsPagination');
    if (pag) pag.innerHTML = '';
    return;
  }

  // Pagination slice
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / CATALOG_PER_PAGE) || 1;
  if (catalogPage > totalPages) catalogPage = totalPages;
  if (catalogPage < 1) catalogPage = 1;

  const startIdx = (catalogPage - 1) * CATALOG_PER_PAGE;
  const pageItems = filteredItems.slice(startIdx, startIdx + CATALOG_PER_PAGE);

  tbody.innerHTML = pageItems.map(p => `
    <tr class="hover:bg-gray-50 transition-colors">
      <td class="py-3 px-4">
        <div class="w-12 h-12 bg-white border border-[#e5e7eb] p-1 flex items-center justify-center overflow-hidden">
          <img src="${p.image}" alt="${p.title}" loading="lazy" decoding="async" class="max-w-full max-h-full object-contain" onerror="this.src='../images/Fire-Hydrant-Yellow.png'">
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
        <button class="btn-edit-prod px-2.5 py-1 text-xs font-semibold bg-[#e6ecf5] text-[#093180] hover:bg-[#093180] hover:text-white transition-colors mr-1 cursor-pointer" data-id="${p.id}">
          Edit
        </button>
        <button class="btn-del-prod px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer" data-id="${p.id}">
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

  // Render pagination controls
  renderPaginationControls({
    containerId: 'adminProductsPagination',
    currentPage: catalogPage,
    totalItems: totalItems,
    perPage: CATALOG_PER_PAGE,
    onPageChange: (newPage) => {
      catalogPage = newPage;
      renderProductsRows(filteredItems);
      tbody.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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
  document.getElementById('prodId').value = prod.id;
  document.getElementById('prodId').disabled = true;
  document.getElementById('prodCode').value = prod.code || '';
  document.getElementById('prodTitle').value = prod.title || '';
  document.getElementById('prodBrand').value = prod.brand || '';
  document.getElementById('prodCategory').value = prod.category || 'hydrant';
  document.getElementById('prodImageUrl').value = prod.image || '';
  document.getElementById('prodDesc').value = prod.desc || '';

  if (specsContainer) {
    specsContainer.innerHTML = '';
    if (Array.isArray(prod.specs) && prod.specs.length > 0) {
      prod.specs.forEach(s => addSpecRow(s.key, s.value));
    } else {
      addSpecRow('Dimensi', '');
      addSpecRow('Material', '');
    }
  }

  title.textContent = `Edit Produk: ${prod.code}`;
  modal.classList.remove('hidden');
}

function addSpecRow(key = '', val = '') {
  const container = document.getElementById('specsContainer');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'flex items-center gap-2 spec-row';
  row.innerHTML = `
    <input type="text" placeholder="Parameter (cth: Dimensi)" value="${key}" class="spec-key w-1/3 text-xs p-2 border border-[#e5e7eb] outline-none focus:border-[#093180]">
    <input type="text" placeholder="Nilai (cth: 1250 x 800 mm)" value="${val}" class="spec-val flex-1 text-xs p-2 border border-[#e5e7eb] outline-none focus:border-[#093180]">
    <button type="button" class="btn-remove-spec p-2 text-rose-500 hover:text-rose-700 cursor-pointer" title="Hapus">✕</button>
  `;

  row.querySelector('.btn-remove-spec').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

async function handleProductFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('prodId').value.trim();
  const code = document.getElementById('prodCode').value.trim();
  const title = document.getElementById('prodTitle').value.trim();
  const brand = document.getElementById('prodBrand').value.trim();
  const category = document.getElementById('prodCategory').value;
  const image = document.getElementById('prodImageUrl').value.trim();
  const desc = document.getElementById('prodDesc').value.trim();

  // Gather specs
  const specs = [];
  document.querySelectorAll('#specsContainer .spec-row').forEach(row => {
    const k = row.querySelector('.spec-key')?.value.trim();
    const v = row.querySelector('.spec-val')?.value.trim();
    if (k && v) specs.push({ key: k, value: v });
  });

  const productData = { id, code, title, brand, category, image, desc, specs };

  try {
    if (isSupabaseConfigured()) {
      await saveProduct(productData);
      showAdminToast(`Produk ${code} berhasil disimpan ke Supabase!`, 'success');
    } else {
      // Demo update
      const existingIdx = allProducts.findIndex(p => p.id === id);
      if (existingIdx >= 0) allProducts[existingIdx] = productData;
      else allProducts.unshift(productData);
      showAdminToast(`Produk ${code} tersimpan (Mode Demo).`, 'info');
    }

    document.getElementById('productModal').classList.add('hidden');
    loadProductsTable();
  } catch (err) {
    console.error('Save product error:', err);
    showAdminToast(`Gagal menyimpan produk: ${err.message}`, 'error');
  }
}

function handleDeleteProduct(id) {
  const prod = allProducts.find(p => p.id === id);
  openConfirmDialog({
    title: 'Hapus Produk',
    message: `Apakah Anda yakin ingin menghapus produk "${prod?.title || id}" (${prod?.code || ''}) dari katalog?`,
    confirmText: 'Ya, Hapus Produk',
    isDanger: true,
    onConfirm: async () => {
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
  });
}

// ==========================================
// 4. GALLERY MANAGEMENT (PAGINATION + LAZY LOAD)
// ==========================================

async function loadGalleryGrid() {
  const grid = document.getElementById('adminGalleryGrid');
  const countEl = document.getElementById('tabCountGallery');
  if (!grid) return;

  grid.innerHTML = `<div class="col-span-full p-8 text-center text-gray-500">Memuat dokumentasi proyek...</div>`;

  try {
    allGallery = await getGallery();
    if (countEl) countEl.textContent = allGallery.length;

    galleryPage = 1;
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
    const pag = document.getElementById('adminGalleryPagination');
    if (pag) pag.innerHTML = '';
    return;
  }

  // Pagination slice
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / GALLERY_PER_PAGE) || 1;
  if (galleryPage > totalPages) galleryPage = totalPages;
  if (galleryPage < 1) galleryPage = 1;

  const startIdx = (galleryPage - 1) * GALLERY_PER_PAGE;
  const pageItems = items.slice(startIdx, startIdx + GALLERY_PER_PAGE);

  grid.innerHTML = pageItems.map(g => `
    <div class="bg-white border border-[#e5e7eb] flex flex-col justify-between overflow-hidden shadow-sm">
      <div class="relative aspect-video bg-gray-100 overflow-hidden">
        <img src="${g.image_url}" alt="${g.title}" loading="lazy" decoding="async" class="w-full h-full object-cover" onerror="this.src='../images/Fire-Hydrant-Yellow.png'">
        <span class="absolute top-2 left-2 px-2 py-0.5 bg-[#093180] text-white text-[10px] font-bold uppercase shadow">
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
            <button class="btn-edit-gal text-xs font-semibold text-[#093180] hover:underline cursor-pointer" data-id="${g.id}">Edit</button>
            <span class="text-gray-300">|</span>
            <button class="btn-del-gal text-xs font-semibold text-rose-600 hover:underline cursor-pointer" data-id="${g.id}">Hapus</button>
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

  // Render pagination controls
  renderPaginationControls({
    containerId: 'adminGalleryPagination',
    currentPage: galleryPage,
    totalItems: totalItems,
    perPage: GALLERY_PER_PAGE,
    onPageChange: (newPage) => {
      galleryPage = newPage;
      renderGalleryGrid(items);
      grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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
      showAdminToast('Dokumentasi tersimpan (Mode Demo).', 'info');
    }

    document.getElementById('galleryModal').classList.add('hidden');
    loadGalleryGrid();
  } catch (err) {
    console.error('Save gallery error:', err);
    showAdminToast(`Gagal menyimpan galeri: ${err.message}`, 'error');
  }
}

function handleDeleteGallery(id) {
  const item = allGallery.find(g => g.id === id);
  openConfirmDialog({
    title: 'Hapus Dokumentasi',
    message: `Apakah Anda yakin ingin menghapus foto dokumentasi "${item?.title || id}"?`,
    confirmText: 'Ya, Hapus Dokumentasi',
    isDanger: true,
    onConfirm: async () => {
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
  });
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
// 6. INQUIRIES / RFQ MESSAGES MANAGEMENT (PAGINATION)
// ==========================================

async function loadInquiriesTable() {
  const tbody = document.getElementById('adminInquiriesTableBody');
  const countEl = document.getElementById('tabCountInquiries');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Memuat pesan masuk...</td></tr>`;

  try {
    allInquiries = await getInquiries();
    if (countEl) countEl.textContent = allInquiries.length;

    inquiriesPage = 1;
    renderInquiriesRows();
  } catch (err) {
    console.error('Error loading inquiries:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Tabel RFQ belum terhubung atau kosong.</td></tr>`;
  }
}

function renderInquiriesRows() {
  const tbody = document.getElementById('adminInquiriesTableBody');
  if (!tbody) return;

  if (allInquiries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Belum ada pesan RFQ masuk. Formulir kontak dari website akan otomatis tercatat di sini.</td></tr>`;
    const pag = document.getElementById('adminInquiriesPagination');
    if (pag) pag.innerHTML = '';
    return;
  }

  const totalItems = allInquiries.length;
  const totalPages = Math.ceil(totalItems / INQUIRIES_PER_PAGE) || 1;
  if (inquiriesPage > totalPages) inquiriesPage = totalPages;
  if (inquiriesPage < 1) inquiriesPage = 1;

  const startIdx = (inquiriesPage - 1) * INQUIRIES_PER_PAGE;
  const pageItems = allInquiries.slice(startIdx, startIdx + INQUIRIES_PER_PAGE);

  tbody.innerHTML = pageItems.map(item => {
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
          <a href="${waUrl}" target="_blank" class="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors mr-1 inline-flex items-center gap-1 cursor-pointer">
            <span>WhatsApp</span>
          </a>
          <button class="btn-del-inquiry px-2 py-1 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer" data-id="${item.id}">
            Hapus
          </button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.btn-del-inquiry').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-id');
      const item = allInquiries.find(i => i.id === id);
      openConfirmDialog({
        title: 'Hapus Pesan Masuk',
        message: `Hapus pesan penawaran dari "${item?.name || 'Klien'}" (${item?.phone || ''})? Tindakan ini tidak dapat dibatalkan.`,
        confirmText: 'Ya, Hapus Pesan',
        isDanger: true,
        onConfirm: async () => {
          await deleteInquiry(id);
          showAdminToast('Pesan berhasil dihapus.', 'info');
          allInquiries = allInquiries.filter(i => i.id !== id);
          const countEl = document.getElementById('tabCountInquiries');
          if (countEl) countEl.textContent = allInquiries.length;
          renderInquiriesRows();
        }
      });
    });
  });

  // Render pagination controls
  renderPaginationControls({
    containerId: 'adminInquiriesPagination',
    currentPage: inquiriesPage,
    totalItems: totalItems,
    perPage: INQUIRIES_PER_PAGE,
    onPageChange: (newPage) => {
      inquiriesPage = newPage;
      renderInquiriesRows();
      tbody.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

// ==========================================
// 7. EVENT LISTENERS SETUP
// ==========================================

function applyAdminProductFilter() {
  const cat = document.getElementById('adminFilterCategory')?.value || 'all';
  const q = document.getElementById('adminSearchProduct')?.value.trim().toLowerCase() || '';

  const filtered = allProducts.filter(p => {
    const matchCat = cat === 'all' || p.category === cat;
    const matchQuery = !q || p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  catalogPage = 1;
  renderProductsRows(filtered);
}

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

  // Logout button (Custom confirmation modal)
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      openConfirmDialog({
        title: 'Keluar dari CMS',
        message: 'Apakah Anda yakin ingin keluar dari panel admin PT INDO TEKNIK EMPATBELAS?',
        confirmText: 'Ya, Keluar',
        isDanger: false,
        onConfirm: async () => {
          sessionStorage.removeItem('indoteknik_admin_demo');
          try {
            await logoutAdmin();
          } catch (e) {}
          showAdminToast('Anda telah keluar dari CMS.', 'info');
          showLogin();
        }
      });
    });
  }

  // Tab navigation
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.getAttribute('data-tab')));
  });

  // Product modal triggers
  document.getElementById('btnOpenAddProduct')?.addEventListener('click', openAddProductModal);
  document.getElementById('closeProductModalBtn')?.addEventListener('click', () => {
    document.getElementById('productModal')?.classList.add('hidden');
  });
  document.getElementById('cancelProductBtn')?.addEventListener('click', () => {
    document.getElementById('productModal')?.classList.add('hidden');
  });
  document.getElementById('btnAddSpecRow')?.addEventListener('click', () => addSpecRow());
  document.getElementById('productForm')?.addEventListener('submit', handleProductFormSubmit);

  // Gallery modal triggers
  document.getElementById('btnOpenAddGallery')?.addEventListener('click', openAddGalleryModal);
  document.getElementById('closeGalleryModalBtn')?.addEventListener('click', () => {
    document.getElementById('galleryModal')?.classList.add('hidden');
  });
  document.getElementById('cancelGalleryBtn')?.addEventListener('click', () => {
    document.getElementById('galleryModal')?.classList.add('hidden');
  });
  document.getElementById('galleryForm')?.addEventListener('submit', handleGalleryFormSubmit);

  // Company Profile submit
  document.getElementById('companyProfileForm')?.addEventListener('submit', handleCompanyProfileSubmit);

  // Refresh Inquiries
  document.getElementById('btnRefreshInquiries')?.addEventListener('click', () => {
    loadInquiriesTable();
    showAdminToast('Memuat ulang pesan masuk...', 'info');
  });

  // Filters & search with debounce/instant
  const adminSearchProduct = document.getElementById('adminSearchProduct');
  const adminFilterCategory = document.getElementById('adminFilterCategory');

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

  // Clear config (Custom confirmation modal instead of confirm)
  if (btnClearConfig) {
    btnClearConfig.addEventListener('click', () => {
      openConfirmDialog({
        title: 'Hapus Kredensial Supabase',
        message: 'Hapus kredensial Supabase yang tersimpan di browser ini? Halaman akan dimuat ulang.',
        confirmText: 'Ya, Hapus Kredensial',
        isDanger: true,
        onConfirm: () => {
          clearSupabaseConfig();
          showAdminToast('Kredensial dihapus.', 'info');
          closeSettings();
          window.location.reload();
        }
      });
    });
  }
}

// Start
document.addEventListener('DOMContentLoaded', initAdmin);
