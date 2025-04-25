let allRecords = [];
let exportCols = [];

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
  a.download = 'export.csv';
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
  XLSX.writeFile(wb, 'export.xlsx');
}

// Initialize the widget
function initGrist() {
  grist.ready({
    columns: [
      {
        name: "ExportCols",
        title: "Columns to Export",
        type: "Any",
        allowMultiple: true,
      }
    ],
    requiredAccess: 'read table',
    allowSelectBy: true,
  });

  // When user saves column mapping, update exportCols & re-render
  grist.onOptions((options) => {
    if (options?.ExportCols?.length) {
      exportCols = options.ExportCols;
      renderTable();
    }
  });

  // When the view’s records change, convert them to plain objects & re-render
  grist.onRecords((records) => {
    // Convert Grist Record objects to plain JS objects
    allRecords = (records || []).map(r => {
      const obj = {};
      for (const key of Object.keys(r)) {
        obj[key] = r[key];
      }
      return obj;
    });
    // If no explicit mapping yet, default exportCols to all keys of the first record
    if (!exportCols.length && allRecords.length) {
      exportCols = Object.keys(allRecords[0]);
    }
    renderTable();
  });

  // Wire up the export buttons
  document.getElementById('export-csv')
    .addEventListener('click', exportCSV);
  document.getElementById('export-xlsx')
    .addEventListener('click', exportXLSX);
}

document.addEventListener('DOMContentLoaded', initGrist);
