/**
 * Util.gs — helpers compartits (labels, enviament, notificacions, extracció ràpida de camps).
 */

function Util_getOrCreateLabel(name) {
  let label = GmailApp.getUserLabelByName(name);
  if (!label) label = GmailApp.createLabel(name);
  return label;
}

function Util_addLabels(thread, names) {
  for (const n of names) thread.addLabel(Util_getOrCreateLabel(n));
}

function Util_hasLabel(thread, name) {
  const labels = thread.getLabels();
  for (const l of labels) if (l.getName() === name) return true;
  return false;
}

/**
 * Envia un mail nou (no reply) o crea draft + avisa al tutor segons CONFIG.AUTO_SEND[autoSendKey].
 *
 * @param {{autoSendKey:string, to:string, subject:string, body:string, attachments?:Array, tutorContext:string}} opts
 */
function Util_sendOrDraft(opts) {
  const auto = !!CONFIG.AUTO_SEND[opts.autoSendKey];
  const params = {
    name: 'Borsa de treball Institut TIC de Barcelona',
  };
  if (opts.attachments && opts.attachments.length) params.attachments = opts.attachments;

  if (auto) {
    GmailApp.sendEmail(opts.to, opts.subject, opts.body, params);
    Logger.log('Util_sendOrDraft sent → ' + opts.to);
  } else {
    GmailApp.createDraft(opts.to, opts.subject, opts.body, params);
    Logger.log('Util_sendOrDraft draft → ' + opts.to);
    Util_notifyTutor('Draft creat: ' + opts.subject, opts.tutorContext + '\nDestinatari: ' + opts.to);
  }
}

/**
 * Reply en hilo via thread.reply() o crea draft del reply.
 *
 * @param {{thread:GoogleAppsScript.Gmail.GmailThread, autoSendKey:string, body:string, attachments?:Array, tutorContext:string}} opts
 */
function Util_replyOrDraft(opts) {
  const auto = !!CONFIG.AUTO_SEND[opts.autoSendKey];
  const params = {};
  if (opts.attachments && opts.attachments.length) params.attachments = opts.attachments;

  if (auto) {
    opts.thread.reply(opts.body, params);
    Logger.log('Util_replyOrDraft reply on thread ' + opts.thread.getId());
  } else {
    opts.thread.createDraftReply(opts.body, params);
    Logger.log('Util_replyOrDraft draft-reply on thread ' + opts.thread.getId());
    Util_notifyTutor('Draft de resposta creat', opts.tutorContext);
  }
}

function Util_notifyTutor(subject, body) {
  const to = CONFIG.TUTOR_NOTIFICATION_EMAIL;
  if (!to) return;
  try {
    GmailApp.sendEmail(to, '[Borsa Bot] ' + subject, body);
  } catch (e) {
    Logger.log('Util_notifyTutor falla: ' + e.message);
  }
}

// -----------------------------------------------------------------------------
// Extractors heurístics — solucions ràpides per omplir placeholders dels templates.
// Si calen més precissos, substituir per una crida a Gemini amb schema dedicat.
// -----------------------------------------------------------------------------

function Util_extractEmpresaFromSender_(sender) {
  const m = String(sender).match(/^"?([^"<]*)"?\s*<?([^>]*)>?$/);
  if (m && m[1] && m[1].trim()) return m[1].trim();
  if (m && m[2]) {
    const dom = m[2].split('@')[1] || '';
    return dom.split('.')[0] || dom || sender;
  }
  return sender;
}

function Util_extractLlocTreball_(subject, body) {
  const s = String(subject || '').replace(/^(re|fwd|rv):\s*/i, '').trim();
  return s || '(veure detalls al cos)';
}

function Util_extractDetalls_(message) {
  const body = message.getPlainBody() || '';
  // Trim a quotat (Gmail típicament marca amb "On ... wrote:")
  const cut = body.split(/\n[>]+|\nOn .+ wrote:/i)[0];
  return cut.trim().slice(0, 4000);
}

function Util_emailDomain_(email) {
  const m = String(email).match(/@([^>\s]+)/);
  return m ? m[1].toLowerCase() : '';
}
