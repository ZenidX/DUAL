/**
 * Main.gs — Orquestració. Punts d'entrada del projecte:
 *
 *   • Main_setup()           → Una sola vegada: crea Sheet + Drive folder + triggers.
 *   • Main_uninstallTriggers → Si vols desactivar el polling sense esborrar el projecte.
 *   • Main_tick()            → Trigger periòdic (cada 5 min). Processa nous correus i seguiment.
 *   • Main_runOnce()         → Per executar manualment des de l'editor i veure logs.
 */

// =============================================================================
// SETUP — executar manualment una vegada
// =============================================================================

function Main_setup() {
  // 1. Verifica API key
  CONFIG_geminiApiKey();
  // 2. Crea Sheet + folder
  const ssId = Sheet_bootstrap();
  Logger.log('Sheet ID: ' + ssId);
  // 3. Crea labels Gmail
  for (const k in CONFIG.LABELS) Util_getOrCreateLabel(CONFIG.LABELS[k]);
  Logger.log('Labels creades');
  // 4. Instal·la trigger
  Main_setupTriggers();
  Logger.log('Setup complet. Properes execucions: Main_tick() cada ' + CONFIG.POLL.TRIGGER_MINUTES + ' min.');
}

function Main_setupTriggers() {
  Main_uninstallTriggers();
  ScriptApp.newTrigger('Main_tick')
    .timeBased()
    .everyMinutes(CONFIG.POLL.TRIGGER_MINUTES)
    .create();
}

function Main_uninstallTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  for (const t of triggers) {
    if (t.getHandlerFunction() === 'Main_tick') ScriptApp.deleteTrigger(t);
  }
}

// =============================================================================
// TICK — entry point del trigger periòdic
// =============================================================================

function Main_tick() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(2000)) {
    Logger.log('Main_tick ja en execució; aquest tick s\'omet.');
    return;
  }
  try {
    Main_processNewIncoming_();
    Main_processFollowups_();
  } finally {
    lock.releaseLock();
  }
}

/** Per a depuració manual. */
function Main_runOnce() { Main_tick(); }

// =============================================================================
// FASE 1: processa correus que encara no estan capturats
// =============================================================================

function Main_processNewIncoming_() {
  const threads = GmailApp.search(CONFIG.POLL.QUERY, 0, 50);
  Logger.log('Main_processNewIncoming_ → ' + threads.length + ' threads nous');
  for (const thread of threads) {
    try {
      Main_handleNewThread_(thread);
    } catch (e) {
      Logger.log('Error processant thread ' + thread.getId() + ': ' + e.stack);
      Util_addLabels(thread, [CONFIG.LABELS.ERROR, CONFIG.LABELS.REVISAR]);
      Sheet_upsertThreadState(thread.getId(), {
        estat: CONFIG.ESTATS.ERROR,
        notes: 'Error: ' + (e.message || String(e)),
      });
    }
  }
}

function Main_handleNewThread_(thread) {
  // Pas 01 del flow original: marcar "capturat" abans de res
  Util_addLabels(thread, [CONFIG.LABELS.CAPTURAT]);

  const messages = thread.getMessages();
  if (!messages.length) return;
  const msg = messages[0];
  const email = {
    sender: msg.getFrom(),
    senderDomain: Util_emailDomain_(msg.getFrom()),
    subject: thread.getFirstMessageSubject(),
    hasAttachment: msg.getAttachments({ includeAttachments: true, includeInlineImages: false }).length > 0,
    body: msg.getPlainBody() || '',
    receivedDateTime: msg.getDate(),
    messageId: msg.getId(),
    threadId: thread.getId(),
  };

  // Pas 02: triatge
  const triage = Triage_classify(email);
  Logger.log('Thread ' + thread.getId() + ' → ' + JSON.stringify(triage));

  // Pas 03: log Inbox (sempre, també per a IGNORE)
  Sheet_appendInbox({
    queue_id: email.messageId + '_' + (email.receivedDateTime ? email.receivedDateTime.getTime() : Date.now()),
    rebut_at: email.receivedDateTime,
    gmail_message_id: email.messageId,
    thread_id: email.threadId,
    from_email: email.sender,
    from_domain: email.senderDomain,
    subject: email.subject,
    has_attachment: email.hasAttachment,
    intent_hint: triage.intent,
    tipus_oferta: triage.tipus_oferta,
    confidence_hint: triage.confidence,
    resum_breu: triage.summary,
    cicles_hint: (triage.cycles || []).join(','),
    estat: CONFIG.ESTATS.PENDENT,
    creat_at_flow: new Date(),
    flow_run_id: '',
  });

  // Pas 04 + 05: dispatch per intent
  Main_dispatch_(thread, triage);
}

function Main_dispatch_(thread, triage) {
  switch (triage.intent) {
    case 'OFERTA':            return handleOferta(thread, triage);
    case 'INSCRIPCIO':        return handleInscripcio(thread, triage);
    case 'CESSIO':            return handleCessio(thread, triage);
    case 'CANDIDAT_EXTERN':   return handleCandidatExtern(thread);
    case 'SEGUIMENT':         return handleSeguiment(thread);
    case 'IGNORE':            return handleIgnore(thread);
    case 'ALTRES':
    default:                  return handleAltres(thread);
  }
}

// =============================================================================
// FASE 2: seguiment — hilos amb estat obert que han rebut nous missatges
// =============================================================================

function Main_processFollowups_() {
  const open = Sheet_listOpenThreads();
  Logger.log('Main_processFollowups_ → ' + open.length + ' threads oberts');
  for (const state of open) {
    try {
      const thread = GmailApp.getThreadById(state.thread_id);
      if (!thread) continue;
      const lastDate = thread.getLastMessageDate();
      // Fallback a updated_at perquè handlers com SEGUIMENT/ALTRES/CESSIO/INSCRIPCIO-incompleta
      // no actualitzen darrer_missatge_at i, sense aquest fallback, es re-disparen cada tick.
      const knownRaw = state.darrer_missatge_at || state.updated_at;
      const known = knownRaw ? new Date(knownRaw) : null;
      // Hi ha resposta nova?
      if (known && lastDate.getTime() <= known.getTime()) continue;

      // Re-dispatch segons intent guardat (no recalcular triage cada cop)
      const triage = {
        intent: state.intent || 'ALTRES',
        tipus_oferta: state.tipus_oferta || 'NA',
        confidence: 'ALTA',
        summary: '',
        cycles: state.cicles ? String(state.cicles).split(',').filter(Boolean) : [],
      };
      Main_dispatch_(thread, triage);
    } catch (e) {
      Logger.log('Error en followup ' + state.thread_id + ': ' + e.stack);
    }
  }
}
