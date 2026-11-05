// Frontend Modal Dialogs
import { showToast } from './toast.js';

export function initModal() {
  const modal = document.getElementById('consultationModal');
  const openBtns = document.querySelectorAll('.open-modal-btn');
  const closeBtns = document.querySelectorAll('.close-modal-btn');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModalHandler = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  closeBtns.forEach(btn => btn.addEventListener('click', closeModalHandler));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModalHandler();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModalHandler();
    }
  });

  const modalForm = document.getElementById('modalConsultationForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Data konsultasi diterima! Tim engineer kami akan menghubungi dalam waktu maksimal 2 jam kerja.', 'success');
      closeModalHandler();
      modalForm.reset();
    });
  }
}
