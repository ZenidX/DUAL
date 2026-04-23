# DUALIZA — Backend i gestió de propostes de projectes

**Data:** 2026-04-23
**Autor:** Xavi Lara (amb Claude)
**Estat:** Draft — pendent de revisió

---

## 1. Resum executiu

Aplicació web Django + MongoDB per rebre, gestionar i fer seguiment de les propostes de projectes de col·laboració entre ITICBCN i empreses (programa DUAL i convocatòria Ayudas Dualiza). El backend substitueix el `mailto:` / fallback actual del fitxer `Dualiza/formulari-projectes.html` i habilita:

- Enviament del formulari amb persistència a MongoDB i adjunts al disc.
- Login per empreses (email + contrasenya o Google OAuth) per consultar l'estat de les seves propostes.
- Panel d'administració (Django Admin + Unfold) per a professorat/coordinació, amb gestió d'estats, filtres i accions en massa.
- Emails transaccionals per confirmació i canvis d'estat.
- Desplegament automàtic des de GitHub al VPS Oracle Cloud (`150.230.183.140`, `/opt/docker/DUALIZA/`).

---

## 2. Decisions preses

| Àrea | Decisió |
|------|---------|
| Scope MVP | Recepció + gestió + login empreses + emails transaccionals |
| Frontend | Django serveix el formulari com a template + admin; SPA futur consumirà REST API |
| Domini | IP:port durant desenvolupament; `dualiza.iticbcn.cat` (o similar) quan estigui aprovisionat |
| Fitxers | Bind-mount al volum `/opt/docker/DUALIZA/media/` del VPS |
| Email transaccional | Gmail / Google Workspace SMTP (app password) amb HTML |
| Email campanya | Mailchimp (fora d'aquest projecte) |
| Auth | Email + contrasenya **i** Google OAuth (django-allauth) |
| Idioma | Català (única llengua del MVP) |
| Desplegament | GitHub Actions → SSH al VPS (push a `main` = deploy) |
| Reverse proxy | Nginx (TLS s'afegeix quan arribi el domini) |
| Admin | Django Admin + tema `django-unfold` |
| Backups | Cap al MVP (risc acceptat) |
| Integració MongoDB | `django-mongodb-backend` oficial (MongoDB Inc.) |

---

## 3. Arquitectura

### Contenidors i xarxa

```
VPS Oracle Cloud · /opt/docker/DUALIZA/

  [Internet] ──80/443──▶ nginx ──▶ django (gunicorn) ──▶ mongodb
                                         │
                                         ▼
                                     media volume
                                /opt/docker/DUALIZA/media/
```

- `nginx` (contenidor): únic servei amb ports publicats al host (`80`, `443` en el futur). Serveix estàtics i reenvia la resta a Django.
- `django` (contenidor): Python 3.12 + Django 5.x + Gunicorn, en la xarxa interna.
- `mongodb` (contenidor): MongoDB 7.x, només accessible des de la xarxa Docker interna, amb usuari/contrasenya.
- **No s'exposa Mongo al host.** Els ports `8000` (django) i `27017` (mongo) només són visibles dins la xarxa Docker `dualiza_net`.

### Volums

- `./media` → `/app/media` (django) i `/var/www/media` (nginx) — fitxers adjunts.
- `mongo_data` (volum nomenat) → `/data/db` (mongo) — persistència de la BD.
- `./static_collected` → `/var/www/static` (nginx) — `collectstatic` de Django.

### Decisions arquitectòniques justificades

- **Nginx des del dia 1**, encara sense TLS, perquè afegir Let's Encrypt més tard només implica muntar `/etc/letsencrypt` i afegir el `server { listen 443 ssl; }`.
- **Gunicorn en comptes de `runserver`** perquè és producció, encara que sigui MVP. `runserver` està marcat com "no usar en producció" per motius de seguretat i rendiment.
- **Mongo en xarxa interna** per evitar exposar la BD a Internet. Si el VPS té IP pública, exposar 27017 és un risc innecessari.

---

## 4. Model de dades

Amb `django-mongodb-backend`, cada `Model` de Django correspon a una col·lecció MongoDB. Es fan servir `ObjectIdAutoField` com a PK i camps embedded quan té sentit.

### 4.1 Entitats

#### `Empresa` (col·lecció `empreses`)

| Camp | Tipus | Notes |
|------|-------|-------|
| `id` | ObjectId | PK |
| `nom` | CharField(200) | `company_name` del form, obligatori |
| `cif` | CharField(20) | opcional |
| `sector` | CharField(100) | opcional |
| `mida` | CharField(30) | choices: Autònom/Micro/Petita/Mitjana/Gran |
| `web` | URLField | opcional |
| `adreca` | CharField(300) | opcional |
| `coneix_dual` | CharField(30) | choices: Sí, Sentit, No |
| `practiques_passades` | CharField(30) | choices: ITICBCN, Altres, No |
| `practiques_actuals` | CharField(30) | choices: ITICBCN, Altres, No |
| `practiques_actuals_detall` | TextField | opcional |
| `user` | OneToOne → `User` | propietari del compte (sempre creat, vegeu §5.2) |
| `created_at` | DateTimeField | auto |
| `updated_at` | DateTimeField | auto |

#### `Contacte` (col·lecció `contactes`)

Pot ser un **document embedded** dins `Empresa` o una col·lecció separada amb FK. **Decisió: embedded**, perquè una empresa al MVP només té un contacte principal i no necessitem consultar contactes de manera independent.

| Camp | Tipus | Notes |
|------|-------|-------|
| `nom` | CharField(200) | `contact_name`, obligatori |
| `carrec` | CharField(100) | opcional |
| `email` | EmailField | obligatori, únic per empresa |
| `telefon` | CharField(20) | opcional |

#### `Projecte` (col·lecció `projectes`)

| Camp | Tipus | Notes |
|------|-------|-------|
| `id` | ObjectId | PK |
| `empresa` | FK → `Empresa` | |
| `titol` | CharField(200) | obligatori |
| `descripcio` | TextField | obligatori |
| `tipus_col_laboracio` | JSONField (list) | valors: Dualiza, Dual intensiva, Repte puntual, Parlem-ne |
| `tecnologies` | JSONField (list of str) | llista de `tech[]` del form |
| `tecnologies_altres` | CharField(500) | opcional, camp lliure |
| `estudiants_previst` | CharField(20) | |
| `modalitat_treball` | CharField(50) | |
| `data_inici_preferent` | DateField | opcional |
| `pressupost_orientatiu` | CharField(100) | text lliure |
| `ods` | JSONField (list) | llista de codis ODS (4, 5, 7, 8, 9, 10, 11, 12, 13, 17) |
| `estat` | CharField(30) | choices: `nou`, `en_revisio`, `aprovat`, `rebutjat`, `en_curs`, `finalitzat` (default: `nou`) |
| `notes_internes` | TextField | només visible per admin |
| `created_at` | DateTimeField | auto |
| `updated_at` | DateTimeField | auto |

#### `FitxerAdjunt` (col·lecció `fitxers`)

| Camp | Tipus | Notes |
|------|-------|-------|
| `id` | ObjectId | PK |
| `projecte` | FK → `Projecte` | |
| `fitxer` | FileField | upload a `media/projectes/<projecte_id>/<filename>` |
| `nom_original` | CharField(255) | el nom amb què l'usuari va pujar-lo |
| `mida_bytes` | IntegerField | |
| `mime_type` | CharField(100) | |
| `uploaded_at` | DateTimeField | auto |

#### `User` (`django.contrib.auth.models.User`, col·lecció `users`)

Estàndard de Django. Afegim un camp `email_verificat: BooleanField` per saber si l'usuari ha confirmat el seu email (via magic link o OAuth Google).

### 4.2 Índexs

- `empreses`: índex únic sobre `contacte.email`.
- `projectes`: índex sobre `estat`, sobre `empresa`, sobre `created_at` descendent.
- `fitxers`: índex sobre `projecte`.
- `users`: índex únic sobre `email` (ja hi és per defecte a Django).

### 4.3 Per què `JSONField` i no col·leccions separades per tech/ODS

Les llistes de `tecnologies` i `ods` són **conjunts tancats d'etiquetes**, no entitats amb cicle de vida propi. Emmagatzemar-les com a llista JSON dins del document del projecte és idiomàtic en MongoDB, permet filtrar amb `__contains`, i evita taules `many-to-many` que afegirien complexitat sense benefici al MVP.

---

## 5. Autenticació i autorització

### 5.1 Estratègia

Dos métodes de login coexistint:

1. **Email + contrasenya** (Django auth estàndard).
2. **Google OAuth** via `django-allauth`.

Tots dos resolen a la mateixa `User` instance. Si una empresa entra primer via Google i després via password (o a l'inrevés), allauth permet vincular comptes si coincideix l'email.

### 5.2 Flux de registre

1. L'empresa omple el formulari públic (sense estar loguejada).
2. Django busca `User` amb `email == contact_email`:
   - **Si no existeix:** crea `User` amb contrasenya **no establerta** (`set_unusable_password()`) i `email_verificat=False`. Crea `Empresa` vinculada i `Projecte`.
   - **Si existeix i té `Empresa` associada:** afegeix un nou `Projecte` a aquella empresa. Mostra missatge "Hem afegit la proposta al teu compte existent amb email X. Entra per veure-la."
   - **Si existeix però sense `Empresa` associada** (cas rar, ex: staff creat manualment): mateix que el primer cas però reutilitzant el User.
3. Envia email de benvinguda amb **enllaç d'activació** (token de curta durada, 48h). L'empresa clica, estableix contrasenya, i queda `email_verificat=True`.
4. Si l'empresa clica "Entra amb Google" amb el mateix email, allauth vincula el compte existent.

### 5.3 Rols i permisos

| Rol | Mecanisme | Pot |
|-----|-----------|-----|
| **Anònim** | — | Veure landing i formulari, enviar formulari |
| **Empresa** | User normal + relació `empresa.user` | Veure/editar els seus projectes, afegir fitxers |
| **Staff** | `is_staff=True` | Accedir al Django Admin, gestionar tots els projectes |
| **Superusuari** | `is_superuser=True` | Tot el del Staff + gestió d'usuaris |

Les vistes d'empresa comproven `request.user.empresa == projecte.empresa` (o 403).

### 5.4 Sessions

Sessions de Django per cookie (default), durada 2 setmanes. CSRF activat per defecte.

---

## 6. Flux d'emails transaccionals

### 6.1 Backend

`django.core.mail` amb SMTP Gmail (`smtp.gmail.com:587`, TLS) i **app password** d'un compte dedicat del Workspace d'ITICBCN (ex: `dualiza@iticbcn.cat` o similar). Credencials a `.env`, mai al repo.

### 6.2 Triggers

| Event | Destinatari | Template |
|-------|-------------|----------|
| Enviament del formulari | Contacte de l'empresa | `emails/confirmacio_enviament.html` |
| Creació del compte | Contacte de l'empresa | `emails/activacio_compte.html` (amb link amb token) |
| Canvi d'estat del projecte | Contacte de l'empresa | `emails/canvi_estat.html` (rendered per estat) |
| Password reset | Usuari | Django built-in, template custom en català |

Cada template té versió text i versió HTML (via `EmailMultiAlternatives`), tots dos en català.

### 6.3 Enviament síncron al MVP

Els emails s'envien dins del cicle de request. **Acceptem el cost (200-500ms afegits)** a canvi de no muntar Celery/Redis. Si un email falla, ho loguegem però no fem fallar la request — l'usuari ja ha vist la pantalla d'èxit.

Refactor futur: afegir Redis + Celery per enviaments asíncrons quan el volum ho demani.

---

## 7. Gestió de fitxers adjunts

### 7.1 Validacions

- Mida màxima per fitxer: **10 MB**.
- Tipus permesos: PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, ZIP, PNG, JPG, GIF, TXT.
- Màxim **10 fitxers per enviament**.

Validació tant al frontend (UX) com al backend (seguretat).

### 7.2 Emmagatzematge

- Ruta: `/app/media/projectes/<projecte_id>/<hash>_<nom_original_sanititzat>`.
- Bind-mount al host: `/opt/docker/DUALIZA/media/`.
- Nom de fitxer **hashejat** per evitar col·lisions i path traversal; el nom original es guarda a `FitxerAdjunt.nom_original` per mostrar-lo a la UI.

### 7.3 Accés als fitxers

- **No serveixen directament via nginx.** Els fitxers no són públics; contenen dades sensibles (empresarials, pressupostos).
- Django té una vista `/fitxers/<id>/` que comprova permisos (`request.user` és propietari de l'empresa o staff) i retorna el fitxer amb `X-Accel-Redirect` perquè nginx faci la transferència real. Això dona control d'accés + rendiment.

---

## 8. Superfície d'URLs

### 8.1 Web (servit per Django)

| URL | Mètode | Qui | Descripció |
|-----|--------|-----|------------|
| `/` | GET | Tothom | Landing; redirigeix a `/formulari/` de moment |
| `/formulari/` | GET, POST | Tothom | Formulari de proposta |
| `/enviat/` | GET | Tothom | Pantalla d'èxit |
| `/entrar/` | GET, POST | Anònim | Login (email + pwd) |
| `/accounts/google/login/` | GET | Anònim | Inici OAuth Google (allauth) |
| `/accounts/google/login/callback/` | GET | Anònim | Callback OAuth |
| `/sortir/` | POST | Auth | Logout |
| `/activar/<token>/` | GET, POST | Anònim amb token | Activar compte / establir contrasenya |
| `/recuperar-contrasenya/` | GET, POST | Anònim | Password reset (built-in Django) |
| `/dashboard/` | GET | Empresa | Llistat dels seus projectes |
| `/projectes/<id>/` | GET | Empresa propietària | Detall del projecte amb estat |
| `/projectes/<id>/editar/` | GET, POST | Empresa propietària | Editar camps permesos |
| `/fitxers/<id>/` | GET | Empresa propietària o staff | Descàrrega amb control d'accés |
| `/admin/` | GET | Staff | Django Admin |

### 8.2 REST API (per a SPA futur)

Prefix: `/api/v1/`. Autenticació: Token (DRF TokenAuth) o session cookie.

| URL | Mètodes | Descripció |
|-----|---------|------------|
| `/api/v1/projectes/` | GET, POST | Llistar (filtrat per permís), crear |
| `/api/v1/projectes/<id>/` | GET, PATCH, DELETE | Detall, modificar (estat per staff, altres camps per empresa), esborrar (staff) |
| `/api/v1/empreses/<id>/` | GET, PATCH | Detall i edició empresa |
| `/api/v1/fitxers/<id>/` | GET, DELETE | Descàrrega i esborrat |
| `/api/v1/auth/login/` | POST | Obtenir token |
| `/api/v1/auth/logout/` | POST | Invalidar token |

Framework: **Django REST Framework (DRF)**. Serializers per cada entitat.

---

## 9. Estructura del repositori

```
dualiza/                              ← repo GitHub (privat inicialment)
├── .github/
│   └── workflows/
│       └── deploy.yml                ← GitHub Actions
├── docker/
│   ├── docker-compose.yml            ← orquestració dels 3 serveis
│   ├── docker-compose.override.yml.example  ← per a desenvolupament local
│   ├── nginx/
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   └── django/
│       ├── Dockerfile
│       └── entrypoint.sh             ← migrate + collectstatic + gunicorn
├── src/
│   ├── manage.py
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── config/                       ← settings, urls arrel, wsgi, asgi
│   ├── core/                         ← landing, vistes genèriques
│   ├── empreses/                     ← model Empresa, views, forms
│   ├── projectes/                    ← model Projecte, FitxerAdjunt, views, forms
│   ├── comptes/                      ← extensions User, activació, allauth config
│   ├── api/                          ← DRF viewsets, serializers, routers
│   ├── templates/
│   │   ├── base.html
│   │   ├── formulari.html            ← adaptació de formulari-projectes.html
│   │   ├── dashboard.html
│   │   ├── emails/                   ← HTML dels transaccionals
│   │   └── admin/                    ← overrides d'Unfold si calen
│   ├── static/
│   └── locale/ca/                    ← traduccions si cal
├── .env.example
├── .gitignore
├── README.md
└── docs/
    └── arquitectura.md
```

### Raonament

- `src/` separat de `docker/` → el codi d'aplicació es pot executar sense Docker (tests locals, desenvolupament ràpid).
- Una **Django app per domini**: `empreses`, `projectes`, `comptes`, `api`. Apps petites i enfocades són més fàcils de mantenir que un monolític `dualiza/`.
- `config/` en comptes de `dualiza/` com a paquet arrel → convenció clara que és configuració transversal.

---

## 10. Desplegament

### 10.1 Primer aprovisionament (manual, una vegada)

1. Crear carpeta `/opt/docker/DUALIZA/` al VPS.
2. Clonar el repo GitHub dins.
3. Copiar `.env.example` a `.env` i omplir secrets reals (SECRET_KEY, credencials Mongo, SMTP, Google OAuth).
4. `docker compose up -d --build`.
5. Crear superusuari: `docker compose exec django python manage.py createsuperuser`.

### 10.2 Actualitzacions (GitHub Actions, automàtic)

Workflow `.github/workflows/deploy.yml` dispara en push a `main`:

```yaml
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/docker/DUALIZA
            git pull
            docker compose up -d --build
            docker compose exec -T django python manage.py migrate --noinput
            docker compose exec -T django python manage.py collectstatic --noinput
```

Secrets a configurar al repo GitHub:
- `VPS_HOST` = `150.230.183.140`
- `VPS_USER` = `ubuntu`
- `SSH_PRIVATE_KEY` = clau privada (es generarà una dedicada només per al deploy, mai la personal del dev)

### 10.3 Variables d'entorn

`.env` al VPS amb (entre d'altres):

```
DJANGO_SECRET_KEY=...
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=150.230.183.140,dualiza.iticbcn.cat
MONGO_USER=dualiza_app
MONGO_PASSWORD=...
MONGO_DB=dualiza
MONGO_HOST=mongodb
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=dualiza@iticbcn.cat
EMAIL_HOST_PASSWORD=...           # app password de Google
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
```

---

## 11. Gestió d'errors

- `DJANGO_DEBUG=False` en producció. Mai stack traces a l'usuari final.
- Pàgines `404.html` i `500.html` personalitzades en català, coherents amb l'estètica del formulari.
- Logging: tots els serveis escriuen a stdout → `docker compose logs` és la font única. Prou pel MVP; si es necessita long-term retention es pot afegir Loki o enviar a un servei extern.
- Errors de validació del formulari: missatges en català, inline, sense perdre les dades introduïdes.
- Errors d'enviament d'email: es loguegen a stderr però **no fan fallar la request** — l'usuari ja ha vist que el seu formulari s'ha desat.
- Errors de Mongo (connexió caiguda, timeout): retornen 500 amb pàgina amable i log detallat.

---

## 12. Estratègia de tests

Mínim viable pel MVP, focalitzat a les rutes crítiques:

- **Unit tests** dels models (validacions, `__str__`, mètodes de negoci si n'hi ha).
- **Integration test** del flux complet d'enviament del formulari: POST → BD escrita + fitxer guardat + email enviat (amb `django.core.mail` backend de memòria).
- **Test** del canvi d'estat i el seu email associat.
- **Test** de permisos: un usuari no pot veure projectes d'una altra empresa.
- **Test smoke** dels endpoints de l'API (autenticació + llistar projectes propis).

Framework: `pytest-django`. No fem coverage de tot, no cal.

CI futur: afegir un job `test` abans del `deploy` a GitHub Actions (fora de scope del MVP inicial, però fàcil d'afegir després).

---

## 13. Fora de scope (explícit)

Queden **expressament fora** del MVP, per ser re-avaluats més tard:

- SPA de gestió separat (només API preparada; la interfície de gestió serà Django Admin).
- Backups automàtics de MongoDB i fitxers.
- Celery / Redis (emails síncrons al MVP).
- Domini i HTTPS (s'afegeix quan ITIC proporcioni el subdomini).
- Internacionalització (només català).
- Magic link authentication.
- Analytics / dashboards avançats dins el Django Admin més enllà del que dona Unfold.
- Webhook o integració automàtica amb Mailchimp.
- Versions mòbils natives o PWA.

---

## 14. Riscos i mitigacions

| Risc | Probabilitat | Impacte | Mitigació |
|------|-------------|---------|-----------|
| `django-mongodb-backend` té incompatibilitats amb tercers (Unfold, allauth) | Mitja | Alt | Provar les tres peces juntes el primer dia de desenvolupament; si peta, passar a "Approach B" (híbrid SQLite + PyMongo) |
| Pèrdua total del VPS sense backup | Baixa | Molt alt | Risc acceptat al MVP; quan hi hagi dades reals, implementar backups immediatament |
| Credencials SMTP Gmail revocades | Baixa | Mitjà | Monitoritzar logs d'email; tenir un segon app password de reserva |
| Oracle Cloud atura la instància Free Tier per inactivitat | Mitja | Mitjà | Mantenir tràfic de healthcheck periòdic; documentar procés de reactivació |
| Empresa puja fitxer amb malware | Mitja | Baix-mitjà | Validació d'extensió i mida; no s'executa res al servidor; avisar a admins que no obrin adjunts sense escanejar |

---

## 15. Pròxims passos després d'aprovar aquest spec

1. Passar a la skill `writing-plans` per generar el pla d'implementació detallat (tasques ordenades, estimacions, checkpoints).
2. Crear el repositori `dualiza` a GitHub (privat inicialment).
3. Executar el pla iterativament, fent commits i desplegaments freqüents al VPS.

---

*Fi del document.*
