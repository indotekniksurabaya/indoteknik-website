import { showToast } from './toast.js';

export function initContactForm() {
  const form = document.getElementById('rfqContactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    const name = document.getElementById('contactName')?.value.trim() || '';
    const company = document.getElementById('contactCompany')?.value.trim() || '';
    const phone = document.getElementById('contactPhone')?.value.trim() || '';
    const service = document.getElementById('contactService')?.value || '';
    const message = document.getElementById('contactMessage')?.value.trim() || '';

    if (!name || !phone || !message) {
      showToast('Harap lengkapi nama, kontak telepon, dan rincian pesan', 'warning');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg> Mengirim Permintaan...
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      form.reset();

      showToast('Terima kasih! Permintaan penawaran Anda telah kami terima.', 'success');

      const waConfirm = confirm('Permintaan tercatat! Apakah Anda ingin meneruskan rincian proyek ini langsung ke Senior Engineer kami via WhatsApp?');
      if (waConfirm) {
        const text = encodeURIComponent(
          `Halo PT INDO TEKNIK EMPATBELAS,\nSaya telah mengajukan form penawaran di website:\n\n` +
          `• Nama: ${name}\n` +
          `• Perusahaan: ${company || '-'}\n` +
          `• Telepon: ${phone}\n` +
          `• Layanan: ${service}\n` +
          `• Rincian Proyek: ${message}\n\n` +
          `Mohon informasi lebih lanjut.`
        );
        window.open(`https://wa.me/6281390630360?text=${text}`, '_blank');
      }
    }, 1200);
  });
}
