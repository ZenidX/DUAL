/**
 * Triage.gs — Classificador d'intent (equivalent al Gem del Paso 02).
 *
 * Crida la Gemini API amb structured output. Retorna sempre un objecte
 * conforme al schema, mai llença excepció per ambigüitat (deriva a `ALTRES` + `BAIXA`).
 */

const TRIAGE_SCHEMA = {
  type: 'object',
  properties: {
    intent: {
      type: 'string',
      enum: ['OFERTA', 'INSCRIPCIO', 'CESSIO', 'CANDIDAT_EXTERN', 'SEGUIMENT', 'IGNORE', 'ALTRES'],
    },
    tipus_oferta: {
      type: 'string',
      enum: ['LABORAL', 'MOBILITAT', 'NA'],
    },
    confidence: {
      type: 'string',
      enum: ['ALTA', 'MITJA', 'BAIXA'],
    },
    summary: { type: 'string' },
    cycles: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['ASIX', 'DAM', 'DAW', 'SMX', 'IABD', 'CEPYTHON'],
      },
    },
  },
  required: ['intent', 'tipus_oferta', 'confidence', 'summary', 'cycles'],
};

const TRIAGE_PROMPT_HEADER =
`Ets l'assistent de triatge de la borsa de treball de l'Institut TIC de Barcelona (iticbcn.cat).

Reps un correu i has de classificar-lo retornant un JSON estricte segons el schema.

Criteris per a "intent":
- OFERTA: una empresa ofereix un lloc de treball, pràctiques o beca de mobilitat.
- INSCRIPCIO: un alumne o ex-alumne demana inscriure's a la borsa o envia CV+cessió com a resposta.
- CESSIO: el correu inclou o fa referència a la carta de cessió de dades signada.
- CANDIDAT_EXTERN: una persona externa (no alumne) envia CV demanant feina a l'institut.
- SEGUIMENT: consulta sobre una oferta, inscripció o document ja obert.
- IGNORE: auto-resposta, fora d'oficina, undeliverable, mail delivery failed, resposta automàtica,
  acusament de rebut sense contingut nou, respostes buides ("ok", "gràcies"), notificacions del sistema.
- ALTRES: no encaixa clarament en cap dels anteriors.

Criteris per a "tipus_oferta" (només si intent=OFERTA, altrament "NA"):
- MOBILITAT: l'oferta menciona Erasmus, mobilitat, beca per estada a l'estranger, país concret
  diferent d'Espanya, durada en mesos amb component internacional.
- LABORAL: oferta normal de treball, pràctiques (FCT) o beca local.

Criteris per a "confidence":
- ALTA: contingut inequívoc.
- MITJA: dóna pistes però hi ha ambigüitat.
- BAIXA: no queda clar.

Criteris per a "cycles":
- Codis acceptats: ASIX, DAM, DAW, SMX, IABD, CEPYTHON.
- Infereix a partir de paraules clau:
  ASIX → administració sistemes, xarxes, servidors, devops, seguretat.
  DAM → desenvolupament apps mòbils (Android/iOS), Kotlin, Swift.
  DAW → desenvolupament web, frontend, backend web, full stack.
  SMX → suport microinformàtic, tècnic sistemes, help desk, hardware.
  IABD → big data, data science, machine learning, analítica, IA.
  CEPYTHON → Python avançat, automatització, scripting.
- Si l'oferta és genèrica o no especifica, retorna llista buida.

Criteris per a "summary":
- Frase curta en català, màxim 40 paraules.

Davant qualsevol ambigüitat, retorna intent=ALTRES amb confidence=BAIXA.`;

/**
 * Classifica un correu retornant {intent, tipus_oferta, confidence, summary, cycles}.
 *
 * @param {{sender:string, senderDomain:string, subject:string, hasAttachment:boolean, body:string}} email
 * @returns {Object}
 */
function Triage_classify(email) {
  const userBlock =
`Remitent: ${email.sender || ''}
Domini del remitent: ${email.senderDomain || ''}
Assumpte: ${email.subject || ''}
Té adjunt: ${email.hasAttachment ? 'sí' : 'no'}

Cos del correu:
"""
${(email.body || '').slice(0, 16000)}
"""`;

  const prompt = TRIAGE_PROMPT_HEADER + '\n\n---\n\n' + userBlock;

  try {
    const result = Gemini_generateJson(prompt, TRIAGE_SCHEMA, {
      model: CONFIG.GEMINI.MODEL_TRIAGE,
      temperature: 0,
    });
    return Triage_normalize_(result);
  } catch (e) {
    Logger.log('Triage_classify error: ' + e.message);
    return {
      intent: 'ALTRES',
      tipus_oferta: 'NA',
      confidence: 'BAIXA',
      summary: 'Triatge automàtic ha fallat: ' + (e.message || 'error desconegut'),
      cycles: [],
    };
  }
}

function Triage_normalize_(r) {
  return {
    intent: r.intent || 'ALTRES',
    tipus_oferta: r.tipus_oferta || 'NA',
    confidence: r.confidence || 'BAIXA',
    summary: (r.summary || '').slice(0, 400),
    cycles: Array.isArray(r.cycles) ? r.cycles.filter(function(c) {
      return Object.prototype.hasOwnProperty.call(CONFIG.GROUPS_BY_CYCLE, c);
    }) : [],
  };
}
