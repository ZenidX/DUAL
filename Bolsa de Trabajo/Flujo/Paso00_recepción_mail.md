# Paso 00 — Recepción del mail

> **Un node per fitxer.** Aquest document descriu **només** el node *starter* del flow.

---

## 1. Identificació

| Camp | Valor |
|---|---|
| **Nom del node al canvas** | `Recepció de correu` |
| **Tipus de node (UI)** | Starter → **Gmail** → `When I get an email` |
| **Posició al flow** | 00 (starter, obligatori) |
| **Flow al qual pertany** | `Borsa — Triatge d'entrada` |

---

## 2. Propòsit

Disparar l'execució del flow cada vegada que arriba un correu a `borsa.treball@iticbcn.cat`, aplicant **només** els filtres que el propi starter permet (subject, sender, contingut, `HasAttachment`, amb lògica booleana).

Qualsevol altra validació (headers RFC, intent, OCR, quarantena d'adjunts) és responsabilitat de nodes posteriors.

---

## 3. Configuració

Valors literals a introduir a la UI real de Workspace Studio:

| Camp UI | Valor |
|---|---|
| **Account** | `borsa.treball@iticbcn.cat` |
| **Trigger event** | `When I get an email` |
| **Scope** (selector *Which messages to check*) | `All emails` |
| **"Has the words"** (filtre) | **Deixar buit** |

### Per què el filtre va buit

La UI del starter Gmail de Workspace Studio només exposa una caixa `Has the words` estil cerca de Gmail (inclusió positiva). **No** és un camp lliure d'expressions booleanes, i no està documentat com a fiable per a múltiples exclusions combinades (múltiples `-subject:"..."`).

Per això es deixa el starter **sense filtre** i es delega l'exclusió de patrons tipus "Out of office", "Undeliverable", "Automatic reply", etc. al node següent que sí pot fer aquesta classificació: el **Paso 02 (Gem Triatge borsa)**, que ja té l'intent `IGNORE` per a aquests casos.

### Alternatives al filtre buit (si cal limitar volum més endavant)

1. **Filtre natiu de Gmail** (fora de Workspace Studio): a Gmail → Configuració → Filtres, crear un filtre que afegeixi una label `borsa/soroll` als correus amb subject "Out of office"/"Undeliverable"/etc., i al starter configurar `Has the words: -label:borsa/soroll`. Robust i barat, però es manté fora del flow.
2. **"Has the words" positiu únic**: si es defineix un criteri d'inclusió clar (p. ex. només correus enviats a la bústia amb un cert prefix al subject), es pot escriure com a `Has the words` positiu. Per al nostre cas actual no aplica.
3. **Un node `Decide` dedicat abans del Paso 01** que només miri el subject i aturi el flow per als patrons exclosos. Més car que el filtre Gmail natiu, més car que fer-ho al Gem del Paso 02.

**Decisió actual:** `Scope = All emails`, camp buit, i confiem en el Gem del Paso 02 per marcar els casos soroll com a `IGNORE` (i que el Paso 04 Decide els aturi). Si a la pràctica es demostra que el volum és massa gran, passem a l'opció 1 (filtre Gmail natiu).

---

## 4. Prompt / expressió

No aplica — aquest node no té cap prompt ni cap expressió més enllà del filtre d'activació.

---

## 5. Inputs

No aplica — és el starter; no consumeix variables de cap pas anterior.

---

## 6. Outputs

Variables que el starter exposa als nodes posteriors (noms orientatius de la UI; **confirmar** al configurador real):

| Nom variable | Tipus | Descripció | Usada a |
|---|---|---|---|
| `email.sender` | string | Adreça + nom del remitent | Paso 02 (Gem Triatge), Paso 03 (Update Row) |
| `email.senderDomain` | string | Domini de l'adreça del remitent | Paso 02 (heurística empresa vs. particular) |
| `email.subject` | string | Assumpte del correu | Paso 02, Paso 03, Paso 04 |
| `email.body` | string (text pla) | Cos del missatge sense HTML | Paso 02, Paso 04 |
| `email.hasAttachment` | boolean | Indica presència d'adjunts | Paso 02, Paso 03 |
| `email.receivedDateTime` | datetime | Moment de recepció | Paso 03 |
| `email.messageId` | string | Identificador intern del missatge a Gmail | Paso 03 (clau per al backend futur) |
| `email.threadId` | string | Identificador de la conversa | Paso 01 (label), Paso 03, Paso 05 |

> **Supòsit:** si Workspace Studio **no** exposa `messageId` o `threadId` directament, deixar els camps buits al Paso 03 i anotar-ho com a bloqueig. No intentar derivar-los aquí.

---

## 7. El que aquest node **NO** fa

- No inspecciona headers RFC (`Auto-Submitted`, `List-Unsubscribe`, `Precedence`, `In-Reply-To`, `References`). El starter no els exposa.
- No descarrega ni analitza adjunts. Només retorna el flag `hasAttachment`.
- No classifica intent (oferta/inscripció/cessió…). Això és el Paso 02.
- No consulta el Sheet de cua. Això és el Paso 03.
- No etiqueta el thread. Això és el Paso 01 i el Paso 05.
- No envia res ni crea drafts.
- No atura per contingut ambigu: això és el Paso 04 (Decide).

---

## 8. Limitacions conegudes

- **Camp `Has the words` bàsic:** només accepta una cadena estil cerca de Gmail. Múltiples exclusions amb expressions booleanes NO són viables al starter. Per això el filtre de soroll s'ha mogut al Paso 02.
- **Sense headers crus:** el starter no exposa `Auto-Submitted`, `List-Unsubscribe`, `Precedence`, `In-Reply-To`, `References`.
- **Quota:** màxim ~25 flows actius amb starter Gmail per usuari. Aquest flow gasta 1.
- **Permisos:** el flow s'executa amb permisos de l'owner. El compte `borsa.treball@` ha de ser l'owner per tenir accés nadiu a la bústia.
- **Shared mailbox:** si `borsa.treball@` és només un alias de Google Group, el starter Gmail pot no funcionar. Ha de ser un usuari Workspace de ple dret. *Cal verificar.*
- **Correus reenviats:** si un altre compte reenvia a aquesta bústia, el starter s'activa igualment; el Gem del Paso 02 haurà de detectar-ho pel contingut.
- **Latència:** el starter no és estrictament real-time; pot tenir retard de fins a uns minuts (no configurable per l'usuari).

---

## 9. Criteris d'acceptació

- [ ] El flow es dispara en rebre **qualsevol** correu (incloent autorespostes i notificacions) — l'exclusió d'aquests casos la fa el Paso 02 Gem + Paso 04 Decide, no el starter.
- [ ] Les variables llistades a la secció *Outputs* són accessibles al Paso 01 (test: afegir una acció temporal *Add comment* mostrant `{{email.subject}}` i verificar que imprimeix).
- [ ] El node no fa cap side effect (no afegeix label, no escriu al Sheet, no envia drafts).
- [ ] Si es detecta que el volum de soroll és massa gran, activar un filtre natiu a Gmail (fora del flow) amb label `borsa/soroll` i afegir `Has the words: -label:borsa/soroll` al starter.

---

## 10. Preguntes obertes

1. ¿`borsa.treball@iticbcn.cat` és un usuari Workspace amb llicència que inclou Workspace Studio? (Admin Workspace)
2. ¿Pot ser owner d'un flow? (Admin Workspace)
3. ¿La UI de Workspace Studio exposa `messageId` i `threadId` com a variables natives del starter Gmail? (cal confirmar obrint la UI)
4. Llista definitiva de patrons de subject a excloure — ampliar amb casos reals que apareguin en producció.
5. ¿Hi ha manera de detectar al starter si un correu és reenviat per un altre compte (p. ex. remitent `iticbcn.cat`)? Si sí, es podria excloure abans.
