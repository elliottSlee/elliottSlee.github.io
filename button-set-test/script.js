let allRecords = []; // Stores all records from the selected table

// Initialize the Grist widget with the necessary columns
function initGrist() {
  grist.ready({
    columns: [
      { name: "OptionsToSelect", title: 'Options to select', type: 'Any' },
      { name: "LinkColumn", title: 'Column to Link Widgets', type: 'Any', optional: true }
    ],
    requiredAccess: 'read table',
    allowSelectBy: true,
  });

  // Fetch and display records when the table changes
  grist.onRecords(function (records) {
    if (!records || records.length === 0) {
      console.error("No records received");
      return;
    }

    // Store the records and map their columns
    allRecords = records;
    const mapped = grist.mapColumnNames(records);

    // Display the records in the UI
    displayRecords(mapped);
  });

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

// Display all fetched records as clickable divs
function displayRecords(mappedRecords) {
  const container = document.getElementById('records-container');
  container.innerHTML = ''; // Clear previous content

  mappedRecords.forEach((record, index) => {
    const recordDiv = document.createElement('div');
    recordDiv.textContent = `Record ${index + 1}: ${JSON.stringify(record)}`;

    // Add click event to set the cursor and trigger onRecord()
    recordDiv.addEventListener('click', function () {
      grist.setCursorPos({ rowId: record.id });
    });

    container.appendChild(recordDiv);
  });
}

// Display the full record details in the right column
function displayRecordDetails(fullRecord) {
  const readout = document.getElementById('readout');
  readout.innerHTML = JSON.stringify(fullRecord, null, 2); // Pretty-print JSON data
}

// Initialize the widget on page load
document.addEventListener('DOMContentLoaded', initGrist);
