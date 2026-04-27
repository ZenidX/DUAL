/**
 * Gemini.gs — Wrapper sobre la Gemini API (Google AI Studio) amb structured output.
 *
 * Setup: a Project Settings → Script properties, afegir clau `GEMINI_API_KEY` amb
 * la API key generada a https://aistudio.google.com/apikey.
 */

/**
 * Genera contingut amb structured output (JSON estricte segons schema).
 *
 * @param {string} prompt — text del prompt enviat al model
 * @param {Object} responseSchema — JSON schema (subset suportat per Gemini)
 * @param {Object} [opts]
 * @param {string} [opts.model] — model id (default CONFIG.GEMINI.MODEL_TRIAGE)
 * @param {number} [opts.temperature=0]
 * @param {Array} [opts.parts] — parts addicionals (p. ex. inline_data per a vision)
 * @returns {Object} — JSON parsejat segons responseSchema
 */
function Gemini_generateJson(prompt, responseSchema, opts) {
  opts = opts || {};
  const model = opts.model || CONFIG.GEMINI.MODEL_TRIAGE;
  const url = CONFIG.GEMINI.ENDPOINT + '/' + model + ':generateContent';

  const parts = [{ text: prompt }];
  if (Array.isArray(opts.parts)) {
    for (const p of opts.parts) parts.push(p);
  }

  const payload = {
    contents: [{ role: 'user', parts: parts }],
    generationConfig: {
      temperature: typeof opts.temperature === 'number' ? opts.temperature : 0,
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    },
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': CONFIG_geminiApiKey() },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  const text = response.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error('Gemini API ' + code + ': ' + text);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error('Resposta no JSON de Gemini: ' + text.slice(0, 500));
  }

  const candidate = (data.candidates && data.candidates[0]) || null;
  if (!candidate) {
    throw new Error('Gemini sense candidates: ' + text.slice(0, 500));
  }
  if (candidate.finishReason && candidate.finishReason !== 'STOP') {
    Logger.log('Gemini finishReason=' + candidate.finishReason + ' (continuant igualment)');
  }

  const partsOut = (candidate.content && candidate.content.parts) || [];
  const jsonText = partsOut.map(function(p) { return p.text || ''; }).join('');
  if (!jsonText) {
    throw new Error('Resposta de Gemini buida: ' + text.slice(0, 500));
  }
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    throw new Error('Output de Gemini no és JSON parsejable: ' + jsonText.slice(0, 500));
  }
}

/**
 * Variant per a Gemini Vision: passa un PDF (o imatge) com a part inline + un prompt.
 *
 * @param {string} prompt
 * @param {GoogleAppsScript.Base.Blob} blob — adjunt (PDF/JPEG/PNG)
 * @param {Object} responseSchema
 * @param {Object} [opts]
 * @returns {Object}
 */
function Gemini_generateVisionJson(prompt, blob, responseSchema, opts) {
  opts = opts || {};
  const mime = blob.getContentType() || 'application/pdf';
  const base64 = Utilities.base64Encode(blob.getBytes());
  const part = { inline_data: { mime_type: mime, data: base64 } };
  return Gemini_generateJson(prompt, responseSchema, Object.assign({}, opts, {
    model: opts.model || CONFIG.GEMINI.MODEL_VISION,
    parts: [part],
  }));
}
