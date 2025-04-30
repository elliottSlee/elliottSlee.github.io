let allRecords = [];
let exportCols = [];
let titleCols = [];

// Show or hide an error message
function showError(msg) {
  const el = document.getElementById('error');
  if (msg) {
    el.textContent = msg;
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

// Render the table headers and rows based on exportCols
function renderTable() {
  const headerRow = document.getElementById('table-header');
  const body = document.getElementById('table-body');
  headerRow.innerHTML = '';
  body.innerHTML = '';

  if (!exportCols.length) {
    showError("No columns selected for export.");
    return;
  }
  showError("");

  // Build header
  exportCols.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });

  // Build rows
  allRecords.forEach(rec => {
    const tr = document.createElement('tr');
    exportCols.forEach(col => {
      const td = document.createElement('td');
      td.textContent = rec[col] != null ? rec[col] : '';
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });
}

// Build a filename by concatenating the FIRST record’s values in titleCols
function makeFilename(ext) {
  if (!titleCols.length || !allRecords.length) {
    return `export.${ext}`;
  }
  const first = allRecords[0];
  const parts = titleCols.map(col => first[col] ?? '').filter(v => v !== '');
  const base = parts.join(' ');
  return `${base}.${ext}`;
}

// Export current view to CSV
function exportCSV() {
  if (!exportCols.length) {
    return showError("Select columns first.");
  }
  const rows = [
    exportCols,
    ...allRecords.map(r => exportCols.map(c => r[c]))
  ];
  const csv = rows
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = makeFilename('csv');
  a.click();
  URL.revokeObjectURL(url);
}

// Export current view to Excel
function exportXLSX() {
  if (!exportCols.length) {
    return showError("Select columns first.");
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(allRecords, { header: exportCols });
  XLSX.utils.book_append_sheet(wb, ws, 'Export');
  XLSX.writeFile(wb, makeFilename('xlsx'));
}

// Initialize the widget
function initGrist() {
  grist.ready({
    columns: [
      { 
        name: "ExportCols", 
        title: "Columns to Export", 
        type: "Any", 
        allowMultiple: true 
      },
      { 
        name: "FileNameCols", 
        title: "Columns for Filename", 
        type: "Any", 
        allowMultiple: true 
      }
    ],
    requiredAccess: 'read table',
    allowSelectBy: true,
  });

  // When user saves mapping, update exportCols & titleCols, then re-render
  grist.onOptions((options) => {
    titleCols  = options.FileNameCols || [];
    exportCols = (options.ExportCols || [])
      // remove id & filename cols
      .filter(c => c !== 'id' && !titleCols.includes(c));
    renderTable();
  });

  // When the view’s records change, convert them to plain objects & re-render
  grist.onRecords((records) => {
    allRecords = (records || []).map(r => ({ ...r }));
    // default exportCols to all except id & titleCols
    if (!exportCols.length && allRecords.length) {
      exportCols = Object.keys(allRecords[0])
        .filter(c => c !== 'id' && !titleCols.includes(c));
    }
    renderTable();
  });

  // Wire up export buttons
  document.getElementById('export-csv')
    .addEventListener('click', exportCSV);
  document.getElementById('export-xlsx')
    .addEventListener('click', exportXLSX);
}

document.addEventListener('DOMContentLoaded', initGrist);
