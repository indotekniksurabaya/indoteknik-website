// Frontend Dynamic Catalog Controller
import { getProducts } from '../lib/supabase.js';

export async function initKatalog() {
  const grid = document.getElementById('catalogGrid');
  const modal = document.getElementById('hydrantDetailModal');
  const closeBtn = document.getElementById('closeHydrantModalBtn');
  const tabs = document.querySelectorAll('.catalog-tab');
  const searchInput = document.getElementById('catalogSearchInput');

  let products = [];

  // Function to render product cards into grid
  const renderProducts = (items) => {
    if (!grid) return;

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center border border-dashed border-[#e5e7eb] p-8">
          <p class="text-sm font-semibold text-[#4b5563]">Tidak ada produk yang sesuai dengan kategori atau pencarian.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(prod => `
      <button data-product-id="${prod.id}" data-category="${prod.category}" class="catalog-card group flex flex-col bg-white p-4 sm:p-5 border border-[#e5e7eb] hover:border-[#093180] hover:shadow-lg transition-all duration-300 focus:outline-none cursor-pointer text-left">
        <div class="w-full aspect-square bg-white flex items-center justify-center overflow-hidden mb-4 p-2">
          <img src="${prod.image}" alt="${prod.title}" class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" onerror="this.src='images/Fire-Hydrant-Yellow.png'">
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
      waEl.href = `https://wa.me/6281390630360?text=${msg}`;
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
      renderProducts(products);
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
