// Frontend Dynamic Catalog Controller
import { getCompanyProfile, getProducts, standardizeCategory } from '../lib/supabase.js';

export async function initKatalog() {
  const grid = document.getElementById('catalogGrid');
  const pagContainer = document.getElementById('catalogPagination');
  const homeFeatured = document.getElementById('homeFeaturedContainer');
  const tabsContainer = document.getElementById('catalogTabsContainer') || document.querySelector('.catalog-tab')?.parentElement;
  const searchInput = document.getElementById('catalogSearchInput');
  const modal = document.getElementById('productDetailModal') || document.getElementById('hydrantDetailModal');
  const closeBtn = document.getElementById('closeModalBtn') || document.getElementById('closeHydrantModalBtn');

  let products = [];
  let currentFiltered = [];
  let currentPage = 1;
  const PER_PAGE = 12;

  // Active filter state
  let currentCategory = 'all';
  let currentSearch = '';

  // Company WhatsApp number for inquiry fallback
  let companyWa = '6281390630360';
  try {
    const cp = await getCompanyProfile();
    if (cp && cp.phone) {
      companyWa = cp.phone.replace(/[^0-9]/g, '');
      if (companyWa.startsWith('0')) companyWa = '62' + companyWa.slice(1);
    }
  } catch (_) {}

  const renderProducts = (items) => {
    if (!grid) return;
    currentFiltered = items;

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center border border-dashed border-[#e5e7eb] p-8">
          <p class="text-sm font-semibold text-[#4b5563]">Tidak ada produk yang sesuai kriteria pencarian.</p>
        </div>
      `;
      if (pagContainer) pagContainer.innerHTML = '';
      return;
    }

    const totalPages = Math.ceil(items.length / PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * PER_PAGE;
    const pageItems = items.slice(startIdx, startIdx + PER_PAGE);

    grid.innerHTML = pageItems.map(p => `
      <div class="product-card group bg-white border border-[#e5e7eb] p-4 flex flex-col justify-between hover:shadow-lg transition-all" data-category="${p.category}" data-id="${p.id}">
        <div>
          <div class="aspect-square bg-white flex items-center justify-center p-3 mb-4 overflow-hidden border border-[#f3f4f6]">
            <img src="${p.image}" alt="${p.title}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='/images/Fire-Hydrant-Yellow.png'">
          </div>
          <span class="text-[10px] font-bold text-[#093180] tracking-wider uppercase block mb-1">
            ${p.code}
          </span>
          <h3 class="product-card-title text-xs font-bold text-[#111827] line-clamp-2 mb-2 group-hover:text-[#093180] transition-colors">
            ${p.title}
          </h3>
          <p class="text-[11px] text-[#6b7280] line-clamp-2 mb-3 leading-relaxed">
            ${p.desc || ''}
          </p>
        </div>
        <div class="pt-3 border-t border-[#e5e7eb] flex items-center justify-between">
          <span class="text-[10px] font-bold text-[#4b5563] uppercase">
            ${p.brand || 'Vinci'}
          </span>
          <button class="btn-detail text-xs font-bold text-[#093180] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer pointer-events-none">
            <span>Rincian</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const prod = products.find(p => p.id === id);
        if (prod) openProductModal(prod);
      });
    });

    // Pagination controls
    if (pagContainer) {
      if (items.length <= PER_PAGE) {
        pagContainer.innerHTML = `
          <div class="text-xs text-[#6b7280]">
            Total <span class="font-bold text-[#111827]">${items.length}</span> produk terdaftar
          </div>
          <div class="text-[11px] text-[#9ca3af]">Halaman 1 dari 1</div>
        `;
      } else {
        const startItem = startIdx + 1;
        const endItem = Math.min(startIdx + PER_PAGE, items.length);

        let pageBtnsHtml = '';
        for (let i = 1; i <= totalPages; i++) {
          if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const active = i === currentPage ? 'bg-[#093180] text-white font-bold border-[#093180]' : 'bg-white text-[#374151] border-[#e5e7eb] hover:bg-gray-100';
            pageBtnsHtml += `<button class="px-3 py-1.5 text-xs border ${active} transition-colors cursor-pointer cat-pg-btn" data-page="${i}">${i}</button>`;
          } else if (i === currentPage - 2 || i === currentPage + 2) {
            pageBtnsHtml += `<span class="px-1 text-gray-400 text-xs select-none">...</span>`;
          }
        }

        pagContainer.innerHTML = `
          <div class="text-xs text-[#6b7280]">
            Menampilkan <span class="font-bold text-[#111827]">${startItem}</span> - <span class="font-bold text-[#111827]">${endItem}</span> dari <span class="font-bold text-[#111827]">${items.length}</span> produk
          </div>
          <div class="flex items-center gap-1.5">
            <button class="cat-pg-prev px-3 py-1.5 text-xs font-semibold bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer" ${currentPage === 1 ? 'disabled' : ''}>
              ← Sebelumnya
            </button>
            <div class="flex items-center gap-1">${pageBtnsHtml}</div>
            <button class="cat-pg-next px-3 py-1.5 text-xs font-semibold bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer" ${currentPage === totalPages ? 'disabled' : ''}>
              Berikutnya →
            </button>
          </div>
        `;

        pagContainer.querySelectorAll('.cat-pg-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            currentPage = parseInt(btn.getAttribute('data-page'), 10);
            renderProducts(currentFiltered);
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        });

        pagContainer.querySelector('.cat-pg-prev')?.addEventListener('click', () => {
          if (currentPage > 1) {
            currentPage--;
            renderProducts(currentFiltered);
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });

        pagContainer.querySelector('.cat-pg-next')?.addEventListener('click', () => {
          if (currentPage < totalPages) {
            currentPage++;
            renderProducts(currentFiltered);
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    }
  };

  // Render featured product for Homepage (index.html)
  const renderHomeFeatured = (items) => {
    if (!homeFeatured) return;
    const featured = items.find(p => p.id === 'vinci-hp-14a') || items[0];
    if (!featured) return;

    homeFeatured.innerHTML = `
      <button id="openHydrantModalBtn" class="group flex flex-col items-center bg-white p-6 max-w-sm w-full focus:outline-none transition-all duration-300 hover:opacity-90 cursor-pointer border border-[#e5e7eb] hover:border-[#093180] shadow-sm hover:shadow-xl">
        <div class="w-full aspect-[3/4] bg-white flex items-center justify-center overflow-hidden mb-6 p-4">
          <img src="${featured.image}" alt="${featured.title}" class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='/images/Fire-Hydrant-Yellow.png'">
        </div>
        <div class="text-center w-full">
          <span class="text-xs font-bold tracking-[0.2em] text-[#093180] uppercase block mb-1">${featured.code}</span>
          <span class="text-[11px] font-bold tracking-wider text-[#111827] uppercase block mb-3 line-clamp-1">${featured.title}</span>
          <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#093180] group-hover:underline">
            <span>Klik untuk Detail Spesifikasi</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </span>
        </div>
      </button>
    `;

    const btn = document.getElementById('openHydrantModalBtn');
    if (btn) {
      btn.addEventListener('click', () => openProductModal(featured));
    }
  };

  const openProductModal = (prod) => {
    if (!modal || !prod) return;

    const codeEl = document.getElementById('modalProductCode');
    const titleEl = document.getElementById('modalProductTitle');
    const brandEl = document.getElementById('modalProductBrand');
    const imgEl = document.getElementById('modalProductImage');
    const descEl = document.getElementById('modalProductDesc');
    const specsEl = document.getElementById('modalProductSpecs');
    const waEl = document.getElementById('modalProductWa');

    if (codeEl) codeEl.textContent = prod.code;
    if (titleEl) titleEl.textContent = prod.title;
    if (brandEl) brandEl.textContent = prod.brand || 'Vinci Firefighting Supplier';
    if (imgEl) {
      imgEl.src = prod.image;
      imgEl.alt = prod.title;
      imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = '/images/Fire-Hydrant-Yellow.png'; };
    }
    if (descEl) descEl.textContent = prod.desc || '';

    if (specsEl) {
      const specsList = Array.isArray(prod.specs) ? prod.specs : [];
      if (specsList.length > 0) {
        specsEl.innerHTML = `
          <div class="border border-[#e5e7eb] divide-y divide-[#e5e7eb] max-h-56 overflow-y-auto bg-white">
            ${specsList.map(s => `
              <div class="flex justify-between items-start gap-3 px-3 py-2 text-xs hover:bg-[#f8fafc] transition-colors">
                <span class="font-bold text-[#111827] shrink-0">${s.key}:</span>
                <span class="text-right text-[#4b5563] font-medium break-words">${s.value}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        specsEl.innerHTML = '<p class="text-xs text-[#9ca3af] py-2 border border-dashed border-[#e5e7eb] text-center">Spesifikasi teknis standar pabrikan dan teruji SNI/NFPA.</p>';
      }
    }

    if (waEl) {
      const msg = encodeURIComponent(`Halo PT INDO TEKNIK EMPATBELAS, saya ingin menanyakan penawaran harga untuk produk ${prod.code} - ${prod.title}.`);
      waEl.href = `https://wa.me/${companyWa}?text=${msg}`;
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  const applyFilters = () => {
    const filtered = products.filter(p => {
      const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
      const matchesSearch = !currentSearch ||
        p.title.toLowerCase().includes(currentSearch) ||
        p.code.toLowerCase().includes(currentSearch) ||
        (p.desc && p.desc.toLowerCase().includes(currentSearch));
      return matchesCategory && matchesSearch;
    });
    currentPage = 1;
    renderProducts(filtered);
  };

  // Build category filter tabs dynamically on catalog.html
  const buildCategoryTabs = (items) => {
    if (!tabsContainer) return;

    const catMap = new Map();
    // Default preset categories
    catMap.set('hydrant', 'Hydrant & Perpipaan');
    catMap.set('alarm', 'Fire Alarm System');
    catMap.set('foam', 'Foam Suppression');
    catMap.set('cleanagent', 'Clean Agent');

    // Add any custom categories present in items
    items.forEach(p => {
      if (p.category && p.category !== 'all' && !catMap.has(p.category)) {
        const std = standardizeCategory(p.category);
        catMap.set(p.category, std.label);
      }
    });

    let html = `
      <button data-category="all" class="catalog-tab px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[#093180] bg-[#093180] text-white transition-all cursor-pointer">
        Semua Produk
      </button>
    `;

    catMap.forEach((label, slug) => {
      html += `
        <button data-category="${slug}" class="catalog-tab px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[#e5e7eb] bg-white text-[#4b5563] hover:border-[#093180] transition-all cursor-pointer">
          ${label}
        </button>
      `;
    });

    tabsContainer.innerHTML = html;

    tabsContainer.querySelectorAll('.catalog-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentCategory = tab.getAttribute('data-category');

        tabsContainer.querySelectorAll('.catalog-tab').forEach(t => {
          t.classList.remove('bg-[#093180]', 'text-white', 'border-[#093180]');
          t.classList.add('bg-white', 'text-[#4b5563]', 'border-[#e5e7eb]', 'hover:border-[#093180]');
        });

        tab.classList.remove('bg-white', 'text-[#4b5563]', 'border-[#e5e7eb]', 'hover:border-[#093180]');
        tab.classList.add('bg-[#093180]', 'text-white', 'border-[#093180]');

        applyFilters();
      });
    });
  };

  // Search input filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  // Load products dynamically
  try {
    products = await getProducts();
    if (grid) {
      buildCategoryTabs(products);
      currentPage = 1;
      renderProducts(products);
    }
    if (homeFeatured) {
      renderHomeFeatured(products);
    }
  } catch (err) {
    console.error('Error initializing products:', err);
  }
}
