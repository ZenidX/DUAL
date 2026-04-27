/**
 * Sheet.gs — Bootstrap del fitxer `BorsaInbox_Queue` i CRUD bàsic.
 *
 * Dues pestanyes:
 *  - Inbox    → log immutable: una fila per correu vist (auditoria).
 *  - Threads  → estat viu per hilo (clau primària: thread_id).
 *
 * Executar Sheet_bootstrap() un cop manualment des de l'editor.
 */

const INBOX_HEADERS = [
  'queue_id', 'rebut_at', 'gmail_message_id', 'thread_id',
  'from_email', 'from_domain', 'subject', 'has_attachment',
  'intent_hint', 'tipus_oferta', 'confidence_hint', 'resum_breu',
  'cicles_hint', 'estat', 'creat_at_flow', 'flow_run_id',
];

const THREADS_HEADERS = [
  'thread_id', 'intent', 'tipus_oferta', 'estat',
  'from_email', 'subject', 'cicles', 'pas_actual',
  'darrer_missatge_at', 'proxima_accio_at', 'creat_at', 'updated_at',
  'notes',
];

/**
 * Crea (o reutilitza) el spreadsheet i les seves pestanyes amb les capçaleres correctes.
 * Idempotent: cridar-lo dues vegades no duplica res.
 *
 * @returns {string} — ID del spreadsheet
 */
function Sheet_bootstrap() {
  const ss = Sheet_getOrCreateSpreadsheet_();

  const inbox = Sheet_ensureSheet_(ss, CONFIG.SHEET.INBOX_TAB, INBOX_HEADERS);
  inbox.setFrozenRows(1);

  const threads = Sheet_ensureSheet_(ss, CONFIG.SHEET.THREADS_TAB, THREADS_HEADERS);
  threads.setFrozenRows(1);

  Logger.log('Sheet OK: ' + ss.getUrl());
  return ss.getId();
}

function Sheet_getOrCreateSpreadsheet_() {
  const propKey = 'BORSA_SPREADSHEET_ID';
  const props = PropertiesService.getScriptProperties();
  const cachedId = props.getProperty(propKey);
  if (cachedId) {
    try { return SpreadsheetApp.openById(cachedId); } catch (e) { /* fall through */ }
  }
  const folder = Sheet_getOrCreateFolder_(CONFIG.SHEET.DRIVE_FOLDER_NAME);
  const files = folder.getFilesByName(CONFIG.SHEET.SPREADSHEET_NAME);
  let ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.openById(files.next().getId());
  } else {
    ss = SpreadsheetApp.create(CONFIG.SHEET.SPREADSHEET_NAME);
    const file = DriveApp.getFileById(ss.getId());
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  }
  props.setProperty(propKey, ss.getId());
  return ss;
}

function Sheet_getOrCreateFolder_(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function Sheet_ensureSheet_(ss, tabName, headers) {
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) sheet = ss.insertSheet(tabName);
  // Si el sheet "Sheet1" per defecte sobra, esborrar-lo
  const def = ss.getSheetByName('Sheet1');
  if (def && def.getName() === 'Sheet1' && ss.getSheets().length > 1) {
    ss.deleteSheet(def);
  }
  // Capçalera
  const range = sheet.getRange(1, 1, 1, headers.length);
  const current = range.getValues()[0];
  const needsWrite = current.length !== headers.length ||
    current.some(function(v, i) { return v !== headers[i]; });
  if (needsWrite) range.setValues([headers]);
  return sheet;
}

/**
 * Afegeix una fila al log Inbox (sempre, també per a IGNORE).
 *
 * @param {Object} row — objecte amb claus segons INBOX_HEADERS
 */
function Sheet_appendInbox(row) {
  const ss = Sheet_getOrCreateSpreadsheet_();
  const sheet = ss.getSheetByName(CONFIG.SHEET.INBOX_TAB);
  const values = INBOX_HEADERS.map(function(h) {
    const v = row[h];
    return (v === undefined || v === null) ? '' : v;
  });
  sheet.appendRow(values);
}

/**
 * Llegeix l'estat actual d'un hilo. Retorna null si no existeix.
 *
 * @param {string} threadId
 * @returns {Object|null}
 */
function Sheet_getThreadState(threadId) {
  const ss = Sheet_getOrCreateSpreadsheet_();
  const sheet = ss.getSheetByName(CONFIG.SHEET.THREADS_TAB);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return null;
  const headers = data[0];
  const idx = headers.indexOf('thread_id');
  for (let i = 1; i < data.length; i++) {
    if (data[i][idx] === threadId) {
      return Sheet_rowToObject_(headers, data[i], i + 1);
    }
  }
  return null;
}

/**
 * Crea o actualitza la fila d'estat d'un hilo (upsert).
 *
 * @param {string} threadId
 * @param {Object} fields — claus subset de THREADS_HEADERS
 */
function Sheet_upsertThreadState(threadId, fields) {
  const ss = Sheet_getOrCreateSpreadsheet_();
  const sheet = ss.getSheetByName(CONFIG.SHEET.THREADS_TAB);
  const now = new Date();
  const existing = Sheet_getThreadState(threadId);

  if (existing) {
    const row = existing._rowNumber;
    const headers = THREADS_HEADERS;
    const newRow = headers.map(function(h) {
      if (h === 'updated_at') return now;
      if (h === 'thread_id') return threadId;
      if (Object.prototype.hasOwnProperty.call(fields, h)) return fields[h];
      return existing[h] !== undefined ? existing[h] : '';
    });
    sheet.getRange(row, 1, 1, headers.length).setValues([newRow]);
  } else {
    const newRow = THREADS_HEADERS.map(function(h) {
      if (h === 'thread_id') return threadId;
      if (h === 'creat_at' || h === 'updated_at') return now;
      return Object.prototype.hasOwnProperty.call(fields, h) ? fields[h] : '';
    });
    sheet.appendRow(newRow);
  }
}

function Sheet_rowToObject_(headers, row, rowNumber) {
  const obj = { _rowNumber: rowNumber };
  for (let i = 0; i < headers.length; i++) obj[headers[i]] = row[i];
  return obj;
}

/**
 * Llista hilos en estats no terminals (per al `tick()` de seguiment).
 *
 * @returns {Array<Object>}
 */
function Sheet_listOpenThreads() {
  const ss = Sheet_getOrCreateSpreadsheet_();
  const sheet = ss.getSheetByName(CONFIG.SHEET.THREADS_TAB);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const terminals = new Set([
    CONFIG.ESTATS.TANCAT,
    CONFIG.ESTATS.IGNORAT,
    CONFIG.ESTATS.OFERTA_AGRAIDA,
    CONFIG.ESTATS.INSCRIPCIO_PAS_2,
    CONFIG.ESTATS.EXTERN_RESPOST,
  ]);
  const out = [];
  for (let i = 1; i < data.length; i++) {
    const obj = Sheet_rowToObject_(headers, data[i], i + 1);
    if (!terminals.has(obj.estat)) out.push(obj);
  }
  return out;
}
