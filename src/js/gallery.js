export function initGallery() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const items = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('galleryModal');
  const modalImg = document.getElementById('galleryModalImg');
  const modalTitle = document.getElementById('galleryModalTitle');
  const modalDesc = document.getElementById('galleryModalDesc');
  const closeBtn = document.getElementById('closeGalleryModalBtn');

  if (filterBtns.length > 0 && items.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-[#093180]', 'text-white');
          b.classList.add('bg-white', 'text-[#111827]');
        });
        btn.classList.remove('bg-white', 'text-[#111827]');
        btn.classList.add('bg-[#093180]', 'text-white');

        const filter = btn.getAttribute('data-filter');

        items.forEach(item => {
          const category = item.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  if (modal && modalImg) {
    items.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-card-title');
        const desc = item.querySelector('.gallery-card-desc');

        if (img) modalImg.src = img.src;
        if (title && modalTitle) modalTitle.textContent = title.textContent;
        if (desc && modalDesc) modalDesc.textContent = desc.textContent;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      modal.classList.add('hidden');
      modalImg.src = '';
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }
}
