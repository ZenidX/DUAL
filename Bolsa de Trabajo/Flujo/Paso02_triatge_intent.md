# Paso 02 — Triatge d'intent (Ask a Gem)

> **Un node per fitxer.** Aquest document descriu **només** el node d'IA que fa la primera
> classificació del correu.

---

## 1. Identificació

| Camp | Valor |
|---|---|
| **Nom del node al canvas** | `Triatge intent` |
| **Tipus de node (UI)** | AI Step → **Ask a Gem** |
| **Gem invocat** | `Gem Triatge borsa` (Gem personalitzat, veure secció 3.2) |
| **Posició al flow** | 02 |
| **Flow al qual pertany** | `Borsa — Triatge d'entrada` |

---

## 2. Propòsit

Classificar **rapidísimament** el correu en una d'aquestes categories i retornar la informació mínima
que els nodes 03 (Sheet) i 04 (Decide) necessiten per funcionar:

- **Intent** del correu entre: `OFERTA`, `INSCRIPCIO`, `CESSIO`, `CANDIDAT_EXTERN`, `SEGUIMENT`,
  `IGNORE`, `ALTRES`.
- **Confiança** del Gem en la seva classificació: `ALTA` / `MITJA` / `BAIXA`.
- **Resum breu** (≤ 40 paraules) per a auditoria al Sheet.
- **Cicles formatius destí** quan siguin evidents a partir del contingut (p. ex. "busquem DAM junior"
  → `[DAM]`; si no es pot inferir, llista buida).

Aquest **no** és la classificació final; és un triatge suficient per decidir si cal continuar al
backend en el futur. La classificació fina (amb structured output JSON estricte) es farà quan es
porti la lògica a SbidShow; per ara, el que surti d'aquest Gem és la nostra millor aproximació.

---

## 3. Configuració

### 3.1 Camps del node al flow

| Camp UI | Valor |
|---|---|
| **Gem to use** | `Gem Triatge borsa` (seleccionar de la llista de Gems propis) |
| **Context / Input** | Veure bloc "Input que es passa al Gem" |
| **Output variable prefix** | `triatge` (perquè els nodes següents referenciïn `{{triatge.intent_hint}}`, etc.) |

### 3.2 Definició del Gem "Gem Triatge borsa"

El Gem es crea **una sola vegada** al Gem Manager de Workspace (fora del flow) amb aquests paràmetres:

**Nom:** `Gem Triatge borsa`

**Descripció curta:** `Classifica correus entrants a la borsa de treball de l'Institut TIC de Barcelona i n'extreu els camps mínims per al triatge.`

**Instruccions del Gem (copiar-enganxar):**

```
Ets l'assistent de triatge de la borsa de treball de l'Institut TIC de
Barcelona (iticbcn.cat).

Reps un correu i has de retornar SEMPRE la mateixa estructura de resposta, en
blocs separats per línies, sense text addicional fora d'aquests blocs:

INTENT_HINT: <un dels valors: OFERTA | INSCRIPCIO | CESSIO | CANDIDAT_EXTERN | SEGUIMENT | IGNORE | ALTRES>
CONFIDENCE_HINT: <un dels valors: ALTA | MITJA | BAIXA>
RESUM_BREU: <frase curta, màxim 40 paraules, en català>
CICLES_HINT: <llista separada per comes dels cicles detectats entre: ASIX, DAM, DAW, SMX, IABD, CEPYTHON; deixa buit si no s'identifica cap>

Criteris per a INTENT_HINT:
- OFERTA: una empresa ofereix un lloc de treball, pràctiques o beca de mobilitat.
- INSCRIPCIO: un alumne o ex-alumne demana inscriure's a la borsa.
- CESSIO: el correu inclou o fa referència a la carta de cessió de dades
  signada, com a retorn d'una sol·licitud prèvia.
- CANDIDAT_EXTERN: una persona externa (no alumne) envia CV demanant feina a
  l'institut.
- SEGUIMENT: consulta sobre una oferta, inscripció o document ja obert.
- IGNORE: auto-resposta o notificació de sistema, incloent (no exhaustiu):
    * Subject que conté "Out of office", "Fora d'oficina", "Resposta
      automàtica", "Automatic reply", "Respuesta automática".
    * Subject que conté "Undeliverable", "Delivery Status Notification",
      "Mail delivery failed", "Returned mail", "Failure notice".
    * Cos que només conté un acusament de rebut automàtic ("Gràcies pel
      vostre missatge, us respondrem aviat…").
    * Respostes curtes buides: "ok", "gràcies", "d'acord", "rebut".
    * Correus sense contingut nou més enllà de signatures, disclaimers o
      imatges.
- ALTRES: no encaixa clarament en cap dels anteriors.

Criteris per a CONFIDENCE_HINT:
- ALTA: el contingut és inequívoc (p. ex. "Us adjunto l'oferta de DAM junior").
- MITJA: el contingut dóna prou pistes però hi ha ambigüitat.
- BAIXA: no queda clar; el node següent hauria de revisar-ho.

Criteris per a CICLES_HINT:
- Usa NOMÉS els codis ASIX, DAM, DAW, SMX, IABD, CEPYTHON.
- Infereix a partir de paraules clau:
    ASIX        → administració sistemes, xarxes, servidors, devops, seguretat.
    DAM         → desenvolupament apps mòbils (Android/iOS), Kotlin, Swift.
    DAW         → desenvolupament web, frontend, backend web, full stack.
    SMX         → suport microinformàtic, tècnic sistemes, help desk, hardware.
    IABD        → big data, data science, machine learning, analítica, IA.
    CEPYTHON    → Python avançat, automatització, scripting.
- Si l'oferta és genèrica "programador/a" o no especifica, deixa el camp buit.

NORMES DE RESPOSTA (estrictes):
- Retorna ÚNICAMENT els 4 blocs indicats, en aquest ordre, cadascun a la seva línia.
- No afegeixis salutacions, explicacions ni justificacions.
- No inventis dades: si no pots inferir alguna cosa, escriu un valor buit
  (però mantén la línia amb la clau).
- Responts SEMPRE en català, excepte els codis d'intent i cicle que són literals.
```

**Fitxers de context a afegir al Gem:** cap inicialment. Si detectem deriva del model, afegirem un PDF
amb exemples de correus tipus de la bústia.

### 3.3 Input que es passa al Gem des del flow

El camp *Context* del node `Ask a Gem` ha de contenir aquest text, amb les variables interpolades:

```
Remitent: {{email.sender}}
Domini del remitent: {{email.senderDomain}}
Assumpte: {{email.subject}}
Té adjunt: {{email.hasAttachment}}

Cos del correu:
"""
{{email.body}}
"""
```

---

## 4. Prompt / expressió

El prompt "fix" viu al Gem (secció 3.2). El flow només passa el context variable (secció 3.3). No hi ha
cap prompt addicional al node.

---

## 5. Inputs

| Variable | Origen | Ús al Gem |
|---|---|---|
| `email.sender` | Paso 00 | Heurística per a `INTENT_HINT` (empresa vs. particular) |
| `email.senderDomain` | Paso 00 | Reforç heurística (p. ex. `@iticbcn.cat` → possiblement intern) |
| `email.subject` | Paso 00 | Senyal principal de triatge |
| `email.hasAttachment` | Paso 00 | Pista per a `CESSIO` (sol portar adjunt signat) |
| `email.body` | Paso 00 | Contingut a analitzar |

---

## 6. Outputs

El Gem retorna text estructurat per blocs. Workspace Studio hauria d'exposar cada bloc com a variable
accessible mitjançant el prefix `triatge.`:

| Variable | Tipus | Valors possibles |
|---|---|---|
| `triatge.intent_hint` | string | `OFERTA` · `INSCRIPCIO` · `CESSIO` · `CANDIDAT_EXTERN` · `SEGUIMENT` · `IGNORE` · `ALTRES` |
| `triatge.confidence_hint` | string | `ALTA` · `MITJA` · `BAIXA` |
| `triatge.resum_breu` | string | Text lliure ≤ 40 paraules |
| `triatge.cicles_hint` | string | Llista separada per comes o cadena buida |

> **Supòsit:** si Workspace Studio no parsea automàticament el format `CLAU: valor` en variables
> separades, caldrà afegir un `Extract` o `Ask Gemini` auxiliar. De moment es manté aquesta opció com a
> simple, assumint que el Gem retorna cadascuna de les línies i que la UI permet seleccionar la línia
> com a variable. Si no, replantejar com a `Extract` amb camps nominats.

---

## 7. El que aquest node **NO** fa

- No escriu res al Sheet (això és el Paso 03).
- No canvia labels de Gmail.
- No envia drafts.
- No fa servir el `confidence_hint` per prendre cap decisió — només l'exposa per a consulta posterior.
- No tradueix el cos; treballa amb l'idioma original.
- No descomprimeix adjunts ni llegeix el contingut dels PDFs. Només rep text del cos.

---

## 8. Limitacions conegudes

- **Gems en català:** confirmar que el Gem accepta instruccions i respostes en català. Si el model
  deriva a castellà, reforçar amb "Respons SEMPRE en català" a les instruccions.
- **Sense structured output estricte:** Workspace Studio no garanteix JSON Schema com ho faria Gemini
  API. El format "CLAU: valor" és un compromís; si el model s'ho salta, el Paso 03 rebrà buit. El Paso
  04 (Decide) ha de defensar contra `intent_hint` buit tractant-lo com a `ALTRES`.
- **Longitud del cos:** si `email.body` és molt llarg (p. ex. threads amb molts quoteds), el Gem pot
  patir. Si cal, afegir un node `Extract` previ que retalli a N paraules; no ho fem ara per simplicitat.
- **Cost/latència:** cada invocació consumeix una unitat de Gemini del pla Workspace; afecta si el
  volum és alt. Per al volum esperat (~desenes/dia) és menyspreable.
- **Variables dins condicionals:** aquest node s'executa en el flow principal (abans del Decide), per
  tant les seves variables sí es propaguen correctament als nodes 03 i 04.

---

## 9. Criteris d'acceptació

- [ ] Un correu d'oferta típic ("Bona tarda, us envio l'oferta de DAM junior de la nostra empresa…")
      retorna `intent_hint=OFERTA`, `confidence_hint=ALTA`, `cicles_hint=DAM`.
- [ ] Un "fora d'oficina" retorna `intent_hint=IGNORE`.
- [ ] Un alumne demanant inscripció retorna `intent_hint=INSCRIPCIO`.
- [ ] El node no triga més de 20 s en cas mitjà, 45 s en cas pitjor.
- [ ] Les variables `triatge.intent_hint`, `triatge.confidence_hint`, `triatge.resum_breu`,
      `triatge.cicles_hint` són accessibles des del Paso 03.
- [ ] Cap correu genera un error que aturi el flow: davant ambigüitat, el Gem retorna `ALTRES` amb
      `BAIXA` i el flow continua.

---

## 10. Preguntes obertes

1. ¿Workspace Studio permet que un `Ask a Gem` retorni variables estructurades automàticament a partir
   del format "CLAU: valor", o cal un `Extract` addicional? **Crític per al Paso 03.**
2. ¿Podem afegir exemples (few-shot) al Gem? Millorarien qualitat si detectem errors recurrents.
3. ¿Com versionem el Gem? Un canvi d'instruccions impacta tots els flows que el fan servir.
4. ¿Cal distingir entre oferta laboral i mobilitat/beca al `intent_hint`, o ho deixem per a la fase
   posterior? De moment tots dos són `OFERTA`.
5. ¿Idioma de detecció: sempre català? Si arriba un correu en castellà/anglès, el Gem hauria de
   respondre igualment en català als blocs, però el `resum_breu` podria reflectir l'original.
