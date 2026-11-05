// Frontend Dynamic Company Profile & Contact Hydration
import { getCompanyProfile } from '../lib/supabase.js';

export async function initAbout() {
  try {
    const profile = await getCompanyProfile();
    if (!profile) return;

    const phone = profile.phone || '+62 813-9063-0360';
    const email = profile.email || 'indoteknikempatbelas@gmail.com';
    const address = profile.address || 'Dusun Pekojo, RT 02/RW 02, Desa Tunggalpager, Kec. Pungging, Kab. Mojokerto, Jawa Timur 61384';
    const companyName = profile.company_name || 'PT INDO TEKNIK EMPATBELAS';
    const tagline = profile.tagline || 'Fire Protection & Mechanical Electrical';

    // Format clean WhatsApp number (e.g., 0856... -> 62856...)
    const rawWa = profile.phone || profile.whatsapp || '6281390630360';
    let cleanWa = rawWa.replace(/[^0-9]/g, '');
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.slice(1);
    } else if (!cleanWa.startsWith('62')) {
      cleanWa = '62' + cleanWa;
    }

    // 1. Hydrate all company phone elements
    document.querySelectorAll('[data-company-phone]').forEach(el => {
      el.textContent = phone;
      if (el.tagName === 'A') {
        const telNumber = phone.replace(/[^0-9+]/g, '');
        el.href = `tel:${telNumber}`;
      }
    });

    // 2. Hydrate all company WhatsApp links
    document.querySelectorAll('[data-company-wa]').forEach(el => {
      if (el.tagName === 'A') {
        const currentHref = el.getAttribute('href') || '';
        let textQuery = '';
        if (currentHref.includes('text=')) {
          try {
            const parsed = new URL(currentHref, 'https://wa.me');
            textQuery = parsed.searchParams.get('text') || '';
          } catch (_) {
            const match = currentHref.match(/[?&]text=([^&]+)/);
            if (match) textQuery = decodeURIComponent(match[1]);
          }
        }
        el.href = textQuery 
          ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(textQuery)}`
          : `https://wa.me/${cleanWa}`;
      }
    });

    // 3. Hydrate all company WhatsApp text labels
    document.querySelectorAll('[data-company-wa-text]').forEach(el => {
      el.textContent = phone;
    });

    // 4. Hydrate all company email elements
    document.querySelectorAll('[data-company-email]').forEach(el => {
      el.textContent = email;
      if (el.tagName === 'A') {
        el.href = `mailto:${email}`;
      }
    });

    // 5. Hydrate all company address elements
    document.querySelectorAll('[data-company-address]').forEach(el => {
      el.textContent = address;
    });

    // 6. Hydrate all company name & tagline elements
    document.querySelectorAll('[data-company-name]').forEach(el => {
      el.textContent = companyName;
    });

    document.querySelectorAll('[data-company-tagline]').forEach(el => {
      el.textContent = tagline;
    });

    // 7. About page specific fields
    const aboutTitleEl = document.getElementById('aboutPageTitle');
    if (aboutTitleEl && profile.about_title) {
      aboutTitleEl.textContent = profile.about_title;
    }

    const aboutDescEl = document.getElementById('aboutPageDesc');
    if (aboutDescEl && profile.about_desc) {
      aboutDescEl.textContent = profile.about_desc;
    }

    const visionEl = document.getElementById('aboutVisionText');
    if (visionEl && profile.vision) {
      visionEl.textContent = profile.vision;
    }

    const missionListEl = document.getElementById('aboutMissionList');
    if (missionListEl && Array.isArray(profile.mission) && profile.mission.length > 0) {
      missionListEl.innerHTML = profile.mission.map(m => `
        <div class="flex items-start gap-2.5 text-xs text-[#4b5563]">
          <span class="w-1.5 h-1.5 bg-[#093180] mt-1.5 shrink-0"></span>
          <span>${m}</span>
        </div>
      `).join('');
    }

    // Stats
    const stats = profile.stats || {};
    const expEl = document.getElementById('companyStatExp');
    const projEl = document.getElementById('companyStatProj');
    const stdEl = document.getElementById('companyStatStd');
    const engEl = document.getElementById('companyStatEng');

    if (expEl && stats.experience_years) expEl.textContent = stats.experience_years;
    if (projEl && stats.projects_completed) projEl.textContent = stats.projects_completed;
    if (stdEl && stats.standards) stdEl.textContent = stats.standards;
    if (engEl && stats.expert_engineers) engEl.textContent = stats.expert_engineers;

  } catch (err) {
    console.debug('Company profile hydration:', err);
  }
}
