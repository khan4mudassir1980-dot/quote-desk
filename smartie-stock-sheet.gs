/**
 * SMARTIE Quote Desk — team stock sync
 * ------------------------------------------------------------------
 * This turns one Google Sheet into the shared stock list for the team.
 * Every copy of the Quote Desk pushes its changes here and pulls back
 * whatever the others have changed.
 *
 * SETUP — about five minutes, once.
 *
 *  1. Go to sheets.new to make a new Google Sheet. Name it something
 *     like "SMARTIE stock".
 *  2. In that sheet choose  Extensions > Apps Script.
 *  3. Delete whatever is in the editor and paste this whole file in.
 *  4. Change TEAM_WORD below to a password of your choosing. Everyone
 *     on the team types the same word into the app.
 *  5. Click Save, then Deploy > New deployment.
 *       - Click the gear next to "Select type" and pick  Web app
 *       - Description:      SMARTIE stock
 *       - Execute as:       Me
 *       - Who has access:   Anyone
 *     Click Deploy. Google will ask you to authorise it — that is normal,
 *     it is your own script running on your own sheet. Choose your
 *     account, then Advanced > Go to (project name) > Allow.
 *  6. Copy the Web app URL. It ends in  /exec
 *  7. In the Quote Desk, open the Stock tab, paste that address into
 *     "Sheet web app address", type the same team word, put your name in,
 *     and press Save & connect.
 *  8. Send the same address and team word to everyone on the team.
 *
 * The sheet fills itself in. You can read it like any spreadsheet, and
 * you can edit the Qty column by hand — the app will pick that up on its
 * next sync, as long as you also clear the Updated cell for that row so
 * it counts as newer. Easier: just change it in the app.
 *
 * If you ever change this script, you must Deploy > Manage deployments >
 * edit > Version: New version, or the team will keep running the old one.
 */

var TEAM_WORD = 'change-this-word';   // <-- set your own
var SHEET     = 'Stock';
var HEADERS   = ['Key', 'Model', 'Group', 'Qty', 'Reorder at', 'Updated', 'By', 'Tracked'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var body = JSON.parse(e.postData.contents || '{}');

    if (String(body.key || '') !== String(TEAM_WORD)) {
      return reply({ error: 'wrong team word' });
    }
    if (body.action === 'ping') {
      return reply({ ok: true, rows: readStock().count });
    }
    if (body.action !== 'stock') {
      return reply({ error: 'unknown action' });
    }

    var changes = body.changes || {};
    if (Object.keys(changes).length) writeStock(changes);
    return reply({ ok: true, stock: readStock().stock, at: Date.now() });

  } catch (err) {
    return reply({ error: String(err && err.message ? err.message : err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

/* A plain GET is handy for checking the deployment is alive in a browser. */
function doGet() {
  return reply({ ok: true, note: 'SMARTIE stock endpoint is running', rows: readStock().count });
}

function reply(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 210);
    sh.setColumnWidth(2, 150);
    sh.setColumnWidth(3, 200);
  }
  return sh;
}

function readStock() {
  var sh = sheet_();
  var last = sh.getLastRow();
  var stock = {};
  if (last < 2) return { stock: stock, count: 0 };

  var rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  for (var i = 0; i < rows.length; i++) {
    var key = String(rows[i][0] || '').trim();
    if (!key) continue;
    var entry = {
      q:   Number(rows[i][3]) || 0,
      min: Number(rows[i][4]) || 0,
      t:   Number(rows[i][5]) || 0,
      by:  String(rows[i][6] || '')
    };
    if (String(rows[i][7]).toLowerCase() === 'no') entry.off = 1;
    stock[key] = entry;
  }
  return { stock: stock, count: rows.length };
}

function writeStock(changes) {
  var sh = sheet_();
  var last = sh.getLastRow();
  var index = {};                       // key -> row number

  if (last >= 2) {
    var keys = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < keys.length; i++) {
      var k = String(keys[i][0] || '').trim();
      if (k) index[k] = i + 2;
    }
  }

  var appends = [];
  for (var key in changes) {
    var v = changes[key] || {};
    var incoming = Number(v.t) || 0;
    var row = index[key];

    if (row) {
      // last edit wins, so an older push never overwrites a newer figure
      var existing = Number(sh.getRange(row, 6).getValue()) || 0;
      if (incoming < existing) continue;
      sh.getRange(row, 4, 1, 5).setValues([[
        Number(v.q) || 0, Number(v.min) || 0, incoming, String(v.by || ''), v.off ? 'no' : 'yes'
      ]]);
    } else {
      var parts = String(key).split('|');
      appends.push([
        key, parts[1] || '', parts[0] || '',
        Number(v.q) || 0, Number(v.min) || 0, incoming, String(v.by || ''), v.off ? 'no' : 'yes'
      ]);
    }
  }

  if (appends.length) {
    sh.getRange(sh.getLastRow() + 1, 1, appends.length, HEADERS.length).setValues(appends);
  }
}
