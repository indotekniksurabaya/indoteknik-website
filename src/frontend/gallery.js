// Frontend Dynamic Gallery Controller
import { getGallery, standardizeCategory } from '../lib/supabase.js';

export async function initGallery() {
  const grid = document.getElementById('galleryGrid');
  const pagContainer = document.getElementById('galleryPagination');
  const homeGrid = document.getElementById('homeGalleryGrid');
  const modal = document.getElementById('galleryModal');
  const modalImg = document.getElementById('galleryModalImg');
  const modalTitle = document.getElementById('galleryModalTitle');
  const modalDesc = document.getElementById('galleryModalDesc');
  const closeBtn = document.getElementById('closeGalleryModalBtn');
  const filterContainer = document.getElementById('galleryFilterContainer') || document.querySelector('.gallery-filter-btn')?.parentElement;

  let galleryItems = [];
  let currentFiltered = [];
  let currentPage = 1;
  const PER_PAGE = 6;

  const openModal = (item) => {
    if (!modal) return;
    if (modalImg) modalImg.src = item.image_url;
    if (modalTitle) modalTitle.textContent = item.title;
    if (modalDesc) modalDesc.textContent = item.description || '';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    if (modalImg) modalImg.src = '';
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

  const renderGallery = (items) => {
    if (!grid) return;
    currentFiltered = items;

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center border border-dashed border-[#e5e7eb] p-8">
          <p class="text-sm font-semibold text-[#4b5563]">Belum ada dokumentasi untuk kategori ini.</p>
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

    grid.innerHTML = pageItems.map(item => `
      <div class="gallery-item group bg-white border border-[#e5e7eb] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300" data-category="${item.category}" data-id="${item.id}">
        <div class="relative overflow-hidden aspect-[4/3] bg-gray-100">
          <img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" onerror="this.src='images/Fire-Hydrant-Yellow.png'">
          <div class="absolute top-3 left-3">
            <span class="px-2.5 py-0.5 bg-[#093180] text-white text-[10px] font-bold uppercase tracking-wider shadow">
              ${item.category_label || item.category}
            </span>
          </div>
        </div>
        <div class="p-5 border-t border-[#e5e7eb]">
          <h3 class="gallery-card-title text-base font-bold text-[#111827] group-hover:text-[#093180] transition-colors mb-1.5 line-clamp-1">
            ${item.title}
          </h3>
          <p class="gallery-card-desc text-xs text-[#4b5563] leading-relaxed line-clamp-2">
            ${item.description || ''}
          </p>
          <div class="mt-4 pt-3 border-t border-[#f3f4f6] flex items-center justify-between text-[11px] font-bold text-[#093180] uppercase tracking-wider">
            <span>Perbesar Dokumentasi</span>
            <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.gallery-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const item = galleryItems.find(g => g.id === id);
        if (item) openModal(item);
      });
    });

    // Pagination controls
    if (pagContainer) {
      if (items.length <= PER_PAGE) {
        pagContainer.innerHTML = `
          <div class="text-xs text-[#6b7280]">
            Total <span class="font-bold text-[#111827]">${items.length}</span> dokumentasi
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
            pageBtnsHtml += `<button class="px-3 py-1.5 text-xs border ${active} transition-colors cursor-pointer gal-pg-btn" data-page="${i}">${i}</button>`;
          } else if (i === currentPage - 2 || i === currentPage + 2) {
            pageBtnsHtml += `<span class="px-1 text-gray-400 text-xs select-none">...</span>`;
          }
        }

        pagContainer.innerHTML = `
          <div class="text-xs text-[#6b7280]">
            Menampilkan <span class="font-bold text-[#111827]">${startItem}</span> - <span class="font-bold text-[#111827]">${endItem}</span> dari <span class="font-bold text-[#111827]">${items.length}</span> dokumentasi
          </div>
          <div class="flex items-center gap-1.5">
            <button class="gal-pg-prev px-3 py-1.5 text-xs font-semibold bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer" ${currentPage === 1 ? 'disabled' : ''}>
              ← Sebelumnya
            </button>
            <div class="flex items-center gap-1">${pageBtnsHtml}</div>
            <button class="gal-pg-next px-3 py-1.5 text-xs font-semibold bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer" ${currentPage === totalPages ? 'disabled' : ''}>
              Berikutnya →
            </button>
          </div>
        `;

        pagContainer.querySelectorAll('.gal-pg-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            currentPage = parseInt(btn.getAttribute('data-page'), 10);
            renderGallery(currentFiltered);
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        });

        pagContainer.querySelector('.gal-pg-prev')?.addEventListener('click', () => {
          if (currentPage > 1) {
            currentPage--;
            renderGallery(currentFiltered);
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });

        pagContainer.querySelector('.gal-pg-next')?.addEventListener('click', () => {
          if (currentPage < totalPages) {
            currentPage++;
            renderGallery(currentFiltered);
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    }
  };

  // Render top 4 items for Homepage
  const renderHomeGallery = (items) => {
    if (!homeGrid) return;
    const topItems = items.slice(0, 4);

    homeGrid.innerHTML = topItems.map(item => `
      <a href="gallery.html" class="group bg-white border border-[#e5e7eb] overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
        <div class="aspect-[4/3] overflow-hidden bg-gray-100 relative">
          <img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" onerror="this.src='images/Fire-Hydrant-Yellow.png'">
          <div class="absolute top-2 left-2">
            <span class="px-2 py-0.5 bg-[#093180] text-white text-[9px] font-bold uppercase tracking-wider">
              ${item.category_label || item.category}
            </span>
          </div>
        </div>
        <div class="p-4 border-t border-[#e5e7eb] flex-1 flex flex-col justify-between">
          <div>
            <span class="text-[10px] font-bold text-[#093180] uppercase tracking-wider block mb-1">
              ${item.category_label || 'Dokumentasi'}
            </span>
            <h3 class="text-xs font-bold text-[#111827] group-hover:text-[#093180] line-clamp-2 transition-colors">
              ${item.title}
            </h3>
          </div>
          <div class="mt-3 pt-2 border-t border-[#f3f4f6] flex items-center justify-between text-[10px] text-[#093180] font-semibold">
            <span>Lihat Foto</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </div>
        </div>
      </a>
    `).join('');
  };

  // Build category filter buttons dynamically on gallery.html
  const buildCategoryTabs = (items) => {
    if (!filterContainer) return;

    const catMap = new Map();
    // Default categories
    catMap.set('hydrant', 'HYDRANT & PLAMBING');
    catMap.set('pump', 'FIRE PUMP & MESIN');
    catMap.set('pipa', 'PERPIPAAN & FABRIKASI');
    catMap.set('team', 'COMMISSIONING & TIM');

    // Add any custom categories present in items
    items.forEach(item => {
      if (item.category && item.category !== 'all' && !catMap.has(item.category)) {
        const std = standardizeCategory(item.category);
        catMap.set(item.category, (item.category_label || std.label).toUpperCase());
      }
    });

    let html = `
      <button class="gallery-filter-btn px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#093180] text-white transition-colors cursor-pointer" data-filter="all">
        SEMUA DOKUMENTASI
      </button>
    `;

    catMap.forEach((label, slug) => {
      html += `
        <button class="gallery-filter-btn px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white text-[#111827] border border-[#e5e7eb] hover:bg-[#e6ecf5] hover:text-[#093180] transition-colors cursor-pointer" data-filter="${slug}">
          ${label}
        </button>
      `;
    });

    filterContainer.innerHTML = html;

    filterContainer.querySelectorAll('.gallery-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        filterContainer.querySelectorAll('.gallery-filter-btn').forEach(b => {
          b.classList.remove('bg-[#093180]', 'text-white');
          b.classList.add('bg-white', 'text-[#111827]');
        });
        btn.classList.remove('bg-white', 'text-[#111827]');
        btn.classList.add('bg-[#093180]', 'text-white');

        currentPage = 1;
        if (filter === 'all') {
          renderGallery(galleryItems);
        } else {
          const filtered = galleryItems.filter(item => item.category === filter);
          renderGallery(filtered);
        }
      });
    });
  };

  // Load gallery items
  try {
    galleryItems = await getGallery();
    if (grid) {
      buildCategoryTabs(galleryItems);
      currentPage = 1;
      renderGallery(galleryItems);
    }
    if (homeGrid) {
      renderHomeGallery(galleryItems);
    }
  } catch (err) {
    console.error('Error loading gallery:', err);
  }
}
