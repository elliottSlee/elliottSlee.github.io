let allRecords = []; // Stores all records from the table
let linkColumnName = null; // Stores the optional second column name (if selected)

// Helper to show/hide error messages.
function showError(msg) {
  const errorEl = document.getElementById('error');
  if (!msg) {
    errorEl.style.display = 'none';
  } else {
    errorEl.innerHTML = msg;
    errorEl.style.display = 'block';
  }
}

// Function to update the dropdown with concatenated values.
function updateDropdown(options) {
  const dropdown = document.getElementById('dropdown');
  dropdown.innerHTML = ''; // Clear previous options

  if (options.length === 0) {
    const optionElement = document.createElement('option');
    optionElement.textContent = 'No options available';
    dropdown.appendChild(optionElement);
  } else {
    options.forEach((option, index) => {
      const optionElement = document.createElement('option');
      optionElement.value = String(index);
      optionElement.textContent = option; // Set concatenated value as the text
      dropdown.appendChild(optionElement);
    });
  }
}

// Initialize the Grist widget and allow selection of two columns.
function initGrist() {
  grist.ready({
    columns: [
      { name: "OptionsToSelect", title: "Select the first column", type: "Any" },
      { name: "LinkColumn", title: "Select the second column", type: "Any", optional: true }
    ],
    requiredAccess: 'read table',
    allowSelectBy: true,
  });

  // Store the optional LinkColumn name if provided.
  grist.onOptions(function (options) {
    linkColumnName = options?.LinkColumn || null;
    console.log(`LinkColumn selected: ${linkColumnName}`);
  });

  // Listen for table data changes and update the dropdown.
  grist.onRecords(function (records) {
    if (!records || records.length === 0) {
      showError("No records received");
      updateDropdown([]);
      return;
    }

    allRecords = records; // Store the records for further use
    const mapped = grist.mapColumnNames(records);

    const options = mapped.map(record => {
      const firstValue = record.OptionsToSelect || "";
      const secondValue = linkColumnName ? record[linkColumnName] || "" : "";
      return `${firstValue} - ${secondValue}`.trim();
    }).filter(option => option !== " - "); // Filter out empty concatenations

    if (options.length === 0) {
      showError("No valid options found");
    }

    updateDropdown(options);
  });

  // Sync the dropdown selection with the Grist cursor position.
  grist.onRecord(function (record) {
    const mapped = grist.mapColumnNames(record);
    const dropdown = document.getElementById('dropdown');
    const index = allRecords.findIndex(r => r.id === record.id);
    if (index !== -1) {
      dropdown.value = String(index); // Set the selected dropdown value
    }
  });

  // Handle dropdown change and update the cursor position.
  document.getElementById('dropdown').addEventListener('change', function(event) {
    const selectedIndex = parseInt(event.target.value);
    const selectedRecord = allRecords[selectedIndex];
    if (selectedRecord) {
      grist.setCursorPos({ rowId: selectedRecord.id }); // Update the cursor position
    }
  });
}

// Initialize the widget on page load.
document.addEventListener('DOMContentLoaded', initGrist);
