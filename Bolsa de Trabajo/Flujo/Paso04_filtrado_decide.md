# Paso 04 — Filtrat (Decide)

> **Un node per fitxer.** Aquest document descriu **només** el gate booleà que decideix si el correu
> mereix accions posteriors.

---

## 1. Identificació

| Camp | Valor |
|---|---|
| **Nom del node al canvas** | `Filtrat — Seguir?` |
| **Tipus de node (UI)** | AI Step → **Decide** |
| **Posició al flow** | 04 |
| **Flow al qual pertany** | `Borsa — Triatge d'entrada` |

---

## 2. Propòsit

Tallar el flow aquí per als correus que no mereixen cap acció posterior (bàsicament els que el Gem
del Paso 02 ha marcat `intent_hint=IGNORE`, i també els ambigus amb confiança baixa i cap pista
d'intent útil).

**Important:** tant si es continua com si s'atura, la fila al Sheet ja existeix (Paso 03); la decisió
d'aquest node només afecta si s'aplica la label d'intent del Paso 05.

---

## 3. Configuració

### 3.1 Camps del node al flow

| Camp UI | Valor |
|---|---|
| **Condition prompt** | Veure bloc de sota |
| **Input context** | Veure bloc "Input que es passa al Decide" |

### 3.2 Prompt del Decide (copiar-enganxar al camp *Condition*)

```
Has de decidir si aquest correu mereix continuar sent processat pel flow de
la borsa de treball.

Retorna SÍ si:
- intent_hint és OFERTA, INSCRIPCIO, CESSIO, CANDIDAT_EXTERN o SEGUIMENT.
- intent_hint és ALTRES i confidence_hint és ALTA o MITJA (cal revisió).
- intent_hint està buit o absent però el cos sembla tenir contingut útil
  (més enllà d'una signatura o una resposta d'una sola paraula).

Retorna NO si:
- intent_hint és IGNORE.
- intent_hint és ALTRES amb confidence_hint BAIXA i el cos és curt o buit.
- El cos només conté quoted text, signatures, disclaimers o imatges, sense
  informació nova.
```

### 3.3 Input que es passa al Decide

El camp *Context* del node `Decide` ha de rebre explícitament les variables rellevants:

```
intent_hint: {{triatge.intent_hint}}
confidence_hint: {{triatge.confidence_hint}}
resum_breu: {{triatge.resum_breu}}

Cos del correu:
"""
{{email.body}}
"""
```

---

## 4. Prompt / expressió

El prompt complet del gate és el de la secció 3.2. No hi ha expressió lògica determinista — la decisió
és de l'IA.

---

## 5. Inputs

| Variable | Origen | Ús |
|---|---|---|
| `triatge.intent_hint` | Paso 02 | Senyal principal |
| `triatge.confidence_hint` | Paso 02 | Modula decisions a `ALTRES` |
| `triatge.resum_breu` | Paso 02 | Context addicional |
| `email.body` | Paso 00 | Fallback quan el Gem no dóna pistes |

---

## 6. Outputs

El `Decide` retorna **booleà** intern que controla si el flow continua o s'atura:

- `true` → el flow executa el Paso 05.
- `false` → el flow acaba aquí (el Paso 05 no s'executa; cap label d'intent s'aplica).

**No exposa cap variable** per als nodes posteriors. Les variables generades dins d'un conditional
branch no es propaguen al main flow (limitació documentada de Workspace Studio), per tant no cal
intentar-ho.

---

## 7. El que aquest node **NO** fa

- No escriu al Sheet (això ho ha fet el Paso 03).
- No canvia l'`estat` de la fila al Sheet de `PENDENT` a `IGNORE`. Això caldria fer-ho amb un `Update
  Row` condicional, que complica; es deixa `PENDENT` i el Sheet s'interpreta així:
  **`estat=PENDENT` + `intent_hint=IGNORE` ≡ descartat per Decide.**
- No afegeix cap label a Gmail.
- No envia notificacions.
- No dóna cap motiu textual de la decisió: el Decide retorna només `true`/`false`.

---

## 8. Limitacions conegudes

- **Variables en branques no propagades:** si volguéssim, dins de la branca `false`, aplicar una label
  `borsa/ignorat`, caldria fer-ho dins la mateixa branca del Decide. Workspace Studio modela això com
  "el Decide atura", no com "if/else". Per això la label `borsa/ignorat` **no s'aplica aquí**; es pot
  afegir opcionalment com a flow separat que monitoritzi files del Sheet amb `intent_hint=IGNORE` i
  apliqui la label via Gmail → Modify label, però això seria un altre flow (no aquest document).
- **Decide consumeix crida IA:** és un altre cost a sumar sobre Paso 02. Si el volum ho justifica, es
  podria eliminar el Decide i fer el gate amb una fórmula al Sheet + un altre flow downstream que
  només reaccioni a files amb `intent_hint != IGNORE`. Per ara el mantenim perquè és el patró més
  net dins Workspace Studio.
- **Sense trasllat del motiu:** si volem saber *per què* el Decide ha rebutjat, no ho sabrem. L'única
  defensa és revisar el Sheet + el thread a Gmail.
- **Determinisme feble:** com que és IA, dos correus quasi idèntics poden rebre veredictes diferents
  si el model té soroll. Mitigar amb temperatures baixes (si la UI ho exposa) i prompt explícit.

---

## 9. Criteris d'acceptació

- [ ] Un correu amb `intent_hint=OFERTA` passa amb `true`.
- [ ] Un correu amb `intent_hint=IGNORE` atura el flow (`false`).
- [ ] Un correu amb `intent_hint=ALTRES` i `confidence_hint=BAIXA` i cos buit → `false`.
- [ ] Un correu amb `intent_hint=ALTRES` i `confidence_hint=ALTA` → `true` (cal revisió).
- [ ] El Paso 05 **no** s'executa quan el Decide retorna `false`.
- [ ] El Sheet manté la fila corresponent amb `estat=PENDENT` tant si el Decide ha dit `true` com
      `false` (el gate no toca el Sheet).

---

## 10. Preguntes obertes

1. ¿Volem un flow auxiliar que apliqui la label `borsa/ignorat` als correus rebutjats aquí? No és
   part d'aquest node.
2. ¿Substituïm el Decide per una regla determinista al Paso 05 (només s'aplica label si
   `intent_hint != IGNORE`)? Seria més barat i més determinista, però trenca el patró "un node, una
   responsabilitat". Valorar segons el cost real dels Decide.
3. ¿El prompt del Decide pot mirar `from_domain` per excloure més agressivament dominis de notificació
   (ex. `mailer-daemon@`)? Potser sí, afegir si veiem soroll.
4. ¿Temperatura configurable? Si la UI la exposa, baixar a 0 per a aquest node.
