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
        // Remove 'selected' class from any other button.
        const previous = document.querySelector('.selected');
        if (previous) previous.classList.remove('selected', 'bg-blue-500', 'text-gray-200');

        // Add 'selected' class to the clicked button.
        button.classList.add('selected', 'bg-blue-500', 'text-gray-200');

        // Get the selected record (entire row).
        const selectedRecord = allRecords[index];
        if (selectedRecord) {
          // Set the cursor to the corresponding row in Grist.
          grist.setCursorPos({ rowId: selectedRecord.id });

          // Use the entire record object as needed.
          console.log("Selected Record:", selectedRecord); // Log the whole record for further use.

          // Example usage: Link this record with another widget.
          handleRecordSelection(selectedRecord);
        }
      });

      container.appendChild(button);
    });
  }
}

// Function to handle the selected record (for linking with other widgets).
function handleRecordSelection(record) {
  console.log("Handling Record:", record); // Log the record for testing.
}

// Initialize the widget.
function initGrist() {
  grist.ready({
    columns: [{ name: "OptionsToSelect", title: "Select a column", type: "Any" }],
    requiredAccess: 'read table',
    allowSelectBy: true,
  });

  // Listen for records and update buttons accordingly.
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

  // Sync button selection with the Grist cursor position.
  grist.onRecord(function (record) {
    const index = allRecords.findIndex(r => r.id === record.id);
    const buttons = document.querySelectorAll('button');

    buttons.forEach((btn, btnIndex) => {
      if (btnIndex === index) {
        btn.classList.add('selected', 'bg-blue-500', 'text-gray-200');
      } else {
        btn.classList.remove('selected', 'bg-blue-500', 'text-gray-200');
      }
    });

    // Optional: Use the entire record object as needed.
    if (record) {
      handleRecordSelection(record);
    }
  });
}

// Initialize the widget on page load.
document.addEventListener('DOMContentLoaded', initGrist);
