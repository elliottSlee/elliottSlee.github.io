let allRecords = []; // Stores all records from the selected column

// Helper to show/hide error messages.
function showError(msg) {
  const errorEl = document.getElementById('error');
  if (!msg) {
    errorEl.classList.add('hidden');
  } else {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }
}

// Function to display the Plan Version ID or any other mapped field at the top.
function displayMappedField(mappedRecord) {
  const displayEl = document.getElementById('plan-version-display');
  const planVersionID = mappedRecord?.Plan_Version_ID || 'N/A'; // Default to 'N/A' if the field is missing.
  displayEl.textContent = `Plan Version ID: ${planVersionID}`;
  displayEl.classList.remove('hidden');
}

// Function to create responsive buttons for each row in the selected column.
function updateButtons(options) {
  const container = document.getElementById('column-container');
  container.innerHTML = ''; // Clear previous content.

  if (options.length === 0) {
    showError("No options available");
  } else {
    showError(""); // Clear error if valid options are found.
    options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 
        'w-full bg-white border rounded-lg px-2 py-1 sm:px-4 sm:py-2 ' +
        'text-left hover:bg-gray-100 text-sm sm:text-base transition-all duration-150';

      button.textContent = String(option);

      // Add click event to set the cursor and access the entire record.
      button.addEventListener('click', function () {
        const previous = document.querySelector('.selected');
        if (previous) {
          previous.classList.remove('selected', 'bg-blue-500', 'text-gray-200', 'border-blue-500', 'border-4');
        }

        button.classList.add('selected', 'bg-blue-500', 'text-gray-200', 'border-blue-500', 'border-4');

        const selectedRecord = allRecords[index];
        if (selectedRecord) {
          grist.setCursorPos({ rowId: selectedRecord.id });

          // Map column names dynamically and display the result.
          const mappedRecord = grist.mapColumnNames(selectedRecord);
          displayMappedField(mappedRecord);
        }
      });

      container.appendChild(button);
    });
  }
}

// Function to initialize the widget and handle records dynamically.
function initGrist() {
  grist.ready({
    columns: [{ name: "OptionsToSelect", title: "Select a column", type: "Any" }],
    requiredAccess: 'read table',
    allowSelectBy: true,
  });

  grist.onRecords(function (records) {
    if (!records || records.length === 0) {
      showError("No records received");
      updateButtons([]);
      return;
    }

    allRecords = records; // Store all records for later use.
    const mapped = grist.mapColumnNames(records);

    const options = mapped
      .map(record => record.OptionsToSelect)
      .filter(option => option !== null && option !== undefined);

    updateButtons(options);
  });

  grist.onRecord(function (record, mappings) {
    const mappedRecord = grist.mapColumnNames(record);
    displayMappedField(mappedRecord);
  });
}

// Initialize the widget on page load.
document.addEventListener('DOMContentLoaded', initGrist);
