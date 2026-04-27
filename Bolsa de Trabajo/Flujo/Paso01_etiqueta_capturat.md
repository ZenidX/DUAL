# Paso 01 — Etiquetar thread com a "borsa/capturat"

> **Un node per fitxer.** Aquest document descriu **només** el node d'etiquetatge Gmail immediatament
> posterior al starter.

---

## 1. Identificació

| Camp | Valor |
|---|---|
| **Nom del node al canvas** | `Etiqueta capturat` |
| **Tipus de node (UI)** | Action → **Gmail** → `Add label` |
| **Posició al flow** | 01 (primer step després del starter) |
| **Flow al qual pertany** | `Borsa — Triatge d'entrada` |

---

## 2. Propòsit

Marcar el thread original amb la label `borsa/capturat` **abans** de qualsevol pas d'IA. Això garanteix que, si el Gem o el Sheet fallen més endavant, el correu ja queda identificat a la bústia com a "el flow l'ha vist", i el tutor pot localitzar fàcilment els correus que han entrat al pipeline.

Aquest pas és ràpid, barat i no depèn de cap decisió prèvia.

---

## 3. Configuració

| Camp UI | Valor |
|---|---|
| **Account** | `borsa.treball@iticbcn.cat` (mateix que el starter) |
| **Target** | Thread del correu entrant |
| **Thread ID** | `{{email.threadId}}` (variable del Paso 00) |
| **Label name** | `borsa/capturat` |
| **Create label if it doesn't exist** | `true` |

> **Supòsit:** la UI de Workspace Studio permet referenciar el thread del starter mitjançant la variable exposada. Si el connector `Add label` només accepta un `messageId`, canviar el camp *Target* a `{{email.messageId}}` (l'efecte visual a Gmail és equivalent quan la label s'aplica a un missatge dins d'un thread: Gmail propaga la label al thread sencer).

### Creació prèvia manual de la label

Abans d'activar el flow, crear manualment a Gmail les labels del namespace `borsa/` perquè apareguin ordenades:

- `borsa/capturat`
- `borsa/oferta`
- `borsa/inscripcio`
- `borsa/cessio`
- `borsa/extern`
- `borsa/seguiment`
- `borsa/altres`
- `borsa/ignorat`
- `borsa/error`
- `borsa/revisar`

La label `borsa/` sense sufix pot crear-se també com a "carpeta mare" per agrupar visualment.

---

## 4. Prompt / expressió

No aplica — és una acció determinista de Gmail, sense IA.

---

## 5. Inputs

| Variable | Origen | Ús |
|---|---|---|
| `email.threadId` (o `email.messageId` com a fallback) | Paso 00 (starter Gmail) | Identificar el thread a etiquetar |

---

## 6. Outputs

Aquest node **no produeix variables** noves per als passos posteriors. Només té un side effect a Gmail.

(Si Workspace Studio exposa un confirmat de l'execució com `actionSucceeded: true`, es pot consultar als logs del flow per a debug, però no es referencia als nodes següents.)

---

## 7. El que aquest node **NO** fa

- No classifica el contingut.
- No elimina cap altra label existent.
- No mou el thread a cap carpeta ni arxiva res.
- No envia cap correu de resposta.
- No depèn del veredicte del Decide (encara no ha passat): s'aplica a **tots** els correus que supera el starter, també els que després seran rebutjats al Paso 04.

---

## 8. Limitacions conegudes

- **Creació de labels:** si la label no existeix i el connector no té l'opció *Create label if it doesn't exist*, caldrà pre-crear-la manualment (instruccions a la secció 3).
- **Propagació a thread vs. missatge:** Gmail aplica labels a missatges; el "label del thread" és la unió de labels dels seus missatges. Etiquetar només el missatge entrant és suficient a efectes pràctics.
- **Sense rollback automàtic:** si un pas posterior falla, aquesta label **no** es retira; quedarà el rastre `borsa/capturat` al thread. Es considera desitjable per a auditoria.
- **Límits de quota Gmail:** les operacions *modify label* tenen quota. Per al volum esperat (desenes de correus/dia) és irrellevant.

---

## 9. Criteris d'acceptació

- [ ] Tot correu que arriba al Paso 01 surt amb la label `borsa/capturat` aplicada al seu thread.
- [ ] La label es crea automàticament si no existeix (o ja està pre-creada manualment).
- [ ] El Paso 02 s'executa després amb èxit (aquest pas no bloqueja el flow).
- [ ] Un error al connector d'aquest node fa que el flow aturi i quedi visible als logs de Workspace Studio.

---

## 10. Preguntes obertes

1. ¿El connector Gmail *Add label* de Workspace Studio accepta `threadId` com a target, o només `messageId`? Verificar al configurador real.
2. ¿Hem de col·locar aquest node **abans** o **després** del Paso 02 (Gem Triatge)? Actualment està abans per garantir traça; si es veu que consumeix massa latència del flow, es pot moure.
3. ¿Volem afegir també una label `borsa/` (pare) a més de `borsa/capturat` per a vistes jeràrquiques a Gmail? Gmail les gestiona com a labels independents separades per `/`.
