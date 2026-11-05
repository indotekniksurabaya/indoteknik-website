// Frontend Dynamic Catalog Controller
import { getCompanyProfile, getProducts } from '../lib/supabase.js';

export async function initKatalog() {
  const grid = document.getElementById('catalogGrid');
  const pagContainer = document.getElementById('catalogPagination');
  const homeFeatured = document.getElementById('homeFeaturedContainer');
  const modal = document.getElementById('hydrantDetailModal');
  const closeBtn = document.getElementById('closeHydrantModalBtn');
  const tabs = document.querySelectorAll('.catalog-tab');
  const searchInput = document.getElementById('catalogSearchInput');

  let products = [];
  let companyWa = '6281390630360';

  let currentPage = 1;
  const PER_PAGE = 12;
  let currentFiltered = [];

  // Get active WhatsApp number from company profile
  try {
    const profile = await getCompanyProfile();
    if (profile) {
      const raw = profile.phone || profile.whatsapp || '6281390630360';
      let clean = raw.replace(/[^0-9]/g, '');
      if (clean.startsWith('0')) clean = '62' + clean.slice(1);
      else if (!clean.startsWith('62')) clean = '62' + clean;
      companyWa = clean;
    }
  } catch (_) {}

  // Function to render product cards with pagination (for catalog.html)
  const renderProducts = (items) => {
    if (!grid) return;
    currentFiltered = items;

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center border border-dashed border-[#e5e7eb] p-8">
          <p class="text-sm font-semibold text-[#4b5563]">Tidak ada produk yang sesuai dengan kategori atau pencarian.</p>
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

    grid.innerHTML = pageItems.map(prod => `
      <button data-product-id="${prod.id}" data-category="${prod.category}" class="catalog-card group flex flex-col bg-white p-4 sm:p-5 border border-[#e5e7eb] hover:border-[#093180] hover:shadow-lg transition-all duration-300 focus:outline-none cursor-pointer text-left">
        <div class="w-full aspect-square bg-white flex items-center justify-center overflow-hidden mb-4 p-2">
          <img src="${prod.image}" alt="${prod.title}" class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" onerror="this.src='images/Fire-Hydrant-Yellow.png'">
        </div>
        <span class="text-[10px] font-bold tracking-widest text-[#093180] uppercase block mb-1">${prod.code}</span>
        <h3 class="text-xs sm:text-sm font-bold text-[#111827] uppercase tracking-tight line-clamp-2 mb-3 group-hover:text-[#093180] transition-colors">
          ${prod.title}
        </h3>
        <div class="mt-auto w-full pt-2 border-t border-[#f3f4f6] flex items-center justify-between text-[10px] text-[#6b7280] uppercase font-semibold">
          <span>Lihat Detail</span>
          <svg class="w-3.5 h-3.5 text-[#093180] transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </div>
      </button>
    `).join('');

    // Re-attach card click events
    grid.querySelectorAll('.catalog-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-product-id');
        const prod = products.find(p => p.id === id);
        if (prod) openProductModal(prod);
      });
    });

    // Render pagination controls
    if (pagContainer) {
      if (items.length <= PER_PAGE) {
        pagContainer.innerHTML = `
          <div class="text-xs text-[#6b7280]">
            Total <span class="font-bold text-[#111827]">${items.length}</span> produk
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
      <button id="openHydrantModalBtn" class="scroll-reveal group flex flex-col items-center bg-white p-6 max-w-sm w-full focus:outline-none transition-all duration-300 hover:opacity-90 cursor-pointer border border-[#e5e7eb] hover:border-[#093180] shadow-sm hover:shadow-xl">
        <div class="w-full aspect-[3/4] bg-white flex items-center justify-center overflow-hidden mb-6 p-4">
          <img src="${featured.image}" alt="${featured.title}" class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" onerror="this.src='images/Fire-Hydrant-Yellow.png'">
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
      imgEl.onerror = () => { imgEl.src = 'images/Fire-Hydrant-Yellow.png'; };
    }
    if (descEl) descEl.textContent = prod.desc || '';

    if (specsEl) {
      const specsList = Array.isArray(prod.specs) ? prod.specs : [];
      if (specsList.length > 0) {
        specsEl.innerHTML = specsList.map(s => `
          <div class="flex justify-between items-start gap-4 py-1.5 border-b border-[#f3f4f6]">
            <span class="font-bold text-[#111827] shrink-0 text-xs">${s.key}:</span>
            <span class="text-right text-[#4b5563] text-xs">${s.value}</span>
          </div>
        `).join('');
      } else {
        specsEl.innerHTML = '<p class="text-xs text-[#9ca3af]">Spesifikasi standar pabrik.</p>';
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

  // Load products dynamically
  try {
    products = await getProducts();
    if (grid) {
      currentPage = 1;
      renderProducts(products);
    }
    if (homeFeatured) {
      renderHomeFeatured(products);
    }
  } catch (err) {
    console.error('Error initializing products:', err);
  }

  // Active filter state
  let currentCategory = 'all';
  let currentSearch = '';

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

  // Tabs filtering
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentCategory = tab.getAttribute('data-category');

      tabs.forEach(t => {
        t.classList.remove('bg-[#093180]', 'text-white', 'border-[#093180]');
        t.classList.add('bg-white', 'text-[#4b5563]', 'border-[#e5e7eb]', 'hover:border-[#093180]');
      });

      tab.classList.remove('bg-white', 'text-[#4b5563]', 'border-[#e5e7eb]', 'hover:border-[#093180]');
      tab.classList.add('bg-[#093180]', 'text-white', 'border-[#093180]');

      applyFilters();
    });
  });

  // Search input filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }
}
