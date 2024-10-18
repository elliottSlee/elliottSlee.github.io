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
  // Handle the record change and fetch the full row from the table
  grist.onRecord(async function (record) {
    if (!record) return; // If no record is selected, do nothing

    // Fetch the entire row by ID to access all columns
    const fullRecord = await grist.docApi.fetchSelectedRecord(record.id);
    console.log("Full Record:", fullRecord);

    // Display the full record details
    displayRecordDetails(fullRecord);
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
