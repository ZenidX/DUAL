# 05 — Hardening inicial del servidor (día 1)

**Aplicar antes de subir cualquier servicio productivo**. El servidor es vulnerable desde el segundo en que tiene IP pública. Provisionar y aplicar hardening en la **misma sesión**.

Sistema de referencia: **Debian 12 (bookworm)** o **Ubuntu 22.04 LTS**. Ajustes equivalentes en Rocky/AlmaLinux.

---

## 1. Primer login y cambios urgentes

### 1.1 Cambiar contraseña root inmediata

```bash
passwd
```

### 1.2 Crear usuario administrador no privilegiado

```bash
adduser admiticbcn
usermod -aG sudo admiticbcn
```

### 1.3 Configurar autenticación SSH por clave

En la máquina local del administrador:

```bash
ssh-keygen -t ed25519 -C "admiticbcn@iticbcn"
ssh-copy-id admiticbcn@<IP_servidor>
```

Probar acceso por clave **antes** de deshabilitar contraseña.

---

## 2. Endurecer SSH

Editar `/etc/ssh/sshd_config`:

```sshd_config
Port 22022                     # Cambio de puerto disuasivo (no es seguridad real)
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
UsePAM yes
AllowUsers admiticbcn
MaxAuthTries 3
MaxSessions 5
ClientAliveInterval 300
ClientAliveCountMax 2
LoginGraceTime 30
X11Forwarding no
PermitEmptyPasswords no
Protocol 2
LogLevel VERBOSE
```

Aplicar:

```bash
systemctl restart sshd
```

> **Antes de cerrar sesión**, abrir una segunda conexión para validar que el nuevo SSH funciona. Si el config tiene un error, no podrás reentrar.

---

## 3. Firewall (nftables / UFW)

### Opción A: UFW (simple)

```bash
apt install ufw -y
ufw default deny incoming
ufw default allow outgoing
ufw allow 22022/tcp     # SSH puerto custom
ufw allow 80/tcp        # HTTP
ufw allow 443/tcp       # HTTPS
ufw enable
ufw status verbose
```

### Opción B: nftables (más moderno, recomendado para sistemas con varios servicios)

```nft
table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;
        ct state {established, related} accept
        iif lo accept
        ip protocol icmp accept
        tcp dport 22022 accept
        tcp dport {80, 443} accept
        log prefix "INPUT_DROP: " level warn
    }
    chain forward { type filter hook forward priority 0; policy drop; }
    chain output  { type filter hook output  priority 0; policy accept; }
}
```

```bash
nft -f /etc/nftables.conf
systemctl enable nftables
```

---

## 4. fail2ban contra fuerza bruta

```bash
apt install fail2ban -y
```

`/etc/fail2ban/jail.local`:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = 22022
filter = sshd
backend = systemd
```

```bash
systemctl restart fail2ban
fail2ban-client status sshd
```

---

## 5. Actualizaciones automáticas

```bash
apt install unattended-upgrades apt-listchanges -y
dpkg-reconfigure -plow unattended-upgrades
```

`/etc/apt/apt.conf.d/50unattended-upgrades`:

```
Unattended-Upgrade::Origins-Pattern {
    "origin=Debian,codename=${distro_codename},label=Debian";
    "origin=Debian,codename=${distro_codename},label=Debian-Security";
    "origin=Debian,codename=${distro_codename}-updates";
};

Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:30";
Unattended-Upgrade::Mail "admiticbcn@iticbcn.cat";
Unattended-Upgrade::MailReport "on-change";
```

Verificar:

```bash
unattended-upgrade --dry-run --debug
```

---

## 6. Auditoría con auditd

```bash
apt install auditd -y
systemctl enable --now auditd
```

Reglas mínimas en `/etc/audit/rules.d/audit.rules`:

```
-w /etc/passwd -p wa -k passwd_changes
-w /etc/shadow -p wa -k shadow_changes
-w /etc/sudoers -p wa -k sudoers
-w /etc/ssh/sshd_config -p wa -k sshd
-w /var/log/auth.log -p wa -k authlog
-a always,exit -F arch=b64 -S execve -F euid=0 -k root_commands
```

```bash
augenrules --load
auditctl -l
```

Logs en `/var/log/audit/audit.log`. Centralizar (sección 9) idealmente.

---

## 7. Gestión de paquetes y servicios

### 7.1 Eliminar lo no necesario

```bash
apt purge -y telnetd rsh-server rsh-client xinetd nis ypbind
apt autoremove -y
```

### 7.2 Listar servicios activos y desactivar superfluos

```bash
systemctl list-unit-files --state=enabled
```

Desactivar lo que no se use (ejemplos comunes):

```bash
systemctl disable --now bluetooth.service
systemctl disable --now cups.service
systemctl disable --now avahi-daemon.service
```

---

## 8. Permisos y kernel hardening

### 8.1 Sysctl

`/etc/sysctl.d/99-hardening.conf`:

```sysctl
# Red
net.ipv4.tcp_syncookies = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.log_martians = 1
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_source_route = 0

# Kernel
kernel.randomize_va_space = 2
kernel.kptr_restrict = 2
kernel.dmesg_restrict = 1
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
fs.suid_dumpable = 0
```

```bash
sysctl --system
```

### 8.2 Permisos en `/etc/cron.*` y otros

```bash
chmod 600 /etc/crontab
chmod 700 /etc/cron.daily /etc/cron.hourly /etc/cron.monthly /etc/cron.weekly /etc/cron.d
```

---

## 9. Monitorización y centralización de logs

### Opción mínima: Netdata (instalación rápida)

```bash
bash <(curl -SsL https://my-netdata.io/kickstart.sh) --dont-wait --disable-telemetry
```

Acceso vía `https://<IP>:19999` (proteger con NGINX + Basic Auth o restricción IP).

### Opción enterprise: Prometheus + Grafana + node_exporter

Desplegar en otro VPS o en local.

### Logs centralizados (recomendado)

- **rsyslog → servidor central** (otro VPS, NAS interno o servicio externo como Logtail/Better Stack).
- Si no es viable, mínimo: **rotación logrotate** correcta y **archivado mensual cifrado** off-site.

```bash
apt install rsyslog -y
```

`/etc/rsyslog.d/99-remote.conf`:

```
*.* @@logserver.iticbcn.local:514
```

---

## 10. Antimalware y detección

### ClamAV (escaneo periódico, no en tiempo real)

```bash
apt install clamav clamav-daemon -y
freshclam
```

Cron diario:

```cron
0 3 * * * root clamscan -ri --exclude-dir="^/sys|^/proc|^/dev" / | mail -s "ClamAV scan" admiticbcn@iticbcn.cat
```

### rkhunter (detección de rootkits)

```bash
apt install rkhunter -y
rkhunter --update
rkhunter --propupd
```

Cron semanal:

```cron
0 4 * * 0 root rkhunter --check --skip-keypress | mail -s "rkhunter weekly" admiticbcn@iticbcn.cat
```

---

## 11. TLS / certificados

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d iticbcn.cat -d www.iticbcn.cat
```

Renovación automática:

```bash
systemctl enable certbot.timer
systemctl start certbot.timer
```

Probar renovación en seco:

```bash
certbot renew --dry-run
```

---

## 12. Cabeceras de seguridad NGINX

`/etc/nginx/snippets/security-headers.conf`:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'self';" always;
server_tokens off;
```

Incluir en `server { }`:

```nginx
include snippets/security-headers.conf;
```

Validar en https://securityheaders.com.

---

## 13. Backup automatizado (enlazar con doc 03)

```bash
apt install restic -y
```

Script en `/opt/scripts/backup.sh`:

```bash
#!/bin/bash
export RESTIC_REPOSITORY="s3:https://s3.eu-central-1.wasabisys.com/iticbcn-backup"
export RESTIC_PASSWORD_FILE="/root/.restic-pw"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."

restic backup /etc /home /var/www /var/lib/postgresql --tag daily
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune
```

Permisos:

```bash
chmod 700 /opt/scripts/backup.sh
chmod 600 /root/.restic-pw
```

Cron:

```cron
0 2 * * * root /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
```

---

## 14. Honeypot SSH (opcional)

Si se quiere desviar atacantes y captar inteligencia:

- Mantener puerto 22 cerrado en firewall
- Levantar `endlessh` en 22 (envía SSH banner infinito, mantiene atacantes ocupados):

```bash
apt install endlessh -y
systemctl enable --now endlessh
ufw allow 22/tcp
```

---

## 15. Lista de verificación de hardening completo

- [ ] Usuario no-root con sudo creado
- [ ] SSH solo por clave, root login deshabilitado, puerto cambiado
- [ ] Firewall configurado y activo (deny incoming default)
- [ ] fail2ban activo en SSH
- [ ] Unattended-upgrades configurado
- [ ] auditd corriendo con reglas mínimas
- [ ] Servicios innecesarios deshabilitados
- [ ] Sysctl hardening aplicado
- [ ] Monitorización activa
- [ ] Logs rotando + envío a servidor central (o archivo cifrado)
- [ ] ClamAV + rkhunter periódicos
- [ ] TLS Let's Encrypt + autorenovar
- [ ] Cabeceras de seguridad en NGINX
- [ ] Backup automatizado restic + verificado off-site
- [ ] Test de penetración básico (nmap externo, testssl.sh, securityheaders.com)
- [ ] Documentación del servidor (este checklist firmado y archivado)

---

## 16. Validación externa

Antes de declarar producción:

```bash
# Desde otra máquina:
nmap -sV -A <IP_servidor>          # ¿Solo los puertos esperados?
testssl.sh https://iticbcn.cat     # ¿TLS bien configurado?
nikto -h https://iticbcn.cat       # Web pen-test básico
```

Si algo aparece inesperado: investigar antes de pasar a producción.
