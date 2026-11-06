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
    const service = document.getElementById('contactService')?.value || 'Instalasi Fire Hydrant & Plambing';
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
      // 1. Simpan ke database Supabase & Local Cache
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

      // 2. Dapatkan nomor WhatsApp perusahaan dari Supabase
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

      // 3. Tampilkan Pop-Up Modal Konfirmasi Khusus (Bukan dialog bawaan browser)
      setTimeout(() => {
        openRfqSuccessModal({
          name,
          company,
          phone,
          service,
          message,
          companyWa
        });
      }, 250);

    } catch (err) {
      console.error('Submit error:', err);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      showToast('Gagal mengirim formulir, silakan coba lagi atau kontak WhatsApp langsung.', 'error');
    }
  });
}

function openRfqSuccessModal({ name, company, phone, service, message, companyWa }) {
  let modal = document.getElementById('rfqSuccessCustomModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'rfqSuccessCustomModal';
    modal.className = 'fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-4 transition-all duration-300';
    document.body.appendChild(modal);
  }

  const text = encodeURIComponent(
    `Halo PT INDO TEKNIK EMPATBELAS,\nSaya telah mengajukan form penawaran di website:\n\n` +
    `• Nama: ${name}\n` +
    `• Perusahaan: ${company || '-'}\n` +
    `• Telepon: ${phone}\n` +
    `• Layanan: ${service}\n` +
    `• Rincian Proyek: ${message}\n\n` +
    `Mohon informasi lebih lanjut.`
  );
  const waUrl = `https://wa.me/${companyWa}?text=${text}`;

  modal.innerHTML = `
    <div class="relative bg-white border-2 border-[#093180] max-w-md w-full shadow-2xl p-6 sm:p-7 flex flex-col justify-between transform transition-all duration-300">
      
      <!-- Header -->
      <div class="flex items-start justify-between pb-4 border-b border-[#e5e7eb] mb-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-[#093180] flex items-center justify-center text-[#ffc107] font-bold text-lg shrink-0">
            <svg class="w-5 h-5 text-[#ffc107]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div>
            <span class="text-[10px] font-bold tracking-widest text-[#093180] uppercase block">Permintaan Terkirim</span>
            <h3 class="text-sm sm:text-base font-extrabold text-[#111827] uppercase tracking-tight">Formulir Berhasil Dicatat</h3>
          </div>
        </div>
        <button id="closeRfqModalBtnX" aria-label="Tutup" class="text-gray-400 hover:text-[#111827] p-1 transition-colors cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Body Message -->
      <div class="mb-6 space-y-3">
        <p class="text-xs text-[#4b5563] leading-relaxed">
          Terima kasih <strong class="text-[#111827]">${name}</strong>. Permintaan penawaran Anda telah tersimpan di portal sistem kami.
        </p>
        <div class="bg-[#f3f4f6] p-3.5 border border-[#e5e7eb] text-xs text-[#374151]">
          <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#e5e7eb]">
            <span class="text-[10px] uppercase font-bold text-[#6b7280]">Kebutuhan Layanan:</span>
            <span class="font-bold text-[#093180] text-right">${service}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase font-bold text-[#6b7280]">Nomor Kontak:</span>
            <span class="font-semibold text-[#111827]">${phone}</span>
          </div>
        </div>
        <p class="text-xs text-[#4b5563] leading-relaxed">
          Untuk mendapatkan respons cepat, Anda dapat langsung meneruskan rincian kebutuhan proyek ke WhatsApp Senior Engineer kami sekarang.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 pt-2 border-t border-[#f3f4f6]">
        <a id="btnRfqDirectWa" href="${waUrl}" target="_blank" class="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#1faa53] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer text-center">
          <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
          <span>Lanjut ke WhatsApp</span>
        </a>
        <button id="closeRfqModalBtn" class="py-3 px-5 bg-white border border-[#e5e7eb] hover:border-[#093180] text-[#111827] hover:text-[#093180] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer">
          <span>Tutup</span>
        </button>
      </div>

    </div>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  const closeBtn = document.getElementById('closeRfqModalBtn');
  const closeBtnX = document.getElementById('closeRfqModalBtnX');
  const waBtn = document.getElementById('btnRfqDirectWa');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeBtnX) closeBtnX.addEventListener('click', closeModal);
  if (waBtn) waBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const onEsc = (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
      document.removeEventListener('keydown', onEsc);
    }
  };
  document.addEventListener('keydown', onEsc);
}
