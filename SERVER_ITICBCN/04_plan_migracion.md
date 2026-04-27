# 04 — Plan de migración Arsys → IONOS

**Cuándo aplicar este documento:** solo si la dirección elige la **estrategia híbrida** (sección 10 del benchmark): empezar con Arsys VPS 240GB y migrar a IONOS XL+ antes de la subida a tarifa estándar.

> Si se elige IONOS desde el día 1, este documento no aplica.

---

## 1. Calendario sugerido

Asumiendo arranque del servicio Arsys el **1 septiembre del curso** (mes 0):

| Hito | Mes desde arranque | Acción |
|---|---|---|
| **M0** (sept) | 0 | Provisión Arsys, hardening inicial, despliegue Fase 1 (web del centro) |
| M1-M9 (oct-may) | 1-9 | Operación normal, ampliación de servicios |
| **M10** (jun) | 10 | **Punto de decisión**: ¿quedarse en Arsys o migrar? |
| M11 (jul) | 11 | Si migra: provisión IONOS, preparación, congelar despliegues |
| **M12** (ago) | 12 | **Ventana de migración** (curso terminado, baja afluencia) |
| M13 (sept) | 13 | Validación final, baja del Arsys |

> **Por qué agosto**: tráfico mínimo, sin clases, IT disponible. Ventana de corte tolerada.

---

## 2. Punto de decisión (M10)

Reunión técnica + dirección con datos de uso real. Cuestionario:

- [ ] ¿Cómo ha respondido Arsys en soporte / latencia / estabilidad?
- [ ] ¿Los recursos del plan 240GB (4/8/240) han sido suficientes?
- [ ] ¿Cuántos servicios se han desplegado?
- [ ] ¿Hay roadmap nuevo que requiera más recursos?
- [ ] ¿IONOS sigue ofreciendo XL+ a 9 €/mes promocional?
- [ ] ¿IT tiene 16-24 h disponibles en agosto?
- [ ] ¿Hay aprobación presupuestaria para los 20 €/mes Arsys de renovación si decidimos quedarnos?

Salida: **decisión documentada en acta**.

---

## 3. Pre-migración (M11 — julio)

Cuatro semanas antes del corte.

### 3.1 Verificación de IONOS

- [ ] Confirmar disponibilidad VPS XL+ a precio promocional para **nuevo cliente**
- [ ] Verificar que el CIF del centro **no ha sido cliente IONOS** previo (correo, dominio, hosting)
- [ ] Solicitar DPA y términos de contrato
- [ ] Confirmar setup fee y costes adicionales
- [ ] Negociar fecha de activación (alta IONOS sin cargar hasta agosto)

### 3.2 Reducir TTL DNS

7-14 días antes del corte, bajar el TTL de los registros A/AAAA a **300 segundos** (5 minutos). Permite propagación rápida el día del cambio.

```dns
;; Ejemplo zona DNS
@        300  IN  A     <IP_actual_arsys>
www      300  IN  A     <IP_actual_arsys>
intranet 300  IN  A     <IP_actual_arsys>
```

> Importante: hacerlo **una semana antes** para que los resolvers caché ya tengan TTL bajo.

### 3.3 Inventario de servicios

Listar **todo** lo que está corriendo en Arsys:

- Servicios systemd activos (`systemctl list-units --type=service --state=running`)
- Puertos en escucha (`ss -tunlp`)
- Cron jobs (`/etc/crontab`, `/etc/cron.d/`, `crontab -l` para cada usuario)
- Bases de datos (lista, tamaño, motor)
- Sitios web (vhosts NGINX/Apache, certificados TLS)
- Usuarios del sistema y claves SSH
- Conexiones a servicios externos (APIs, SMTP, etc.)
- Volúmenes de datos por directorio (`du -sh /var/www /home /opt`)
- Reglas de firewall (`ufw status verbose`, `iptables-save`)
- Variables de entorno y secretos (`.env`, vault…)

Guardar en **inventario_arsys.md** del repositorio.

### 3.4 Snapshot Arsys

Snapshot completo desde el panel Arsys. **Conservar mínimo 30 días post-migración** como red de seguridad.

### 3.5 Provisión IONOS en paralelo

- [ ] Alta IONOS XL+
- [ ] Sistema operativo: **igual al de Arsys** (Debian 12 / Ubuntu 22.04 / lo que aplique)
- [ ] Aplicar `05_hardening_inicial.md` completo
- [ ] Configurar usuarios, SSH keys, firewall
- [ ] Instalar mismas versiones de software (mejor: usar **Ansible/Docker Compose** para reproducibilidad)
- [ ] Levantar **entorno espejo** sin tráfico real

---

## 4. Día de migración (M12 — agosto)

### Ventana sugerida

**Sábado 02:00 — domingo 02:00 (24 h)**. Comunicada a todos los usuarios con 2 semanas de antelación.

### Paso a paso

1. **02:00 — Modo mantenimiento**: poner web en modo mantenimiento (página estática "volvemos en X horas"). Detener servicios productivos en Arsys.

2. **02:30 — Snapshot final Arsys**: snapshot completo + dump bases de datos.

3. **03:00 — Transferencia de datos**:
   - Bases de datos: `pg_dump` / `mysqldump` → transferir → restaurar en IONOS
   - Ficheros: `rsync -avz --delete /datos arsys-server:/datos ionos-server:/datos`
   - Configuración: copiar `/etc/nginx`, `/etc/systemd/system/*.service`, etc. (con cuidado de adaptar IPs/hostnames)
   - Certificados TLS: regenerar con Let's Encrypt en IONOS (más seguro que copiar) o copiar privkey y reusar.

4. **05:00 — Levantar servicios en IONOS**:
   - Iniciar servicios systemd
   - Verificar logs (`journalctl -xe`)
   - Smoke tests: web responde, login funciona, BD accesible

5. **07:00 — Switch DNS**:
   - Cambiar registros A/AAAA al nuevo IP de IONOS
   - TTL ya está a 300 → propagación 5-30 min

6. **07:30-09:00 — Validación**:
   - Acceder desde varias redes (datos móviles, Wi-Fi externa)
   - Probar todos los flujos críticos: web pública, login intranet, formularios, etc.
   - Verificar certificados TLS
   - Verificar cron jobs ejecutándose
   - Verificar cabeceras de seguridad
   - Backup automatizado en IONOS funciona

7. **09:00 — Confirmación + monitorización 24 h**: declarar producción a IONOS, monitorizar 24 h continuas.

8. **Domingo — Modo mantenimiento OFF**: si todo correcto, retirar página de mantenimiento. Comunicar normalidad.

---

## 5. Post-migración (días 1-7)

### 5.1 Verificación adicional

- [ ] Métricas de monitorización estables (CPU, RAM, disco)
- [ ] Logs sin errores nuevos
- [ ] Visitas/usuarios coherentes con la línea base de Arsys
- [ ] Backups del nuevo entorno verificados
- [ ] Cron jobs ejecutados según calendario

### 5.2 Mantener Arsys 7 días en standby

No dar de baja Arsys hasta verificar **mínimo 7 días estables** en IONOS. Coste de seguridad ~5 €/semana.

### 5.3 Subir TTL DNS

Tras 7 días sin incidencias, restaurar TTL a 3600 (1 hora) o el valor habitual.

---

## 6. Plan de rollback

### Cuándo activar

- Web caída > 1 hora sin causa aislable
- Pérdida de datos detectada
- Incompatibilidad de software irresoluble
- Saturación de recursos en IONOS imposible de mitigar

### Cómo

1. Volver a apuntar DNS al IP Arsys (TTL bajo → propagación rápida)
2. Reactivar servicios en Arsys (sigue corriendo en standby)
3. Comunicar a usuarios el rollback
4. Auditar fallo en IONOS sin presión de producción
5. Replanificar segunda ventana

### Tiempo de rollback objetivo

**< 30 minutos** desde declaración hasta servicio restablecido en Arsys.

---

## 7. Lista de verificación previa a corte

24 h antes del corte:

- [ ] DPA IONOS firmado
- [ ] VPS IONOS provisionado, hardening aplicado, en standby
- [ ] Inventario Arsys actualizado
- [ ] Snapshot Arsys hecho (< 24 h)
- [ ] TTL DNS reducido a 300 (verificar `dig` desde resolvers públicos)
- [ ] Comunicación enviada (email, web, redes del centro)
- [ ] Equipo IT confirmado para ventana
- [ ] Plan de rollback impreso y a mano
- [ ] Backups off-site verificados (escenario peor caso)
- [ ] Tarjeta de pago IONOS validada (sin que rechace por límites)

---

## 8. Riesgos identificados y mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| IONOS no concede promo a CIF ya conocido | Media | Alto (sube coste 60 %) | Confirmar 4 semanas antes, plan B: quedarse en Arsys |
| DNS no propaga en tiempo | Baja | Medio | TTL bajo desde 1 semana antes; resolvers públicos como Cloudflare 1.1.1.1 propagan rápido |
| Software no compatible con IONOS (versión kernel, drivers) | Muy baja | Medio | Probar en provisión IONOS dos semanas antes |
| Saturación recursos IONOS XL+ | Baja | Bajo | Métricas de Arsys deberían mostrarlo antes; XL+ tiene mismas specs |
| Pérdida datos en transferencia | Muy baja | Crítico | Snapshot + rsync con verificación; backup off-site como red final |
| Certificados TLS expirados durante el corte | Baja | Medio | Regenerar Let's Encrypt en IONOS antes del corte |

---

## 9. Decisión final (M13 — septiembre)

Una semana después del corte:

- [ ] Sistema estable durante 7 días continuados
- [ ] Métricas dentro de baseline
- [ ] Sin tickets de usuarios sobre indisponibilidad
- [ ] Backups del nuevo proveedor funcionando

→ **Baja contractual de Arsys**. Notificación por escrito en plazo legal del proveedor (típicamente 1 mes; verificar T&C).

→ Archivo del expediente de migración en repositorio del centro.

→ **Lecciones aprendidas** documentadas para futuras migraciones.
