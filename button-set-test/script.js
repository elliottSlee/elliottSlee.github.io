let allRecords = []; // Stores all records from the selected table

// Initialize the Grist widget with column selection
function initGrist() {
  grist.ready({
    columns: [{ name: "OptionsToSelect", title: 'Options to select', type: 'Any' }],
    requiredAccess: 'read table',
    allowSelectBy: true,
  });

  // Fetch and map all records, then display them
  grist.onRecords(function (records) {
    if (!records || records.length === 0) {
      console.error("No records received");
      return;
    }

    // Store and map the records
    allRecords = records;
    const mapped = grist.mapColumnNames(records);

    // Display each record in its own div
    displayRecords(mapped);
  });

  // Update the displayed record details when a record is selected
  grist.onRecord(function (record) {
    const readout = document.getElementById('readout');
    readout.innerHTML = JSON.stringify(record, null, 2);
  });
}

// Display each record in its own div inside the records container
function displayRecords(mappedRecords) {
  const container = document.getElementById('records-container');
  container.innerHTML = ''; // Clear previous content

  mappedRecords.forEach((record, index) => {
    const recordDiv = document.createElement('div');
    recordDiv.textContent = `Record ${index + 1}: ${JSON.stringify(record)}`;

    // Add click event to select the record in Grist
    recordDiv.addEventListener('click', function () {
      grist.setCursorPos({ rowId: record.id });
    });

    container.appendChild(recordDiv);
  });
}

// Initialize the widget on page load
document.addEventListener('DOMContentLoaded', initGrist);
