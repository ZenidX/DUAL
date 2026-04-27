# 02 — Costes ocultos, SLA, descuentos y riesgo del proveedor

**Objetivo:** evitar sorpresas presupuestarias post-firma y entender qué garantiza realmente el proveedor.

---

## 1. Costes adicionales típicos (no incluidos en el plan base)

| Concepto | IONOS | Arsys | OVH | Nominalia |
|---|---|---|---|---|
| **Setup fee** | 10 € único | 0 € | 0 € | 0 € |
| **IPv4 adicional** | ~3-5 €/mes | ~3 €/mes | ~3 €/mes | ~3 €/mes |
| **IPv6** | Incluido | Incluido | Incluido | Incluido |
| **Backups extra** (snapshot a demanda) | Incluido (cuota) | 5-10 €/mes | Incluido (1) | Variable |
| **Tráfico saliente extra** | Ilimitado 1 Gbit/s | Ilimitado 1 Gbit/s | Ilimitado | 1-30 TB cuota |
| **Plesk Web Host** | Incluido | Incluido | 14 €/mes extra | Variable |
| **Plesk Web Pro / Host Plus** | 9-14 €/mes | 9-14 €/mes | Variable | Variable |
| **Soporte 24/7 telefónico** | Incluido básico | Incluido básico | Premium 19+ €/mes | Incluido |
| **Anti-DDoS avanzado** | Básico incluido | Básico incluido | Avanzado incluido | Básico |
| **Consola KVM emergencia** | Incluido | Incluido | Incluido | Incluido |
| **Migración asistida** | Variable | Gratuita primer mes | No estándar | No estándar |
| **Certificado SSL Let's Encrypt** | Gratis (autoinstalable) | Gratis | Gratis | Gratis |
| **Certificado SSL EV/wildcard comercial** | 30-200 €/año | 30-200 €/año | 30-200 €/año | 30-200 €/año |

> **Acción:** pedir presupuesto **con todos los conceptos cerrados** antes de firmar. Especialmente: setup fee, IPv4 adicional si se van a alojar varios servicios separados, snapshots a demanda y soporte premium.

---

## 2. Costes "trampa" más frecuentes

### 2.1 Renovación tras promo
Mencionado en el benchmark principal. **Cualquier promo** acaba; planificar el coste real **post-promo** desde el día 1.

### 2.2 Egress/tráfico fuera de cuota
Aunque se anuncie "ilimitado", suele haber un **fair use**. Si el centro pone vídeo en la web (clases, jornadas) puede saturarse. Revisar política de fair use.

### 2.3 Incremento anual contractual
Algunos contratos incluyen cláusula de revisión anual por IPC. Verificar y pedir techo (ej. máximo IPC + 0%).

### 2.4 Snapshots no eliminados
Snapshots olvidados ocupan disco y pueden facturarse aparte. Política interna: rotar y borrar.

### 2.5 Recursos adicionales temporales
Si en exámenes/eventos se aumenta CPU o RAM puntualmente, el coste prorrateado se factura en la siguiente factura. Provisionar 10-20% de margen presupuestario.

---

## 3. SLA real y compensaciones

| Proveedor | SLA anunciado | Cálculo del incumplimiento | Compensación máxima | Plazo reclamación |
|---|---|---|---|---|
| IONOS | 99,99 % | Indisponibilidad > 4,38 min/mes | Crédito proporcional, máx. 1 mes | 30 días |
| Arsys | 99,9 % | Indisponibilidad > 43,8 min/mes | Crédito 1-100% según escala | 30 días |
| OVH | 99,9 % infraestructura | Excluye paradas programadas | Crédito de servicio, máx. 30% | 30 días |
| Nominalia | 99,9 % | Sobre disponibilidad red | Crédito proporcional | 30 días |

### Lo que NO suele cubrir el SLA

- Incidencias por mala configuración del cliente
- Ataques DDoS que excedan capacidad de mitigación
- Mantenimiento programado anunciado con 48 h de antelación
- Fallo del software del cliente (web/aplicación caída por bug del centro)
- Fuerza mayor (huelgas, cortes eléctricos generales)

> **Implicación:** el SLA del proveedor protege el **uptime de la VM**, no la **disponibilidad del servicio del centro**. Si la web cae por un bug propio o un ataque amplificado, no hay compensación.

---

## 4. Descuentos para sector educativo / administración pública

Estado a fecha de redacción:

| Proveedor | Descuento educación pública | Cómo solicitar |
|---|---|---|
| IONOS | No publicado, posible negociación con comercial empresas | Contactar comercial empresas indicando volumen |
| Arsys | Programa "Aire Networks" para administración pública. Descuentos por volumen y contratos plurianuales | comercial@arsys.es |
| OVH | Programa "OVH Education" en algunos países, no estandarizado en España | Solicitar contacto comercial |
| Nominalia | No publicado | Negociación directa |

### Pliego público (recomendable)

Para contratos plurianuales > 1.500 € (límite contrato menor administraciones públicas) puede ser **obligatorio licitar por procedimiento abierto simplificado**. Beneficio: presión competitiva entre proveedores → mejores condiciones.

> **Acción:** verificar con la dirección/secretaría si por importe debe ir a licitación pública o se puede tramitar como contrato menor (15.000 € sin IVA / 4 años máximo en menores de servicios).

---

## 5. Riesgo de continuidad del proveedor

Análisis de la solidez/estabilidad de cada proveedor:

| Proveedor | Propietario | Cotiza | Año fundación | Tamaño | Riesgo |
|---|---|---|---|---|---|
| IONOS | United Internet AG | Sí (Frankfurt) | 1988 | ~4.000 empleados | **Bajo** |
| Arsys | Grupo Aire (capital español) | No (privado) | 1996 | ~250 empleados | **Bajo-medio** |
| OVH | OVH Groupe SA | Sí (Euronext París) | 1999 | ~2.500 empleados | **Bajo** |
| Nominalia | Grupo Dada (italiano) | No | 1998 | ~150 empleados | **Medio** |
| CDMON | Privado catalán | No | 2000 | ~50 empleados | **Medio-alto** (menor escala) |

### Eventos pasados a tener en cuenta

- **OVH**: incendio Estrasburgo 2021 que destruyó SBG2. Caso emblemático sobre por qué backups externos son críticos.
- **IONOS**: ha pasado por varias rebrandings (1&1, Strato adquirido). Estable pero con cambios de marca.
- **Arsys**: adquirida por Grupo Aire en 2019. Continuidad operativa pero perdió algo de identidad histórica.

### Cláusulas a exigir en contrato

- [ ] Plazo de notificación previa en caso de cese de servicio (mínimo **6 meses**)
- [ ] Derecho a **descarga completa** de datos en formato estándar al finalizar
- [ ] Cláusula de **continuidad** ante cambio de control accionarial
- [ ] Garantías de **portabilidad** (snapshots descargables, no propietario cerrado)

---

## 6. Plan de salida (exit plan)

Aunque suene prematuro, **diseñar el plan de salida desde el día 1** es buena praxis y reduce el lock-in.

| Aspecto | Recomendación |
|---|---|
| **Snapshots periódicos descargables** | Mensual a almacenamiento externo (Wasabi, Backblaze B2, OVH Object Storage en otra región) |
| **Configuración como código** | Ansible/Terraform → reproducible en cualquier proveedor |
| **Datos en formatos estándar** | PostgreSQL/MySQL dump, no SaaS propietario |
| **DNS gestionado fuera del proveedor VPS** | Cloudflare gratuito o el registrador del dominio → desacopla DNS del hosting |
| **Documentación de despliegue** | README + scripts en repositorio Git interno → cualquier técnico puede replicar el sistema en horas |

---

## 7. Lista de verificación pre-firma (resumen ejecutivo)

- [ ] Presupuesto cerrado con **todos los costes adicionales** explícitos
- [ ] SLA escrito con cálculo claro de compensaciones
- [ ] Verificación de descuentos sector educativo (si aplica)
- [ ] Modalidad de contratación validada (menor / abierto simplificado)
- [ ] Cláusulas de salida revisadas (notificación, portabilidad, continuidad)
- [ ] Plan de provisionamiento del 10-20% de margen presupuestario para imprevistos

---

## Anexo: presupuesto realista año 1 (escenario IONOS XL+)

Estimación con todos los conceptos contemplados:

| Concepto | EUR/mes | EUR/año |
|---|---|---|
| IONOS VPS XL+ promocional | 9,00 | 108,00 |
| IVA 21 % | 1,89 | 22,68 |
| Setup fee (1 vez) | 10,00 (único) | 10,00 |
| IPv4 adicional (1 extra) | 4,00 | 48,00 |
| Margen 15% imprevistos | — | 28,30 |
| **Total año 1** | — | **≈ 217 €** |
| **Total año 3 (renovación)** | 15+IVA = 18,15 | ≈ 250 € |

> Provisionar **300 € anuales** en partida presupuestaria como cifra realista (incluyendo margen, escalados puntuales, certificados).
