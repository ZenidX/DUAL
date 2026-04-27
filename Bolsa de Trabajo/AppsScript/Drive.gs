/**
 * Drive.gs — Validació d'adjunts via Gemini Vision multimodal.
 *
 * Per al pas 2 d'INSCRIPCIO: l'alumne respon amb 2 PDFs (CV + carta de cessió signada).
 * Aquest mòdul classifica cada adjunt com:
 *   - "cv"            → currículum vitae
 *   - "cessio"        → carta de cessió signada (amb dades omplertes i signatura)
 *   - "oferta"        → document descriptiu d'una oferta laboral
 *   - "altre"         → no encaixa
 *
 * Si la classificació no és inequívoca, retorna confidence baixa per a revisió humana.
 */

const ATTACHMENT_SCHEMA = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['cv', 'cessio', 'oferta', 'altre'],
    },
    confidence: {
      type: 'string',
      enum: ['ALTA', 'MITJA', 'BAIXA'],
    },
    cessio_signada: { type: 'boolean' },
    cessio_dades_omplertes: { type: 'boolean' },
    notes: { type: 'string' },
  },
  required: ['type', 'confidence', 'cessio_signada', 'cessio_dades_omplertes', 'notes'],
};

const ATTACHMENT_PROMPT =
`Ets un classificador de documents per a la borsa de treball de l'Institut TIC de Barcelona.

Has de classificar el document adjunt en una d'aquestes categories:
- "cv": currículum vitae d'una persona (nom, experiència, formació, contacte).
- "cessio": carta de cessió de dades personals i professionals — el títol o cos esmenta
  "Consentiment de cessió de les dades personals i professionals" o "borsa de treball" i
  inclou camps com DNI/NIE, telèfon, correu, signatura.
- "oferta": document que descriu una oferta laboral o pràctiques d'una empresa.
- "altre": qualsevol altre document.

Per a "cessio", a més:
- "cessio_signada": true si veus signatura manual o digital.
- "cessio_dades_omplertes": true si els camps DNI/cicle/telèfon/correu estan reblerts (no buits).

Retorna JSON estricte segons el schema.`;

/**
 * Classifica tots els adjunts d'un GmailMessage.
 *
 * @param {GoogleAppsScript.Gmail.GmailMessage} message
 * @returns {Array<{name:string, type:string, confidence:string, cessio_signada:boolean, cessio_dades_omplertes:boolean, notes:string}>}
 */
function Drive_classifyAttachments(message) {
  const attachments = message.getAttachments({ includeInlineImages: false, includeAttachments: true });
  const out = [];
  for (const att of attachments) {
    const name = att.getName();
    const ct = att.getContentType() || '';
    if (!/^application\/pdf|^image\//i.test(ct)) {
      out.push({ name: name, type: 'altre', confidence: 'ALTA', cessio_signada: false,
        cessio_dades_omplertes: false, notes: 'Tipus MIME no suportat: ' + ct });
      continue;
    }
    try {
      const result = Gemini_generateVisionJson(ATTACHMENT_PROMPT, att.copyBlob(), ATTACHMENT_SCHEMA, {
        model: CONFIG.GEMINI.MODEL_VISION,
        temperature: 0,
      });
      out.push(Object.assign({ name: name }, result));
    } catch (e) {
      Logger.log('Drive_classifyAttachments error en ' + name + ': ' + e.message);
      out.push({ name: name, type: 'altre', confidence: 'BAIXA', cessio_signada: false,
        cessio_dades_omplertes: false, notes: 'Error en classificació: ' + e.message });
    }
  }
  return out;
}

/**
 * Per a INSCRIPCIO pas-2: comprova si entre els adjunts hi ha CV + cessió vàlida.
 *
 * @param {Array} classifications
 * @returns {{cvPresent:boolean, cessioPresent:boolean, cessioOk:boolean, ambiguous:boolean}}
 */
function Drive_inscripcioCompleteness(classifications) {
  let cvPresent = false, cessioPresent = false, cessioOk = false, ambiguous = false;
  for (const c of classifications) {
    if (c.type === 'cv' && c.confidence !== 'BAIXA') cvPresent = true;
    if (c.type === 'cessio') {
      cessioPresent = true;
      if (c.cessio_signada && c.cessio_dades_omplertes && c.confidence !== 'BAIXA') cessioOk = true;
    }
    if (c.confidence === 'BAIXA') ambiguous = true;
  }
  return { cvPresent: cvPresent, cessioPresent: cessioPresent, cessioOk: cessioOk, ambiguous: ambiguous };
}
