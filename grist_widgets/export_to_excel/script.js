let allRecords = [];
let exportCols = [];
let currentRecord = null;  // Will hold the full selected record

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

// Helper to derive filename prefix from the currentRecord
function makeFilename(ext) {
  if (!currentRecord) {
    return `export.${ext}`;
  }
  // Derive YYYY-MM
  const bp = currentRecord["Billing_Period.Billing_Period"];
  const d = new Date(bp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const yearMonth = `${year}-${month}`;

  const fullName = currentRecord["Full_Name"] || "Unknown";
  const contractID = currentRecord["Contract_ID.Contract_ID"] || "Unknown";

  return `Timesheet ${yearMonth} ${fullName} ${contractID}.${ext}`;
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
        allowMultiple: true,
      }
    ],
    requiredAccess: 'full',
    allowSelectBy: true,
  });

  // When user saves column mapping, update exportCols & re-render
  grist.onOptions((options) => {
    if (options?.ExportCols?.length) {
      // Never include the internal 'id' column
      exportCols = options.ExportCols.filter(c => c !== 'id');
      renderTable();
    }
  });

  // When the view’s records change, convert them to plain objects & re-render
  grist.onRecords((records) => {
    allRecords = (records || []).map(r => {
      const obj = {};
      for (const key of Object.keys(r)) {
        obj[key] = r[key];
      }
      return obj;
    });
    // Default to all columns (minus 'id') if none explicitly mapped
    if (!exportCols.length && allRecords.length) {
      exportCols = Object.keys(allRecords[0]).filter(c => c !== 'id');
    }
    renderTable();
  });

  // When the cursor (selected row) changes, fetch full record for naming
  grist.onRecord(async (record) => {
    if (!record) {
      currentRecord = null;
    } else {
      // Fetch full record including all columns
      currentRecord = await grist.docApi.fetchSelectedRecord(record.id);
    }
  });

  // Wire up the export buttons
  document.getElementById('export-csv')
    .addEventListener('click', exportCSV);
  document.getElementById('export-xlsx')
    .addEventListener('click', exportXLSX);
}

document.addEventListener('DOMContentLoaded', initGrist);
