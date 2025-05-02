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

// Returns a promise that resolves to true if `promise` takes longer than ms to settle.
function isLongerThan(promise, ms) {
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; }, ms);
  return promise
    .finally(() => clearTimeout(timer))
    .then(() => timedOut, () => timedOut);
}

ready(function() {
  // … existing grist.ready, onRecord, etc …

  // Wrap applyUserActions to track “slow” state
  const origApply = grist.docApi.applyUserActions.bind(grist.docApi);
  data.processing = false;
  grist.docApi.applyUserActions = async function(actions) {
    // Kick off both the real apply and a timeout check
    const p = origApply(actions);
    isLongerThan(p, 1000).then((slow) => {
      data.processing = slow;
    });
    try {
      const result = await p;
      return result;
    } finally {
      data.processing = false;
    }
  };

  // Initialize Vue with the new `processing` field
  app = new Vue({
    el: '#app',
    data: data,
    methods: {applyActions},
  });
});
