/**
 * Handlers.gs — Un handler per intent. Cada handler:
 *   1. Decideix quin missatge enviar i a qui.
 *   2. Respeta CONFIG.AUTO_SEND.<key>: true → envia; false → crea draft + avisa al tutor.
 *   3. Actualitza estat al Sheet i mou labels Gmail.
 *
 * Tots els handlers són idempotents respecte a labels: si la label de pas-X ja hi és, no fan res.
 */

// =============================================================================
// OFERTA — empresa envia oferta. Distribuïm al/s Group/s del/s cicle/s i agraïm.
// =============================================================================

function handleOferta(thread, triage) {
  const threadId = thread.getId();
  const message = thread.getMessages()[0];
  const sender = message.getFrom();
  const subject = thread.getFirstMessageSubject();
  const tipus = triage.tipus_oferta === 'MOBILITAT' ? 'MOBILITAT' : 'LABORAL';
  const cycles = triage.cycles && triage.cycles.length ? triage.cycles : Object.keys(CONFIG.GROUPS_BY_CYCLE);

  // Pas 1: distribució al/s Group/s del/s cicle/s (mail nou, NO reply)
  if (!Util_hasLabel(thread, tipus === 'MOBILITAT' ? CONFIG.LABELS.OFERTA_MOBILITAT : CONFIG.LABELS.OFERTA_LABORAL)) {
    const tmpl = (tipus === 'MOBILITAT') ? TEMPLATES.OFERTA_MOBILITAT_AL_GROUP : TEMPLATES.OFERTA_LABORAL_AL_GROUP;
    const vars = {
      LLOC_TREBALL: Util_extractLlocTreball_(subject, message.getPlainBody()),
      LLOC_BECA: Util_extractLlocTreball_(subject, message.getPlainBody()),
      NOM_EMPRESA: Util_extractEmpresaFromSender_(sender),
      DETALLS_OFERTA: Util_extractDetalls_(message),
      ENLLAC_OFERTA_OPT: '',
    };
    const rendered = Templates_render(tmpl, vars);

    for (const cycle of cycles) {
      const groupAddr = CONFIG.GROUPS_BY_CYCLE[cycle];
      if (!groupAddr) continue;
      Util_sendOrDraft({
        autoSendKey: 'oferta_distribucio',
        to: groupAddr,
        subject: rendered.subject + ' — ' + cycle,
        body: rendered.body,
        tutorContext: 'OFERTA ' + tipus + ' → ' + cycle + ' (' + groupAddr + ')\nThread: ' + thread.getPermalink(),
      });
    }

    Util_addLabels(thread, [
      CONFIG.LABELS.OFERTA,
      tipus === 'MOBILITAT' ? CONFIG.LABELS.OFERTA_MOBILITAT : CONFIG.LABELS.OFERTA_LABORAL,
    ]);
    Sheet_upsertThreadState(threadId, {
      intent: 'OFERTA', tipus_oferta: tipus, estat: CONFIG.ESTATS.OFERTA_DISTRIBUIDA,
      from_email: sender, subject: subject, cicles: cycles.join(','),
      pas_actual: 'pas-1-distribuida', darrer_missatge_at: thread.getLastMessageDate(),
    });
  }

  // Pas 2: agraïment a l'empresa (reply en hilo)
  const state = Sheet_getThreadState(threadId);
  if (state && state.estat === CONFIG.ESTATS.OFERTA_DISTRIBUIDA) {
    const agra = Templates_render(TEMPLATES.AGRAIMENT_EMPRESA, {
      OFERTA_DESC: Util_extractLlocTreball_(subject, message.getPlainBody()),
    });
    Util_replyOrDraft({
      thread: thread,
      autoSendKey: 'oferta_agraiment_empresa',
      body: agra.body,
      tutorContext: 'AGRAIMENT a empresa per oferta\nThread: ' + thread.getPermalink(),
    });
    Util_addLabels(thread, [CONFIG.LABELS.TANCAT]);
    Sheet_upsertThreadState(threadId, { estat: CONFIG.ESTATS.OFERTA_AGRAIDA, pas_actual: 'pas-2-agraida' });
  }
}

// =============================================================================
// INSCRIPCIO — alumne demana inscripció. Pas 1: enviem oferiment + adjunt cessió.
//                                       Pas 2: rep CV+cessió → formalitzem.
// =============================================================================

function handleInscripcio(thread, triage) {
  const threadId = thread.getId();
  const state = Sheet_getThreadState(threadId);
  const messages = thread.getMessages();
  const lastMsg = messages[messages.length - 1];

  // Pas 1: primer contacte → enviem oferiment amb adjunt cessió
  if (!state || state.estat === CONFIG.ESTATS.PENDENT) {
    const tmpl = Templates_render(TEMPLATES.INSCRIPCIO_OFERIMENT, {});
    let cessioBlob = null;
    try { cessioBlob = Templates_carteCessioBlob(); }
    catch (e) {
      Logger.log('Cessió blob falta: ' + e.message);
      Util_addLabels(thread, [CONFIG.LABELS.ERROR, CONFIG.LABELS.REVISAR]);
      Sheet_upsertThreadState(threadId, {
        intent: 'INSCRIPCIO', estat: CONFIG.ESTATS.ERROR,
        notes: 'Falta MOD_carta cessió de dades.docx al Drive.',
      });
      return;
    }
    Util_replyOrDraft({
      thread: thread,
      autoSendKey: 'inscripcio_oferiment',
      body: tmpl.body,
      attachments: [cessioBlob],
      tutorContext: 'INSCRIPCIO pas-1 oferiment + cessió\nThread: ' + thread.getPermalink(),
    });
    Util_addLabels(thread, [CONFIG.LABELS.INSCRIPCIO, CONFIG.LABELS.INSCRIPCIO_PAS_1]);
    Sheet_upsertThreadState(threadId, {
      intent: 'INSCRIPCIO', tipus_oferta: 'NA', estat: CONFIG.ESTATS.INSCRIPCIO_PAS_1,
      from_email: messages[0].getFrom(), subject: thread.getFirstMessageSubject(),
      pas_actual: 'pas-1-oferiment', darrer_missatge_at: thread.getLastMessageDate(),
    });
    return;
  }

  // Pas 2: l'alumne ha respost → si porta CV+cessió, formalitzem
  if (state.estat === CONFIG.ESTATS.INSCRIPCIO_PAS_1) {
    const classifications = Drive_classifyAttachments(lastMsg);
    const completeness = Drive_inscripcioCompleteness(classifications);

    if (completeness.cvPresent && completeness.cessioOk) {
      const tmpl = Templates_render(TEMPLATES.INSCRIPCIO_FORMALITZANT, {});
      Util_replyOrDraft({
        thread: thread,
        autoSendKey: 'inscripcio_formalitzant',
        body: tmpl.body,
        tutorContext: 'INSCRIPCIO pas-2 formalitzada (CV + cessió OK)\nThread: ' + thread.getPermalink(),
      });
      Util_addLabels(thread, [CONFIG.LABELS.INSCRIPCIO_PAS_2, CONFIG.LABELS.TANCAT]);
      Sheet_upsertThreadState(threadId, {
        estat: CONFIG.ESTATS.INSCRIPCIO_PAS_2,
        pas_actual: 'pas-2-formalitzada',
        darrer_missatge_at: thread.getLastMessageDate(),
      });
    } else {
      // No completa → demana revisió humana
      Util_addLabels(thread, [CONFIG.LABELS.REVISAR]);
      const notes = JSON.stringify(completeness) + ' classificacions=' +
        classifications.map(function(c) { return c.name + '→' + c.type; }).join(';');
      Sheet_upsertThreadState(threadId, { notes: notes });
      Util_notifyTutor('INSCRIPCIO incompleta — adjunts no validen', notes + '\nThread: ' + thread.getPermalink());
    }
  }
}

// =============================================================================
// CESSIO — algun cas en què la cessió arriba en hilo nou (no com a resposta al pas-1).
// =============================================================================

function handleCessio(thread, triage) {
  // Per simplicitat, tractem-la com a pas-2 d'INSCRIPCIO sense oferiment previ.
  Sheet_upsertThreadState(thread.getId(), {
    intent: 'CESSIO', estat: CONFIG.ESTATS.INSCRIPCIO_PAS_1,
    from_email: thread.getMessages()[0].getFrom(),
    subject: thread.getFirstMessageSubject(),
  });
  Util_addLabels(thread, [CONFIG.LABELS.CESSIO, CONFIG.LABELS.INSCRIPCIO_PAS_1]);
  // Re-entra a la lògica d'INSCRIPCIO al proper tick.
}

// =============================================================================
// CANDIDAT_EXTERN — resposta automàtica i tancat.
// =============================================================================

function handleCandidatExtern(thread) {
  const threadId = thread.getId();
  if (Util_hasLabel(thread, CONFIG.LABELS.EXTERN)) return;

  const tmpl = Templates_render(TEMPLATES.CANDIDAT_EXTERN, {});
  Util_replyOrDraft({
    thread: thread,
    autoSendKey: 'candidat_extern_resposta',
    body: tmpl.body,
    tutorContext: 'CANDIDAT_EXTERN resposta automàtica\nThread: ' + thread.getPermalink(),
  });
  Util_addLabels(thread, [CONFIG.LABELS.EXTERN, CONFIG.LABELS.TANCAT]);
  Sheet_upsertThreadState(threadId, {
    intent: 'CANDIDAT_EXTERN', tipus_oferta: 'NA', estat: CONFIG.ESTATS.EXTERN_RESPOST,
    from_email: thread.getMessages()[0].getFrom(),
    subject: thread.getFirstMessageSubject(),
    pas_actual: 'respost', darrer_missatge_at: thread.getLastMessageDate(),
  });
}

// =============================================================================
// SEGUIMENT — sempre revisió humana (per ara no automatitzem).
// =============================================================================

function handleSeguiment(thread) {
  Util_addLabels(thread, [CONFIG.LABELS.SEGUIMENT, CONFIG.LABELS.REVISAR]);
  Sheet_upsertThreadState(thread.getId(), {
    intent: 'SEGUIMENT', tipus_oferta: 'NA', estat: CONFIG.ESTATS.REVISAR,
    from_email: thread.getMessages()[0].getFrom(),
    subject: thread.getFirstMessageSubject(),
    pas_actual: 'pendent-revisio',
  });
  Util_notifyTutor('SEGUIMENT a revisar', 'Thread: ' + thread.getPermalink());
}

// =============================================================================
// IGNORE / ALTRES — només etiqueten.
// =============================================================================

function handleIgnore(thread) {
  Util_addLabels(thread, [CONFIG.LABELS.IGNORAT]);
  Sheet_upsertThreadState(thread.getId(), {
    intent: 'IGNORE', tipus_oferta: 'NA', estat: CONFIG.ESTATS.IGNORAT,
    from_email: thread.getMessages()[0].getFrom(),
    subject: thread.getFirstMessageSubject(),
  });
}

function handleAltres(thread) {
  Util_addLabels(thread, [CONFIG.LABELS.ALTRES, CONFIG.LABELS.REVISAR]);
  Sheet_upsertThreadState(thread.getId(), {
    intent: 'ALTRES', tipus_oferta: 'NA', estat: CONFIG.ESTATS.REVISAR,
    from_email: thread.getMessages()[0].getFrom(),
    subject: thread.getFirstMessageSubject(),
  });
  Util_notifyTutor('ALTRES — cal classificació humana', 'Thread: ' + thread.getPermalink());
}
