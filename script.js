let allRecords = [];

// Helper to show/hide error messages.
function showError(msg) {
  const errorEl = document.getElementById('error');
  if (!msg) {
    errorEl.style.display = 'none';
  } else {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }
}

// Function to create buttons for each option.
function updateButtons(options) {
  const container = document.getElementById('column-container');
  container.innerHTML = ''; // Clear previous content.

  if (options.length === 0) {
    showError("No options available");
  } else {
    showError(""); // Clear error if valid options are found.
    options.forEach((option, index) => {
      const button = document.createElement('div');
      button.className = 'item-container';
      button.textContent = String(option);

      // Add click event to set the cursor position in Grist and display row data.
      button.addEventListener('click', function () {
        // Remove 'selected' class from any other button.
        const previous = document.querySelector('.item-container.selected');
        if (previous) previous.classList.remove('selected');

        // Add 'selected' class to the clicked button.
        button.classList.add('selected');

        // Set the cursor to the corresponding row in Grist.
        const selectedRecord = allRecords[index];
        if (selectedRecord) {
          grist.setCursorPos({ rowId: selectedRecord.id });

          // Display the entire row's data in the readout section.
          displayRowData(selectedRecord);
        }
      });

      container.appendChild(button);
    });
  }
}

// Function to display the entire row's data.
function displayRowData(record) {
  const readout = document.getElementById('readout');
  readout.innerHTML = `<pre>${JSON.stringify(record, null, 2)}</pre>`;
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

    allRecords = records;
    const mapped = grist.mapColumnNames(records);

    const options = mapped
      .map(record => record.OptionsToSelect)
      .filter(option => option !== null && option !== undefined);

    updateButtons(options);
  });

  // Sync button selection with the Grist cursor position.
  grist.onRecord(function (record) {
    const index = allRecords.findIndex(r => r.id === record.id);
    const buttons = document.querySelectorAll('.item-container');

    buttons.forEach((btn, btnIndex) => {
      if (btnIndex === index) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });

    // Display the row's data if the record is available.
    if (record) {
      displayRowData(record);
    }
  });
}

// Initialize the widget on page load.
document.addEventListener('DOMContentLoaded', initGrist);
