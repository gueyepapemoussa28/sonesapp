import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// ── Palette couleurs SENEAU ──────────────────────────────────────────────────
const COLOR = {
  blueDark:    '003D7A',
  blue:        '0057A8',
  blueMid:     '3381C8',
  blueLight:   'EBF3FF',
  teal:        '00917C',
  tealLight:   'E0F5F1',
  orange:      'F4720B',
  orangeLight: 'FFF4EC',
  red:         'D92D20',
  redLight:    'FFF1F0',
  green:       '027A48',
  greenLight:  'ECFDF3',
  gray:        '667085',
  grayLight:   'F9FAFB',
  grayBorder:  'E4E7EC',
  white:       'FFFFFF',
  headerText:  'FFFFFF',
  rowAlt:      'F8FAFD',
};

// ── Helpers styles ────────────────────────────────────────────────────────────
function headerStyle(bgColor = COLOR.blue) {
  return {
    font: { bold: true, color: { argb: 'FF' + COLOR.headerText }, size: 10, name: 'Calibri' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgColor } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin', color: { argb: 'FF' + bgColor } },
      bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
    }
  };
}

function cellStyle(bg = COLOR.white, bold = false, color = '101828', align = 'center') {
  return {
    font: { bold, color: { argb: 'FF' + color }, size: 10, name: 'Calibri' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bg } },
    alignment: { horizontal: align, vertical: 'middle' },
    border: {
      bottom: { style: 'hair', color: { argb: 'FFE4E7EC' } },
    }
  };
}

function applyRowStyle(row, bg, isAlt = false) {
  const finalBg = isAlt ? COLOR.rowAlt : bg || COLOR.white;
  row.eachCell({ includeEmpty: true }, cell => {
    if (!cell.style?.fill?.fgColor?.argb || cell.style.fill.fgColor.argb === 'FFFFFFFF') {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + finalBg } };
    }
    cell.border = {
      bottom: { style: 'hair', color: { argb: 'FFE4E7EC' } },
    };
    if (!cell.alignment) cell.alignment = { vertical: 'middle' };
  });
  row.height = 18;
}

function pressureStyle(val) {
  if (val === '' || val === null || val === undefined) return {};
  if (val < 2)   return { font: { bold: true, color: { argb: 'FF' + COLOR.red },    size: 10, name: 'Calibri' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLOR.redLight } } };
  if (val < 2.5) return { font: { bold: true, color: { argb: 'FF' + COLOR.orange }, size: 10, name: 'Calibri' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLOR.orangeLight } } };
  return { font: { color: { argb: 'FF' + COLOR.green }, size: 10, name: 'Calibri' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLOR.greenLight } } };
}

function fuelStyle(val) {
  if (val === '' || val === null || val === undefined) return {};
  if (val <= 10) return { font: { bold: true, color: { argb: 'FF' + COLOR.red },    size: 10, name: 'Calibri' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLOR.redLight } } };
  if (val <= 20) return { font: { bold: true, color: { argb: 'FF' + COLOR.orange }, size: 10, name: 'Calibri' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLOR.orangeLight } } };
  return { font: { color: { argb: 'FF' + COLOR.green }, size: 10, name: 'Calibri' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLOR.greenLight } } };
}

function deltaStyle(val) {
  if (val === '' || val === null || val === undefined) return {};
  const num = parseFloat(val);
  if (isNaN(num)) return {};
  if (num > 0) return { font: { color: { argb: 'FF' + COLOR.green }, size: 10, name: 'Calibri' } };
  if (num < 0) return { font: { color: { argb: 'FF' + COLOR.red   }, size: 10, name: 'Calibri' } };
  return {};
}

// ── Feuille de couverture ─────────────────────────────────────────────────────
function addCoverSheet(wb, sites, saisies, period) {
  const ws = wb.addWorksheet('📋 Rapport', {
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true }
  });

  ws.columns = [
    { width: 4 }, { width: 28 }, { width: 18 }, { width: 18 },
    { width: 18 }, { width: 18 }, { width: 18 }, { width: 4 }
  ];

  // Titre principal
  ws.mergeCells('B2:G2');
  const title = ws.getCell('B2');
  title.value = 'SENEAU — SiteWatch Pro';
  title.style = {
    font: { bold: true, size: 22, color: { argb: 'FF' + COLOR.white }, name: 'Calibri' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLOR.blueDark } },
    alignment: { horizontal: 'center', vertical: 'middle' },
  };
  ws.getRow(2).height = 48;

  // Sous-titre
  ws.mergeCells('B3:G3');
  const sub = ws.getCell('B3');
  sub.value = 'Rapport de Supervision Hydraulique';
  sub.style = {
    font: { size: 13, color: { argb: 'FF' + COLOR.white }, name: 'Calibri' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLOR.blue } },
    alignment: { horizontal: 'center', vertical: 'middle' },
  };
  ws.getRow(3).height = 28;

  // Période et date
  ws.mergeCells('B4:G4');
  const dateLine = ws.getCell('B4');
  dateLine.value = `Période : ${period}   |   Généré le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  dateLine.style = {
    font: { size: 10, italic: true, color: { argb: 'FF' + COLOR.gray }, name: 'Calibri' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLOR.blueLight } },
    alignment: { horizontal: 'center', vertical: 'middle' },
  };
  ws.getRow(4).height = 22;

  ws.getRow(5).height = 12;

  // En-têtes synthèse
  const hdrs = ['Site', 'Localisation', 'Statut', 'Dernière saisie', 'Pression (bars)', 'Carburant (%)'];
  const hdrRow = ws.addRow(['', ...hdrs, '']);
  hdrRow.eachCell((cell, col) => {
    if (col >= 2 && col <= 7) {
      cell.style = headerStyle(COLOR.blue);
    }
  });
  hdrRow.height = 22;

  // Données synthèse
  sites.forEach((site, idx) => {
    const rows = saisies[site.id] || [];
    const latest = rows[rows.length - 1];
    const statusLabel = { online: '✅ En ligne', warn: '⚠ Attention', offline: '❌ Hors ligne' }[site.status] || '✅ En ligne';
    const dataRow = ws.addRow([
      '',
      site.name,
      site.loc || '—',
      statusLabel,
      latest ? latest.date : 'Aucune saisie',
      latest ? latest.pression : '—',
      latest ? latest.carburant : '—',
      ''
    ]);

    const isAlt = idx % 2 === 1;
    dataRow.height = 20;
    dataRow.eachCell({ includeEmpty: true }, (cell, col) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + (isAlt ? COLOR.rowAlt : COLOR.white) } };
      cell.font = { size: 10, name: 'Calibri' };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { bottom: { style: 'hair', color: { argb: 'FFE4E7EC' } } };
    });

    // Colorier pression et carburant
    if (latest) {
      Object.assign(dataRow.getCell(6).style, pressureStyle(latest.pression));
      Object.assign(dataRow.getCell(7).style, fuelStyle(latest.carburant));
    }

    // Nom site en gras à gauche
    dataRow.getCell(2).font = { bold: true, size: 10, name: 'Calibri', color: { argb: 'FF' + COLOR.blueDark } };
    dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
  });

  // Total saisies
  ws.addRow([]);
  const totalRow = ws.addRow(['', `Total sites : ${sites.length}`, '', '', '', `Total saisies : ${Object.values(saisies).reduce((s, r) => s + r.length, 0)}`, '', '']);
  totalRow.getCell(2).style = { font: { bold: true, size: 10, color: { argb: 'FF' + COLOR.blue }, name: 'Calibri' }, alignment: { horizontal: 'left' } };
  totalRow.getCell(6).style = { font: { bold: true, size: 10, color: { argb: 'FF' + COLOR.blue }, name: 'Calibri' }, alignment: { horizontal: 'center' } };

  // Pied de page légende
  ws.addRow([]);
  ws.addRow([]);
  const legendTitle = ws.addRow(['', 'Légende des couleurs :', '', '', '', '', '', '']);
  legendTitle.getCell(2).style = { font: { bold: true, size: 10, name: 'Calibri' } };

  const legends = [
    [COLOR.greenLight, COLOR.green, 'Normal / OK'],
    [COLOR.orangeLight, COLOR.orange, 'Attention requise'],
    [COLOR.redLight, COLOR.red, 'Critique — action immédiate'],
  ];
  legends.forEach(([bg, fg, label]) => {
    const r = ws.addRow(['', '   ' + label]);
    r.getCell(2).style = {
      font: { size: 10, name: 'Calibri', color: { argb: 'FF' + fg }, bold: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bg } },
      alignment: { horizontal: 'left', vertical: 'middle' },
    };
    r.height = 18;
  });
}

// ── Feuille par site ──────────────────────────────────────────────────────────
function addSiteSheet(wb, site, rows) {
  const ws = wb.addWorksheet(site.name.slice(0, 31), {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
    views: [{ state: 'frozen', ySplit: 3 }]
  });

  ws.columns = [
    { key: 'date',       width: 13 },
    { key: 'heure',      width: 10 },
    { key: 'cpt_h',      width: 14 },
    { key: 'dcpt_h',     width: 12 },
    { key: 'cpt_eau',    width: 14 },
    { key: 'deau',       width: 12 },
    { key: 'pression',   width: 14 },
    { key: 'dpression',  width: 12 },
    { key: 'k1',         width: 11 },
    { key: 'k2',         width: 11 },
    { key: 'kvar',       width: 10 },
    { key: 'cosphi',     width: 10 },
    { key: 'ge_h',       width: 13 },
    { key: 'ge_marche',  width: 13 },
    { key: 'carburant',  width: 13 },
    { key: 'obs',        width: 28 },
  ];

  // Ligne titre site
  ws.mergeCells(1, 1, 1, 16);
  const titleCell = ws.getCell('A1');
  titleCell.value = `${site.name}  —  ${site.loc || ''}`;
  titleCell.style = {
    font: { bold: true, size: 13, color: { argb: 'FF' + COLOR.white }, name: 'Calibri' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLOR.blueDark } },
    alignment: { horizontal: 'left', vertical: 'middle', indent: 1 },
  };
  ws.getRow(1).height = 28;

  // Groupes d'en-têtes
  const groupRow = ws.addRow([
    'Identification', '', 'Compteurs', '', '', '', 'Pression', '',
    'Énergie', '', '', '', 'Groupe Électrogène', '', '', 'Observations'
  ]);
  const groups = [
    { start: 1, end: 2,  color: COLOR.blueDark },
    { start: 3, end: 8,  color: COLOR.teal },
    { start: 9, end: 12, color: COLOR.blueMid },
    { start: 13, end: 15, color: COLOR.orange },
    { start: 16, end: 16, color: COLOR.gray },
  ];
  groups.forEach(({ start, end, color }) => {
    if (start !== end) ws.mergeCells(2, start, 2, end);
    const cell = groupRow.getCell(start);
    cell.style = headerStyle(color);
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  ws.getRow(2).height = 20;

  // En-têtes colonnes
  const colHeaders = [
    'Date', 'Heure',
    'Cpt Horaire (h)', 'Δ Horaire',
    'Cpt Eau (m³)', 'Δ Eau (m³)',
    'Pression (bars)', 'Δ Pression',
    'k1 (kWh)', 'k2 (kWh)', 'kvar', 'cos φ',
    'Cpt GE (h)', 'Marche (h)', 'Carburant (%)',
    'Observations'
  ];
  const hdrRow = ws.addRow(colHeaders);
  hdrRow.eachCell(cell => { cell.style = headerStyle(COLOR.blue); });
  ws.getRow(3).height = 22;

  if (rows.length === 0) {
    ws.addRow(['Aucune saisie enregistrée pour ce site.']);
    return;
  }

  // Données
  rows.forEach((r, i) => {
    const p = i > 0 ? rows[i - 1] : null;
    const dCptH   = p ? parseFloat((r.cpt_h   - p.cpt_h  ).toFixed(1)) : '';
    const dEau    = p ? r.cpt_eau - p.cpt_eau : '';
    const dPress  = p ? parseFloat((r.pression - p.pression).toFixed(2)) : '';

    const dataRow = ws.addRow([
      r.date, r.heure,
      r.cpt_h,   dCptH,
      r.cpt_eau, dEau,
      r.pression, dPress,
      r.k1, r.k2, r.kvar, r.cosphi,
      r.ge_h, r.ge_marche, r.carburant,
      r.obs || ''
    ]);

    const isAlt = i % 2 === 1;
    applyRowStyle(dataRow, isAlt ? COLOR.rowAlt : COLOR.white);

    // Date en gras
    dataRow.getCell(1).font = { bold: true, size: 10, name: 'Calibri', color: { argb: 'FF' + COLOR.blueDark } };
    dataRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    dataRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

    // Couleurs conditionnelles
    Object.assign(dataRow.getCell(7).style, pressureStyle(r.pression));
    Object.assign(dataRow.getCell(15).style, fuelStyle(r.carburant));
    Object.assign(dataRow.getCell(4).style,  deltaStyle(dCptH));
    Object.assign(dataRow.getCell(6).style,  deltaStyle(dEau));
    Object.assign(dataRow.getCell(8).style,  deltaStyle(dPress));

    // Observations en italique à gauche
    const obsCell = dataRow.getCell(16);
    obsCell.font = { italic: true, size: 9, color: { argb: 'FF' + COLOR.gray }, name: 'Calibri' };
    obsCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  });

  // Ligne statistiques
  if (rows.length > 1) {
    ws.addRow([]);
    const vals = field => rows.map(r => parseFloat(r[field])).filter(v => !isNaN(v));
    const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : '—';
    const min = arr => arr.length ? Math.min(...arr).toFixed(2) : '—';
    const max = arr => arr.length ? Math.max(...arr).toFixed(2) : '—';

    const statsHeaders = ws.addRow([
      'Statistiques', '',
      'Moy cpt h', '', 'Moy eau (m³)', '',
      'Moy pression', '', 'Moy k1', '', '', '',
      '', '', 'Moy carburant', ''
    ]);
    statsHeaders.eachCell(cell => {
      if (cell.value) {
        cell.style = headerStyle(COLOR.blueDark);
      }
    });
    statsHeaders.height = 18;

    const statsData = [
      ['Moyenne', '',
        avg(vals('cpt_h')), '',  avg(vals('cpt_eau')), '',
        avg(vals('pression')), '', avg(vals('k1')), '', '', '',
        '', '', avg(vals('carburant')), ''
      ],
      ['Minimum', '',
        min(vals('cpt_h')), '',  min(vals('cpt_eau')), '',
        min(vals('pression')), '', min(vals('k1')), '', '', '',
        '', '', min(vals('carburant')), ''
      ],
      ['Maximum', '',
        max(vals('cpt_h')), '',  max(vals('cpt_eau')), '',
        max(vals('pression')), '', max(vals('k1')), '', '', '',
        '', '', max(vals('carburant')), ''
      ],
    ];

    statsData.forEach((data, idx) => {
      const r = ws.addRow(data);
      r.getCell(1).style = {
        font: { bold: true, size: 10, color: { argb: 'FF' + COLOR.blueDark }, name: 'Calibri' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLOR.blueLight } },
        alignment: { horizontal: 'left', vertical: 'middle' }
      };
      r.eachCell((cell, col) => {
        if (col > 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + (idx % 2 === 0 ? COLOR.blueLight : COLOR.white) } };
          cell.font = { size: 10, name: 'Calibri' };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
      r.height = 18;
    });
  }
}

// ── Export principal ──────────────────────────────────────────────────────────
async function generateWorkbook(sites, saisies, period, filename) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SiteWatch Pro — SENEAU';
  wb.created = new Date();
  wb.modified = new Date();

  addCoverSheet(wb, sites, saisies, period);
  sites.forEach(site => {
    addSiteSheet(wb, site, saisies[site.id] || []);
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, filename);
}

export async function exportDaily(sites, saisies) {
  const date = new Date().toISOString().split('T')[0];
  const period = `Export complet au ${new Date().toLocaleDateString('fr-FR')}`;
  await generateWorkbook(sites, saisies, period, `SiteWatch_Rapport_${date}.xlsx`);
}

export async function exportMonthly(sites, saisies, month) {
  const [year, m] = month.split('-');
  const monthName = new Date(year, m - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const filteredSaisies = {};
  sites.forEach(s => {
    filteredSaisies[s.id] = (saisies[s.id] || []).filter(r => r.date.startsWith(month));
  });
  await generateWorkbook(sites, filteredSaisies, `Mois de ${monthName}`, `SiteWatch_Mensuel_${month}.xlsx`);
}
