export function initFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.portfolio-item');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-[#093180]', 'text-white');
        b.classList.add('bg-white', 'text-[#111827]', 'border-[#e5e7eb]');
      });
      btn.classList.add('bg-[#093180]', 'text-white');
      btn.classList.remove('bg-white', 'text-[#111827]', 'border-[#e5e7eb]');

      const filterValue = btn.getAttribute('data-filter');

      projectItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category') || '';
        if (filterValue === 'all' || itemCategory.includes(filterValue)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}
