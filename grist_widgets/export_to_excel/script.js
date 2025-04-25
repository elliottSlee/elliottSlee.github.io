// …rest of your script.js…

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

  // 1) When the user saves their column mapping, update exportCols & re-render
  grist.onOptions((options) => {
    exportCols = options?.ExportCols || [];
    renderTable();
  });

  // 2) When the view’s records change, update allRecords & re-render
  grist.onRecords((records) => {
    allRecords = records || [];
    renderTable();
  });

  document.getElementById('export-csv')
    .addEventListener('click', exportCSV);
  document.getElementById('export-xlsx')
    .addEventListener('click', exportXLSX);
}

document.addEventListener('DOMContentLoaded', initGrist);
