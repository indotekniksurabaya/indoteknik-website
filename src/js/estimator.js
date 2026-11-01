import { showToast } from './toast.js';

export function initEstimator() {
  const calcBtn = document.getElementById('calculateEstimateBtn');
  const estimatorResult = document.getElementById('estimatorResult');
  const sendEstimateWaBtn = document.getElementById('sendEstimateWaBtn');

  if (!calcBtn) return;

  calcBtn.addEventListener('click', () => {
    const facilityType = document.getElementById('estFacilityType').value;
    const areaSize = parseFloat(document.getElementById('estAreaSize').value) || 0;
    const hazards = document.getElementById('estHazardLevel').value;
    const selectedSystems = [];

    document.querySelectorAll('input[name="estSystems"]:checked').forEach(cb => {
      selectedSystems.push(cb.value);
    });

    if (areaSize <= 0) {
      showToast('Silakan masukkan perkiraan luas area yang valid (m²)', 'warning');
      return;
    }

    if (selectedSystems.length === 0) {
      showToast('Pilih minimal satu sistem proteksi yang dibutuhkan', 'warning');
      return;
    }

    let pumpRec = 'Fire Pump 500 GPM @ 8 Bar (Diesel + Electric + Jockey)';
    if (areaSize > 10000 || hazards === 'extra') {
      pumpRec = 'Fire Pump 1000 GPM - 1500 GPM @ 10-12 Bar (Standard NFPA 20 UL/FM)';
    } else if (areaSize > 5000 || hazards === 'ordinary') {
      pumpRec = 'Fire Pump 750 GPM @ 9-10 Bar (Diesel + Electric + Jockey NFPA 20)';
    }

    let reservoirRec = Math.round(areaSize * 0.04 + 100) + ' m³ (Menjamin durasi semprot minimal 60-90 menit)';
    let timelineRec = areaSize > 10000 ? '90 - 150 Hari Kerja' : (areaSize > 3000 ? '45 - 90 Hari Kerja' : '30 - 45 Hari Kerja');

    const resFacility = document.getElementById('resFacility');
    const resArea = document.getElementById('resArea');
    const resPump = document.getElementById('resPump');
    const resReservoir = document.getElementById('resReservoir');
    const resTimeline = document.getElementById('resTimeline');
    const resSystems = document.getElementById('resSystems');

    if (resFacility) resFacility.textContent = facilityType;
    if (resArea) resArea.textContent = `${areaSize.toLocaleString('id-ID')} m²`;
    if (resPump) resPump.textContent = pumpRec;
    if (resReservoir) resReservoir.textContent = reservoirRec;
    if (resTimeline) resTimeline.textContent = timelineRec;
    if (resSystems) resSystems.textContent = selectedSystems.join(', ');

    if (estimatorResult) {
      estimatorResult.classList.remove('hidden');
      estimatorResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    showToast('Estimasi teknis berhasil dihitung berdasarkan parameter NFPA & SNI!', 'success');

    if (sendEstimateWaBtn) {
      const waText = encodeURIComponent(
        `Halo PT Indo Teknik Empatbelas, saya ingin mendiskusikan penawaran untuk proyek proteksi kebakaran:\n\n` +
        `• Tipe Fasilitas: ${facilityType}\n` +
        `• Luas Area: ${areaSize} m²\n` +
        `• Tingkat Bahaya: ${hazards}\n` +
        `• Sistem Dibutuhkan: ${selectedSystems.join(', ')}\n` +
        `• Rekomendasi Awal: ${pumpRec}\n\n` +
        `Mohon informasi tindak lanjut survey teknis & penawaran resmi. Terima kasih.`
      );
      sendEstimateWaBtn.href = `https://wa.me/6281390630360?text=${waText}`;
    }
  });
}
