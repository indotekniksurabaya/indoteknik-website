export function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-md';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-[#10b981] text-white',
    warning: 'bg-[#ffc107] text-[#111827]',
    error: 'bg-[#ef4444] text-white',
    info: 'bg-[#093180] text-white'
  };

  toast.className = `${bgColors[type] || bgColors.info} p-4 border border-black/10 shadow-lg text-sm font-medium flex items-center justify-between gap-3 transition-all duration-300 transform translate-y-4 opacity-0`;
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${type === 'success' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'}
      </svg>
      <span>${message}</span>
    </div>
    <button class="text-current hover:opacity-75 focus:outline-none" onclick="this.parentElement.remove()">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}
