/**
 * Config.gs — Constants centralitzades per a l'automatització de la borsa de treball.
 *
 * Setup inicial (una sola vegada):
 *   1. Crear projecte Apps Script standalone (script.google.com).
 *   2. Vincular amb clasp:  clasp clone <SCRIPT_ID>
 *   3. PropertiesService → afegir clau GEMINI_API_KEY (Google AI Studio).
 *   4. Executar manualment Sheet_bootstrap() (un cop) per crear el Sheet.
 *   5. Executar manualment Main_setupTriggers() per instal·lar el trigger periòdic.
 */

const CONFIG = {
  // Bústia operativa (l'owner del projecte Apps Script ha de ser aquest compte)
  MAILBOX: 'borsa.treball@iticbcn.cat',

  // Adreça per avisar al tutor humà quan AUTO_SEND és false (drafts a revisar)
  // Canviar al correu real abans de desplegar.
  TUTOR_NOTIFICATION_EMAIL: 'borsa.treball@iticbcn.cat',

  // Mapping cicle → Google Group on es distribueixen ofertes
  GROUPS_BY_CYCLE: {
    ASIX: 'ofertes.treball.asix@iticbcn.cat',
    DAM: 'ofertes.treball.dam@iticbcn.cat',
    DAW: 'ofertes.treball.daw@iticbcn.cat',
    SMX: 'ofertes.treball.smx@iticbcn.cat',
    IABD: 'ofertes.treball.iabd@iticbcn.cat',
    CEPYTHON: 'ofertes.treball.cepython@iticbcn.cat',
  },

  // Auto-send per acció. true = envia directe; false = crea draft i avisa al tutor.
  // Pensat perquè el tutor pugui modular el risc fàcilment des d'aquí.
  AUTO_SEND: {
    oferta_distribucio: false,        // mail nou al Group del cicle (alt risc per error)
    oferta_agraiment_empresa: true,   // resposta a l'empresa un cop distribuïda
    inscripcio_oferiment: true,       // resposta amb adjunt cessió a l'alumne
    inscripcio_formalitzant: true,    // confirmació final un cop rebut CV+cessió
    candidat_extern_resposta: true,   // resposta automàtica a externs
  },

  // Gemini API (Google AI Studio, no Vertex)
  GEMINI: {
    API_KEY_PROPERTY: 'GEMINI_API_KEY',
    MODEL_TRIAGE: 'gemini-2.5-flash',
    MODEL_VISION: 'gemini-2.5-flash',
    ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
    TIMEOUT_MS: 30000,
  },

  // Google Sheet de cua + estat per hilo
  SHEET: {
    SPREADSHEET_NAME: 'BorsaInbox_Queue',
    INBOX_TAB: 'Inbox',         // log immutable: una fila per correu vist
    THREADS_TAB: 'Threads',     // estat viu per hilo (clau: thread_id)
    DRIVE_FOLDER_NAME: 'Borsa de treball — Workspace Studio',
  },

  // Labels Gmail (es creen automàticament si no existeixen)
  LABELS: {
    CAPTURAT: 'borsa/capturat',
    OFERTA: 'borsa/oferta',
    OFERTA_LABORAL: 'borsa/oferta/laboral',
    OFERTA_MOBILITAT: 'borsa/oferta/mobilitat',
    INSCRIPCIO: 'borsa/inscripcio',
    INSCRIPCIO_PAS_1: 'borsa/inscripcio/pas-1-oferiment',
    INSCRIPCIO_PAS_2: 'borsa/inscripcio/pas-2-formalitzada',
    CESSIO: 'borsa/cessio',
    EXTERN: 'borsa/extern',
    SEGUIMENT: 'borsa/seguiment',
    ALTRES: 'borsa/altres',
    IGNORAT: 'borsa/ignorat',
    ERROR: 'borsa/error',
    REVISAR: 'borsa/revisar',
    TANCAT: 'borsa/tancat',
  },

  // Màquina d'estats (columna `estat` al Sheet Threads)
  ESTATS: {
    PENDENT: 'PENDENT',
    OFERTA_DISTRIBUIDA: 'OFERTA_DISTRIBUIDA',
    OFERTA_AGRAIDA: 'OFERTA_AGRAIDA',
    INSCRIPCIO_PAS_1: 'INSCRIPCIO_PAS_1',
    INSCRIPCIO_PAS_2: 'INSCRIPCIO_PAS_2',
    EXTERN_RESPOST: 'EXTERN_RESPOST',
    IGNORAT: 'IGNORAT',
    REVISAR: 'REVISAR',
    TANCAT: 'TANCAT',
    ERROR: 'ERROR',
  },

  // Polling
  POLL: {
    QUERY: 'in:inbox -label:borsa/capturat newer_than:30d',
    FOLLOWUP_QUERY: 'label:borsa -label:borsa/tancat newer_than:60d',
    TRIGGER_MINUTES: 5,
  },
};

/** Llegeix la API key de Gemini de PropertiesService. */
function CONFIG_geminiApiKey() {
  const key = PropertiesService.getScriptProperties().getProperty(CONFIG.GEMINI.API_KEY_PROPERTY);
  if (!key) {
    throw new Error('Falta la propietat ' + CONFIG.GEMINI.API_KEY_PROPERTY +
      ' a Script Properties. Afegeix-la a Project Settings → Script properties.');
  }
  return key;
}
