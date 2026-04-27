# 06 — Roadmap de servicios y operación

**Objetivo:** secuenciar qué se aloja en el servidor y cuándo, y dimensionar las horas de IT internas necesarias para mantenerlo.

---

## 1. Filosofía

> No subir todo de golpe. Cada servicio nuevo es un riesgo nuevo (configuración, expuesto a Internet, datos personales, dependencia). **Una fase a la vez, validada antes de pasar a la siguiente.**

---

## 2. Fases del despliegue

### Fase 0 — Provisión y hardening (semana 1)

| Tarea | Horas estimadas |
|---|---|
| Provisión VPS, alta cuenta proveedor | 1 |
| Hardening completo (`05_hardening_inicial.md`) | 4-6 |
| Configuración DNS + correo del centro apuntando | 1 |
| Despliegue monitorización (Netdata o Prometheus) | 2 |
| Backup automatizado (restic + Wasabi) | 2 |
| Pruebas de restauración inicial | 2 |
| Documentación del estado base | 2 |
| **Total Fase 0** | **14-16 h** |

> Hito: servidor seguro, monitorizado, con backups verificados, sin servicios públicos aún.

---

### Fase 1 — Web del centro (semanas 2-4)

| Tarea | Horas |
|---|---|
| Migración / nueva instalación web (WordPress / Hugo / etc.) | 6-12 |
| Configuración NGINX + TLS Let's Encrypt | 2 |
| Cabeceras de seguridad + WAF básico (NGINX modsecurity) | 3 |
| CDN frontal opcional (Cloudflare gratuito) | 2 |
| Tests de carga ligeros | 2 |
| Documentación + traspaso a quien actualizará contenidos | 3 |
| **Total Fase 1** | **18-24 h** |

> Hito: web pública del centro funcionando. Resto del servidor sigue privado.

---

### Fase 2 — Software interno e intranet (mes 2-3)

Ejemplos típicos en un centro educativo:

- Intranet básica (Nextcloud, etc.)
- Sistema de tickets para soporte interno (osTicket, Zammad)
- Calendario / videoconferencia (Jitsi self-hosted opcional)
- Wiki interno (DokuWiki, BookStack)
- Gestor de contraseñas del equipo IT (Vaultwarden)

| Por cada servicio | Horas |
|---|---|
| Estudio de viabilidad + selección | 2-4 |
| Instalación + configuración | 4-12 |
| Integración con autenticación común (LDAP/OAuth si aplica) | 4-8 |
| Backups específicos del servicio | 1-2 |
| Documentación de usuario | 2-4 |
| Formación al equipo | 2-4 |

Asumiendo **3 servicios** en esta fase: **~50-100 h**.

> Hito: intranet del centro operativa, sustituye a SaaS externos donde aplique.

---

### Fase 3 — Sistemas de seguridad propios (mes 4-6)

| Componente | Horas |
|---|---|
| Centralización de logs (rsyslog server o Graylog/Loki) | 8-16 |
| IDS/IPS (Suricata, Wazuh) | 12-20 |
| Dashboard SIEM (Wazuh, Security Onion lite) | 8-16 |
| Honeypots adicionales (cowrie SSH, dionaea) | 4-8 |
| Alertado (alertmanager, Telegram bot, email) | 4-6 |
| Documentación + procedimientos de respuesta | 6-10 |
| **Total Fase 3** | **42-76 h** |

> Hito: servidor con capacidades defensivas activas, ITIC tiene visibilidad sobre intentos de intrusión.

---

### Fase 4 — Crecimiento y optimización (mes 6+)

A partir de aquí depende de las necesidades del centro:

- Alta disponibilidad (segundo VPS + replicación) si crece la criticidad
- Caché distribuido (Redis), BD secundaria
- API gateway si hay varios servicios web
- Despliegue continuo (Gitea + Drone CI o GitLab CE) si se desarrolla software propio

Sin estimación cerrada — se planifica caso por caso.

---

## 3. Servicios que **no** alojaríamos en este servidor

Aunque la idea sea soberanía total, conviene reconocer límites:

| Servicio | Por qué NO en propio | Alternativa |
|---|---|---|
| Correo @iticbcn.cat | Reputación de IPs, antispam, complicación SPF/DKIM/DMARC | Microsoft 365 / Google Workspace educativo, o proveedor especializado (mailbox.org, ProtonMail) |
| Repositorios Git con CI/CD pesado | Recursos elevados, picos | GitHub gratuito para educación, o Gitea ligero para repos internos |
| Almacenamiento masivo (>500 GB de archivos) | Plan no escala bien | NAS local del centro o Object Storage externo |
| Videoconferencia masiva | Ancho de banda + CPU intensivo | Jitsi como complemento puntual; Meet/Teams para uso institucional |

> Decidir qué **no** se aloja es tan importante como qué sí. Evita sobrecargar el servidor y prolongar el TTL de la inversión.

---

## 4. Estimación de horas IT internas (operación continua)

Tras la fase de despliegue, la operación recurrente requiere:

| Tarea | Frecuencia | Horas/ocasión | Horas/mes |
|---|---|---|---|
| Revisión de monitorización y alertas | Diaria | 0,1 | 2 |
| Aplicar parches críticos manuales | Quincenal | 1 | 2 |
| Verificación de backups | Semanal | 0,5 | 2 |
| Prueba mensual de restauración | Mensual | 1 | 1 |
| Atención a incidentes (reactivo) | Variable | 1-4 | 2-4 |
| Mantenimiento programado | Mensual | 2 | 2 |
| Mejoras / nuevas configuraciones | Variable | 2-8 | 2-8 |
| Auditoría trimestral interna | Trimestral | 4 | 1,3 |
| **Total** | | | **14-22 h/mes** |

**Equivalencia:** ~0,1-0,15 FTE (jornada parcial sostenida) en tiempos de operación normal. En crisis (ataque, incidente grave) puede saturar a un técnico durante 1-2 semanas.

---

## 5. Roles y responsabilidades

| Rol | Quién | Responsabilidad |
|---|---|---|
| **Responsable técnico** | 1 técnico IT del centro | Decisiones arquitectura, hardening, backups, respuesta a incidentes |
| **Suplente técnico** | Otro técnico / coordinador IT | Cobertura ausencias. Mínimo 2 personas conocen el sistema |
| **Responsable de datos / DPD** | Designado del centro | Validación RGPD, comunicación AEPD, RAT |
| **Stakeholder dirección** | Equipo directivo | Decisiones presupuestarias, aprobación cambios mayores |

> **Bus factor**: nunca **una sola persona** debe tener acceso o conocimiento del servidor. Mínimo dos. Las claves SSH y credenciales del proveedor en gestor de contraseñas compartido (Vaultwarden / Bitwarden Org).

---

## 6. Documentación operativa mínima

Repositorio Git interno (Gitea/GitLab/Forgejo) con:

- `infra/` — Ansible playbooks o Docker Compose de cada servicio
- `runbooks/` — procedimientos para incidentes comunes (web caída, alta carga, alerta IDS, certificado expirado)
- `inventario.md` — estado actual del servidor (servicios, puertos, BD, vhosts)
- `cambios.md` — registro cronológico de cambios significativos
- `secrets/` — referencias (no las claves) a dónde están los secretos en Vaultwarden
- `contactos.md` — DPD, dirección, soporte proveedor, teléfonos urgencia
- `pruebas-restauracion/` — log de pruebas mensuales

> **Regla de oro:** si mañana el responsable técnico se va de vacaciones imprevistas, el suplente debe poder gestionar incidentes con esta documentación.

---

## 7. Indicadores (KPIs) trimestrales

Métricas a reportar a dirección cada 3 meses:

| KPI | Objetivo |
|---|---|
| Uptime real (%) | ≥ 99,9 % (≤ 8,7 h/trimestre caída) |
| Backups verificados (%) | 100 % |
| Pruebas de restauración con éxito | 100 % |
| Incidentes de seguridad detectados | Reportar todos, mitigados < 24 h |
| Vulnerabilidades CVE críticas pendientes > 7 días | 0 |
| Coste real vs presupuestado | Desviación ≤ 15 % |
| Servicios desplegados en plazo | 100 % vs roadmap |

---

## 8. Calendario sintético

Vista global suponiendo arranque **septiembre del curso académico**:

| Mes | Hito |
|---|---|
| Septiembre | Fase 0 (provisión + hardening) + Fase 1 inicio |
| Octubre | Fase 1 completa (web del centro pública) |
| Noviembre-diciembre | Fase 2 (intranet + servicios internos) |
| Enero-marzo | Fase 3 (sistemas de seguridad) |
| Abril-junio | Fase 4 + auditoría interna anual |
| Julio | Mantenimiento + planificación curso siguiente |
| Agosto | Mantenimiento mayor (kernel updates, snapshots, ventana migración si aplica) |

> Aprovechar **agosto** como ventana natural de cambios disruptivos; **julio** para auditorías y formación.

---

## 9. Lista de verificación final del proyecto (cierre año 1)

- [ ] Servidor en producción con uptime ≥ 99,9 %
- [ ] Roadmap de fases 1-3 cumplido
- [ ] Backups funcionando + 12 pruebas mensuales registradas
- [ ] Documentación operativa completa y revisada
- [ ] Bus factor ≥ 2 técnicos formados
- [ ] Auditoría interna anual realizada y archivada
- [ ] DPD informado del estado del tratamiento (`01_compliance_rgpd.md`)
- [ ] Coste real anual ≤ presupuesto + 15 %
- [ ] Lecciones aprendidas documentadas → input al curso siguiente
