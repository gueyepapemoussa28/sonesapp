// src/utils/exportExcel.js
import * as XLSX from 'xlsx';
import { getDelta } from './store';

export function exportDaily(sites, saisies) {
  const wb = XLSX.utils.book_new();

  sites.forEach(site => {
    const rows = saisies[site.id] || [];
    const header = [
      'Date', 'Heure arrivée',
      'Cpt Horaire (h)', 'Δ Cpt Horaire',
      'Cpt Eau (m³)', 'Δ Eau (m³)',
      'Pression (bars)', 'Δ Pression',
      'k1 (kWh)', 'k2 (kWh)', 'kvar', 'cos φ',
      'GE Compteur (h)', 'GE Marche (h)',
      'Carburant (%)', 'Observations'
    ];

    const dataRows = rows.map((r, i) => {
      const p = i > 0 ? rows[i - 1] : null;
      return [
        r.date, r.heure,
        r.cpt_h, p ? parseFloat((r.cpt_h - p.cpt_h).toFixed(1)) : '',
        r.cpt_eau, p ? r.cpt_eau - p.cpt_eau : '',
        r.pression, p ? parseFloat((r.pression - p.pression).toFixed(2)) : '',
        r.k1, r.k2, r.kvar, r.cosphi,
        r.ge_h, r.ge_marche,
        r.carburant, r.obs || ''
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows]);

    // Column widths
    ws['!cols'] = [
      { wch: 12 }, { wch: 12 },
      { wch: 14 }, { wch: 12 },
      { wch: 14 }, { wch: 10 },
      { wch: 14 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 8 },
      { wch: 14 }, { wch: 12 },
      { wch: 12 }, { wch: 20 }
    ];

    // Header style — bold + blue background
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c: C });
      if (ws[addr]) {
        ws[addr].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '0057A8' } },
          alignment: { horizontal: 'center' }
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, site.name.slice(0, 31));
  });

  // Summary sheet
  const summaryHeader = ['Site', 'Dernière saisie', 'Pression (bars)', 'Cpt Eau (m³)', 'Carburant (%)', 'k1 (kWh)', 'k2 (kWh)', 'GE Marche (h)'];
  const summaryRows = sites.map(site => {
    const rows = saisies[site.id] || [];
    const latest = rows[rows.length - 1];
    if (!latest) return [site.name, 'Aucune donnée', '', '', '', '', '', ''];
    return [site.name, latest.date, latest.pression, latest.cpt_eau, latest.carburant, latest.k1, latest.k2, latest.ge_marche];
  });
  const wsSummary = XLSX.utils.aoa_to_sheet([summaryHeader, ...summaryRows]);
  wsSummary['!cols'] = summaryHeader.map(h => ({ wch: Math.max(h.length + 2, 14) }));
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Synthèse');

  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `SiteWatch_Export_${date}.xlsx`);
}

export function exportMonthly(sites, saisies, month) {
  const wb = XLSX.utils.book_new();
  sites.forEach(site => {
    const rows = (saisies[site.id] || []).filter(r => r.date.startsWith(month));
    const header = ['Date', 'Heure', 'Cpt Eau (m³)', 'Δ Eau', 'Pression', 'k1', 'k2', 'Carburant (%)'];
    const dataRows = rows.map((r, i) => {
      const p = i > 0 ? rows[i - 1] : null;
      return [r.date, r.heure, r.cpt_eau, p ? r.cpt_eau - p.cpt_eau : '', r.pression, r.k1, r.k2, r.carburant];
    });
    const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows]);
    ws['!cols'] = header.map(() => ({ wch: 14 }));
    XLSX.utils.book_append_sheet(wb, ws, site.name.slice(0, 31));
  });
  XLSX.writeFile(wb, `SiteWatch_Mensuel_${month}.xlsx`);
}
