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

    const stats = profile.stats || {};

    // 7. About page specific fields (about.html)
    const aboutTitleEl = document.getElementById('aboutPageTitle');
    if (aboutTitleEl && profile.about_title) {
      aboutTitleEl.textContent = profile.about_title;
    }

    const aboutDescEl = document.getElementById('aboutPageDesc');
    if (aboutDescEl && profile.about_desc) {
      aboutDescEl.textContent = profile.about_desc;
    }

    // Card 1: Profil & Visi
    const visionTitleEl = document.getElementById('aboutVisionTitle');
    if (visionTitleEl && stats.vision_title) {
      visionTitleEl.textContent = stats.vision_title;
    }

    const visionEl = document.getElementById('aboutVisionText');
    if (visionEl && profile.vision) {
      visionEl.textContent = profile.vision;
    }

    const missionListEl = document.getElementById('aboutMissionList');
    if (missionListEl && Array.isArray(profile.mission) && profile.mission.length > 0) {
      missionListEl.innerHTML = profile.mission.map(m => `
        <div class="flex items-start gap-2 text-xs text-[#4b5563]">
          <span class="w-1.5 h-1.5 bg-[#093180] mt-1.5 shrink-0"></span>
          <span>${m}</span>
        </div>
      `).join('');
    }

    const visionFooterEl = document.getElementById('aboutVisionFooter');
    if (visionFooterEl && stats.vision_footer) {
      visionFooterEl.textContent = stats.vision_footer;
    }

    // Card 2: Keselamatan & Mutu
    const safetyTitleEl = document.getElementById('aboutSafetyTitle');
    if (safetyTitleEl && stats.safety_title) {
      safetyTitleEl.textContent = stats.safety_title;
    }

    const safetyDescEl = document.getElementById('aboutSafetyDesc');
    if (safetyDescEl && stats.safety_desc) {
      safetyDescEl.textContent = stats.safety_desc;
    }

    const safetyListEl = document.getElementById('aboutSafetyList');
    if (safetyListEl && Array.isArray(stats.safety_points) && stats.safety_points.length > 0) {
      safetyListEl.innerHTML = stats.safety_points.map(p => `
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 bg-[#093180]"></span>
          <span>${p}</span>
        </div>
      `).join('');
    }

    const safetyFooterEl = document.getElementById('aboutSafetyFooter');
    if (safetyFooterEl && stats.safety_footer) {
      safetyFooterEl.textContent = stats.safety_footer;
    }

    // Card 3: Layanan & Keahlian
    const serviceTitleEl = document.getElementById('aboutServiceTitle');
    if (serviceTitleEl && stats.service_title) {
      serviceTitleEl.textContent = stats.service_title;
    }

    const serviceDescEl = document.getElementById('aboutServiceDesc');
    if (serviceDescEl && stats.service_desc) {
      serviceDescEl.textContent = stats.service_desc;
    }

    const serviceListEl = document.getElementById('aboutServiceList');
    if (serviceListEl && Array.isArray(stats.service_points) && stats.service_points.length > 0) {
      serviceListEl.innerHTML = stats.service_points.map(p => `
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 bg-[#093180]"></span>
          <span>${p}</span>
        </div>
      `).join('');
    }

    const serviceFooterEl = document.getElementById('aboutServiceFooter');
    if (serviceFooterEl && stats.service_footer) {
      serviceFooterEl.textContent = stats.service_footer;
    }

    // Card 4: Stats Rekam Jejak
    const expEl = document.getElementById('companyStatExp');
    const expLabelEl = document.getElementById('companyStatExpLabel');
    const projEl = document.getElementById('companyStatProj');
    const projLabelEl = document.getElementById('companyStatProjLabel');
    const stdEl = document.getElementById('companyStatStd');
    const stdLabelEl = document.getElementById('companyStatStdLabel');
    const engEl = document.getElementById('companyStatEng');
    const engLabelEl = document.getElementById('companyStatEngLabel');

    if (expEl && stats.experience_years) expEl.textContent = stats.experience_years;
    if (expLabelEl && stats.experience_label) expLabelEl.textContent = stats.experience_label;
    if (projEl && stats.projects_completed) projEl.textContent = stats.projects_completed;
    if (projLabelEl && stats.projects_label) projLabelEl.textContent = stats.projects_label;
    if (stdEl && stats.standards) stdEl.textContent = stats.standards;
    if (stdLabelEl && stats.standards_label) stdLabelEl.textContent = stats.standards_label;
    if (engEl && stats.expert_engineers) engEl.textContent = stats.expert_engineers;
    if (engLabelEl && stats.engineers_label) engLabelEl.textContent = stats.engineers_label;

    // 8. Homepage About Section (index.html)
    const hCard1Title = document.getElementById('homeAboutCard1Title');
    const hCard1Desc = document.getElementById('homeAboutCard1Desc');
    const hCard1Footer = document.getElementById('homeAboutCard1Footer');
    if (hCard1Title && stats.home_card1_title) hCard1Title.textContent = stats.home_card1_title;
    if (hCard1Desc && stats.home_card1_desc) hCard1Desc.textContent = stats.home_card1_desc;
    if (hCard1Footer && stats.home_card1_footer) hCard1Footer.textContent = stats.home_card1_footer;

    const hCard2Title = document.getElementById('homeAboutCard2Title');
    const hCard2Desc = document.getElementById('homeAboutCard2Desc');
    const hCard2Footer = document.getElementById('homeAboutCard2Footer');
    if (hCard2Title && stats.home_card2_title) hCard2Title.textContent = stats.home_card2_title;
    if (hCard2Desc && stats.home_card2_desc) hCard2Desc.textContent = stats.home_card2_desc;
    if (hCard2Footer && stats.home_card2_footer) hCard2Footer.textContent = stats.home_card2_footer;

    const hCard3Title = document.getElementById('homeAboutCard3Title');
    const hCard3Desc = document.getElementById('homeAboutCard3Desc');
    const hCard3Footer = document.getElementById('homeAboutCard3Footer');
    if (hCard3Title && stats.home_card3_title) hCard3Title.textContent = stats.home_card3_title;
    if (hCard3Desc && stats.home_card3_desc) hCard3Desc.textContent = stats.home_card3_desc;
    if (hCard3Footer && stats.home_card3_footer) hCard3Footer.textContent = stats.home_card3_footer;

  } catch (err) {
    console.debug('Company profile hydration:', err);
  }
}
