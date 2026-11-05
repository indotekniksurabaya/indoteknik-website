// Frontend Dynamic Company Profile Hydration
import { getCompanyProfile } from '../lib/supabase.js';

export async function initAbout() {
  try {
    const profile = await getCompanyProfile();
    if (!profile) return;

    // Optional dynamic hydration for stats or company details
    const expEl = document.getElementById('companyStatExp');
    const projEl = document.getElementById('companyStatProj');
    if (expEl && profile.stats?.experience_years) expEl.textContent = profile.stats.experience_years;
    if (projEl && profile.stats?.projects_completed) projEl.textContent = profile.stats.projects_completed;

  } catch (err) {
    console.debug('Company profile hydration:', err);
  }
}
