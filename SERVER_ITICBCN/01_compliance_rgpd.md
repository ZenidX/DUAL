# 01 — Cumplimiento legal: RGPD, LOPDGDD y ENS

**Estatus:** Bloqueante para firmar contrato. Validar con asesoría jurídica del centro antes de provisionar.

---

## 1. Marco legal aplicable

| Norma | Aplicación al servidor del centro |
|---|---|
| **RGPD** (UE 2016/679) | Procesamiento de datos personales de alumnado, profesorado, familias, personal. |
| **LOPDGDD** (LO 3/2018) | Normativa española de protección de datos. Establece edad de consentimiento (14 años) y obligaciones específicas en centros educativos. |
| **ENS** (RD 311/2022) | Esquema Nacional de Seguridad. Aplicable si el centro es de titularidad pública o gestiona datos de la Generalitat. Categoría probable: **MEDIA**. |
| **LSSI-CE** (Ley 34/2002) | Obligaciones de la web del centro: aviso legal, política de cookies. |
| **DA-23 LOMLOE** | Tratamiento de datos del alumnado por administraciones educativas. |

> Como el alumnado puede ser **menor de 14 años**, el tratamiento requiere **consentimiento de padres/tutores** o base jurídica alternativa (ejecución de la función educativa, art. 6.1.e RGPD).

---

## 2. Cláusula DPA (Data Processing Agreement)

Todo proveedor VPS actúa como **encargado de tratamiento** (art. 28 RGPD). El centro debe firmar un **DPA / Contrato de Encargo** con el proveedor antes de subir datos personales.

### Disponibilidad de DPA por proveedor

| Proveedor | DPA disponible | Modalidad | Enlace habitual |
|---|---|---|---|
| IONOS | ✅ Sí | Firma online o anexo al contrato | Solicitar a comercial / dpo@ionos.es |
| Arsys | ✅ Sí | Anexo estándar al contrato | dpo@arsys.es |
| OVH | ✅ Sí | DPA público en web | privacy.ovhcloud.com |
| Nominalia | ✅ Sí | Solicitar a comercial | privacy@nominalia.com |
| CDMON | ✅ Sí | Anexo estándar | privacy@cdmon.com |

> **Acción:** solicitar DPA por escrito **antes de firmar contrato comercial**. Sin DPA firmado no se puede subir ningún dato personal al servidor.

---

## 3. Contenido mínimo del DPA (a verificar)

Lista de verificación basada en art. 28.3 RGPD:

- [ ] Objeto y duración del tratamiento
- [ ] Naturaleza y finalidad del tratamiento
- [ ] Tipo de datos personales y categorías de interesados
- [ ] Obligaciones del encargado (proveedor)
- [ ] Confidencialidad del personal del proveedor
- [ ] Medidas técnicas y organizativas (art. 32 RGPD)
- [ ] Autorización de subencargados (subprocessors) — lista y aviso previo de cambios
- [ ] Asistencia al responsable en derechos de los interesados
- [ ] Notificación de brechas en plazo (72 h al responsable)
- [ ] Devolución/destrucción de datos al finalizar el contrato
- [ ] Auditoría: derecho del responsable a auditar al encargado
- [ ] Transferencias internacionales: cláusulas SCC si aplica

---

## 4. Ubicación de los datos

### Requisito

Datos almacenados y procesados **en territorio EU**, preferiblemente **España**, sin transferencias fuera del EEE salvo cláusulas SCC + decisión de adecuación.

### Estado por proveedor recomendado

| Proveedor | Datacenter principal | Backups | Soporte | Transferencias fuera EEE |
|---|---|---|---|---|
| IONOS | Madrid (Alcobendas) | Madrid + opción Alemania | EU | No por defecto |
| Arsys | Logroño + Madrid | Logroño | España | No |
| OVH | Madrid + Francia | Configurable | Francia/EU | No por defecto |

### Riesgo a vigilar

- **Soporte técnico**: aunque los datos estén en Madrid, si el equipo de soporte accede desde fuera del EEE (filiales globales) hay tratamiento internacional. Confirmar con el proveedor si el soporte L1/L2 está en EU.
- **Subencargados**: monitorización, antivirus, antiDDoS pueden ser proveedores externos US (Cloudflare, Akamai). Revisar lista.

---

## 5. Subencargados (subprocessors)

Cada proveedor mantiene una lista pública de subencargados. Validarla y exigir aviso previo de cualquier cambio (art. 28.2 RGPD).

| Proveedor | URL aproximada de la lista | Subencargados típicos |
|---|---|---|
| IONOS | ionos.com/terms-gtc/subprocessors | Microsoft (Azure metrics), GitHub |
| Arsys | arsys.es/legal/subencargados | — (mayoría in-house) |
| OVH | ovhcloud.com/en/personal-data-protection/subprocessors | — |

**Acción:** descargar lista vigente, archivar en expediente, configurar alerta para nuevas versiones.

---

## 6. Derechos de los interesados

El centro como **responsable** debe garantizar el ejercicio de los derechos ARSULIPO:

- **A**cceso
- **R**ectificación
- **S**upresión (derecho al olvido)
- **L**imitación
- **I**mpugnación de decisiones automatizadas
- **P**ortabilidad
- **O**posición

Consecuencias prácticas en el servidor:
- Capacidad de **localizar todos los datos** de un interesado (alumno, familia, docente) → requiere catálogo de bases de datos y registros.
- Capacidad de **suprimir** completamente, incluyendo backups (revisar política de retención).
- Plazo legal: **1 mes** desde la solicitud (ampliable a 3 con justificación).

---

## 7. Notificación de brechas

Obligación: notificar a **AEPD en 72 h** desde el conocimiento de la brecha (art. 33 RGPD), y a los interesados si hay alto riesgo (art. 34).

Procedimiento interno propuesto:
1. Detección (monitorización, fail2ban, IDS) → alerta a IT.
2. Contención (aislar sistema afectado, snapshot forense).
3. Análisis (alcance, datos afectados, número de interesados).
4. Notificación interna al **DPD del centro** (o al designado).
5. Notificación AEPD vía sede electrónica si procede.
6. Comunicación a interesados si alto riesgo.
7. Registro en el **Registro de Brechas** interno.

> Plantilla de notificación AEPD: https://sedeagpd.gob.es/sede-electronica-web/vistas/formNuevaReclamacion/reclamacion.jsf

---

## 8. Registro de Actividades de Tratamiento (RAT)

El centro debe mantener su RAT (art. 30 RGPD). Las actividades nuevas que añade este servidor:

| Actividad | Finalidad | Datos | Base jurídica | Retención |
|---|---|---|---|---|
| Web del centro | Información pública / contacto | Identificativos formulario contacto | Consentimiento (art. 6.1.a) | 1 año desde el último contacto |
| Software interno | Gestión académica/admin | Académicos, identificativos | Misión pública (art. 6.1.e) | Según tabla de archivos del centro |
| Sistemas de seguridad propios (logs) | Garantizar la seguridad del sistema | IPs, eventos de acceso | Interés legítimo (art. 6.1.f) | 12 meses |

---

## 9. ENS (Esquema Nacional de Seguridad)

Si el centro recibe financiación pública o trata datos de la Administración (Generalitat), debe **cumplir ENS** y declararlo. Pasos:

1. **Categorización del sistema** (Anexo I ENS): probablemente categoría **MEDIA**.
2. **Aplicación de medidas** (Anexo II): control de acceso, cifrado, registro de actividad, copias de seguridad, gestión de incidentes.
3. **Auditoría bienal** (categoría MEDIA o ALTA): externa, antes de 2 años desde la entrada en producción.
4. **Declaración de Conformidad** publicada en la web del centro.

> El proveedor seleccionado debe estar **certificado ENS** o tener un anexo declarando cómo cubre los requisitos. **IONOS, Arsys y OVH** ofrecen certificación ENS-MEDIA o equivalente. Confirmar por escrito.

---

## 10. Lista de verificación previa a firmar contrato

- [ ] DPA solicitado al proveedor y revisado por asesoría jurídica
- [ ] Lista de subencargados archivada
- [ ] Confirmación de ubicación de datos (datacenter + backups en EU/España)
- [ ] Confirmación de no transferencia internacional sin SCC
- [ ] Certificación ENS del proveedor recibida
- [ ] Procedimiento interno de notificación de brechas redactado
- [ ] Actualización del RAT del centro con las nuevas actividades
- [ ] Designación del DPD del centro informada del nuevo encargado
- [ ] Cláusula de devolución/destrucción de datos al finalizar contrato

> Sin estos 9 puntos cerrados, **no se firma contrato**.

---

## Recursos

- Texto consolidado RGPD: https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679
- LOPDGDD: https://www.boe.es/eli/es/lo/2018/12/05/3/con
- AEPD — guía centros educativos: https://www.aepd.es/guias/guia-centros-educativos.pdf
- ENS — Centro Criptológico Nacional: https://www.ccn-cert.cni.es/series-ccn-stic/800-guia-esquema-nacional-de-seguridad.html
- Cláusula DPA modelo CCN-STIC-840: https://www.ccn-cert.cni.es
