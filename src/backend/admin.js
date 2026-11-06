// PT INDO TEKNIK EMPATBELAS — ADMIN CMS CONTROLLER
import {
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
  normalizeMediaUrl,
  onAuthStateChange,
  saveGalleryItem,
  saveProduct,
  standardizeCategory,
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
    modal.className = 'fixed inset-0 z-[120] bg-black/75 flex items-center justify-center p-4 transition-all duration-200';
    document.body.appendChild(modal);
  }

  const btnTheme = isDanger 
    ? 'bg-rose-600 hover:bg-rose-700 text-white' 
    : 'bg-[#093180] hover:bg-[#062460] text-white';

  modal.innerHTML = `
    <div class="relative bg-white border-2 border-[#093180] max-w-sm w-full shadow-2xl p-4 sm:p-6 transform transition-all duration-200">
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
      <div class="grid grid-cols-2 sm:flex sm:justify-end gap-2.5 pt-3 border-t border-[#f3f4f6]">
        <button id="btnCancelConfirmAction" class="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-white border border-[#e5e7eb] hover:bg-gray-100 text-[#374151] transition-colors cursor-pointer text-center">
          Batal
        </button>
        <button id="btnProceedConfirmAction" class="w-full sm:w-auto px-4 py-2 text-xs font-bold uppercase tracking-wider ${btnTheme} transition-colors cursor-pointer shadow-sm text-center">
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

function syncCategoryOptions() {
  const filterSel = document.getElementById('adminFilterCategory');
  const prodCatSel = document.getElementById('prodCategory');
  const galCatSel = document.getElementById('galCategory');

  // Products
  const prodMap = new Map();
  prodMap.set('hydrant', 'Hydrant & Valve');
  prodMap.set('alarm', 'Fire Alarm System');
  prodMap.set('foam', 'Foam Bladder System');
  prodMap.set('cleanagent', 'Clean Agent System');

  allProducts.forEach(p => {
    if (p.category && !prodMap.has(p.category)) {
      const std = standardizeCategory(p.category);
      prodMap.set(p.category, std.label);
    }
  });

  if (filterSel) {
    const prev = filterSel.value;
    let html = '<option value="all">Semua Kategori</option>';
    prodMap.forEach((lbl, slug) => {
      html += `<option value="${slug}">${lbl}</option>`;
    });
    filterSel.innerHTML = html;
    if (prodMap.has(prev) || prev === 'all') filterSel.value = prev;
  }

  if (prodCatSel) {
    const prev = prodCatSel.value;
    let html = '';
    prodMap.forEach((lbl, slug) => {
      html += `<option value="${slug}">${lbl}</option>`;
    });
    html += '<option value="__new__">+ Tambah Kategori Baru...</option>';
    prodCatSel.innerHTML = html;
    if (prodMap.has(prev)) prodCatSel.value = prev;
  }

  // Gallery
  const galMap = new Map();
  galMap.set('hydrant', 'Hydrant & Plambing');
  galMap.set('pump', 'Fire Pump & Mesin');
  galMap.set('pipa', 'Perpipaan & Fabrikasi');
  galMap.set('team', 'Commissioning & Tim');

  allGallery.forEach(g => {
    if (g.category && !galMap.has(g.category)) {
      const std = standardizeCategory(g.category);
      galMap.set(g.category, g.category_label || std.label);
    }
  });

  if (galCatSel) {
    const prev = galCatSel.value;
    let html = '';
    galMap.forEach((lbl, slug) => {
      html += `<option value="${slug}">${lbl}</option>`;
    });
    html += '<option value="__new__">+ Tambah Kategori Baru...</option>';
    galCatSel.innerHTML = html;
    if (galMap.has(prev)) galCatSel.value = prev;
  }
}

async function loadProductsTable() {
  const tbody = document.getElementById('adminProductsTableBody');
  const countEl = document.getElementById('tabCountProducts');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Memuat data produk...</td></tr>`;

  try {
    allProducts = await getProducts();
    if (countEl) countEl.textContent = allProducts.length;

    syncCategoryOptions();
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
          <img src="${normalizeMediaUrl(p.image)}" alt="${p.title}" loading="lazy" decoding="async" class="max-w-full max-h-full object-contain" onerror="this.onerror=null; this.src='/images/Fire-Hydrant-Yellow.png'">
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

  const newCatBox = document.getElementById('prodNewCategoryBox');
  if (newCatBox) newCatBox.classList.add('hidden');
  const newCatInput = document.getElementById('prodNewCategoryInput');
  if (newCatInput) newCatInput.value = '';
  const newCatPrev = document.getElementById('prodCategoryStandardizedPreview');
  if (newCatPrev) newCatPrev.classList.add('hidden');

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

  const newCatBox = document.getElementById('prodNewCategoryBox');
  if (newCatBox) newCatBox.classList.add('hidden');
  const newCatInput = document.getElementById('prodNewCategoryInput');
  if (newCatInput) newCatInput.value = '';
  const newCatPrev = document.getElementById('prodCategoryStandardizedPreview');
  if (newCatPrev) newCatPrev.classList.add('hidden');

  const catSelect = document.getElementById('prodCategory');
  if (catSelect) {
    let found = false;
    for (let i = 0; i < catSelect.options.length; i++) {
      if (catSelect.options[i].value === prod.category) {
        found = true;
        break;
      }
    }
    if (!found && prod.category) {
      const std = standardizeCategory(prod.category);
      const opt = document.createElement('option');
      opt.value = std.slug;
      opt.textContent = std.label;
      const newOpt = catSelect.querySelector('option[value="__new__"]');
      if (newOpt) catSelect.insertBefore(opt, newOpt);
      else catSelect.appendChild(opt);
    }
    catSelect.value = prod.category || 'hydrant';
  }

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
  row.className = 'spec-row p-2.5 sm:p-2 bg-[#f9fafb] sm:bg-white border border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center gap-2 transition-all';
  row.innerHTML = `
    <div class="w-full sm:w-1/3">
      <label class="block sm:hidden text-[10px] font-bold text-[#6b7280] uppercase mb-1">Nama Parameter</label>
      <input type="text" placeholder="Parameter (cth: Dimensi)" value="${key}" class="spec-key w-full text-xs p-2 bg-white border border-[#e5e7eb] outline-none focus:border-[#093180]">
    </div>
    <div class="w-full sm:flex-1">
      <label class="block sm:hidden text-[10px] font-bold text-[#6b7280] uppercase mb-1">Nilai / Ukuran</label>
      <input type="text" placeholder="Nilai (cth: 1250 x 800 mm)" value="${val}" class="spec-val w-full text-xs p-2 bg-white border border-[#e5e7eb] outline-none focus:border-[#093180]">
    </div>
    <div class="flex justify-end sm:justify-center pt-1 sm:pt-0">
      <button type="button" class="btn-remove-spec px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 sm:border-0 sm:p-2 cursor-pointer flex items-center gap-1 transition-colors" title="Hapus Parameter">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        <span class="sm:hidden text-[11px]">Hapus</span>
      </button>
    </div>
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
  let category = document.getElementById('prodCategory').value;
  const image = document.getElementById('prodImageUrl').value.trim();
  const desc = document.getElementById('prodDesc').value.trim();

  if (category === '__new__') {
    const rawCat = document.getElementById('prodNewCategoryInput')?.value.trim();
    if (!rawCat) {
      showAdminToast('Silakan ketik nama kategori produk baru.', 'warning');
      return;
    }
    const std = standardizeCategory(rawCat);
    category = std.slug;
  }

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

    syncCategoryOptions();
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
        <img src="${normalizeMediaUrl(g.image_url)}" alt="${g.title}" loading="lazy" decoding="async" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='/images/Fire-Hydrant-Yellow.png'">
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

  const newCatBox = document.getElementById('galNewCategoryBox');
  if (newCatBox) newCatBox.classList.add('hidden');
  const newCatInput = document.getElementById('galNewCategoryInput');
  if (newCatInput) newCatInput.value = '';
  const newCatPrev = document.getElementById('galCategoryStandardizedPreview');
  if (newCatPrev) newCatPrev.classList.add('hidden');

  modal.classList.remove('hidden');
}

function openEditGalleryModal(id) {
  const item = allGallery.find(g => g.id === id);
  if (!item) return;

  const modal = document.getElementById('galleryModal');
  const title = document.getElementById('galleryModalTitle');

  document.getElementById('galId').value = item.id;
  document.getElementById('galTitle').value = item.title || '';

  const newCatBox = document.getElementById('galNewCategoryBox');
  if (newCatBox) newCatBox.classList.add('hidden');
  const newCatInput = document.getElementById('galNewCategoryInput');
  if (newCatInput) newCatInput.value = '';
  const newCatPrev = document.getElementById('galCategoryStandardizedPreview');
  if (newCatPrev) newCatPrev.classList.add('hidden');

  const catSelect = document.getElementById('galCategory');
  if (catSelect) {
    let found = false;
    for (let i = 0; i < catSelect.options.length; i++) {
      if (catSelect.options[i].value === item.category) {
        found = true;
        break;
      }
    }
    if (!found && item.category) {
      const std = standardizeCategory(item.category);
      const opt = document.createElement('option');
      opt.value = std.slug;
      opt.textContent = item.category_label || std.label;
      const newOpt = catSelect.querySelector('option[value="__new__"]');
      if (newOpt) catSelect.insertBefore(opt, newOpt);
      else catSelect.appendChild(opt);
    }
    catSelect.value = item.category || 'hydrant';
  }

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
  let category = document.getElementById('galCategory').value;
  let category_label = document.getElementById('galCategoryLabel').value.trim();
  const image_url = document.getElementById('galImageUrl').value.trim();
  const description = document.getElementById('galDesc').value.trim();

  if (category === '__new__') {
    const rawCat = document.getElementById('galNewCategoryInput')?.value.trim();
    if (!rawCat) {
      showAdminToast('Silakan ketik nama kategori baru untuk dokumentasi.', 'warning');
      return;
    }
    const std = standardizeCategory(rawCat);
    category = std.slug;
    if (!category_label) category_label = std.label;
  }

  if (!title || !image_url) {
    showAdminToast('Judul dan Gambar dokumentasi wajib diisi.', 'warning');
    return;
  }

  const galData = { id, title, category, category_label: category_label || category, image_url, description, order_num: allGallery.length + 1 };

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
// 5. COMPANY PROFILE & ABOUT US MANAGEMENT
// ==========================================

async function loadCompanyProfile() {
  try {
    const cp = await getCompanyProfile();
    if (!cp) return;

    // 1. Identitas & Kontak
    if (document.getElementById('cpName')) document.getElementById('cpName').value = cp.company_name || '';
    if (document.getElementById('cpTagline')) document.getElementById('cpTagline').value = cp.tagline || '';
    if (document.getElementById('cpDesc')) document.getElementById('cpDesc').value = cp.about_desc || '';
    if (document.getElementById('cpPhone')) document.getElementById('cpPhone').value = cp.phone || '';
    if (document.getElementById('cpEmail')) document.getElementById('cpEmail').value = cp.email || '';
    if (document.getElementById('cpAddress')) document.getElementById('cpAddress').value = cp.address || '';

    const stats = cp.stats || {};

    // 1.1 Kantor Pusat & Jam Operasional (contact.html & index.html)
    if (document.getElementById('cpWorkshopTitle')) {
      document.getElementById('cpWorkshopTitle').value = stats.workshop_title || cp.workshop_title || 'Kantor Pusat & Workshop';
    }
    if (document.getElementById('cpOperationalArea')) {
      document.getElementById('cpOperationalArea').value = stats.operational_area || cp.operational_area || 'Jawa Timur & Seluruh Indonesia';
    }
    if (document.getElementById('cpHoursWorkday')) {
      document.getElementById('cpHoursWorkday').value = stats.hours_workday || cp.hours_workday || '08:00 - 17:00 WIB';
    }
    if (document.getElementById('cpHoursSaturday')) {
      document.getElementById('cpHoursSaturday').value = stats.hours_saturday || cp.hours_saturday || '08:00 - 13:00 WIB';
    }
    if (document.getElementById('cpHoursEmergency')) {
      document.getElementById('cpHoursEmergency').value = stats.hours_emergency || cp.hours_emergency || 'Siaga 24 Jam';
    }

    // 2. About Us 4 Kartu
    if (document.getElementById('cpVisionTitle')) document.getElementById('cpVisionTitle').value = stats.vision_title || 'VISI PERUSAHAAN';
    if (document.getElementById('cpVision')) document.getElementById('cpVision').value = cp.vision || '';
    if (document.getElementById('cpMission')) {
      document.getElementById('cpMission').value = Array.isArray(cp.mission) ? cp.mission.join('\n') : '';
    }
    if (document.getElementById('cpVisionFooter')) document.getElementById('cpVisionFooter').value = stats.vision_footer || 'KOMITMEN PROFESIONALISME';

    if (document.getElementById('cpSafetyTitle')) document.getElementById('cpSafetyTitle').value = stats.safety_title || 'STANDAR MUTU & K3L';
    if (document.getElementById('cpSafetyDesc')) document.getElementById('cpSafetyDesc').value = stats.safety_desc || '';
    if (document.getElementById('cpSafetyPoints')) {
      document.getElementById('cpSafetyPoints').value = Array.isArray(stats.safety_points) ? stats.safety_points.join('\n') : '';
    }
    if (document.getElementById('cpSafetyFooter')) document.getElementById('cpSafetyFooter').value = stats.safety_footer || 'KEANDALAN TERUJI';

    if (document.getElementById('cpServiceTitle')) document.getElementById('cpServiceTitle').value = stats.service_title || 'LINGKUP KEAHLIAN';
    if (document.getElementById('cpServiceDesc')) document.getElementById('cpServiceDesc').value = stats.service_desc || '';
    if (document.getElementById('cpServicePoints')) {
      document.getElementById('cpServicePoints').value = Array.isArray(stats.service_points) ? stats.service_points.join('\n') : '';
    }
    if (document.getElementById('cpServiceFooter')) document.getElementById('cpServiceFooter').value = stats.service_footer || 'SOLUSI TERINTEGRASI';

    if (document.getElementById('cpStatExp')) document.getElementById('cpStatExp').value = stats.experience_years || '20+';
    if (document.getElementById('cpStatExpLabel')) document.getElementById('cpStatExpLabel').value = stats.experience_label || 'Tahun Pengalaman';
    if (document.getElementById('cpStatProj')) document.getElementById('cpStatProj').value = stats.projects_completed || '500+';
    if (document.getElementById('cpStatProjLabel')) document.getElementById('cpStatProjLabel').value = stats.projects_label || 'Proyek Selesai';
    if (document.getElementById('cpStatStd')) document.getElementById('cpStatStd').value = stats.standards || 'NFPA & SNI';
    if (document.getElementById('cpStatStdLabel')) document.getElementById('cpStatStdLabel').value = stats.standards_label || 'Standar Resmi';
    if (document.getElementById('cpStatEng')) document.getElementById('cpStatEng').value = stats.expert_engineers || '30+';
    if (document.getElementById('cpStatEngLabel')) document.getElementById('cpStatEngLabel').value = stats.engineers_label || 'Engineer Ahli';

    // 3. Homepage 3 Kartu
    if (document.getElementById('cpHomeCard1Title')) document.getElementById('cpHomeCard1Title').value = stats.home_card1_title || 'Badan Usaha Resmi';
    if (document.getElementById('cpHomeCard1Desc')) document.getElementById('cpHomeCard1Desc').value = stats.home_card1_desc || '';
    if (document.getElementById('cpHomeCard1Footer')) document.getElementById('cpHomeCard1Footer').value = stats.home_card1_footer || 'Integritas & Presisi';

    if (document.getElementById('cpHomeCard2Title')) document.getElementById('cpHomeCard2Title').value = stats.home_card2_title || 'Standar NFPA & SNI';
    if (document.getElementById('cpHomeCard2Desc')) document.getElementById('cpHomeCard2Desc').value = stats.home_card2_desc || '';
    if (document.getElementById('cpHomeCard2Footer')) document.getElementById('cpHomeCard2Footer').value = stats.home_card2_footer || 'Standar Teruji';

    if (document.getElementById('cpHomeCard3Title')) document.getElementById('cpHomeCard3Title').value = stats.home_card3_title || 'Solusi Terintegrasi';
    if (document.getElementById('cpHomeCard3Desc')) document.getElementById('cpHomeCard3Desc').value = stats.home_card3_desc || '';
    if (document.getElementById('cpHomeCard3Footer')) document.getElementById('cpHomeCard3Footer').value = stats.home_card3_footer || 'End-to-End Service';

  } catch (err) {
    console.error('Error loading company profile:', err);
  }
}

async function handleCompanyProfileSubmit(e) {
  e.preventDefault();

  const missionText = document.getElementById('cpMission')?.value || '';
  const missionLines = missionText.split('\n').map(l => l.trim()).filter(Boolean);

  const safetyText = document.getElementById('cpSafetyPoints')?.value || '';
  const safetyLines = safetyText.split('\n').map(l => l.trim()).filter(Boolean);

  const serviceText = document.getElementById('cpServicePoints')?.value || '';
  const serviceLines = serviceText.split('\n').map(l => l.trim()).filter(Boolean);

  const profile = {
    company_name: document.getElementById('cpName').value.trim(),
    tagline: document.getElementById('cpTagline').value.trim(),
    about_desc: document.getElementById('cpDesc').value.trim(),
    vision: document.getElementById('cpVision').value.trim(),
    mission: missionLines,
    phone: document.getElementById('cpPhone').value.trim(),
    whatsapp: document.getElementById('cpPhone').value.trim().replace(/[^0-9]/g, ''),
    email: document.getElementById('cpEmail').value.trim(),
    address: document.getElementById('cpAddress').value.trim(),
    stats: {
      workshop_title: document.getElementById('cpWorkshopTitle')?.value.trim() || 'Kantor Pusat & Workshop',
      operational_area: document.getElementById('cpOperationalArea')?.value.trim() || 'Jawa Timur & Seluruh Indonesia',
      hours_workday: document.getElementById('cpHoursWorkday')?.value.trim() || '08:00 - 17:00 WIB',
      hours_saturday: document.getElementById('cpHoursSaturday')?.value.trim() || '08:00 - 13:00 WIB',
      hours_emergency: document.getElementById('cpHoursEmergency')?.value.trim() || 'Siaga 24 Jam',
      vision_title: document.getElementById('cpVisionTitle')?.value.trim() || 'VISI PERUSAHAAN',
      vision_footer: document.getElementById('cpVisionFooter')?.value.trim() || 'KOMITMEN PROFESIONALISME',
      safety_title: document.getElementById('cpSafetyTitle')?.value.trim() || 'STANDAR MUTU & K3L',
      safety_desc: document.getElementById('cpSafetyDesc')?.value.trim() || '',
      safety_points: safetyLines,
      safety_footer: document.getElementById('cpSafetyFooter')?.value.trim() || 'KEANDALAN TERUJI',
      service_title: document.getElementById('cpServiceTitle')?.value.trim() || 'LINGKUP KEAHLIAN',
      service_desc: document.getElementById('cpServiceDesc')?.value.trim() || '',
      service_points: serviceLines,
      service_footer: document.getElementById('cpServiceFooter')?.value.trim() || 'SOLUSI TERINTEGRASI',
      experience_years: document.getElementById('cpStatExp')?.value.trim() || '20+',
      experience_label: document.getElementById('cpStatExpLabel')?.value.trim() || 'Tahun Pengalaman',
      projects_completed: document.getElementById('cpStatProj')?.value.trim() || '500+',
      projects_label: document.getElementById('cpStatProjLabel')?.value.trim() || 'Proyek Selesai',
      standards: document.getElementById('cpStatStd')?.value.trim() || 'NFPA & SNI',
      standards_label: document.getElementById('cpStatStdLabel')?.value.trim() || 'Standar Resmi',
      expert_engineers: document.getElementById('cpStatEng')?.value.trim() || '30+',
      engineers_label: document.getElementById('cpStatEngLabel')?.value.trim() || 'Engineer Ahli',
      home_card1_title: document.getElementById('cpHomeCard1Title')?.value.trim() || 'Badan Usaha Resmi',
      home_card1_desc: document.getElementById('cpHomeCard1Desc')?.value.trim() || '',
      home_card1_footer: document.getElementById('cpHomeCard1Footer')?.value.trim() || 'Integritas & Presisi',
      home_card2_title: document.getElementById('cpHomeCard2Title')?.value.trim() || 'Standar NFPA & SNI',
      home_card2_desc: document.getElementById('cpHomeCard2Desc')?.value.trim() || '',
      home_card2_footer: document.getElementById('cpHomeCard2Footer')?.value.trim() || 'Standar Teruji',
      home_card3_title: document.getElementById('cpHomeCard3Title')?.value.trim() || 'Solusi Terintegrasi',
      home_card3_desc: document.getElementById('cpHomeCard3Desc')?.value.trim() || '',
      home_card3_footer: document.getElementById('cpHomeCard3Footer')?.value.trim() || 'End-to-End Service'
    }
  };

  try {
    if (isSupabaseConfigured()) {
      await updateCompanyProfile(profile);
      showAdminToast('Profil & Konten Tentang Kami berhasil diperbarui di Supabase!', 'success');
    } else {
      await updateCompanyProfile(profile);
      showAdminToast('Profil & Konten Tentang Kami diperbarui di penyimpanan lokal.', 'info');
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
        <td class="py-3 px-4 font-bold text-[#111827] whitespace-nowrap">
          <div class="text-xs">${item.name}</div>
          <div class="text-[11px] text-[#093180] font-medium">${item.company || 'Perorangan'}</div>
        </td>
        <td class="py-3 px-4 text-xs font-semibold text-[#111827] whitespace-nowrap">${item.phone}</td>
        <td class="py-3 px-4 whitespace-nowrap">
          <span class="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#e6ecf5] text-[#093180]">
            ${item.service || 'Umum'}
          </span>
        </td>
        <td class="py-3 px-4 text-xs text-[#4b5563] min-w-[220px] max-w-sm leading-relaxed break-words">
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

  // Category addition & auto-standardization listeners: Product
  const prodCategorySelect = document.getElementById('prodCategory');
  const prodNewCatBox = document.getElementById('prodNewCategoryBox');
  const prodNewCatInput = document.getElementById('prodNewCategoryInput');
  const prodCatPreview = document.getElementById('prodCategoryStandardizedPreview');
  const prodCatPrevLabel = document.getElementById('prodCategoryPreviewLabel');
  const prodCatPrevSlug = document.getElementById('prodCategoryPreviewSlug');

  if (prodCategorySelect) {
    prodCategorySelect.addEventListener('change', (e) => {
      if (e.target.value === '__new__') {
        if (prodNewCatBox) prodNewCatBox.classList.remove('hidden');
        if (prodNewCatInput) {
          prodNewCatInput.focus();
          prodNewCatInput.required = true;
        }
      } else {
        if (prodNewCatBox) prodNewCatBox.classList.add('hidden');
        if (prodNewCatInput) {
          prodNewCatInput.required = false;
          prodNewCatInput.value = '';
        }
        if (prodCatPreview) prodCatPreview.classList.add('hidden');
      }
    });
  }

  if (prodNewCatInput) {
    prodNewCatInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.trim()) {
        const std = standardizeCategory(val);
        if (prodCatPrevLabel) prodCatPrevLabel.textContent = std.label;
        if (prodCatPrevSlug) prodCatPrevSlug.textContent = std.slug;
        if (prodCatPreview) prodCatPreview.classList.remove('hidden');
      } else {
        if (prodCatPreview) prodCatPreview.classList.add('hidden');
      }
    });
  }

  // Category addition & auto-standardization listeners: Gallery
  const galCategorySelect = document.getElementById('galCategory');
  const galNewCatBox = document.getElementById('galNewCategoryBox');
  const galNewCatInput = document.getElementById('galNewCategoryInput');
  const galCatPreview = document.getElementById('galCategoryStandardizedPreview');
  const galCatPrevLabel = document.getElementById('galCategoryPreviewLabel');
  const galCatPrevSlug = document.getElementById('galCategoryPreviewSlug');
  const galCategoryLabelInput = document.getElementById('galCategoryLabel');

  if (galCategorySelect) {
    galCategorySelect.addEventListener('change', (e) => {
      if (e.target.value === '__new__') {
        if (galNewCatBox) galNewCatBox.classList.remove('hidden');
        if (galNewCatInput) {
          galNewCatInput.focus();
          galNewCatInput.required = true;
        }
      } else {
        if (galNewCatBox) galNewCatBox.classList.add('hidden');
        if (galNewCatInput) {
          galNewCatInput.required = false;
          galNewCatInput.value = '';
        }
        if (galCatPreview) galCatPreview.classList.add('hidden');
      }
    });
  }

  if (galNewCatInput) {
    galNewCatInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.trim()) {
        const std = standardizeCategory(val);
        if (galCatPrevLabel) galCatPrevLabel.textContent = std.label;
        if (galCatPrevSlug) galCatPrevSlug.textContent = std.slug;
        if (galCatPreview) galCatPreview.classList.remove('hidden');
        if (galCategoryLabelInput) galCategoryLabelInput.value = std.label;
      } else {
        if (galCatPreview) galCatPreview.classList.add('hidden');
      }
    });
  }

  // Product image file upload
  const prodFileEl = document.getElementById('prodImageFile');
  if (prodFileEl) {
    prodFileEl.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const statusEl = document.getElementById('prodUploadStatus');
      if (statusEl) statusEl.classList.remove('hidden');
      try {
        if (isSupabaseConfigured()) {
          const url = await uploadMedia(file, 'products');
          document.getElementById('prodImageUrl').value = url;
          showAdminToast('Gambar berhasil diunggah ke Supabase!', 'success');
        } else {
          const reader = new FileReader();
          reader.onload = (ev) => {
            document.getElementById('prodImageUrl').value = ev.target.result;
            showAdminToast('Gambar dimuat (Mode Demo).', 'info');
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.error('Upload error:', err);
        showAdminToast(`Gagal mengupload gambar: ${err.message}`, 'error');
      } finally {
        if (statusEl) statusEl.classList.add('hidden');
      }
    });
  }

  // Gallery image file upload
  const galFileEl = document.getElementById('galImageFile');
  if (galFileEl) {
    galFileEl.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        if (isSupabaseConfigured()) {
          const url = await uploadMedia(file, 'gallery');
          document.getElementById('galImageUrl').value = url;
          showAdminToast('Foto dokumentasi berhasil diunggah!', 'success');
        } else {
          const reader = new FileReader();
          reader.onload = (ev) => {
            document.getElementById('galImageUrl').value = ev.target.result;
            showAdminToast('Foto dimuat (Mode Demo).', 'info');
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.error('Gallery upload error:', err);
        showAdminToast(`Gagal mengupload foto: ${err.message}`, 'error');
      }
    });
  }

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
}

// Start
document.addEventListener('DOMContentLoaded', initAdmin);
