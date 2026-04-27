# Benchmark VPS 2026 — Servidor del centro Institut TIC Barcelona

**Fecha del informe:** 27 de abril de 2026
**Solicitante:** Dirección ITIC Barcelona
**Autor:** Departamento técnico

---

## 1. Requisitos de la dirección

| Parámetro | Valor objetivo |
|---|---|
| Presupuesto | 0 – 15 €/mes (preferiblemente con renovación dentro del rango) |
| CPU | 4 – 8 vCPU |
| RAM | 8 – 16 GB |
| Almacenamiento | 200 – 500 GB (NVMe/SSD) |
| Sistema operativo | Linux libre (Debian/Ubuntu/Rocky/Alma) |
| Acceso | Root + KVM/consola |
| Restricción legal | Proveedor con **entidad española / facturación con CIF español**. No se contratan proveedores extranjeros sin filial en territorio español |
| Caso de uso | Web del centro, software interno, sistemas de seguridad propios. **Máxima libertad** (autogestionado, sin restricciones de panel) |

---

## 2. Filtro de cumplimiento territorial (criterio eliminatorio)

| Proveedor | Entidad facturadora | CIF | Sede | ¿Cumple? |
|---|---|---|---|---|
| **CDMON** | Hosting i Domains S.L. (cdmon) | Spanish | Igualada (Barcelona) | ✅ Sí |
| **ARSYS** | Arsys Internet S.L.U. (Grupo Aire) | Spanish | Logroño (La Rioja) | ✅ Sí |
| **NOMINALIA** | NOMINALIA INTERNET S.L.U. | B-61553327 | Barcelona | ✅ Sí |
| **OVH** | OVH HISPANO S.L. | B-83834747 | Calle Alcalá 21, Madrid | ✅ Sí (filial española, factura desde España) |
| **IONOS** | IONOS CLOUD S.L. (ex-1&1 IONOS España S.L.U.) | B-85049435 | Logroño / Alcobendas (Madrid) | ✅ Sí |
| **HOSTINGER** | Hostinger International Ltd (Chipre) / Hostinger Operations UAB (Lituania) | — | Sin filial registrada en España | ❌ **No cumple** — entidad extranjera sin establecimiento permanente en España |
| **HETZNER** | Hetzner Online GmbH | — | Gunzenhausen (Alemania) | ❌ **No cumple** — sin filial española, factura desde Alemania, sin datacenter en España |
| **CUBEPATH** | CubePath (US-based, ASN AS26141) | — | EE. UU. (datacenter operativo en Barcelona) | ⚠️ **No cumple estrictamente** — entidad estadounidense sin filial española confirmada, aunque la infraestructura física sí está en Barcelona |

> **Conclusión del filtro legal:** quedan eliminados Hostinger, Hetzner y Cubepath. Continúan en evaluación CDMON, Arsys, Nominalia, OVH e IONOS.
>
> **Matización sobre Cubepath:** ofrece datacenter propio en Barcelona con protección DDoS incluida, lo que técnicamente sitúa los datos en territorio español. Sin embargo, la entidad facturadora es estadounidense, por lo que el contrato se firmaría con un proveedor extranjero. Si la dirección del centro acepta una interpretación laxa del criterio (datos en España aunque contrato sea con entidad extranjera), Cubepath podría reincorporarse — pero por defecto se mantiene fuera.

---

## 3. Tabla comparativa de ofertas y plan más cercano al requisito

Precios en EUR/mes (sin IVA salvo nota). "Promo" = primer periodo / "Renov" = renovación o tarifa estándar.

| Proveedor | Plan | vCPU | RAM | Disco NVMe | Promo | Renov | DC España | Linux libre | Acceso root |
|---|---|---|---|---|---|---|---|---|---|
| **CDMON** | VPS Base (gestionado) | 2 (hasta 16) | 6 GB | 150 GB | — | **89,95 €** (29 € HW + 60,95 € admin) | ✅ | Solo Debian 11 (gestionado) | Limitado (managed) |
| **Arsys** | VPS 240GB | 4 | 8 GB | 240 GB | 2 € | **20 €** | ✅ Logroño/Madrid | Ubuntu/Debian/Alma/Rocky | ✅ |
| **Arsys** | VPS 480GB | 8 | 16 GB | 480 GB | 11 € | **40 €** | ✅ | ✅ | ✅ |
| **Nominalia** | X4 | 4 | 4 GB | 150 GB | — | **18 €** | "Europeo" (no garantiza España) | Linux varios | ✅ |
| **Nominalia** | X8 | 6 | 8 GB | 300 GB | — | **30 €** | "Europeo" | ✅ | ✅ |
| **Nominalia** | X16 | 12 | 16 GB | 400 GB | — | **45 €** | "Europeo" | ✅ | ✅ |
| **OVH** | VPS-1 | 4 | 8 GB | 75 GB SSD | — | **6,68 €** (IVA inc.) | ✅ Madrid | Ubuntu/Debian/Alma/Rocky | ✅ |
| **OVH** | VPS-2 | 6 | 12 GB | 100 GB NVMe | — | **10,27 €** (IVA inc.) | ✅ Madrid | ✅ | ✅ |
| **OVH** | VPS-3 | 8 | 24 GB | 200 GB NVMe | — | **20,56 €** (IVA inc.) | ✅ Madrid | ✅ | ✅ |
| **IONOS** | VPS L+ | 6 | 8 GB | 240 GB NVMe | 5 € | **8 €** | ✅ Madrid | Ubuntu/Debian/Alma/Rocky | ✅ |
| **IONOS** | VPS XL+ | 8 | 16 GB | 480 GB NVMe | 9 € | **15 €** | ✅ Madrid | ✅ | ✅ |
| **IONOS** | VPS XXL+ | 12 | 24 GB | 720 GB NVMe | 15 € | **29,50 €** | ✅ Madrid | ✅ | ✅ |

> Notas: precios IONOS y Arsys excluyen IVA (suma 21%). OVH publica precio con IVA. Hostinger y Hetzner no se incluyen por incumplir el filtro territorial — se documentan al final por trazabilidad.

---

## 4. Análisis individual

### 4.1 CDMON ❌ Fuera de presupuesto
- **Único modelo de venta: VPS 100 % administrado.** No hay variante unmanaged.
- El precio mínimo (HW + administración) ronda los **90 €/mes**, 6 × por encima del techo de 15 €.
- Limita la libertad: solo Debian 11, gestión por panel, root restringido.
- **Veredicto:** descartado por precio y por filosofía (la dirección quiere "máxima libertad", CDMON es lo opuesto).

### 4.2 ARSYS ⚠️ Buen producto, supera presupuesto en renovación
- Producto correcto: VPS Pro/Avanzado/Premium, NVMe, KVM, root, Plesk Web Host gratuito, datacenter Tier III en España con ISO 27001/9001/50001/14001.
- **VPS 240GB (4 vCPU / 8 GB / 240 GB)**: 2 € promocional → **20 €/mes** en renovación.
- **VPS 480GB (8 vCPU / 16 GB / 480 GB)**: 11 € promocional → **40 €/mes** en renovación.
- Ambos planes salen del techo de 15 € a partir del segundo año.
- Soporte 24/7 en castellano, marca consolidada en sector público español.
- **Veredicto:** opción premium por calidad/soporte/cumplimiento, pero **sobrepasa presupuesto al renovar**. Si el centro acepta ~20 €/mes el VPS 240GB es el sweet spot Arsys.

### 4.3 NOMINALIA ❌ Caro y datacenter no garantiza España
- Precios alineados con tier alto: el plan que cubre los requisitos (X16: 12/16/400) cuesta **45 €/mes**, 3 × el techo.
- Plan más barato dentro de especificación parcial (X8): **30 €/mes**, también fuera.
- La página comercial habla de "servidores europeos" — no especifica datacenter en España.
- **Veredicto:** descartado por precio. Aunque la entidad es española (Barcelona), el producto VPS está sobrevalorado frente a Arsys/IONOS.

### 4.4 OVH ✅ Buen ratio €/CPU pero penaliza disco
- Datacenter en **Madrid (Spain Region — SBG/RBX/MAD)**, IPv4 dedicada, backup diario incluido, tráfico ilimitado, IVA incluido en precio publicado.
- **VPS-1 (4 vCPU / 8 GB / 75 GB)** a **6,68 €/mes**: cumple CPU y RAM pero el disco se queda en 75 GB (debajo del mínimo de 200 GB).
- **VPS-2 (6 vCPU / 12 GB / 100 GB NVMe)** a **10,27 €/mes**: cumple CPU/RAM con margen pero **disco insuficiente (100 GB, requisito 200-500)**.
- **VPS-3 (8 vCPU / 24 GB / 200 GB NVMe)** a **20,56 €/mes**: cumple disco mínimo pero RAM se va a 24 GB y precio sobrepasa el techo.
- **Veredicto:** OVH es muy competitivo en CPU/RAM por euro, pero su escalado de disco está mal calibrado para tu caso. Para entrar en presupuesto te quedas corto en almacenamiento; para tener disco suficiente te sales del presupuesto.

### 4.5 IONOS ⭐ Mejor encaje técnico-económico
- Datacenter propio en **Madrid (Alcobendas)**, IP española, KVM completo, NVMe SSD, Plesk Web Host incluido, tráfico ilimitado a 1 Gbit/s.
- **VPS XL+** = **8 vCPU / 16 GB RAM / 480 GB NVMe** → **9 € promocional / 15 € regular** (sin IVA).
- Coincide **exactamente** con el techo superior de los tres requisitos físicos (CPU 8 / RAM 16 / disco 480), no quedan recursos infrautilizados ni escasos.
- Compromiso 24 meses con precio bloqueado a 9 € → ahorro inicial significativo.
- Filial española (IONOS CLOUD S.L., CIF B-85049435 en Logroño/Madrid) factura con IVA español.
- **Veredicto:** **único proveedor que cumple los 4 ejes** (territorial + CPU + RAM + disco) **dentro de los 15 €/mes**, incluso a tarifa de renovación.

---

## 5. Matriz de decisión

| Criterio | Peso | CDMON | Arsys 480GB | Nominalia X16 | OVH VPS-2 | **IONOS XL+** |
|---|---|---|---|---|---|---|
| Cumplimiento territorial | Bloqueante | ✅ | ✅ | ✅ | ✅ | ✅ |
| Precio ≤ 15 €/mes en renovación | Bloqueante | ❌ (90 €) | ❌ (40 €) | ❌ (45 €) | ✅ (10,27 €) | ✅ (15 €) |
| Disco 200-500 GB | Bloqueante | ✅ (150 base) | ✅ (480) | ✅ (400) | ❌ (100 GB) | ✅ (480) |
| CPU 4-8 | Bloqueante | ⚠️ (2 base) | ✅ (8) | ⚠️ (12) | ✅ (6) | ✅ (8) |
| RAM 8-16 | Bloqueante | ⚠️ (6 base) | ✅ (16) | ✅ (16) | ⚠️ (12) | ✅ (16) |
| Libertad / no managed | Alto | ❌ | ✅ | ✅ | ✅ | ✅ |
| Datacenter España garantizado | Medio | ✅ | ✅ | ⚠️ "europeo" | ✅ | ✅ |
| Soporte 24/7 castellano | Medio | ✅ | ✅ | ✅ | ✅ | ✅ |
| Promoción inicial agresiva | Bajo | — | ✅ | — | — | ✅ |

**Único candidato que pasa los 5 criterios bloqueantes: IONOS VPS XL+.**

---

## 6. Recomendación

### 6.1 Recomendación principal: **IONOS VPS XL+**
- 8 vCPU / 16 GB RAM / 480 GB NVMe SSD
- 9 €/mes los primeros 24 meses, 15 €/mes en renovación
- Datacenter Madrid, IONOS CLOUD S.L. (CIF español), KVM, root, Plesk incluido, tráfico ilimitado a 1 Gbit/s, SLA 99,99 %
- Cumple **todos** los requisitos físicos en el techo y se mantiene **justo en el límite** de presupuesto en renovación

### 6.2 Recomendación alternativa (si se acepta superar techo presupuestario)
**Arsys VPS 240GB** a 20 €/mes (4 vCPU / 8 GB / 240 GB).
- Te ahorra 5 € respecto a Arsys 480GB pero CPU/RAM al mínimo del rango.
- Justifica el +5 € sobre IONOS por: marca histórica española, certificaciones ISO completas, soporte técnico reconocido en el sector educativo público, datacenter en Logroño con redundancia adicional.
- Si la dirección antepone proveedor 100 % español de capital nacional sobre el coste/especificaciones, Arsys es la elección.

### 6.3 Sobre la preferencia personal por Arsys
Tu apuesta por Arsys es **defendible y razonable**, pero tiene un coste objetivo:
- Mismas especificaciones en Arsys (8/16/480) cuestan **40 €/mes**, frente a **15 €/mes** en IONOS → +300 €/año por la misma máquina.
- Si bajas Arsys al VPS 240GB (4/8/240) para meterte en 20 €/mes, cedes la mitad de CPU/RAM/disco respecto a IONOS XL+ por 5 € más.
- La ventaja real de Arsys es **soporte y reputación**, no especificaciones por euro.

**Mi sugerencia:** llevar a dirección los dos finalistas (IONOS XL+ y Arsys VPS 240GB) y dejar que el comité decida si valora más recursos/precio (IONOS) o marca/soporte (Arsys). Ambos cumplen el filtro territorial y son contractables por una administración educativa.

---

## 7. Anexo A — Proveedores descartados por filtro territorial

Documentado por trazabilidad en caso de que el criterio "extranjero sin filial española" se relaje en el futuro.

### HOSTINGER (Lituania, sin filial española)
- KVM 4: 4 vCPU / 16 GB / 200 GB NVMe → 10,99 € promo / **27,99 € renov**
- KVM 8: 8 vCPU / 32 GB / 400 GB NVMe → 21,99 € promo / **49,99 € renov**
- Excelente relación calidad/precio, pero factura desde Hostinger International Ltd (Chipre) o Hostinger Operations UAB (Lituania). No apto para contratación pública española sin matización jurídica.

### HETZNER (Alemania, sin filial española)
- CX32: 4 vCPU / 8 GB / 80 GB → **6,80 €/mes**
- CPX31: 4 vCPU / 8 GB / 160 GB → ~24 €/mes (tras subida de tarifas abril 2026)
- Mejor €/recurso del mercado pero datacenters solo en Alemania/Finlandia/USA/Singapur, factura Hetzner Online GmbH desde Alemania. No apto sin filial española.

### CUBEPATH (EE. UU., datacenter Barcelona, sin filial española)
Planes "General Purpose" (cloud VPS, KVM, NVMe, protección DDoS incluida, facturación horaria, tráfico unmetered 1 Gbps):

| Plan | vCPU | RAM | Disco NVMe | Tráfico | Precio EUR/mes |
|---|---|---|---|---|---|
| gp.nano | 1 | 2 GB | 40 GB | 3 TB | **5,17 €** |
| gp.micro | 2 | 4 GB | 80 GB | 5 TB | **8,92 €** |
| gp.starter | 4 | 8 GB | 100 GB | 10 TB | **15,51 €** |
| gp.small | 8 | 16 GB | 200 GB | 20 TB | **28,70 €** |
| gp.medium | 12 | 32 GB | 300 GB | 40 TB | **53,19 €** |

Análisis técnico (independientemente del filtro territorial):
- **gp.starter** (4 / 8 / 100 GB) cabe casi en presupuesto (15,51 € ≈ techo) pero el disco se queda en **100 GB**, por debajo del mínimo de 200 GB.
- **gp.small** (8 / 16 / 200 GB) cumple los 4 requisitos físicos, pero **28,70 €/mes** está casi al doble del techo presupuestario.
- Ventajas diferenciales que sí ofrece Cubepath y los demás no incluyen "de serie": **protección DDoS empresarial**, **facturación horaria**, **API completa**, datacenter Barcelona con AS propio (AS26141).
- Inconveniente: la empresa es **CubePath, US-based**. La página corporativa no documenta filial española con CIF; los hilos de la comunidad (LowEndTalk, BuiltByBit) la describen como "American company with European operations". Para contratación pública educativa española habría que solicitar al proveedor confirmación documental de establecimiento permanente en España, y en su defecto descartarla.

---

## 8. Disclaimers

1. **Precios verificados a 27/04/2026.** Las tarifas de los proveedores cambian periódicamente (especialmente IONOS, OVH y Hostinger ajustan promo cada trimestre). Confirmar en la web oficial antes de contratar.
2. **IVA**: Arsys, IONOS y Nominalia publican **sin IVA**. OVH publica con IVA. Aplicar 21 % al comparar el coste real al centro.
3. **Compromiso de permanencia**: IONOS condiciona los precios promocionales a contratos de 24 meses. Confirmar política de bajas antes de firmar.
4. **Capacidad de escalado**: si se prevé crecimiento, validar que el plan permite upgrade a vCPU/RAM/disco mayores sin migración (todos los listados sí lo permiten salvo CDMON, que requiere ticket).
5. **Para contratación pública educativa**: solicitar al proveedor declaración expresa de domicilio fiscal en España y certificado de estar al corriente de obligaciones tributarias (modelo AEAT) para incorporar al expediente.

---

---

## 9. Análisis de rendimiento con promociones aplicadas

Esta sección responde a la pregunta: *"¿Qué proveedor da el mejor rendimiento contando promociones?"*. Solo se evalúan los proveedores que pasan el filtro territorial (sección 2).

### 9.1 Ranking de planes que cumplen specs y entran en 15 €/mes con promo

| # | Plan | vCPU | RAM | Disco NVMe | Precio promo | €/vCPU/mes | Renovación |
|---|---|---|---|---|---|---|---|
| 🥇 | **IONOS VPS XL+** | 8 | 16 GB | 480 GB | **9 €** | **1,12 €** | 15 € |
| 🥈 | Arsys VPS 480GB | 8 | 16 GB | 480 GB | 11 € | 1,37 € | 40 € |
| 🥉 | IONOS VPS L+ | 6 | 8 GB | 240 GB | 5 € | 0,83 € | 8 € |

A **misma configuración exacta (8 vCPU / 16 GB / 480 GB NVMe)**, IONOS XL+ es:
- **2 €/mes más barato que Arsys** durante la promo (24 € de ahorro en 24 meses)
- **25 €/mes más barato que Arsys** en la renovación (300 €/año de ahorro a partir del año 3)
- Mismas garantías: datacenter en territorio español, IP española, KVM, root, NVMe, Plesk Web Host incluido, tráfico 1 Gbit/s ilimitado, SLA 99,99 %

**Conclusión:** IONOS XL+ domina en todos los escenarios (promo y renovación). Arsys solo gana si dirección valora la marca/soporte por encima del coste objetivo.

### 9.2 Si "rendimiento" = exprimir el techo de 15 €/mes durante la promo

Si dirección acepta superar los topes técnicos solicitados (8 CPU / 16 GB / 500 GB) y aceptar un salto de precio al renovar a cambio de mucha más potencia durante los 24 meses iniciales:

| Plan | vCPU | RAM | Disco | Precio promo | Renovación |
|---|---|---|---|---|---|
| **IONOS VPS XXL+** | 12 | 24 GB | 720 GB NVMe | **15 €/mes** | **29,50 €/mes** |

Por los mismos 15 € que IONOS XL+ pagaría en renovación, **durante los 24 meses de promoción** XXL+ entrega:
- **+50 % CPU** (12 vs 8 vCPU)
- **+50 % RAM** (24 vs 16 GB)
- **+50 % disco** (720 vs 480 GB)

**Riesgo asumido:** al renovar el precio se duplica a 29,50 €/mes (≈ 2 × techo presupuestario). Solo es rentable si:
1. Se planifica renegociar o migrar de plan al cabo de los 2 años, **o**
2. Los recursos extra (24 GB de RAM, 720 GB de disco) se aprovechan desde el día 1 — por ejemplo si vas a alojar varias VMs anidadas, contenedores intensivos, o un IDS/IPS con captura de tráfico que requiera RAM y disco alto.

### 9.3 Veredicto en una línea

| Si priorizas… | Plan ganador | Precio efectivo |
|---|---|---|
| **Estabilidad de coste a largo plazo** dentro del presupuesto | **IONOS VPS XL+** | 9 € promo / 15 € renov |
| **Máximo rendimiento durante la promo de 24 meses** | **IONOS VPS XXL+** | 15 € promo / 29,50 € renov |
| **Marca premium española y soporte 24/7 en castellano** | Arsys VPS 480GB | 11 € promo / 40 € renov |

**Recomendación operativa:** dado que el caso de uso (web del centro + software variado + seguridad propia) es de **larga duración**, el plan que mejor rendimiento sostenible ofrece es **IONOS VPS XL+** — único que mantiene specs en el techo del requisito **y** precio dentro del presupuesto **incluso después de la promoción**.

---

## 10. Estrategia "Arsys ahora, migrar a IONOS después"

Estudiamos la propuesta de **empezar con Arsys aprovechando su promoción y migrar a otro proveedor antes de que se renueve a tarifa estándar**. Es una estrategia legítima, pero hay que hacer las cuentas reales y dimensionar los riesgos.

### 10.1 Coste total a 3 años (TCO)

Asunciones: promo Arsys 12 meses (estándar — confirmar en pliego), promo IONOS 24 meses, sin coste de migración valorado en horas internas.

| Estrategia | Año 1 | Año 2 | Año 3 | **Total 36 meses** |
|---|---|---|---|---|
| **A) Arsys 480GB → migrar a IONOS XL+ en mes 13** | 132 € | 108 € (IONOS promo) | 108 € (IONOS promo) | **348 €** |
| **B) IONOS XL+ desde el día 1** | 108 € | 108 € | 180 € (renovación) | **396 €** |
| C) Arsys 480GB sin migrar | 132 € | 480 € | 480 € | 1.092 € |
| D) Arsys 240GB sin migrar (4/8/240) | 24 € | 240 € | 240 € | 504 € |

> **Ahorro real de la estrategia A frente a B: ≈ 48 € en 3 años.**
>
> Si la migración cuesta más de 4 h de trabajo técnico (lo cual es prácticamente seguro en un servidor con web + servicios de seguridad), el ahorro económico se evapora.

### 10.2 Riesgos de la migración intermedia

1. **Promo IONOS condicionada a "nuevo cliente".** Si el centro ya tiene altas previas en IONOS bajo el mismo CIF (correo, dominio, hosting compartido…), puede no calificar para los 9 €/mes promocionales. **Verificar con IONOS antes de firmar Arsys.**
2. **Carga técnica de la migración** (en un servidor productivo del centro):
   - Snapshot completo y transferencia de discos a nueva infraestructura
   - Cambio de IP → propagación DNS (24-48 h con TTL alto, o reducir TTL días antes)
   - Reconfiguración: firewall, reglas IDS/IPS, certificados TLS, jobs cron, claves SSH, claves de servicios externos
   - Reinstalación/reconfiguración de software de seguridad propio (alarmas, baselines, logs históricos, cuentas de usuarios)
   - Ventana de corte planificada (idealmente julio/agosto, fuera de curso académico)
   - Estimación realista: **8-20 h de trabajo técnico** según servicios alojados
3. **Compromiso contractual mínimo en Arsys.** Confirmar que el contrato Arsys no obliga a permanencia más allá del periodo promocional, y que no hay penalización por baja al final del año 1.
4. **Carga administrativa duplicada.** Para un centro público: dos altas en proveedor, dos altas de gasto en presupuesto, dos pliegos o dos contratos menores, dos cuentas a auditar.
5. **Asimetría de promos.** Arsys 12 meses vs IONOS 24 meses. La estrategia "saltar de promo en promo" requiere migrar más a menudo de lo que parece — si después del año 3 quieres volver a optimizar, te toca otra migración.
6. **Sistemas de seguridad propios alojados.** Mover IDS/IPS/firewall propio es **más delicado** que mover una web estática: hay alarmas históricas, baselines de comportamiento, logs de auditoría que pierden continuidad si no se trasladan correctamente.

### 10.3 Ruta híbrida recomendada

Si la dirección quiere **respetar la preferencia por Arsys** sin comprometerse a 40 €/mes en renovación ni a una migración compleja, la opción más sensata es:

1. **Año 1: Arsys VPS 240GB (4 vCPU / 8 GB / 240 GB NVMe) a 2 €/mes promocional.**
   - Coste casi simbólico (24 € todo el año)
   - Specs ya suficientes para arrancar la mayoría de servicios del centro
   - Permite **validar de verdad** la calidad de Arsys: latencia, panel, soporte, estabilidad

2. **Mes 10-11: punto de decisión informado**, con datos reales de uso:
   - **Si Arsys cumple expectativas y aceptamos 5 € sobre techo**: renovar Arsys 240GB a 20 €/mes. **Sin migración.**
   - **Si Arsys decepciona o queremos más recursos por menos dinero**: migrar a IONOS VPS XL+ (8/16/480) a 9 € promo / 15 € renovación. La migración se planifica con margen.

Esta ruta convierte el primer año en un **piloto barato** y deja la decisión final tomada **con evidencia operativa**, no con previsión teórica.

### 10.4 Veredicto

| ¿Tiene sentido la estrategia "Arsys → IONOS"? |
|---|
| ✅ **Sí** si: quieres **probar Arsys** un año a coste mínimo, tienes IT disponible en julio, y confirmas con IONOS que el centro califica para promo de nuevo cliente. |
| ❌ **No** si: el objetivo era ahorrar dinero (los ~48 € no compensan ni 4 h de migración), o el servidor aloja servicios críticos desde el día 1 que no quieres tocar en 24 meses. |

**Recomendación final ajustada:** **Arsys VPS 240GB en año 1 (2 €/mes), revisión en mes 10-11 con migración a IONOS XL+ como plan B documentado.** Es el equilibrio entre tu apuesta por Arsys, el respeto al presupuesto y la optionalidad real ante imprevistos.

---

## Fuentes

- Arsys — https://www.arsys.es/servidores/vps/espana
- IONOS España — https://www.ionos.es/servidores/vps
- OVHcloud España — https://www.ovhcloud.com/es-es/vps/
- Nominalia — https://www.nominalia.com/servidores/vps/
- CDMON — https://www.cdmon.com/es/servidores
- Hostinger — https://www.hostinger.com/es/vps-hosting
- Hetzner Cloud — https://www.hetzner.com/cloud
- CubePath pricing — https://cubepath.com/pricing
- CubePath VPS Barcelona — https://cubepath.com/vps/vps-barcelona
- CubePath Datacenters — https://cubepath.com/datacenter
- OVH HISPANO S.L. (registro mercantil) — https://www.einforma.com/informacion-empresa/ovh-hispano
- IONOS CLOUD S.L. (registro mercantil) — https://www.einforma.com/informacion-empresa/1-internet-espana
