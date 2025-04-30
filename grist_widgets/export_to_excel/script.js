let allRecords = [];
let exportCols = [];
let mapCols = {};  // Will hold { BillingCol, NameCol, ContractCol }

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
    return showError("No export columns selected.");
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

// Build filename from the mapped columns for the *selected* record
function makeFilename(ext) {
  // We use the *current* cursor record to name the file
  const rec = mapCols._currentMapped;
  if (!rec) {
    return `export.${ext}`;
  }
  // Billing period => YYYY-MM
  const dt = new Date(rec[ mapCols.BillingCol ]);
  const ym = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
  const name = rec[ mapCols.NameCol ] || 'Unknown';
  const cid  = rec[ mapCols.ContractCol ] || 'Unknown';
  return `Timesheet ${ym} ${name} ${cid}.${ext}`;
}

// Export CSV
function exportCSV() {
  if (!exportCols.length) {
    return showError("Select columns to export.");
  }
  const rows = [
    exportCols,
    ...allRecords.map(r => exportCols.map(c => r[c]))
  ];
  const csv = rows
    .map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = makeFilename('csv');
  a.click();
  URL.revokeObjectURL(url);
}

// Export Excel
function exportXLSX() {
  if (!exportCols.length) {
    return showError("Select columns to export.");
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(allRecords, { header: exportCols });
  XLSX.utils.book_append_sheet(wb, ws, 'Export');
  XLSX.writeFile(wb, makeFilename('xlsx'));
}

function initGrist() {
  grist.ready({
    columns: [
      { name: "ExportCols",   title: "Columns to Export",            type: "Any",    allowMultiple: true },
      { name: "BillingCol",   title: "Billing Period Column",         type: ["Date","DateTime"], optional: false },
      { name: "NameCol",      title: "Full Name Column",             type: "Text",   optional: false },
      { name: "ContractCol",  title: "Contract ID Column",           type: "Any",    optional: false },
    ],
    requiredAccess: 'full',
    allowSelectBy: true,
  });

  // Capture the column mappings (and filter out 'id')
  grist.onOptions((options, mappings) => {
    exportCols = (options.ExportCols || []).filter(c => c!=='id');
    mapCols = {
      BillingCol:  mappings.BillingCol,
      NameCol:     mappings.NameCol,
      ContractCol: mappings.ContractCol,
      _currentMapped: null,
    };
    renderTable();
  });

  // OnRecords: build allRecords as plain objects, default exportCols if needed
  grist.onRecords(records => {
    allRecords = (records || []).map(r => ({ ...r }));
    if (!exportCols.length && allRecords.length) {
      exportCols = Object.keys(allRecords[0]).filter(c=>'id'!==c);
    }
    renderTable();
  });

  // OnRecord: fetch full record and store mapped values for filename
  grist.onRecord(async (rec) => {
    if (!rec) {
      mapCols._currentMapped = null;
    } else {
      const full = await grist.docApi.fetchSelectedRecord(rec.id);
      mapCols._currentMapped = full;
    }
  });

  document.getElementById('export-csv')
    .addEventListener('click', exportCSV);
  document.getElementById('export-xlsx')
    .addEventListener('click', exportXLSX);
}

document.addEventListener('DOMContentLoaded', initGrist);
