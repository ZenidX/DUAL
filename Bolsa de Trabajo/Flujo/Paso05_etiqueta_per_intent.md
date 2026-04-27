# Paso 05 — Etiqueta per intent

> **Un node per fitxer.** Aquest document descriu **només** l'últim node del flow, que aplica una
> label específica segons l'intent detectat.

---

## 1. Identificació

| Camp | Valor |
|---|---|
| **Nom del node al canvas** | `Etiqueta per intent` |
| **Tipus de node (UI)** | Action → **Gmail** → `Add label` |
| **Posició al flow** | 05 (últim; només s'executa si el Paso 04 ha dit `true`) |
| **Flow al qual pertany** | `Borsa — Triatge d'entrada` |

---

## 2. Propòsit

Aplicar al thread de Gmail una label que depèn de `triatge.intent_hint`. Aquesta label serà el
**semàfor** que dispararà els **flows posteriors** (encara per dissenyar, un per intent) que faran la
feina real (crear drafts, demanar documents, validar cessions, etc.).

Motius per etiquetar ara enlloc d'etiquetar més tard:

1. Deixa la bústia visualment organitzada immediatament.
2. Permet que els flows downstream facin servir **Gmail starter amb filtre per label** com a
   disparador (és la primitiva més natural i estable per encadenar flows a Workspace Studio).
3. Serveix de cerca ràpida per al tutor humà ("dona'm totes les ofertes d'aquesta setmana").

---

## 3. Configuració

### 3.1 Mapping intent → label

| `triatge.intent_hint` | Label a aplicar |
|---|---|
| `OFERTA` | `borsa/oferta` |
| `INSCRIPCIO` | `borsa/inscripcio` |
| `CESSIO` | `borsa/cessio` |
| `CANDIDAT_EXTERN` | `borsa/extern` |
| `SEGUIMENT` | `borsa/seguiment` |
| `ALTRES` | `borsa/altres` |
| *(qualsevol altre valor o buit)* | `borsa/altres` (fallback) |

> **Important:** `IGNORE` no apareix perquè el Paso 04 ja ha aturat el flow en aquest cas; aquest
> node no s'executa per correus ignorats.

### 3.2 Implementació a Workspace Studio

Com que Workspace Studio **no suporta conditionals niuats ni loops dins del flow principal**, hi ha
dues opcions per resoldre el mapping:

#### Opció A (preferida): expressió inline al camp `Label name`

Configurar el node `Add label` amb una sola expressió que seleccioni la label correcta en funció de
la variable:

```
IF triatge.intent_hint == "OFERTA"           THEN "borsa/oferta"
ELSE IF triatge.intent_hint == "INSCRIPCIO"  THEN "borsa/inscripcio"
ELSE IF triatge.intent_hint == "CESSIO"      THEN "borsa/cessio"
ELSE IF triatge.intent_hint == "CANDIDAT_EXTERN" THEN "borsa/extern"
ELSE IF triatge.intent_hint == "SEGUIMENT"   THEN "borsa/seguiment"
ELSE                                          "borsa/altres"
```

La sintaxi exacta depèn de com Workspace Studio permeti escriure expressions als camps (pot ser
estil *Apps Script expression*, *Sheet formula*, o una UI visual de "switch"). Si la UI no ho permet,
usar **Opció B**.

#### Opció B (fallback): un sol `Ask Gemini` previ que retorni la label

Afegir un micro-node `Ask Gemini` just abans (entre Paso 04 i aquest Paso 05) amb aquest prompt:

```
Donat l'intent "{{triatge.intent_hint}}", retorna exactament la label Gmail
corresponent segons aquest mapping:
  OFERTA → borsa/oferta
  INSCRIPCIO → borsa/inscripcio
  CESSIO → borsa/cessio
  CANDIDAT_EXTERN → borsa/extern
  SEGUIMENT → borsa/seguiment
  tot altre valor → borsa/altres

Retorna NOMÉS la label, sense cometes ni explicacions.
```

Sortida: variable `label.name`. El node `Add label` fa servir `{{label.name}}`.

Això consumeix un micro-step extra però és resistent a manques expressives de la UI. El fitxer
d'aquest node descriu l'opció que finalment s'implementi; actualment es prefereix A i es documenta B
com a pla B.

### 3.3 Camps del node `Add label`

| Camp UI | Valor |
|---|---|
| **Account** | `borsa.treball@iticbcn.cat` |
| **Target** | Thread del correu entrant |
| **Thread ID** | `{{email.threadId}}` |
| **Label name** | Segons Opció A (expressió) o Opció B (`{{label.name}}`) |
| **Create label if it doesn't exist** | `true` |

---

## 4. Prompt / expressió

Opció A: expressió de la secció 3.2.
Opció B: prompt descrit a 3.2.

---

## 5. Inputs

| Variable | Origen | Ús |
|---|---|---|
| `triatge.intent_hint` | Paso 02 | Determinar la label |
| `email.threadId` | Paso 00 | Target del `Add label` |
| `label.name` (només si Opció B) | Micro-node `Ask Gemini` previ | Label resolta |

---

## 6. Outputs

Cap variable nova. El side effect és l'aplicació de la label al thread.

---

## 7. El que aquest node **NO** fa

- No envia correus ni crea drafts.
- No actualitza el Sheet (l'`estat` al Sheet no canvia per això).
- No elimina la label `borsa/capturat` ja aplicada al Paso 01 — conviuen.
- No crida Google Groups ni afegeix membres.
- No dispara directament cap flow downstream: només deixa la label que els flows downstream podran
  usar com a starter filter.

---

## 8. Limitacions conegudes

- **Sintaxi d'expressions a la UI:** si Workspace Studio no admet un `IF/ELSE IF` inline al camp
  `Label name`, cal Opció B (cost: una crida Gemini extra).
- **Creació automàtica de labels:** si el connector no suporta `Create label if it doesn't exist`,
  totes les labels han d'estar pre-creades manualment (veure Paso 01 per a la llista).
- **Propagació label-thread:** Gmail propaga la label aplicada a un missatge a tot el thread. Això
  implica que si el correu és una resposta a una conversa anterior, la label es pot aplicar a
  missatges anteriors del mateix thread. És desitjable: el thread queda uniformement categoritzat.
- **Collisions amb labels `borsa/capturat`:** totes dues conviuen (un thread tindrà `borsa/capturat`
  + `borsa/<intent>`). Això és el comportament esperat.
- **No rollback:** si el node falla, no hi ha label per intent aplicada però `borsa/capturat` ja hi
  és. L'estat parcial és visible i recuperable manualment.

---

## 9. Criteris d'acceptació

- [ ] Un correu amb `intent_hint=OFERTA` acaba amb label `borsa/oferta` aplicada.
- [ ] Un correu amb `intent_hint=INSCRIPCIO` acaba amb label `borsa/inscripcio`.
- [ ] Un correu amb `intent_hint=CESSIO` acaba amb label `borsa/cessio`.
- [ ] Un correu amb `intent_hint=CANDIDAT_EXTERN` acaba amb label `borsa/extern`.
- [ ] Un correu amb `intent_hint=SEGUIMENT` acaba amb label `borsa/seguiment`.
- [ ] Un correu amb `intent_hint=ALTRES` o valor no reconegut acaba amb label `borsa/altres`.
- [ ] Un correu amb `intent_hint=IGNORE` **no** passa per aquest node (el Paso 04 l'ha aturat).
- [ ] Totes les labels conviuen amb `borsa/capturat` sense substituir-la.

---

## 10. Preguntes obertes

1. ¿Workspace Studio admet expressions inline tipus `IF/ELSE IF` als camps d'acció, o cal Opció B?
   **Bloqueja la decisió de disseny d'aquest node.**
2. ¿Volem una label `borsa/processat` que s'apliqui aquí com a marca de "ha passat pel triatge
   complet"? Seria redundant amb `borsa/<intent>` però útil per a mètriques agregades.
3. ¿Cal versionar les labels (`borsa/oferta/v2`, …) quan canviem la taxonomia d'intents? Per ara no.
4. Els flows downstream han de disparar-se per **label Gmail** o per **fila nova al Sheet**? La
   presència d'aquesta label ho deixa obert; tots dos camins són viables i es decidiran quan
   dissenyem els flows de processament.

---

## 11. Fi del flow

Aquest és l'últim node del flow `Borsa — Triatge d'entrada`. Els passos següents es faran a **flows
separats** amb starters propis, que es documentaran com a nous `.md` sota una altra carpeta o un
subdirectori quan s'arribi allà (p. ex. `Flujo/Borsa_Processar_Oferta/Paso00_…md`).

Resultat final esperat d'una execució completa:

- Thread a Gmail amb labels `borsa/capturat` + `borsa/<intent>`.
- Fila al Sheet `BorsaInbox_Queue` amb `estat=PENDENT` i totes les metadades i hints del Gem.
- Cap acció externa (cap correu enviat, cap membre afegit a cap grup, cap document generat) — totes
  elles són responsabilitat dels flows posteriors.
