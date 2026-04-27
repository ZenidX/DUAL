# Borrador de correo a Dirección — Propuesta servidor VPS del centro

**Para:** direccio@iticbcn.cat
**De:** [tu correo]
**Asunto:** Propuesta proveedor VPS para el servidor del centro — recomendación tras benchmark

---

Hola [nombre / equipo directivo],

Tras analizar siete proveedores de VPS (CDMON, Arsys, Hostinger, Nominalia, OVH, IONOS, Hetzner) más uno adicional (Cubepath), os traslado la propuesta de IT para montar el servidor propio del centro.

## Requisitos de partida

- Presupuesto: 0-15 €/mes
- Hardware: 4-8 vCPU, 8-16 GB RAM, 200-500 GB de disco
- Sistema operativo: Linux libre con máxima autonomía
- Restricción legal: solo proveedores con entidad o filial española

Aplicado el filtro territorial quedan descartados Hostinger (Lituania), Hetzner (Alemania) y Cubepath (EE. UU.), por no disponer de filial registrada en España.

## Recomendación

Proponemos una **estrategia híbrida en dos fases**:

| Fase | Proveedor | Plan | Specs | Coste |
|---|---|---|---|---|
| Año 1 | **Arsys (Logroño)** | VPS 240GB | 4 vCPU / 8 GB RAM / 240 GB NVMe | **2 €/mes** durante 12 meses (24 €/año) |
| Mes 10-11 | — | Punto de decisión con datos reales | — | — |
| Año 2+ | Arsys (continuidad) **o** IONOS (Madrid) | 240GB / VPS XL+ | 4-8 vCPU / 8-16 GB / 240-480 GB | 20 €/mes Arsys, o 9-15 €/mes IONOS |

### Por qué esta opción

1. **Año 1 a coste casi simbólico (24 €)**: nos permite validar la calidad de Arsys (proveedor histórico español, datacenter en La Rioja, certificaciones ISO completas) sin comprometer presupuesto.
2. **Decisión informada en mes 10-11**: con 10 meses de uso real podremos decidir si los recursos son suficientes y si Arsys cumple expectativas, o si conviene migrar a IONOS por mejor relación recursos/precio.
3. **Plan B documentado**: la migración a IONOS XL+ (8/16/480, 9 € promo / 15 € renovación) está planificada técnicamente para ejecutarse en agosto del próximo curso si fuera necesario.
4. **Cumplimiento legal**: ambos proveedores facturan desde España con CIF español, datacenter en territorio nacional y disponen de cláusula DPA (RGPD) y certificación ENS.

## Condiciones a verificar antes de firmar

- Solicitud de DPA (Contrato de Encargo del Tratamiento) a Arsys.
- Presupuesto cerrado con costes adicionales explícitos (IPv4, snapshots, soporte).
- Validación con secretaría sobre la modalidad de contratación aplicable (contrato menor o procedimiento abierto simplificado, según importe plurianual).
- Confirmación con IONOS de que el CIF del centro califica para tarifa de "nuevo cliente" en caso de migración futura.

## Coste total estimado año 1

Aproximadamente **220-300 €/año** (cuota Arsys + IVA + IPv4 adicional + 15 % de margen para imprevistos).

## Documentación de soporte adjunta

He preparado un dossier técnico-legal con todo el detalle:

- `benchmark_vps_2026.md` — Comparativa completa de los 8 proveedores y justificación de la elección.
- `01_compliance_rgpd.md` — Cumplimiento RGPD, LOPDGDD y ENS. Bloqueante para firmar.
- `02_costes_ocultos_sla.md` — Costes adicionales, SLA y plan de salida.
- `03_backup_estrategia.md` — Estrategia 3-2-1 de copias de seguridad y plan ante desastre.
- `04_plan_migracion.md` — Procedimiento detallado de migración Arsys → IONOS.
- `05_hardening_inicial.md` — Securización del servidor antes de producción.
- `06_roadmap_y_operacion.md` — Roadmap de servicios y estimación de horas de IT internas.

## Próximos pasos solicitados

1. Aprobación de la propuesta por parte del equipo directivo.
2. Validación legal del DPA y aspectos RGPD por la asesoría del centro.
3. Tramitación del expediente contractual.
4. Provisión técnica y arranque del servidor en septiembre.

Quedo a vuestra disposición para presentar el dossier en una reunión técnica si lo consideráis oportuno.

Un saludo,

[Nombre]
Departamento técnico — Institut TIC Barcelona
