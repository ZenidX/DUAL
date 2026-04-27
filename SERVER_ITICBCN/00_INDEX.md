# Documentación servidor del centro — Institut TIC Barcelona

**Fecha:** 27 de abril de 2026
**Responsable:** Departamento técnico ITIC

Documentación de planificación e implantación del servidor VPS del centro. Cada archivo aborda un aspecto específico del proyecto. El orden numérico es el orden recomendado de lectura.

---

## Índice de documentos

| # | Documento | Resumen |
|---|---|---|
| 0 | [00_INDEX.md](00_INDEX.md) | Este archivo. Índice de toda la documentación. |
| — | [benchmark_vps_2026.md](benchmark_vps_2026.md) | Comparativa de proveedores VPS y elección de plan. **Documento maestro.** |
| 1 | [01_compliance_rgpd.md](01_compliance_rgpd.md) | Cumplimiento legal RGPD/LOPDGDD. Cláusula DPA, ubicación de datos, derechos de los interesados. **Bloqueante para firmar.** |
| 2 | [02_costes_ocultos_sla.md](02_costes_ocultos_sla.md) | Costes adicionales no incluidos en el plan base. SLA real y compensaciones. Descuentos sector educativo. Riesgo de continuidad del proveedor. |
| 3 | [03_backup_estrategia.md](03_backup_estrategia.md) | Estrategia de copias de seguridad (regla 3-2-1), retención, cifrado, pruebas de restauración, plan de recuperación ante desastre. |
| 4 | [04_plan_migracion.md](04_plan_migracion.md) | Checklist de migración Arsys → IONOS si se ejecuta la estrategia híbrida (sección 10 del benchmark). |
| 5 | [05_hardening_inicial.md](05_hardening_inicial.md) | Securización del servidor el día 1: SSH, firewall, auditoría, actualizaciones, monitorización. |
| 6 | [06_roadmap_y_operacion.md](06_roadmap_y_operacion.md) | Roadmap de servicios a alojar (fases) y estimación de horas de IT internas. |

---

## Estado del proyecto

- ✅ Benchmark de proveedores completado
- ⚠️ Documentos de soporte en redacción inicial (plantilla — completar con datos del centro)
- ❌ Pendiente: aprobación dirección, redacción pliego, firma contrato

## Próximos hitos sugeridos

1. Reunión con dirección para validar elección de proveedor (basado en `benchmark_vps_2026.md`).
2. Verificación legal/RGPD con asesoría jurídica del centro (basado en `01_compliance_rgpd.md`).
3. Solicitud de presupuesto cerrado al proveedor con todos los costes incluidos (basado en `02_costes_ocultos_sla.md`).
4. Aprobación gasto y firma de contrato.
5. Provisión del servidor y aplicación del hardening inicial (basado en `05_hardening_inicial.md`).
6. Despliegue de la fase 1 según roadmap (basado en `06_roadmap_y_operacion.md`).
