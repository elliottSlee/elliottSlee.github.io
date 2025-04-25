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

// Render the table using only the columns in exportCols
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

  // Header
  exportCols.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });

  // Rows
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

// Export visible data to CSV
function exportCSV() {
  if (!exportCols.length) return showError("Select columns first.");
  const rows = [exportCols, ...allRecords.map(r => exportCols.map(c => r[c]))];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Export visible data to Excel
function exportXLSX() {
  if (!exportCols.length) return showError("Select columns first.");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(allRecords, {header: exportCols});
  XLSX.utils.book_append_sheet(wb, ws, 'Export');
  XLSX.writeFile(wb, 'export.xlsx');
}

// Initialize Grist widget
function initGrist() {
  grist.ready({
    columns: [
      {
        name: "ExportCols",
        title: "Columns to Export",
        type: "Any",
        optional: false,
        allowMultiple: true,
      }
    ],
    requiredAccess: 'read table',
    allowSelectBy: true,
  });

  // Store which columns the user picked
  grist.onOptions((options, interaction) => {
    exportCols = options?.ExportCols || [];
  });

  // Get current view records
  grist.onRecords((records) => {
    if (!records) {
      showError("No records in view.");
      return;
    }
    allRecords = records;
    renderTable();
  });

  // Wire up buttons
  document.getElementById('export-csv').addEventListener('click', exportCSV);
  document.getElementById('export-xlsx').addEventListener('click', exportXLSX);
}

document.addEventListener('DOMContentLoaded', initGrist);
