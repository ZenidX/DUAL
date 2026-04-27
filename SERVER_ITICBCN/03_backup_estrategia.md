# 03 — Estrategia de copias de seguridad y recuperación ante desastre

**Objetivo:** garantizar que ante cualquier incidente (fallo hardware, error humano, ransomware, baja del proveedor) el centro pueda **restaurar el servicio en < 4 horas con pérdida máxima de datos de 24 horas**.

---

## 1. Regla 3-2-1

Estándar de la industria, no negociable:

- **3** copias de los datos (la original + 2 backups)
- **2** medios o sistemas distintos
- **1** copia **fuera del sitio** (off-site)

Aplicación al servidor del centro:

| Copia | Ubicación | Tipo | Frecuencia |
|---|---|---|---|
| Original | VPS IONOS Madrid | Producción | continua |
| Backup 1 (proveedor) | Snapshot IONOS | Snapshot completo | diario |
| Backup 2 (off-site) | Wasabi Amsterdam o backup en casa del centro | Cifrado restic/borg | diario |

---

## 2. Backup incluido por el proveedor

| Proveedor | Backup en plan base | Frecuencia | Retención | Restauración |
|---|---|---|---|---|
| IONOS XL+ | Cloud Backup (con cuota) | Diario | 7-30 días | Web panel |
| Arsys VPS | Backup remoto incluido | Diario | 7-14 días | Panel + ticket |
| OVH VPS | Backup automático diario | Diario | 7 días | Panel |
| Nominalia | Snapshots manuales | A demanda | Indefinido | Panel |

> El backup del proveedor **es la primera línea de defensa pero no la única**. No protege contra: borrado del backup desde el panel (compromiso de credenciales), baja del proveedor, fallo masivo del datacenter.

---

## 3. Backup propio off-site

### Herramientas recomendadas

| Herramienta | Ventajas | Caso de uso |
|---|---|---|
| **restic** | Cifrado por defecto, deduplicación, multi-backend (S3, B2, SFTP) | **Recomendado** para datos del centro |
| **borg** | Deduplicación excelente, eficiente en CPU | Alternativa a restic |
| **rsnapshot** | Simple, basado en rsync + hardlinks | Solo si destino es disco local |
| **duplicity** | Cifrado GPG, incremental | Legacy, prefiere restic |

### Backend de almacenamiento off-site

| Servicio | Coste | Ubicación | Notas |
|---|---|---|---|
| **Wasabi** | ~6 $/TB/mes | Amsterdam | S3 compatible, sin egress fees |
| **Backblaze B2** | ~6 $/TB/mes | EU Central (Ámsterdam) | S3 compatible, comunidad amplia |
| **OVH Object Storage** | ~10 €/TB/mes | París/Estrasburgo | Cumple RGPD, factura España |
| **NAS en sede del centro** | Hardware único | Local | Off-site real, requiere conectividad VPN |

> **Recomendación:** Wasabi o B2 en Amsterdam para coste, OVH Object Storage si se prioriza facturación 100 % EU.

---

## 4. Política de retención

### Esquema "Grandfather-Father-Son" (GFS)

| Tipo | Frecuencia | Retención | Cantidad de copias activas |
|---|---|---|---|
| Daily | Cada noche 02:00 | 7 días | 7 |
| Weekly | Domingos 03:00 | 4 semanas | 4 |
| Monthly | Día 1 mes 04:00 | 12 meses | 12 |
| Yearly | 31/12 05:00 | 5 años | 5 |

Total ~28 puntos de restauración temporal.

> Para sistemas con datos personales del alumnado, la **retención** debe alinearse con los plazos del **Registro de Actividades de Tratamiento** (ver `01_compliance_rgpd.md`). No conservar backups indefinidamente "por si acaso" — viola minimización.

---

## 5. Cifrado

- **Cifrado en tránsito**: SFTP/SSH al backend de backup. Restic/borg cifran por defecto.
- **Cifrado en reposo**: clave gestionada localmente, **nunca** en el mismo servidor que produce el backup.
- **Custodia de claves**: clave maestra en gestor de contraseñas del centro (Bitwarden/KeePass) + copia física en caja fuerte.
- **Rotación**: anual. Cambio inmediato si se sospecha compromiso.

---

## 6. Pruebas de restauración

> **Un backup que no se ha restaurado nunca es un esquema de pago, no un backup.**

### Calendario de pruebas

| Frecuencia | Acción | Quién |
|---|---|---|
| Mensual | Restauración de un fichero aleatorio en VM de pruebas | Técnico IT |
| Trimestral | Restauración completa de la web del centro en sandbox | Técnico IT |
| Semestral | Simulacro completo: provisionar VPS limpio, restaurar todo, validar servicios | Equipo IT + responsable |
| Anual | Auditoría externa del esquema de backup | Asesoría externa o ENS |

### Documentar cada prueba

- Fecha
- Datos restaurados
- Tiempo (RTO real)
- Pérdida (RPO real)
- Incidencias
- Acciones correctoras

---

## 7. Plan de Recuperación ante Desastre (DRP)

### Escenarios

| Escenario | Probabilidad | Impacto | Plan |
|---|---|---|---|
| Borrado accidental de fichero | Alta | Bajo | Restauración desde snapshot del día |
| Compromiso por ransomware | Media | Alto | Restauración off-site al último backup limpio + bastionado |
| Fallo hardware del proveedor | Baja | Alto | Restauración en proveedor secundario (IONOS → Arsys o viceversa) |
| Incendio/desastre datacenter | Muy baja | Crítico | Reprovisión completa en otro proveedor + restauración off-site |
| Baja imprevista del proveedor | Muy baja | Crítico | Misma respuesta que desastre + cambio de proveedor en plazo de 1-2 semanas |

### RTO/RPO objetivo

- **RTO (Recovery Time Objective)**: tiempo máximo aceptable de servicio caído → **4 horas**
- **RPO (Recovery Point Objective)**: pérdida máxima de datos aceptable → **24 horas**

Si en algún escenario se incumple el objetivo, replantear estrategia (snapshots más frecuentes, replicación en caliente, alta disponibilidad).

---

## 8. Procedimiento de restauración (resumen)

### Paso a paso

1. **Detección y declaración del incidente** → técnico IT al responsable.
2. **Decisión nivel de respuesta** (snapshot proveedor / off-site / reprovisión).
3. **Aislar sistema afectado** (no apagar — preservar evidencias).
4. **Provisionar entorno de restauración** (puede ser el mismo VPS si solo es restauración de ficheros, o un VPS nuevo si es reprovisión).
5. **Restaurar desde el backup más reciente verificado**.
6. **Validar integridad** (checksum, smoke tests, comparación con monitorización).
7. **Reabrir servicio** + comunicar a usuarios.
8. **Post-mortem documentado**: causa, cronología, mejoras.

---

## 9. Coste estimado del esquema de backup

| Concepto | EUR/mes |
|---|---|
| Backup proveedor (incluido en VPS) | 0 |
| Wasabi 100 GB off-site | ~0,60 |
| Wasabi 500 GB off-site | ~3,00 |
| Wasabi 1 TB off-site | ~6,00 |

> Coste despreciable comparado con el riesgo de no tener backup off-site. Provisionar **5 €/mes** en partida.

---

## 10. Lista de verificación

- [ ] Backup del proveedor activado y configurado
- [ ] Backup off-site con restic/borg implementado
- [ ] Cifrado verificado (clave fuera del servidor)
- [ ] Política de retención GFS aplicada
- [ ] Calendario de pruebas de restauración documentado
- [ ] DRP escrito con escenarios y RTO/RPO
- [ ] Procedimiento de restauración impreso y archivado fuera del servidor
- [ ] Custodia de claves de cifrado implementada
- [ ] Primera prueba de restauración completa realizada antes de declarar el sistema en producción
