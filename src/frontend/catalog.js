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

  // 3D Tilt Parallax & Lightning Spotlight handler (Single Unified 3D Card, Smooth 60fps)
  const bindSpotlightHover = (root) => {
    if (!root) return;
    root.querySelectorAll('.product-card').forEach(card => {
      let rafId = null;

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.08s ease-out, box-shadow 0.25s ease-out, border-color 0.25s ease';
      });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const percentX = Math.max(-1, Math.min(1, (x - centerX) / centerX));
          const percentY = Math.max(-1, Math.min(1, (y - centerY) / centerY));

          const tiltX = (-percentY * 6).toFixed(2);
          const tiltY = (percentX * 6).toFixed(2);

          card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.015, 1.015, 1.015)`;
          card.style.setProperty('--spotlight-x', `${x}px`);
          card.style.setProperty('--spotlight-y', `${y}px`);
        });
      });

      card.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  };

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
      <div class="product-card group relative cursor-pointer flex flex-col justify-between bg-white border border-[#e5e7eb] p-5 sm:p-6 transition-all" data-category="${p.category}" data-id="${p.id}">
        <div>
          <!-- Seamless Product Showcase (No inner card border, no nested box) -->
          <div class="skeleton-loader relative aspect-[4/3] w-full flex items-center justify-center p-3 mb-4 overflow-hidden bg-white">
            <img src="${p.image}" alt="${p.title}" class="img-lazy max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" decoding="async" onload="this.classList.add('loaded'); this.parentElement?.classList.add('is-loaded');" onerror="this.onerror=null; this.src='/images/Fire-Hydrant-Yellow.png'; this.classList.add('loaded'); this.parentElement?.classList.add('is-loaded');">
            <div class="gallery-spotlight-glow absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"></div>
          </div>

          <!-- Product Typography Details -->
          <div class="pb-2">
            <h3 class="product-card-title text-sm sm:text-base font-extrabold text-[#111827] group-hover:text-[#093180] tracking-tight transition-colors line-clamp-2 leading-snug">
              ${p.title}
            </h3>
            <p class="product-card-desc text-xs text-[#4b5563] leading-relaxed line-clamp-2 mt-1.5">
              ${p.desc || ''}
            </p>
          </div>
        </div>

        <!-- Footer Specs / Brand Bar -->
        <div class="pt-4 border-t border-[#e5e7eb] flex items-center justify-between mt-3">
          <span class="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            ${p.brand || 'VINCI FIREFIGHTING SUPPLIER'}
          </span>
          <span class="btn-outline text-xs py-1.5 px-3 pointer-events-none">
            <span>Buka Rincian</span>
            <svg class="btn-arrow w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    `).join('');

    bindSpotlightHover(grid);

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

  // Render top 4 featured products for Homepage (index.html) in responsive 4-column grid
  const renderHomeFeatured = (items) => {
    if (!homeFeatured || !items || items.length === 0) return;

    // Select 4 priority featured products, or first 4 available products
    const preferredIds = ['vinci-hp-14a', 'vinci-box-b', 'vinci-sc-s7a', 'vinci-hr-01', 'vinci-box-a1', 'vinci-box-c'];
    const featuredList = [];

    for (const pid of preferredIds) {
      const match = items.find(p => p.id === pid);
      if (match && !featuredList.some(p => p.id === match.id)) {
        featuredList.push(match);
      }
      if (featuredList.length >= 4) break;
    }

    for (const item of items) {
      if (featuredList.length >= 4) break;
      if (!featuredList.some(p => p.id === item.id)) {
        featuredList.push(item);
      }
    }

    homeFeatured.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8';
    homeFeatured.innerHTML = featuredList.map(p => `
      <div class="product-card group relative cursor-pointer flex flex-col justify-between bg-white border border-[#e5e7eb] p-5 sm:p-6 transition-all" data-category="${p.category || 'hydrant'}" data-id="${p.id}">
        <div>
          <!-- Seamless Product Showcase (No inner card border, no nested box) -->
          <div class="skeleton-loader relative aspect-[4/3] w-full flex items-center justify-center p-3 mb-4 overflow-hidden bg-white">
            <img src="${p.image}" alt="${p.title}" class="img-lazy max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" decoding="async" onload="this.classList.add('loaded'); this.parentElement?.classList.add('is-loaded');" onerror="this.onerror=null; this.src='/images/Fire-Hydrant-Yellow.png'; this.classList.add('loaded'); this.parentElement?.classList.add('is-loaded');">
            <div class="gallery-spotlight-glow absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"></div>
          </div>

          <!-- Product Typography Details -->
          <div class="pb-2">
            <h3 class="product-card-title text-sm sm:text-base font-extrabold text-[#111827] group-hover:text-[#093180] tracking-tight transition-colors line-clamp-2 leading-snug">
              ${p.title}
            </h3>
            <p class="product-card-desc text-xs text-[#4b5563] leading-relaxed line-clamp-2 mt-1.5">
              ${p.desc || ''}
            </p>
          </div>
        </div>

        <!-- Footer Specs / Brand Bar -->
        <div class="pt-4 border-t border-[#e5e7eb] flex items-center justify-between mt-3">
          <span class="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            ${p.brand || 'VINCI FIREFIGHTING SUPPLIER'}
          </span>
          <span class="btn-outline text-xs py-1.5 px-3 pointer-events-none">
            <span>Buka Rincian</span>
            <svg class="btn-arrow w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    `).join('');

    bindSpotlightHover(homeFeatured);

    homeFeatured.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const prod = items.find(p => p.id === id);
        if (prod) openProductModal(prod);
      });
    });
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
      <button data-category="all" class="catalog-tab active px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[#093180] bg-[#093180] text-white transition-all cursor-pointer">
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
          t.classList.remove('active', 'bg-[#093180]', 'text-white', 'border-[#093180]');
          t.classList.add('bg-white', 'text-[#4b5563]', 'border-[#e5e7eb]');
        });

        tab.classList.remove('bg-white', 'text-[#4b5563]', 'border-[#e5e7eb]');
        tab.classList.add('active', 'bg-[#093180]', 'text-white', 'border-[#093180]');

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

  // Pre-bind static cards in homeFeatured if present
  if (homeFeatured) {
    bindSpotlightHover(homeFeatured);
    homeFeatured.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const prod = products.find(p => p.id === id);
        if (prod) openProductModal(prod);
      });
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
