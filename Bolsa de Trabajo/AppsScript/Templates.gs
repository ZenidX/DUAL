/**
 * Templates.gs — Modelos extraídos de los 7 .docx originals.
 *
 * Convenció de placeholders: `{{NOM_VARIABLE}}`.
 * Després passar pel helper Templates_render(template, vars).
 *
 * Els fitxers `.docx` originals viuen a `Bolsa de Trabajo/MOD_*.docx` i són la
 * referència autoritativa per a contingut. Si es canvien allà, **cal sincronitzar manualment** aquí.
 */

const TEMPLATES = {
  // -----------------------------------------------------------------------------
  // 1) MOD_mail informació oferta alumnat — distribució d'oferta laboral al Group
  // -----------------------------------------------------------------------------
  OFERTA_LABORAL_AL_GROUP: {
    subject: 'Oferta laboral',
    body:
`Benvolgut/da,

Ens posem en contacte amb tu per informar-te de l'existència de la següent oferta laboral que pot ser del teu interès: "{{LLOC_TREBALL}}" per a l'empresa {{NOM_EMPRESA}}.

Els detalls de l'oferta són els següents:
{{DETALLS_OFERTA}}

{{ENLLAC_OFERTA_OPT}}

Salutacions,

Borsa de treball Institut TIC de Barcelona

{{GDPR_FOOTER}}`,
  },

  // -----------------------------------------------------------------------------
  // 2) MOD_mail oferta mobilitat alumnat — distribució de beca de mobilitat al Group
  // -----------------------------------------------------------------------------
  OFERTA_MOBILITAT_AL_GROUP: {
    subject: 'Oferta de mobilitat',
    body:
`Benvolgut/da,

Ens posem en contacte amb tu per informar-te de l'existència de la següent oferta de beca per mobilitat que pot ser del teu interès: "{{LLOC_BECA}}" per a l'empresa {{NOM_EMPRESA}}.

Els detalls de l'oferta són els següents:

{{DETALLS_OFERTA}}

Salutacions,

Borsa de treball Institut TIC de Barcelona

{{GDPR_FOOTER}}`,
  },

  // -----------------------------------------------------------------------------
  // 3) MOD_mail agraiment empresa — resposta a l'empresa un cop distribuïda
  // -----------------------------------------------------------------------------
  AGRAIMENT_EMPRESA: {
    subject: 'Oferta borsa de treball',
    body:
`Benvolgut/da,

Agraïm la seva participació a la borsa de treball de l'Institut TIC de Barcelona amb la inscripció de l'oferta "{{OFERTA_DESC}}". Procedim a proporcionar l'esmentada oferta als perfils professionals als que correspon.

Aprofitem l'avinentesa per agrair la confiança i la participació.

Salutacions,

Borsa de treball Institut TIC de Barcelona

{{GDPR_FOOTER_EMPRESA}}`,
  },

  // -----------------------------------------------------------------------------
  // 4) MOD_mail oferiment inscripció — resposta inicial amb adjunt cessió
  // -----------------------------------------------------------------------------
  INSCRIPCIO_OFERIMENT: {
    subject: 'Inscripció borsa de treball',
    body:
`Benvolgut/da,

Ens posem en contacte amb tu per oferir-te la possibilitat d'inscriure't a la borsa de treball de l'institut.

Si tens interès en inscriure't a la borsa cal que ens escriguis un correu electrònic a aquesta adreça (borsa.treball@iticbcn.cat) adjuntant el teu currículum actualitzat en format pdf, el document de cessió de dades personals i professionals que adjuntem degudament completat i signat (pdf) i indicant un correu electrònic personal diferent al de l'institut.

Un cop realitzats els tràmits esmentats t'inscriurem a la borsa i rebràs les ofertes corresponents al teu cicle formatiu que vagin publicant les empreses per tal que puguis participar en el procés de selecció de les mateixes en cas que siguin del teu interès.

Salutacions,

Borsa de treball Institut TIC de Barcelona

{{GDPR_FOOTER}}`,
  },

  // -----------------------------------------------------------------------------
  // 5) MOD_mail formalitzant inscripció — confirmació final
  // -----------------------------------------------------------------------------
  INSCRIPCIO_FORMALITZANT: {
    subject: 'Formalitzada inscripció borsa de treball',
    body:
`Benvolgut/da,

Et comuniquem que ha estat formalitzada la teva inscripció a la borsa de treball de l'Institut TIC de Barcelona.

A partir d'aquest moment rebràs les ofertes corresponents al teu cicle formatiu que vagin publicant les empreses per tal que puguis participar en el procés de selecció de les mateixes en cas que siguin del teu interès.

Salutacions,

Borsa de treball Institut TIC de Barcelona

{{GDPR_FOOTER}}`,
  },

  // -----------------------------------------------------------------------------
  // 6) MOD_resposta mail demanant feina — candidat extern
  // -----------------------------------------------------------------------------
  CANDIDAT_EXTERN: {
    subject: 'Sobre la seva sol·licitud',
    body:
`Bona tarda,

Sentim comunicar-te que la contractació de personal de l'Institut la realitza el Consorci d'Educació de Barcelona al tractar-se d'un institut públic.

Atentament,

Borsa de treball Institut TIC de Barcelona

{{GDPR_FOOTER}}`,
  },
};

// -----------------------------------------------------------------------------
// Peu RGPD compartit per (gairebé) tots els correus a alumnes
// -----------------------------------------------------------------------------
const GDPR_FOOTER =
`En compliment d'allò que estableix la normativa vigent en matèria de Protecció de Dades, t'informem que les dades recollides per accedir a la borsa de treball, s'incorporaran, per ser tractades, en un fitxer automatitzat propietat de l'Institut TIC de Barcelona, amb la finalitat d'atendre la teva sol·licitud.
Et recordem que pots exercir en qualsevol moment els drets d'accés, rectificació, cancel·lació i oposició als nostres fitxers de dades de caràcter personal i professional davant l'Institut TIC de Barcelona (carrer Sancho d'Àvila 131, Barcelona) o per correu electrònic a l'adreça borsa.treball@iticbcn.cat.`;

// Variant del peu adreçada a empreses (tractament formal "li" en lloc de "et")
const GDPR_FOOTER_EMPRESA =
`En compliment d'allò que estableix la normativa vigent en matèria de Protecció de Dades, l'informem que les dades recollides per a la publicació d'ofertes a la borsa de treball, s'incorporaran, per ser tractades, en un fitxer automatitzat propietat de l'Institut TIC de Barcelona, amb la finalitat d'atendre la seva sol·licitud.
Li recordem que pot exercir en qualsevol moment els drets d'accés, rectificació, cancel·lació i oposició als nostres fitxers de dades de caràcter personal i professional davant l'Institut TIC de Barcelona (carrer Sancho d'Àvila 131, Barcelona) o per correu electrònic a l'adreça borsa.treball@iticbcn.cat.`;

/**
 * Renderitza una plantilla substituint `{{VAR}}` pels valors de `vars`.
 * Sempre injecta GDPR_FOOTER i GDPR_FOOTER_EMPRESA.
 *
 * @param {{subject: string, body: string}} template
 * @param {Object<string,string>} vars
 * @returns {{subject: string, body: string}}
 */
function Templates_render(template, vars) {
  const allVars = Object.assign({
    GDPR_FOOTER: GDPR_FOOTER,
    GDPR_FOOTER_EMPRESA: GDPR_FOOTER_EMPRESA,
    ENLLAC_OFERTA_OPT: '',
  }, vars || {});
  const renderOne = function(text) {
    return text.replace(/\{\{(\w+)\}\}/g, function(match, key) {
      return Object.prototype.hasOwnProperty.call(allVars, key) ? String(allVars[key]) : match;
    });
  };
  return {
    subject: renderOne(template.subject),
    body: renderOne(template.body),
  };
}

/**
 * Localitza el fitxer `MOD_carta cessió de dades.docx` al Drive de l'owner i el retorna com a Blob
 * per adjuntar-lo a un correu. La primera vegada cal **pujar manualment** el .docx al Drive de
 * `borsa.treball@iticbcn.cat` (o crear una còpia al folder configurat).
 *
 * @returns {GoogleAppsScript.Base.Blob}
 */
function Templates_carteCessioBlob() {
  const fileName = 'MOD_carta cessió de dades.docx';
  const files = DriveApp.getFilesByName(fileName);
  if (!files.hasNext()) {
    throw new Error('No s\'ha trobat el fitxer "' + fileName + '" al Drive de l\'owner. ' +
      'Pujar-lo manualment a Drive abans d\'activar el flow.');
  }
  return files.next().getBlob();
}
