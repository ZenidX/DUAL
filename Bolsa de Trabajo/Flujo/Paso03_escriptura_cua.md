# Paso 03 — Escriptura a la cua (Google Sheet)

> **Un node per fitxer.** Aquest document descriu **només** el node que afegeix una fila al Sheet
> `BorsaInbox_Queue`.

---

## 1. Identificació

| Camp | Valor |
|---|---|
| **Nom del node al canvas** | `Escriure a la cua` |
| **Tipus de node (UI)** | Action → **Google Sheets** → `Update Row` (mode *append new row*) |
| **Posició al flow** | 03 |
| **Flow al qual pertany** | `Borsa — Triatge d'entrada` |

> Si la UI de Workspace Studio separa `Add Row` i `Update Row` com a connectors diferents, escollir
> el que faci **append** (afegir una nova fila). En aquesta documentació, "Update Row (append)" es
> refereix a aquesta operació.

---

## 2. Propòsit

Deixar **constància persistent** de cada correu que ha superat el starter i el triatge, amb totes les
dades que pot recollir el flow:

- Metadades del correu (remitent, assumpte, timestamps, ids Gmail).
- Resultat del Gem del Paso 02 (intent_hint, confiança, resum, cicles).
- Estat inicial `PENDENT` per a que els flows posteriors (futurs) puguin processar.

S'escriu **sempre**, també per a correus que el Paso 04 (Decide) acabarà aturant (intent `IGNORE`),
perquè així es guarda traça de tots els correus vistos i es pot iterar el prompt del Gem amb exemples
reals.

---

## 3. Configuració

### 3.1 Sheet destí

| Paràmetre | Valor |
|---|---|
| **Spreadsheet** | `BorsaInbox_Queue` |
| **Propietari** | L'owner del flow (`borsa.treball@iticbcn.cat` segons decisió de S1/S2 del Paso 00) |
| **Ubicació** | Drive privat de l'owner → carpeta `/Borsa de treball/Workspace Studio/` |
| **Compartició** | No compartit amb cap altre usuari (Workspace Studio només treballa sobre fitxers privats) |
| **Pestanya** | `Inbox` |

### 3.2 Columnes del Sheet (capçalera a la fila 1)

Crear la capçalera amb aquests noms **exactes** abans d'activar el flow (l'ordre importa):

| Col. | Nom | Tipus esperat | Origen del valor |
|---|---|---|---|
| A | `queue_id` | text (UUID) | Generat al flow (veure 3.3) |
| B | `rebut_at` | datetime ISO | `{{email.receivedDateTime}}` |
| C | `gmail_message_id` | text | `{{email.messageId}}` |
| D | `thread_id` | text | `{{email.threadId}}` |
| E | `from_email` | text | `{{email.sender}}` |
| F | `from_domain` | text | `{{email.senderDomain}}` |
| G | `subject` | text | `{{email.subject}}` |
| H | `has_attachment` | boolean | `{{email.hasAttachment}}` |
| I | `intent_hint` | text | `{{triatge.intent_hint}}` |
| J | `confidence_hint` | text | `{{triatge.confidence_hint}}` |
| K | `resum_breu` | text | `{{triatge.resum_breu}}` |
| L | `cicles_hint` | text | `{{triatge.cicles_hint}}` |
| M | `estat` | text (enum) | Literal `PENDENT` |
| N | `creat_at_flow` | datetime | Funció `NOW()` o variable del flow |
| O | `flow_run_id` | text | Identificador de l'execució del flow (si la UI l'exposa); altrament, buit |

### 3.3 Configuració del node al flow

| Camp UI | Valor |
|---|---|
| **Spreadsheet** | `BorsaInbox_Queue` |
| **Sheet name** | `Inbox` |
| **Operation** | `Append row` (o equivalent `Update Row → Append`) |
| **Values** | Mapping columna a columna (taula de la secció 3.2) |

### 3.4 Generació del `queue_id`

Workspace Studio no té una funció `UUID()` nativa garantida. Opcions, per ordre de preferència:

1. **Fórmula al Sheet:** a la columna A, la capçalera pot ser un `ARRAYFORMULA` que genera UUID a
   partir del hash del `gmail_message_id` (p. ex. `=LEFT(SHA256(C2), 16)`). El flow escriu la columna
   A buida i el Sheet ompla.
2. **Concatenació al flow:** `queue_id = {{email.messageId}}_{{email.receivedDateTime}}` — no és UUID
   pur però és únic i es pot referenciar.
3. **Sense `queue_id`:** el Sheet usa el número de fila com a identificador implícit.

Per defecte adoptem l'**opció 2** (la més simple sense tocar el Sheet).

---

## 4. Prompt / expressió

No aplica — és una acció determinista.

---

## 5. Inputs

| Variable | Origen | Columna destí |
|---|---|---|
| `email.receivedDateTime` | Paso 00 | B |
| `email.messageId` | Paso 00 | C |
| `email.threadId` | Paso 00 | D |
| `email.sender` | Paso 00 | E |
| `email.senderDomain` | Paso 00 | F |
| `email.subject` | Paso 00 | G |
| `email.hasAttachment` | Paso 00 | H |
| `triatge.intent_hint` | Paso 02 | I |
| `triatge.confidence_hint` | Paso 02 | J |
| `triatge.resum_breu` | Paso 02 | K |
| `triatge.cicles_hint` | Paso 02 | L |

---

## 6. Outputs

Cap variable nova per als nodes posteriors. Només un side effect: una fila afegida al Sheet.

(Si la UI de Workspace Studio exposa la referència a la fila creada — p. ex. `sheet.rowNumber` — es pot
conservar com a `currentQueueRow` per a un hipotètic futur. Ara no s'utilitza.)

---

## 7. El que aquest node **NO** fa

- No escriu a cap base de dades externa (no MongoDB, no Firestore).
- No deduplica. Si el mateix correu dispara el flow dues vegades (escenari excepcional), s'afegeix
  dues files. Per a MVP és acceptable; la deduplicació es farà al port futur a SbidShow.
- No genera informes ni agregats sobre les files.
- No neteja files antigues. La retenció es farà amb un flow separat programat (schedule starter).
- No aplica labels a Gmail ni envia drafts.

---

## 8. Limitacions conegudes

- **Fitxers privats:** el Sheet ha d'estar al Drive personal de l'owner del flow, no a un Shared Drive
  ni compartit amb cap altre usuari. Si es vol que més persones vegin els resultats, cal que cada una
  es connecti al Sheet via enllaç públic de sola lectura (configurat a posteriori) o mitjançant una
  còpia sincronitzada — però **el flow** només pot tocar el fitxer privat.
- **Permisos:** qualsevol persona amb accés al Sheet veurà dades potencialment sensibles
  (remitents, resums). Cal respectar RGPD: si es comparteix, anonimitzar o restringir.
- **Quota de Google Sheets API:** no és un problema a aquest volum, però amb milers de files/dia
  podríem topar amb límits d'execució d'scripts associats.
- **Creació del Sheet:** el Sheet no es crea automàticament pel flow; cal crear-lo manualment amb la
  capçalera exacta abans d'activar.
- **Ordre de columnes fràgil:** si algú canvia l'ordre manualment, el flow escriurà valors a columnes
  equivocades. Congelar la fila 1 i protegir-la.
- **Sense transaccions:** si aquest node falla i es reintenta, pot quedar una fila orfe amb dades
  incompletes. Assumible per a MVP.

---

## 9. Criteris d'acceptació

- [ ] Per cada correu que arriba al Paso 03, s'afegeix **exactament una** fila nova al Sheet.
- [ ] Les 12 primeres columnes (A–L) porten dades reals (no `{{...}}` literals, no buits per errors
      de resolució de variables).
- [ ] La columna M (`estat`) val `PENDENT` sempre.
- [ ] La columna N (`creat_at_flow`) és un timestamp plausible del moment d'execució.
- [ ] La capçalera de la fila 1 mai s'altera.
- [ ] Files amb `intent_hint=IGNORE` també apareixen al Sheet (auditoria completa).

---

## 10. Preguntes obertes

1. ¿Quina versió del Sheets connector exposa Workspace Studio? La UI i els camps canvien entre versions.
2. ¿`Append row` és el nom literal a la UI? Confirmar.
3. ¿Volem un camp `processat_at` (columna addicional) que el futur flow de processament ompli quan
   agafi la fila? Per ara no, però és fàcil afegir-lo a la capçalera.
4. ¿Cal una pestanya separada `Ignored` on es redireccionin les files amb `intent_hint=IGNORE`?
   Valorable per a claredat visual; per ara tot va a `Inbox`.
5. ¿Retenció de dades al Sheet: quant de temps? Cal un flow programat de purga (fora de l'abast d'aquest node).
