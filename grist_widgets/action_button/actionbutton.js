function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

const column = 'ActionButton';
let app = undefined;
let data = {
  status: 'waiting',
  result: null,
  inputs: [{
    description: null,
    button: null,
    actions: null,
  }],
  desc: null
}

function handleError(err) {
  console.error('ERROR', err);
  data.status = String(err).replace(/^Error: /, '');
}

async function applyActions(actions) {
  data.results = "Working...";
  try {
    await grist.docApi.applyUserActions(actions);
    data.message = 'Done';
  } catch (e) {
    data.message = `Please grant full access for writing. (${e})`;
  }
}

function onRecord(row, mappings) {
  try {
    data.status = '';
    data.results = null;
    // If there is no mapping, test the original record.
    row = grist.mapColumnNames(row) || row;
    if (!row.hasOwnProperty(column)) {
      throw new Error(`Need a visible column named "${column}". You can map a custom column in the Creator Panel.`);
    }
    let btns = row[column]
    // If only one action button is defined, put it within an Array
    if (!Array.isArray(btns)) {
      btns = [ btns ]
    }
    const keys = ['button', 'description', 'actions'];
    for (btn of btns) {
      if (!btn || keys.some(k => !btn[k])) {
        const allKeys = keys.map(k => JSON.stringify(k)).join(", ");
        const missing = keys.filter(k => !btn?.[k]).map(k => JSON.stringify(k)).join(", ");
        const gristName = mappings?.[column] || column;
        throw new Error(`"${gristName}" cells should contain an object with keys ${allKeys}. ` +
          `Missing keys: ${missing}`);
      }
    }
    data.inputs = btns;
  } catch (err) {
    handleError(err);
  }
}

ready(function() {
  // Update the widget anytime the document data changes.
  grist.ready({columns: [{name: column, title: "Action"}]});
  grist.onRecord(onRecord);
  
  app = new Vue({
    el: '#app',
    data: {
      inputs: [],        // your inputs array
      desc: null,
      processing: false, // ← declare it here
    },
    methods: {
      async applyActions(actions) {
        // reset
        this.processing = false;

        // kick off the real apply
        const applyPromise = grist.docApi.applyUserActions(actions);

        // race it against a 1 s timer
        const isSlow = await Promise.race([
          applyPromise.then(() => false).catch(() => false),
          new Promise(resolve => setTimeout(() => resolve(true), 1000)),
        ]);

        if (isSlow) {
          this.processing = true;
        }

        try {
          await applyPromise;
        } finally {
          this.processing = false;
        }
      }
    }
  });
});
