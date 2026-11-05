// Frontend RFQ Contact Form Handler
import { getCompanyProfile, submitInquiry } from '../lib/supabase.js';
import { showToast } from './toast.js';

export function initContactForm() {
  const form = document.getElementById('rfqContactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    const name = document.getElementById('contactName')?.value.trim() || '';
    const company = document.getElementById('contactCompany')?.value.trim() || '';
    const phone = document.getElementById('contactPhone')?.value.trim() || '';
    const service = document.getElementById('contactService')?.value || '';
    const message = document.getElementById('contactMessage')?.value.trim() || '';

    if (!name || !phone || !message) {
      showToast('Harap lengkapi nama, kontak telepon, dan rincian pesan proyek', 'warning');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg> Mengirim Permintaan...
    `;

    try {
      // 1. Simpan ke database Supabase
      await submitInquiry({
        name,
        company,
        phone,
        service,
        message
      });

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      form.reset();

      showToast('Terima kasih! Permintaan penawaran Anda telah tersimpan di sistem.', 'success');

      // 2. Opsi forward ke WhatsApp engineer
      setTimeout(async () => {
        const waConfirm = confirm('Permintaan berhasil dicatat! Teruskan rincian proyek langsung ke WhatsApp Senior Engineer kami sekarang?');
        if (waConfirm) {
          let companyWa = '6281390630360';
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

          const text = encodeURIComponent(
            `Halo PT INDO TEKNIK EMPATBELAS,\nSaya telah mengajukan form penawaran di website:\n\n` +
            `• Nama: ${name}\n` +
            `• Perusahaan: ${company || '-'}\n` +
            `• Telepon: ${phone}\n` +
            `• Layanan: ${service}\n` +
            `• Rincian Proyek: ${message}\n\n` +
            `Mohon informasi lebih lanjut.`
          );
          window.open(`https://wa.me/${companyWa}?text=${text}`, '_blank');
        }
      }, 300);

    } catch (err) {
      console.error('Submit error:', err);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      showToast('Gagal mengirim formulir, silakan coba lagi atau kontak WhatsApp langsung.', 'error');
    }
  });
}
