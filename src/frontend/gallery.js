// Frontend Dynamic Gallery Controller
import { getGallery } from '../lib/supabase.js';

export async function initGallery() {
  const grid = document.getElementById('galleryGrid');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const modal = document.getElementById('galleryModal');
  const modalImg = document.getElementById('galleryModalImg');
  const modalTitle = document.getElementById('galleryModalTitle');
  const modalDesc = document.getElementById('galleryModalDesc');
  const closeBtn = document.getElementById('closeGalleryModalBtn');

  let galleryItems = [];

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

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center border border-dashed border-[#e5e7eb] p-8">
          <p class="text-sm font-semibold text-[#4b5563]">Belum ada dokumentasi untuk kategori ini.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(item => `
      <div class="gallery-item group bg-white border border-[#e5e7eb] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300" data-category="${item.category}" data-id="${item.id}">
        <div class="relative overflow-hidden aspect-[4/3] bg-gray-100">
          <img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onerror="this.src='images/Fire-Hydrant-Yellow.png'">
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
  };

  // Load gallery items
  try {
    galleryItems = await getGallery();
    if (grid) {
      renderGallery(galleryItems);
    }
  } catch (err) {
    console.error('Error loading gallery:', err);
  }

  // Filter buttons logic
  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-[#093180]', 'text-white');
          b.classList.add('bg-white', 'text-[#111827]');
        });
        btn.classList.remove('bg-white', 'text-[#111827]');
        btn.classList.add('bg-[#093180]', 'text-white');

        const filter = btn.getAttribute('data-filter');
        const filtered = filter === 'all' ? galleryItems : galleryItems.filter(item => item.category === filter);
        renderGallery(filtered);
      });
    });
  }
}
