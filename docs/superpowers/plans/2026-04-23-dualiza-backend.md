# DUALIZA Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Django + MongoDB backend that receives DUALIZA project proposals from companies, enables companies to log in and track status, provides admin management via Django Admin, sends transactional emails via Gmail SMTP, and auto-deploys to an Oracle Cloud VPS via GitHub Actions.

**Architecture:** Django 5 serves the public form as a template and the admin panel; business data lives in MongoDB via `django-mongodb-backend` (official MongoDB Inc. adapter); three-container stack (nginx → gunicorn/Django → MongoDB) with bind-mounted media volume on the host; GitHub Actions deploys via SSH on push to `main`.

**Tech Stack:** Python 3.12, Django 5.x, django-mongodb-backend, django-allauth (Google OAuth), django-unfold (admin theme), Django REST Framework, MongoDB 7, Gunicorn, Nginx, Docker Compose, GitHub Actions.

**Related spec:** `docs/superpowers/specs/2026-04-23-dualiza-backend-design.md`

---

## Environment conventions

- **Local development path:** `D:/Xavi/ProjectsITIC/dualiza/`
- **GitHub repo:** `ZenidX/dualiza` (private initially)
- **VPS:** `ubuntu@150.230.183.140`, deploy to `/opt/docker/DUALIZA/`
- **Python env locally:** `uv` or `venv` — pla assumeix `venv`, però és indiferent
- **Shell:** bash (Git Bash on Windows)

Commands are shown as bash. On Windows use Git Bash or WSL.

---

## Phase 1 — Project bootstrap

### Task 1: Create the local project directory and git repo

**Files:**
- Create: `D:/Xavi/ProjectsITIC/dualiza/.gitignore`
- Create: `D:/Xavi/ProjectsITIC/dualiza/README.md`

- [ ] **Step 1: Create dir and initialize git**

```bash
mkdir -p D:/Xavi/ProjectsITIC/dualiza
cd D:/Xavi/ProjectsITIC/dualiza
git init -b main
```

- [ ] **Step 2: Create `.gitignore`**

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
.venv/
env/
ENV/
*.egg-info/
dist/
build/
.pytest_cache/
.coverage
htmlcov/
.tox/

# Django
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal
media/
static_collected/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Env
.env
.env.local
.env.*.local

# Docker
docker-compose.override.yml

# OS
.DS_Store
Thumbs.db
```

- [ ] **Step 3: Create minimal `README.md`**

```markdown
# DUALIZA

Backend Django + MongoDB per gestionar propostes de projectes entre ITICBCN i empreses.

Veure `docs/` per a arquitectura i pla d'implementació.

## Requeriments

- Python 3.12+
- Docker + Docker Compose

## Desenvolupament local

```bash
cp .env.example .env
# omplir .env
docker compose up --build
```

## Desplegament

Automàtic via GitHub Actions en push a `main`.
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore README.md
git commit -m "chore: initial project scaffold"
```

---

### Task 2: Create the GitHub repo and push

**Files:** none (uses `gh` CLI)

- [ ] **Step 1: Create private GitHub repo**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
gh repo create ZenidX/dualiza --private --source=. --remote=origin --description "Backend DUALIZA: gestió de propostes de projectes empresa-ITICBCN"
```

Expected: repo created at `https://github.com/ZenidX/dualiza`.

- [ ] **Step 2: Push main branch**

```bash
git push -u origin main
```

Expected: `main` branch pushed and tracking `origin/main`.

---

### Task 3: Create Django project skeleton with `src/` layout

**Files:**
- Create: `src/` (entire Django project)
- Create: `src/requirements.txt`
- Create: `src/manage.py`
- Create: `src/config/__init__.py`
- Create: `src/config/settings.py`
- Create: `src/config/urls.py`
- Create: `src/config/wsgi.py`
- Create: `src/config/asgi.py`

- [ ] **Step 1: Create venv and install Django**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
python -m venv venv
source venv/Scripts/activate    # Git Bash on Windows
pip install --upgrade pip
pip install "Django>=5.0,<6.0"
```

- [ ] **Step 2: Start Django project inside `src/`**

```bash
mkdir src
cd src
django-admin startproject config .
```

This creates `src/config/` with `settings.py`, `urls.py`, `wsgi.py`, `asgi.py` and `src/manage.py`.

- [ ] **Step 3: Create `requirements.txt`**

File: `src/requirements.txt`

```
Django>=5.0,<6.0
django-mongodb-backend>=5.0
djangorestframework>=3.15
django-allauth>=65.0
django-unfold>=0.40
python-decouple>=3.8
gunicorn>=22.0
pymongo>=4.6
Pillow>=10.0
```

- [ ] **Step 4: Install deps**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
pip install -r src/requirements.txt
```

Expected: all install cleanly. If `django-mongodb-backend` fails (version mismatch), check https://github.com/mongodb/django-mongodb-backend for latest compatible version.

- [ ] **Step 5: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/
git commit -m "feat: Django project skeleton with src layout"
```

Note: `venv/` is in `.gitignore` so it won't be staged.

---

### Task 4: Configure Django settings for MongoDB and environment

**Files:**
- Modify: `src/config/settings.py` (rewrite)
- Create: `.env.example`
- Create: `src/config/__init__.py` (leave empty)

- [ ] **Step 1: Rewrite `src/config/settings.py`**

Replace the generated `settings.py` with:

```python
from pathlib import Path
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("DJANGO_SECRET_KEY")
DEBUG = config("DJANGO_DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("DJANGO_ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())

INSTALLED_APPS = [
    "unfold",
    "unfold.contrib.filters",
    "unfold.contrib.forms",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "rest_framework",
    "rest_framework.authtoken",
    "core",
    "empreses",
    "projectes",
    "comptes",
    "api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django_mongodb_backend",
        "HOST": config("MONGO_HOST", default="localhost"),
        "PORT": config("MONGO_PORT", default=27017, cast=int),
        "NAME": config("MONGO_DB", default="dualiza"),
        "USER": config("MONGO_USER", default=""),
        "PASSWORD": config("MONGO_PASSWORD", default=""),
    },
}

DEFAULT_AUTO_FIELD = "django_mongodb_backend.fields.ObjectIdAutoField"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "ca"
TIME_ZONE = "Europe/Madrid"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR.parent / "static_collected"
STATICFILES_DIRS = [BASE_DIR / "static"]

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR.parent / "media"

# Email
EMAIL_BACKEND = config("EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="dualiza@iticbcn.cat")

# Auth
SITE_ID = 1
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]
LOGIN_REDIRECT_URL = "/dashboard/"
LOGOUT_REDIRECT_URL = "/"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APP": {
            "client_id": config("GOOGLE_OAUTH_CLIENT_ID", default=""),
            "secret": config("GOOGLE_OAUTH_CLIENT_SECRET", default=""),
            "key": "",
        },
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"access_type": "online"},
    }
}

# REST framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

# File uploads
DATA_UPLOAD_MAX_MEMORY_SIZE = 15 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 15 * 1024 * 1024
```

- [ ] **Step 2: Add `sys.path` tweak at top of `manage.py`**

File: `src/manage.py` — ensure Django can find the `config` module AND the app packages at top-level (`empreses`, `projectes`, etc.). The default `manage.py` already works because apps live next to `config/`.

No change needed; verify by running `python manage.py check` after apps exist.

- [ ] **Step 3: Create `.env.example` at repo root**

File: `D:/Xavi/ProjectsITIC/dualiza/.env.example`

```
# Django
DJANGO_SECRET_KEY=change-me-to-a-long-random-string
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,150.230.183.140,dualiza.iticbcn.cat

# MongoDB
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_DB=dualiza
MONGO_USER=dualiza_app
MONGO_PASSWORD=change-me

# Email (Gmail/Workspace SMTP with app password)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=dualiza@iticbcn.cat
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=dualiza@iticbcn.cat

# Google OAuth (per obtenir: https://console.cloud.google.com → OAuth 2.0)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
```

- [ ] **Step 4: Create local `.env` with dev values**

```bash
cp .env.example .env
# edit .env: set DJANGO_SECRET_KEY to a random string, set MONGO_HOST=localhost for dev without Docker
python -c "import secrets; print(secrets.token_urlsafe(50))"
# paste output as DJANGO_SECRET_KEY
```

- [ ] **Step 5: Commit**

```bash
git add .env.example src/config/settings.py src/requirements.txt
git commit -m "feat: configure Django settings for MongoDB, allauth, DRF, i18n-ca"
```

---

### Task 5: Create Docker Compose for local development

**Files:**
- Create: `docker/docker-compose.yml`
- Create: `docker/django/Dockerfile`
- Create: `docker/django/entrypoint.sh`

- [ ] **Step 1: Create Django Dockerfile**

File: `docker/django/Dockerfile`

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libjpeg-dev \
    zlib1g-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY src/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY src/ /app/

COPY docker/django/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--access-logfile", "-"]
```

- [ ] **Step 2: Create entrypoint script**

File: `docker/django/entrypoint.sh`

```bash
#!/usr/bin/env bash
set -e

echo "Waiting for MongoDB..."
until python -c "import pymongo; pymongo.MongoClient('mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/?authSource=admin', serverSelectionTimeoutMS=2000).admin.command('ping')" 2>/dev/null; do
  echo "  Mongo not ready, retrying in 2s..."
  sleep 2
done
echo "MongoDB up."

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static..."
python manage.py collectstatic --noinput

echo "Starting: $@"
exec "$@"
```

- [ ] **Step 3: Create `docker-compose.yml`**

File: `docker/docker-compose.yml`

```yaml
services:
  mongodb:
    image: mongo:7
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongo_data:/data/db
    networks:
      - dualiza_net
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  django:
    build:
      context: ..
      dockerfile: docker/django/Dockerfile
    restart: unless-stopped
    env_file:
      - ../.env
    depends_on:
      mongodb:
        condition: service_healthy
    volumes:
      - ../media:/app/media
      - ../static_collected:/app/static_collected
    networks:
      - dualiza_net
    expose:
      - "8000"

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ../static_collected:/var/www/static:ro
      - ../media:/var/www/media:ro
    depends_on:
      - django
    networks:
      - dualiza_net

volumes:
  mongo_data:

networks:
  dualiza_net:
    driver: bridge
```

- [ ] **Step 4: Test the compose (local smoke test)**

Note: this will fail later tasks still need done (no apps yet), but we verify the services come up.

```bash
cd D:/Xavi/ProjectsITIC/dualiza
# Ensure .env has MONGO_USER/PASSWORD, DJANGO_SECRET_KEY set
docker compose -f docker/docker-compose.yml up -d mongodb
docker compose -f docker/docker-compose.yml logs mongodb | tail
```

Expected: MongoDB logs "Waiting for connections".

- [ ] **Step 5: Commit**

```bash
git add docker/
git commit -m "feat: docker compose stack (mongodb + django + nginx)"
```

---

### Task 6: Create Nginx config

**Files:**
- Create: `docker/nginx/nginx.conf`

- [ ] **Step 1: Create nginx.conf**

File: `docker/nginx/nginx.conf`

```nginx
upstream django_app {
    server django:8000;
}

server {
    listen 80;
    server_name _;

    client_max_body_size 20M;

    location /static/ {
        alias /var/www/static/;
        expires 7d;
        access_log off;
    }

    location /protected_media/ {
        internal;
        alias /var/www/media/;
    }

    location / {
        proxy_pass http://django_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
}
```

The `/protected_media/` location is used by Django's `X-Accel-Redirect` for authorized file downloads.

- [ ] **Step 2: Commit**

```bash
git add docker/nginx/
git commit -m "feat: nginx reverse proxy config with X-Accel-Redirect for media"
```

---

## Phase 2 — Domain models

### Task 7: Create `core` app (landing page placeholder)

**Files:**
- Create: `src/core/` (Django app)
- Modify: `src/config/urls.py`

- [ ] **Step 1: Create app**

```bash
cd D:/Xavi/ProjectsITIC/dualiza/src
python manage.py startapp core
```

- [ ] **Step 2: Add minimal view**

File: `src/core/views.py`

```python
from django.shortcuts import redirect

def landing(request):
    return redirect("formulari")
```

- [ ] **Step 3: Create `core/urls.py`**

File: `src/core/urls.py`

```python
from django.urls import path
from . import views

urlpatterns = [
    path("", views.landing, name="landing"),
]
```

- [ ] **Step 4: Wire into root URLs**

File: `src/config/urls.py` — replace entirely:

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("api/v1/", include("api.urls")),
    path("", include("projectes.urls")),
    path("", include("empreses.urls")),
    path("", include("comptes.urls")),
    path("", include("core.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

- [ ] **Step 5: Commit**

```bash
git add src/core/ src/config/urls.py
git commit -m "feat: core app and root URL configuration"
```

---

### Task 8: Create `empreses` app with `Empresa` model (embedded `Contacte`)

**Files:**
- Create: `src/empreses/` (Django app)

- [ ] **Step 1: Create app**

```bash
cd D:/Xavi/ProjectsITIC/dualiza/src
python manage.py startapp empreses
```

- [ ] **Step 2: Write the model**

File: `src/empreses/models.py`

```python
from django.db import models
from django.conf import settings
from django_mongodb_backend.fields import EmbeddedModelField
from django_mongodb_backend.models import EmbeddedModel


MIDA_CHOICES = [
    ("autonom", "Autònom / freelance"),
    ("micro", "Micro (fins a 10)"),
    ("petita", "Petita (10-49)"),
    ("mitjana", "Mitjana (50-249)"),
    ("gran", "Gran (250+)"),
]

CONEIX_DUAL_CHOICES = [
    ("si", "Sí, el coneixem bé"),
    ("sentit", "N'hem sentit parlar"),
    ("no", "No, és nou per a nosaltres"),
]

PRACTIQUES_CHOICES = [
    ("iticbcn", "Sí, d'ITICBCN"),
    ("altres", "Sí, d'altres centres"),
    ("no", "No"),
]


class Contacte(EmbeddedModel):
    nom = models.CharField(max_length=200)
    carrec = models.CharField(max_length=100, blank=True)
    email = models.EmailField()
    telefon = models.CharField(max_length=20, blank=True)

    class Meta:
        managed = False

    def __str__(self):
        return f"{self.nom} <{self.email}>"


class Empresa(models.Model):
    nom = models.CharField(max_length=200)
    cif = models.CharField(max_length=20, blank=True)
    sector = models.CharField(max_length=100, blank=True)
    mida = models.CharField(max_length=30, choices=MIDA_CHOICES, blank=True)
    web = models.URLField(blank=True)
    adreca = models.CharField(max_length=300, blank=True)
    contacte = EmbeddedModelField(Contacte)
    coneix_dual = models.CharField(max_length=30, choices=CONEIX_DUAL_CHOICES, blank=True)
    practiques_passades = models.CharField(max_length=30, choices=PRACTIQUES_CHOICES, blank=True)
    practiques_actuals = models.CharField(max_length=30, choices=PRACTIQUES_CHOICES, blank=True)
    practiques_actuals_detall = models.TextField(blank=True)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="empresa",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "empreses"
        indexes = [
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return self.nom
```

- [ ] **Step 3: Create `empreses/urls.py` (empty for now)**

File: `src/empreses/urls.py`

```python
from django.urls import path

app_name = "empreses"
urlpatterns = []
```

- [ ] **Step 4: Verify `empreses.apps` registers correctly**

File: `src/empreses/apps.py` (should already exist from `startapp`):

```python
from django.apps import AppConfig

class EmpresesConfig(AppConfig):
    default_auto_field = "django_mongodb_backend.fields.ObjectIdAutoField"
    name = "empreses"
```

- [ ] **Step 5: Run `makemigrations`**

```bash
cd D:/Xavi/ProjectsITIC/dualiza/src
python manage.py makemigrations empreses
```

Expected: `Migrations for 'empreses': 0001_initial.py`.

- [ ] **Step 6: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/empreses/
git commit -m "feat(empreses): Empresa model with embedded Contacte"
```

---

### Task 9: Create `projectes` app with `Projecte` and `FitxerAdjunt` models

**Files:**
- Create: `src/projectes/` (Django app)

- [ ] **Step 1: Create app**

```bash
cd D:/Xavi/ProjectsITIC/dualiza/src
python manage.py startapp projectes
```

- [ ] **Step 2: Write the models**

File: `src/projectes/models.py`

```python
import hashlib
import os
from django.db import models
from empreses.models import Empresa


ESTAT_CHOICES = [
    ("nou", "Nou"),
    ("en_revisio", "En revisió"),
    ("aprovat", "Aprovat"),
    ("rebutjat", "Rebutjat"),
    ("en_curs", "En curs"),
    ("finalitzat", "Finalitzat"),
]

TIPUS_COL_LABORACIO_CHOICES = [
    "Dualiza",
    "Dual intensiva",
    "Repte puntual",
    "Parlem-ne",
]

ODS_CHOICES = [
    ("4", "ODS 4 · Educació de qualitat"),
    ("5", "ODS 5 · Igualtat de gènere"),
    ("7", "ODS 7 · Energia neta"),
    ("8", "ODS 8 · Treball decent"),
    ("9", "ODS 9 · Indústria i innovació"),
    ("10", "ODS 10 · Reducció de desigualtats"),
    ("11", "ODS 11 · Ciutats sostenibles"),
    ("12", "ODS 12 · Consum responsable"),
    ("13", "ODS 13 · Acció pel clima"),
    ("17", "ODS 17 · Aliances"),
]

ESTUDIANTS_CHOICES = [
    ("1", "1"),
    ("2", "2"),
    ("3", "3"),
    ("4-5", "4-5"),
    ("6+", "6 o més"),
    ("flex", "Flexible"),
]

MODALITAT_CHOICES = [
    ("presencial", "Presencial"),
    ("hibrid", "Híbrid"),
    ("remot", "Remot"),
]


class Projecte(models.Model):
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name="projectes"
    )
    titol = models.CharField(max_length=200)
    descripcio = models.TextField()
    tipus_col_laboracio = models.JSONField(default=list)  # list[str]
    tecnologies = models.JSONField(default=list)  # list[str]
    tecnologies_altres = models.CharField(max_length=500, blank=True)
    estudiants_previst = models.CharField(max_length=20, choices=ESTUDIANTS_CHOICES, blank=True)
    modalitat_treball = models.CharField(max_length=50, choices=MODALITAT_CHOICES, blank=True)
    data_inici_preferent = models.DateField(null=True, blank=True)
    pressupost_orientatiu = models.CharField(max_length=100, blank=True)
    ods = models.JSONField(default=list)  # list[str]
    estat = models.CharField(max_length=30, choices=ESTAT_CHOICES, default="nou")
    notes_internes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "projectes"
        indexes = [
            models.Index(fields=["estat"]),
            models.Index(fields=["empresa"]),
            models.Index(fields=["-created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.titol} ({self.empresa.nom})"


def projecte_upload_path(instance, filename):
    name, ext = os.path.splitext(filename)
    hashed = hashlib.sha1(f"{instance.projecte_id}{filename}".encode()).hexdigest()[:10]
    safe_name = "".join(c if c.isalnum() or c in "-_." else "_" for c in name)
    return f"projectes/{instance.projecte_id}/{hashed}_{safe_name}{ext}"


class FitxerAdjunt(models.Model):
    projecte = models.ForeignKey(
        Projecte, on_delete=models.CASCADE, related_name="fitxers"
    )
    fitxer = models.FileField(upload_to=projecte_upload_path)
    nom_original = models.CharField(max_length=255)
    mida_bytes = models.IntegerField()
    mime_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "fitxers"
        indexes = [
            models.Index(fields=["projecte"]),
        ]

    def __str__(self):
        return self.nom_original
```

- [ ] **Step 3: Verify `apps.py`**

File: `src/projectes/apps.py` — ensure `default_auto_field` matches:

```python
from django.apps import AppConfig

class ProjectesConfig(AppConfig):
    default_auto_field = "django_mongodb_backend.fields.ObjectIdAutoField"
    name = "projectes"
```

- [ ] **Step 4: Create `projectes/urls.py` placeholder**

File: `src/projectes/urls.py`

```python
from django.urls import path

app_name = "projectes"
urlpatterns = []
```

- [ ] **Step 5: Run `makemigrations`**

```bash
cd D:/Xavi/ProjectsITIC/dualiza/src
python manage.py makemigrations projectes
```

- [ ] **Step 6: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/projectes/
git commit -m "feat(projectes): Projecte and FitxerAdjunt models"
```

---

### Task 10: Create `comptes` app for auth extensions

**Files:**
- Create: `src/comptes/` (Django app)

- [ ] **Step 1: Create app**

```bash
cd D:/Xavi/ProjectsITIC/dualiza/src
python manage.py startapp comptes
```

- [ ] **Step 2: Empty URL conf for now**

File: `src/comptes/urls.py`

```python
from django.urls import path

app_name = "comptes"
urlpatterns = []
```

- [ ] **Step 3: Ensure `apps.py` has correct auto field**

File: `src/comptes/apps.py`

```python
from django.apps import AppConfig

class ComptesConfig(AppConfig):
    default_auto_field = "django_mongodb_backend.fields.ObjectIdAutoField"
    name = "comptes"
```

- [ ] **Step 4: Create empty `models.py`**

File: `src/comptes/models.py`

```python
# Comptes app: registration, activation, and OAuth helpers live in views/forms.
# No custom models needed; we use Django's built-in User + allauth's tables.
```

- [ ] **Step 5: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/comptes/
git commit -m "feat(comptes): app scaffold for auth flows"
```

---

### Task 11: Run all migrations against local MongoDB

**Files:** none

- [ ] **Step 1: Start MongoDB locally (via Docker)**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
docker compose -f docker/docker-compose.yml up -d mongodb
```

- [ ] **Step 2: Point local env to localhost Mongo**

In `.env` (local dev), set:

```
MONGO_HOST=localhost
```

Also expose Mongo port in a dev override. Create `docker/docker-compose.override.yml`:

```yaml
services:
  mongodb:
    ports:
      - "27017:27017"
```

Restart: `docker compose -f docker/docker-compose.yml up -d mongodb`.

- [ ] **Step 3: Run migrations**

```bash
cd D:/Xavi/ProjectsITIC/dualiza/src
python manage.py migrate
```

Expected: collections created in MongoDB `dualiza` database. Verify:

```bash
docker exec -it $(docker compose -f ../docker/docker-compose.yml ps -q mongodb) mongosh -u $MONGO_USER -p $MONGO_PASSWORD --authenticationDatabase admin --eval 'use dualiza; show collections'
```

Should list: `empreses`, `projectes`, `fitxers`, `auth_user`, `django_session`, etc.

Note: the `$MONGO_USER` and `$MONGO_PASSWORD` env vars must be in your shell. Load them from `.env`:

```bash
export $(grep -v '^#' .env | xargs)
```

- [ ] **Step 4: Commit `docker-compose.override.yml.example`**

Rename the override file and add an example variant to git (the real one stays gitignored):

```bash
cp docker/docker-compose.override.yml docker/docker-compose.override.yml.example
git add docker/docker-compose.override.yml.example
git commit -m "chore: dev override example exposing mongodb port"
```

---

## Phase 3 — Public form submission

### Task 12: Write the `ProjecteForm` with all form fields

**Files:**
- Create: `src/projectes/forms.py`
- Create: `src/projectes/tests.py` (overwrite the `startapp` stub)

- [ ] **Step 1: Write failing test for form validation (TDD)**

File: `src/projectes/tests.py`

```python
from django.test import TestCase
from projectes.forms import ProjecteForm


class ProjecteFormTest(TestCase):
    def _valid_data(self):
        return {
            # empresa
            "company_name": "ACME SL",
            "company_cif": "B12345678",
            "company_sector": "IT",
            "company_size": "micro",
            "company_web": "https://acme.example",
            "company_address": "Carrer Exemple 1, Barcelona",
            # contacte
            "contact_name": "Anna Soler",
            "contact_role": "CTO",
            "contact_email": "anna@acme.example",
            "contact_phone": "600000000",
            # col·laboració
            "collab_type": ["Dualiza"],
            "know_dual": "si",
            "past_internships": "no",
            "current_internships": "no",
            "current_internships_detail": "",
            # projecte
            "project_title": "Sistema de reserves",
            "project_description": "Plataforma interna per a reserves de recursos",
            "tech": ["Python", "Django · Flask · FastAPI"],
            "tech_other": "",
            "students_count": "2",
            "work_mode": "hibrid",
            "start_date": "",
            "project_budget": "",
            "ods": ["4", "9"],
            # gdpr
            "gdpr": True,
        }

    def test_form_valid_with_minimum_required(self):
        data = self._valid_data()
        form = ProjecteForm(data=data)
        self.assertTrue(form.is_valid(), form.errors)

    def test_form_invalid_without_company_name(self):
        data = self._valid_data()
        data["company_name"] = ""
        form = ProjecteForm(data=data)
        self.assertFalse(form.is_valid())
        self.assertIn("company_name", form.errors)

    def test_form_invalid_without_gdpr(self):
        data = self._valid_data()
        data["gdpr"] = False
        form = ProjecteForm(data=data)
        self.assertFalse(form.is_valid())
        self.assertIn("gdpr", form.errors)

    def test_form_invalid_without_contact_email(self):
        data = self._valid_data()
        data["contact_email"] = ""
        form = ProjecteForm(data=data)
        self.assertFalse(form.is_valid())
        self.assertIn("contact_email", form.errors)
```

- [ ] **Step 2: Run tests to see them fail**

```bash
cd D:/Xavi/ProjectsITIC/dualiza/src
python manage.py test projectes
```

Expected: ImportError or 4 failures, because `forms.py` doesn't exist.

- [ ] **Step 3: Implement the form**

File: `src/projectes/forms.py`

```python
from django import forms
from projectes.models import (
    TIPUS_COL_LABORACIO_CHOICES,
    ODS_CHOICES,
    ESTUDIANTS_CHOICES,
    MODALITAT_CHOICES,
)
from empreses.models import MIDA_CHOICES, CONEIX_DUAL_CHOICES, PRACTIQUES_CHOICES


class ProjecteForm(forms.Form):
    # Empresa
    company_name = forms.CharField(max_length=200, required=True)
    company_cif = forms.CharField(max_length=20, required=False)
    company_sector = forms.CharField(max_length=100, required=False)
    company_size = forms.ChoiceField(choices=[("", "—")] + MIDA_CHOICES, required=False)
    company_web = forms.URLField(required=False)
    company_address = forms.CharField(max_length=300, required=False)

    # Contacte
    contact_name = forms.CharField(max_length=200, required=True)
    contact_role = forms.CharField(max_length=100, required=False)
    contact_email = forms.EmailField(required=True)
    contact_phone = forms.CharField(max_length=20, required=False)

    # Col·laboració (free-form multi-value — validated in clean_collab_type)
    collab_type = forms.CharField(required=False)
    know_dual = forms.ChoiceField(
        choices=CONEIX_DUAL_CHOICES, widget=forms.RadioSelect, required=False
    )
    past_internships = forms.ChoiceField(
        choices=PRACTIQUES_CHOICES, widget=forms.RadioSelect, required=False
    )
    current_internships = forms.ChoiceField(
        choices=PRACTIQUES_CHOICES, widget=forms.RadioSelect, required=False
    )
    current_internships_detail = forms.CharField(max_length=300, required=False)

    # Projecte
    project_title = forms.CharField(max_length=200, required=True)
    project_description = forms.CharField(widget=forms.Textarea, required=True)
    tech = forms.CharField(required=False)                # collected via clean_tech
    tech_other = forms.CharField(max_length=500, required=False)
    students_count = forms.ChoiceField(
        choices=[("", "—")] + ESTUDIANTS_CHOICES, required=False
    )
    work_mode = forms.ChoiceField(
        choices=[("", "—")] + MODALITAT_CHOICES, required=False
    )
    start_date = forms.DateField(required=False)
    project_budget = forms.CharField(max_length=100, required=False)
    ods = forms.CharField(required=False)                 # collected via clean_ods

    # GDPR
    gdpr = forms.BooleanField(required=True)

    # `tech`, `collab_type` and `ods` are free-form multi-value fields.
    # We don't constrain the choices here because the HTML form has evolving
    # checkbox chips; any value submitted is accepted as-is.

    def _multi(self, key):
        """Return list of submitted values, tolerant of dict or QueryDict."""
        if hasattr(self.data, "getlist"):
            return self.data.getlist(key)
        v = self.data.get(key, [])
        return v if isinstance(v, list) else [v]

    def clean_tech(self):
        return self._multi("tech")

    def clean_collab_type(self):
        return self._multi("collab_type")

    def clean_ods(self):
        return self._multi("ods")
```

Note: we bypass strict choice validation for `tech[]` because the HTML has dozens of chips and might evolve. Validation against known lists happens later if desired.

- [ ] **Step 4: Run tests — they should pass**

```bash
python manage.py test projectes
```

Expected: `OK (4 tests)`.

- [ ] **Step 5: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/projectes/forms.py src/projectes/tests.py
git commit -m "feat(projectes): ProjecteForm with validation tests"
```

---

### Task 13: Create the template `formulari.html` adapting the existing HTML

**Files:**
- Create: `src/templates/base.html`
- Create: `src/templates/formulari.html`
- Create: `src/templates/enviat.html`

- [ ] **Step 1: Create `base.html`**

File: `src/templates/base.html`

```html
{% load static %}
<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{% block title %}DUALIZA · ITICBCN{% endblock %}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap">
    {% block extra_head %}{% endblock %}
</head>
<body>
    {% if messages %}
    <div class="messages">
        {% for message in messages %}<div class="msg msg-{{ message.tags }}">{{ message }}</div>{% endfor %}
    </div>
    {% endif %}
    {% block content %}{% endblock %}
</body>
</html>
```

- [ ] **Step 2: Copy and adapt the form HTML**

Copy the existing `D:/Xavi/ProjectsITIC/DUAL-SolucionesClaude/Dualiza/formulari-projectes.html` into `src/templates/formulari.html` making these surgical edits:

- Wrap everything from `<!DOCTYPE html>` up through the closing `</head>` — replace with `{% extends "base.html" %}{% block extra_head %}` and move the embedded `<style>` block inside `{% block extra_head %}...{% endblock %}`.
- Replace the `<body>` content with a `{% block content %}...{% endblock %}` body, moving the entire page markup inside.
- Change the `<form action="#" method="POST" enctype="multipart/form-data" novalidate>` to:
  ```
  <form action="{% url 'projectes:enviar' %}" method="POST" enctype="multipart/form-data" novalidate>
      {% csrf_token %}
      ...existing fields...
  </form>
  ```
- For any field that has server errors, the existing HTML already shows inline errors in divs with class `.field-error`. Augment each field with:
  ```
  {% if form.company_name.errors %}<div class="field-error">{{ form.company_name.errors.0 }}</div>{% endif %}
  ```
  for at minimum the required fields (`company_name`, `contact_name`, `contact_email`, `project_title`, `project_description`, `gdpr`).
- At the top of the form, if `form.non_field_errors`, render them.
- Keep all the existing JavaScript — it does client-side validation and stepper behavior and doesn't conflict with server-side.

The detailed rewrite is done manually (file is ~2800 lines). The diff against the original should be small: new `{% extends %}`, CSRF token, server-error divs on required fields, and `action` URL.

- [ ] **Step 3: Create `enviat.html`**

File: `src/templates/enviat.html`

```html
{% extends "base.html" %}
{% block title %}Proposta enviada · DUALIZA{% endblock %}
{% block content %}
<main style="max-width:640px;margin:80px auto;padding:24px;text-align:center;">
    <h1>Proposta rebuda · Gràcies!</h1>
    <p>Hem enviat una confirmació a <strong>{{ email }}</strong>.</p>
    <p>El nostre equip revisarà la proposta i us contactarà en breu.</p>
    {% if usuari_creat %}
        <p>Hem creat un compte amb aquest email. Reviseu la safata d'entrada per
           <strong>activar-lo i establir una contrasenya</strong>, i així podreu
           consultar l'estat de la vostra proposta en qualsevol moment.</p>
    {% endif %}
    <p style="margin-top:32px;">
        <a href="{% url 'formulari' %}">Enviar una altra proposta</a>
        · <a href="{% url 'account_login' %}">Entrar al compte</a>
    </p>
</main>
{% endblock %}
```

- [ ] **Step 4: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/templates/
git commit -m "feat: base template + adapted formulari + enviat template"
```

---

### Task 14: Write the view `enviar_formulari` that creates `Empresa`, `Projecte`, and user

**Files:**
- Modify: `src/projectes/views.py`
- Modify: `src/projectes/urls.py`
- Modify: `src/projectes/tests.py` (append integration test)

- [ ] **Step 1: Write integration test (TDD)**

Append to `src/projectes/tests.py`:

```python
from django.urls import reverse
from django.contrib.auth.models import User
from django.core import mail


class EnviarFormulariViewTest(TestCase):
    def _post_data(self):
        return {
            "company_name": "ACME SL",
            "company_cif": "B12345678",
            "company_sector": "IT",
            "company_size": "micro",
            "company_web": "https://acme.example",
            "company_address": "Barcelona",
            "contact_name": "Anna Soler",
            "contact_role": "CTO",
            "contact_email": "anna@acme.example",
            "contact_phone": "600000000",
            "collab_type": ["Dualiza"],
            "know_dual": "si",
            "past_internships": "no",
            "current_internships": "no",
            "current_internships_detail": "",
            "project_title": "Sistema de reserves",
            "project_description": "Plataforma interna",
            "tech": ["Python"],
            "tech_other": "",
            "students_count": "2",
            "work_mode": "hibrid",
            "start_date": "",
            "project_budget": "",
            "ods": ["4"],
            "gdpr": "on",
        }

    def test_post_creates_empresa_projecte_and_user(self):
        from empreses.models import Empresa
        from projectes.models import Projecte

        response = self.client.post(reverse("projectes:enviar"), self._post_data())
        self.assertEqual(response.status_code, 302)  # redirect to enviat
        self.assertTrue(User.objects.filter(email="anna@acme.example").exists())
        self.assertEqual(Empresa.objects.count(), 1)
        self.assertEqual(Projecte.objects.count(), 1)

    def test_post_sends_confirmation_email(self):
        self.client.post(reverse("projectes:enviar"), self._post_data())
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("anna@acme.example", mail.outbox[0].to)
```

- [ ] **Step 2: Run tests — expect failures**

```bash
cd D:/Xavi/ProjectsITIC/dualiza/src
python manage.py test projectes.tests.EnviarFormulariViewTest
```

Expected: NoReverseMatch or 404, because the view doesn't exist yet.

- [ ] **Step 3: Implement the view**

File: `src/projectes/views.py`

```python
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.urls import reverse
from django.views.decorators.http import require_http_methods

from projectes.forms import ProjecteForm
from projectes.models import Projecte, FitxerAdjunt
from empreses.models import Empresa, Contacte
from comptes.services import ensure_user_and_empresa, send_confirmacio_enviament


def formulari(request):
    form = ProjecteForm(request.POST or None, request.FILES or None)
    if request.method == "POST" and form.is_valid():
        return _process_submission(request, form)
    return render(request, "formulari.html", {"form": form})


def _process_submission(request, form):
    cd = form.cleaned_data
    contact_email = cd["contact_email"]

    user, empresa, usuari_creat = ensure_user_and_empresa(
        email=contact_email,
        empresa_data={
            "nom": cd["company_name"],
            "cif": cd.get("company_cif", ""),
            "sector": cd.get("company_sector", ""),
            "mida": cd.get("company_size", ""),
            "web": cd.get("company_web", ""),
            "adreca": cd.get("company_address", ""),
            "coneix_dual": cd.get("know_dual", ""),
            "practiques_passades": cd.get("past_internships", ""),
            "practiques_actuals": cd.get("current_internships", ""),
            "practiques_actuals_detall": cd.get("current_internships_detail", ""),
        },
        contacte_data={
            "nom": cd["contact_name"],
            "carrec": cd.get("contact_role", ""),
            "email": contact_email,
            "telefon": cd.get("contact_phone", ""),
        },
    )

    projecte = Projecte.objects.create(
        empresa=empresa,
        titol=cd["project_title"],
        descripcio=cd["project_description"],
        tipus_col_laboracio=cd.get("collab_type", []),
        tecnologies=cd.get("tech", []),
        tecnologies_altres=cd.get("tech_other", ""),
        estudiants_previst=cd.get("students_count", ""),
        modalitat_treball=cd.get("work_mode", ""),
        data_inici_preferent=cd.get("start_date") or None,
        pressupost_orientatiu=cd.get("project_budget", ""),
        ods=cd.get("ods", []),
    )

    for f in request.FILES.getlist("project_files"):
        FitxerAdjunt.objects.create(
            projecte=projecte,
            fitxer=f,
            nom_original=f.name,
            mida_bytes=f.size,
            mime_type=f.content_type or "application/octet-stream",
        )

    send_confirmacio_enviament(user, empresa, projecte, usuari_creat=usuari_creat)

    return redirect(f"{reverse('projectes:enviat')}?email={contact_email}&nou={int(usuari_creat)}")


def enviat(request):
    return render(request, "enviat.html", {
        "email": request.GET.get("email", ""),
        "usuari_creat": request.GET.get("nou") == "1",
    })
```

- [ ] **Step 4: Wire up URLs**

File: `src/projectes/urls.py`

```python
from django.urls import path
from . import views

app_name = "projectes"
urlpatterns = [
    path("formulari/", views.formulari, name="enviar"),
    path("enviat/", views.enviat, name="enviat"),
]
```

All templates use `{% url 'projectes:enviar' %}` (namespaced).

- [ ] **Step 5: Placeholder `comptes.services`**

The view calls `ensure_user_and_empresa` and `send_confirmacio_enviament` from `comptes.services`, which don't exist yet. Create a stub so imports work:

File: `src/comptes/services.py`

```python
from django.contrib.auth.models import User
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

from empreses.models import Empresa, Contacte


def ensure_user_and_empresa(*, email, empresa_data, contacte_data):
    """Create or fetch a User by email and ensure an Empresa is linked.

    Returns (user, empresa, usuari_creat: bool).
    """
    user, created = User.objects.get_or_create(
        email=email,
        defaults={"username": email},
    )
    if created:
        user.set_unusable_password()
        user.save()

    empresa, _ = Empresa.objects.get_or_create(
        user=user,
        defaults={
            **empresa_data,
            "contacte": Contacte(**contacte_data),
        },
    )
    return user, empresa, created


def send_confirmacio_enviament(user, empresa, projecte, *, usuari_creat):
    ctx = {
        "user": user,
        "empresa": empresa,
        "projecte": projecte,
        "usuari_creat": usuari_creat,
    }
    subject = "Hem rebut la vostra proposta · DUALIZA"
    text = render_to_string("emails/confirmacio_enviament.txt", ctx)
    html = render_to_string("emails/confirmacio_enviament.html", ctx)
    msg = EmailMultiAlternatives(subject, text, settings.DEFAULT_FROM_EMAIL, [user.email])
    msg.attach_alternative(html, "text/html")
    try:
        msg.send()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).exception("Failed to send confirmacio email: %s", exc)
```

- [ ] **Step 6: Create email templates (minimal)**

File: `src/templates/emails/confirmacio_enviament.txt`

```
Hola {{ empresa.contacte.nom }},

Hem rebut la vostra proposta "{{ projecte.titol }}" al programa DUALIZA d'ITICBCN.
El nostre equip la revisarà i us contactarà en breu.

{% if usuari_creat %}
Hem creat un compte amb aquest email. Activeu-lo per poder consultar l'estat de la
vostra proposta en qualsevol moment: activeu-lo clicant el botó "He oblidat la contrasenya"
al login i establint una contrasenya nova.
{% endif %}

Atentament,
Equip DUALIZA · ITICBCN
```

File: `src/templates/emails/confirmacio_enviament.html`

```html
<!DOCTYPE html>
<html><body style="font-family:Roboto,Arial,sans-serif;color:#1a1a2e;max-width:640px;margin:auto;">
<h2>Proposta rebuda · DUALIZA</h2>
<p>Hola <strong>{{ empresa.contacte.nom }}</strong>,</p>
<p>Hem rebut la vostra proposta <strong>"{{ projecte.titol }}"</strong> al programa DUALIZA d'ITICBCN.</p>
<p>El nostre equip la revisarà i us contactarà en breu.</p>
{% if usuari_creat %}
<p>Hem creat un compte amb aquest email. Per activar-lo i consultar l'estat de la vostra proposta,
cliqueu "He oblidat la contrasenya" al login i establiu una contrasenya nova.</p>
{% endif %}
<p>Atentament,<br>Equip DUALIZA · ITICBCN</p>
</body></html>
```

- [ ] **Step 7: Run tests**

```bash
cd D:/Xavi/ProjectsITIC/dualiza/src
python manage.py test projectes
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/projectes/views.py src/projectes/urls.py src/projectes/tests.py src/comptes/services.py src/templates/emails/
git commit -m "feat: form submission view creates Empresa+Projecte+User and sends email"
```

---

### Task 15: File upload validation

**Files:**
- Modify: `src/projectes/forms.py`
- Modify: `src/projectes/tests.py`

- [ ] **Step 1: Write failing tests**

Append to `src/projectes/tests.py`:

```python
from django.core.files.uploadedfile import SimpleUploadedFile


class FileUploadValidationTest(TestCase):
    def _post_data(self):
        return {
            "company_name": "ACME SL",
            "contact_name": "Anna",
            "contact_email": "a@b.cat",
            "project_title": "X",
            "project_description": "Y",
            "gdpr": "on",
        }

    def test_rejects_oversized_file(self):
        big = SimpleUploadedFile("huge.pdf", b"0" * (11 * 1024 * 1024), content_type="application/pdf")
        response = self.client.post(
            reverse("projectes:enviar"),
            {**self._post_data(), "project_files": [big]},
        )
        self.assertNotEqual(response.status_code, 302)
        self.assertContains(response, "10 MB")

    def test_rejects_disallowed_extension(self):
        bad = SimpleUploadedFile("shell.exe", b"MZ\x00\x00", content_type="application/x-msdownload")
        response = self.client.post(
            reverse("projectes:enviar"),
            {**self._post_data(), "project_files": [bad]},
        )
        self.assertNotEqual(response.status_code, 302)

    def test_rejects_more_than_ten_files(self):
        files = [
            SimpleUploadedFile(f"f{i}.pdf", b"ok", content_type="application/pdf")
            for i in range(11)
        ]
        response = self.client.post(
            reverse("projectes:enviar"),
            {**self._post_data(), "project_files": files},
        )
        self.assertNotEqual(response.status_code, 302)
```

- [ ] **Step 2: Run tests — they fail (validation not yet enforced)**

```bash
python manage.py test projectes.tests.FileUploadValidationTest
```

- [ ] **Step 3: Add validation to the form**

Modify `src/projectes/forms.py`: add a `project_files` field and a `clean` method.

```python
# Add at top:
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
                      ".zip", ".png", ".jpg", ".jpeg", ".gif", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024   # 10 MB
MAX_FILE_COUNT = 10


class MultiFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True


class ProjecteForm(forms.Form):
    # ... existing fields ...
    project_files = forms.FileField(
        widget=MultiFileInput(attrs={"multiple": True}),
        required=False,
    )

    def clean(self):
        cleaned = super().clean()
        files = self.files.getlist("project_files") if self.files else []

        if len(files) > MAX_FILE_COUNT:
            raise forms.ValidationError(f"Màxim {MAX_FILE_COUNT} fitxers per enviament.")

        for f in files:
            if f.size > MAX_FILE_SIZE:
                raise forms.ValidationError(
                    f"El fitxer '{f.name}' supera el límit de 10 MB."
                )
            import os
            _, ext = os.path.splitext(f.name.lower())
            if ext not in ALLOWED_EXTENSIONS:
                raise forms.ValidationError(
                    f"El fitxer '{f.name}' té una extensió no permesa ({ext})."
                )

        return cleaned
```

- [ ] **Step 4: Run tests — they pass**

```bash
python manage.py test projectes
```

- [ ] **Step 5: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/projectes/forms.py src/projectes/tests.py
git commit -m "feat(projectes): file upload validation (size, extension, count)"
```

---

### Task 16: Manual smoke test of form submission locally

**Files:** none (manual verification)

- [ ] **Step 1: Start the stack**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
# Make sure EMAIL_BACKEND is console for dev:
# In .env: EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
docker compose -f docker/docker-compose.yml up --build
```

- [ ] **Step 2: Hit the form**

Open browser at `http://localhost/formulari/`. Fill in required fields. Submit.

Expected: redirect to `/enviat/?email=...&nou=1` showing the success page. The Django container logs should show the email printed (console backend).

- [ ] **Step 3: Verify data in MongoDB**

```bash
docker exec -it $(docker compose -f docker/docker-compose.yml ps -q mongodb) \
  mongosh -u $MONGO_USER -p $MONGO_PASSWORD --authenticationDatabase admin \
  --eval 'use dualiza; db.empreses.find().pretty(); db.projectes.find().pretty()'
```

Expected: one empresa document and one projecte document.

- [ ] **Step 4: Commit note (optional)**

No code change. Move to next task.

---

## Phase 4 — Authentication (password + Google OAuth)

### Task 17: Configure `django-allauth` URLs and templates for password login

**Design note on the activation flow:** The spec's §6.2 lists an `activacio_compte.html` template for account creation. We **merge that flow into `confirmacio_enviament`** (which already tells the user how to "activate" by using password reset). This avoids duplicating templates for the same UX: one email after form submission explains both "we got your proposal" and "here's how to set a password". No custom activation endpoint is needed — allauth's built-in password reset works.


**Files:**
- Modify: `src/comptes/urls.py`
- Create: `src/templates/account/login.html`
- Create: `src/templates/account/signup.html`
- Create: `src/templates/account/email/*.txt`

- [ ] **Step 1: Override `account/login.html`**

File: `src/templates/account/login.html`

```html
{% extends "base.html" %}
{% block title %}Entrar · DUALIZA{% endblock %}
{% block content %}
<main style="max-width:420px;margin:80px auto;padding:24px;">
  <h1>Entrar</h1>
  <form method="POST" action="{% url 'account_login' %}">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit" class="btn">Entrar</button>
  </form>
  <p style="margin-top:16px;">
    <a href="{% url 'account_reset_password' %}">He oblidat la contrasenya</a>
  </p>
  {% load socialaccount %}
  {% get_providers as providers %}
  {% if providers %}
  <hr style="margin:24px 0;">
  <p>O entra amb:</p>
  {% for provider in providers %}
    {% if provider.id == "google" %}
      <a href="{% provider_login_url 'google' %}" class="btn">Entra amb Google</a>
    {% endif %}
  {% endfor %}
  {% endif %}
</main>
{% endblock %}
```

- [ ] **Step 2: Override `account/signup.html`** (minimal — we don't actively advertise signup)

File: `src/templates/account/signup.html`

```html
{% extends "base.html" %}
{% block title %}Crear compte · DUALIZA{% endblock %}
{% block content %}
<main style="max-width:420px;margin:80px auto;padding:24px;">
  <h1>Crear compte</h1>
  <p>Si ja heu enviat un formulari, <a href="{% url 'account_login' %}">entreu aquí</a> amb el vostre email.</p>
  <form method="POST" action="{% url 'account_signup' %}">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit" class="btn">Crear compte</button>
  </form>
</main>
{% endblock %}
```

- [ ] **Step 3: Catalan override for allauth email templates (optional for MVP)**

Copy at minimum `account/email/email_confirmation_subject.txt` and `account/email/email_confirmation_message.txt` under `src/templates/account/email/` and translate. This task is optional; allauth defaults will work in English.

- [ ] **Step 4: Verify URLs work**

```bash
python manage.py runserver
```

Open `http://localhost:8000/accounts/login/` — should render our override template.

- [ ] **Step 5: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/templates/account/
git commit -m "feat(comptes): allauth template overrides for login/signup"
```

---

### Task 18: Set up Google OAuth app credentials

**Files:**
- Modify: `.env` (local)

- [ ] **Step 1: Create Google OAuth credentials**

Go to https://console.cloud.google.com/apis/credentials:

1. Create an OAuth 2.0 Client ID (type: Web application).
2. Authorized redirect URIs:
   - `http://localhost/accounts/google/login/callback/`
   - `http://150.230.183.140/accounts/google/login/callback/`
   - (later) `https://dualiza.iticbcn.cat/accounts/google/login/callback/`
3. Note the Client ID and Secret.

- [ ] **Step 2: Put secrets in `.env`**

```
GOOGLE_OAUTH_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=...
```

- [ ] **Step 3: Create the SocialApp via Django admin**

Since allauth reads from the `APP` dict in settings, this step is often unnecessary — but some allauth versions require a `SocialApp` DB row. To be safe:

```bash
python manage.py shell -c "
from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site
site = Site.objects.get(pk=1)
app, _ = SocialApp.objects.get_or_create(
    provider='google',
    defaults={'name': 'Google', 'client_id': 'placeholder', 'secret': 'placeholder'}
)
app.sites.add(site)
"
```

(The `APP` in settings takes precedence over DB values; this just satisfies allauth's schema check.)

- [ ] **Step 4: Smoke test**

Start `runserver`. Go to `/accounts/login/` → click "Entra amb Google" → should redirect to Google consent.

- [ ] **Step 5: Commit** (only the README, secrets stay in .env)

Update `README.md`:

```markdown
## Google OAuth setup

1. Create OAuth 2.0 credentials at https://console.cloud.google.com/apis/credentials
2. Add redirect URIs: `<domain>/accounts/google/login/callback/`
3. Put the ID and secret in `.env` as `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`.
```

```bash
git add README.md
git commit -m "docs: Google OAuth setup instructions"
```

---

### Task 19: Hook empresa.user creation and bind allauth SocialAccount linking

**Files:**
- Create: `src/comptes/adapters.py`
- Modify: `src/config/settings.py`

- [ ] **Step 1: Create a custom social account adapter**

Google OAuth might create a new User when someone signs in with Google using an email that already exists as a password user. We want to link by email.

File: `src/comptes/adapters.py`

```python
from allauth.account.utils import user_email
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth.models import User


class DualizaSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """Link social login to existing User by email when possible."""
        if sociallogin.is_existing:
            return

        email = user_email(sociallogin.user)
        if not email:
            return

        try:
            existing = User.objects.get(email=email)
        except User.DoesNotExist:
            return

        sociallogin.connect(request, existing)
```

- [ ] **Step 2: Register adapter in settings**

Add to `src/config/settings.py`:

```python
SOCIALACCOUNT_ADAPTER = "comptes.adapters.DualizaSocialAccountAdapter"
```

- [ ] **Step 3: Write test**

File: `src/comptes/tests.py`

```python
from django.test import TestCase
from django.contrib.auth.models import User


class AdapterLogicTest(TestCase):
    def test_existing_user_is_looked_up_by_email(self):
        User.objects.create_user(username="anna@example.com", email="anna@example.com")
        qs = User.objects.filter(email="anna@example.com")
        self.assertEqual(qs.count(), 1)
```

(Full end-to-end OAuth test is complex — this placeholder test confirms the query we rely on.)

- [ ] **Step 4: Run tests**

```bash
python manage.py test comptes
```

- [ ] **Step 5: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/comptes/adapters.py src/config/settings.py src/comptes/tests.py
git commit -m "feat(comptes): link Google OAuth to existing User by email"
```

---

## Phase 5 — Empresa dashboard and project visibility

### Task 20: Dashboard view listing the user's projects

**Files:**
- Create: `src/empreses/views.py` (replace)
- Modify: `src/empreses/urls.py`
- Create: `src/templates/dashboard.html`

- [ ] **Step 1: Write failing test**

File: `src/empreses/tests.py`

```python
from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from empreses.models import Empresa, Contacte
from projectes.models import Projecte


class DashboardTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="a@b.cat", email="a@b.cat", password="pass12345")
        self.empresa = Empresa.objects.create(
            user=self.user,
            nom="ACME",
            contacte=Contacte(nom="Anna", email="a@b.cat"),
        )
        self.projecte = Projecte.objects.create(
            empresa=self.empresa, titol="P1", descripcio="d"
        )

    def test_dashboard_requires_login(self):
        response = self.client.get(reverse("empreses:dashboard"))
        self.assertEqual(response.status_code, 302)

    def test_dashboard_shows_own_projects(self):
        self.client.login(username="a@b.cat", password="pass12345")
        response = self.client.get(reverse("empreses:dashboard"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "P1")

    def test_dashboard_hides_other_empresas_projects(self):
        other_user = User.objects.create_user(username="c@d.cat", email="c@d.cat", password="pass12345")
        other_empresa = Empresa.objects.create(
            user=other_user, nom="OTHER",
            contacte=Contacte(nom="C", email="c@d.cat"),
        )
        Projecte.objects.create(empresa=other_empresa, titol="P_OTHER", descripcio="x")

        self.client.login(username="a@b.cat", password="pass12345")
        response = self.client.get(reverse("empreses:dashboard"))
        self.assertNotContains(response, "P_OTHER")
```

- [ ] **Step 2: Run tests — expect fail**

```bash
python manage.py test empreses
```

- [ ] **Step 3: Implement the view**

File: `src/empreses/views.py`

```python
from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def dashboard(request):
    empresa = getattr(request.user, "empresa", None)
    projectes = empresa.projectes.all() if empresa else []
    return render(request, "dashboard.html", {
        "empresa": empresa,
        "projectes": projectes,
    })
```

File: `src/empreses/urls.py`

```python
from django.urls import path
from . import views

app_name = "empreses"
urlpatterns = [
    path("dashboard/", views.dashboard, name="dashboard"),
]
```

- [ ] **Step 4: Template**

File: `src/templates/dashboard.html`

```html
{% extends "base.html" %}
{% block title %}El vostre compte · DUALIZA{% endblock %}
{% block content %}
<main style="max-width:960px;margin:40px auto;padding:24px;">
  <header style="display:flex;justify-content:space-between;align-items:center;">
    <h1>Les vostres propostes</h1>
    <form method="POST" action="{% url 'account_logout' %}" style="display:inline;">
        {% csrf_token %}
        <button type="submit" class="btn">Sortir</button>
    </form>
  </header>
  {% if empresa %}
    <p>Empresa: <strong>{{ empresa.nom }}</strong></p>
  {% else %}
    <p>No teniu cap empresa associada al vostre compte.</p>
  {% endif %}

  {% if projectes %}
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead><tr><th align="left">Títol</th><th align="left">Estat</th><th align="left">Data</th></tr></thead>
      <tbody>
      {% for p in projectes %}
        <tr>
          <td><a href="{% url 'projectes:detall' p.pk %}">{{ p.titol }}</a></td>
          <td>{{ p.get_estat_display }}</td>
          <td>{{ p.created_at|date:"d/m/Y" }}</td>
        </tr>
      {% endfor %}
      </tbody>
    </table>
  {% else %}
    <p>Encara no heu enviat cap proposta. <a href="{% url 'projectes:enviar' %}">Enviar-ne una ara</a>.</p>
  {% endif %}
</main>
{% endblock %}
```

- [ ] **Step 5: Run tests — all pass**

- [ ] **Step 6: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/empreses/views.py src/empreses/urls.py src/empreses/tests.py src/templates/dashboard.html
git commit -m "feat(empreses): dashboard listing logged-in user's projects"
```

---

### Task 21: Project detail view (read-only for now)

**Files:**
- Modify: `src/projectes/views.py`
- Modify: `src/projectes/urls.py`
- Create: `src/templates/projecte_detail.html`
- Modify: `src/projectes/tests.py`

- [ ] **Step 1: Test access control**

Append to `src/projectes/tests.py`:

```python
class ProjecteDetallTest(TestCase):
    def setUp(self):
        from empreses.models import Empresa, Contacte
        self.u1 = User.objects.create_user(username="a@b.cat", email="a@b.cat", password="pw12345678")
        self.u2 = User.objects.create_user(username="c@d.cat", email="c@d.cat", password="pw12345678")
        self.e1 = Empresa.objects.create(user=self.u1, nom="E1", contacte=Contacte(nom="A", email="a@b.cat"))
        self.e2 = Empresa.objects.create(user=self.u2, nom="E2", contacte=Contacte(nom="B", email="c@d.cat"))
        self.p1 = Projecte.objects.create(empresa=self.e1, titol="P1", descripcio="x")

    def test_owner_can_view(self):
        self.client.login(username="a@b.cat", password="pw12345678")
        resp = self.client.get(reverse("projectes:detall", args=[str(self.p1.pk)]))
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "P1")

    def test_non_owner_gets_403(self):
        self.client.login(username="c@d.cat", password="pw12345678")
        resp = self.client.get(reverse("projectes:detall", args=[str(self.p1.pk)]))
        self.assertEqual(resp.status_code, 403)

    def test_anonymous_redirected_to_login(self):
        resp = self.client.get(reverse("projectes:detall", args=[str(self.p1.pk)]))
        self.assertEqual(resp.status_code, 302)
```

- [ ] **Step 2: Implement view**

Append to `src/projectes/views.py`:

```python
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404


@login_required
def detall(request, pk):
    projecte = get_object_or_404(Projecte, pk=pk)
    if not (request.user.is_staff or
            (hasattr(request.user, "empresa") and projecte.empresa_id == request.user.empresa.pk)):
        raise PermissionDenied
    return render(request, "projecte_detail.html", {"projecte": projecte})
```

Add URL in `src/projectes/urls.py`:

```python
path("projectes/<str:pk>/", views.detall, name="detall"),
```

- [ ] **Step 3: Template**

File: `src/templates/projecte_detail.html`

```html
{% extends "base.html" %}
{% block title %}{{ projecte.titol }} · DUALIZA{% endblock %}
{% block content %}
<main style="max-width:760px;margin:40px auto;padding:24px;">
  <p><a href="{% url 'empreses:dashboard' %}">← Tornar</a></p>
  <h1>{{ projecte.titol }}</h1>
  <p><strong>Estat:</strong> {{ projecte.get_estat_display }}</p>
  <p><strong>Empresa:</strong> {{ projecte.empresa.nom }}</p>
  <p><strong>Data enviament:</strong> {{ projecte.created_at|date:"d/m/Y H:i" }}</p>

  <h2>Descripció</h2>
  <p>{{ projecte.descripcio|linebreaks }}</p>

  {% if projecte.tecnologies %}<h2>Tecnologies</h2><ul>{% for t in projecte.tecnologies %}<li>{{ t }}</li>{% endfor %}</ul>{% endif %}
  {% if projecte.ods %}<h2>ODS</h2><ul>{% for o in projecte.ods %}<li>ODS {{ o }}</li>{% endfor %}</ul>{% endif %}

  <h2>Fitxers adjunts</h2>
  {% if projecte.fitxers.all %}
  <ul>
    {% for f in projecte.fitxers.all %}
      <li><a href="{% url 'projectes:descarregar_fitxer' f.pk %}">{{ f.nom_original }}</a> ({{ f.mida_bytes|filesizeformat }})</li>
    {% endfor %}
  </ul>
  {% else %}<p>Cap fitxer adjunt.</p>{% endif %}
</main>
{% endblock %}
```

- [ ] **Step 4: Run tests — all pass**

- [ ] **Step 5: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/projectes/
git add src/templates/projecte_detail.html
git commit -m "feat(projectes): detail view with access control"
```

---

### Task 22: File download view with `X-Accel-Redirect`

**Files:**
- Modify: `src/projectes/views.py`
- Modify: `src/projectes/urls.py`
- Modify: `src/projectes/tests.py`

- [ ] **Step 1: Tests**

Append:

```python
class FitxerDownloadTest(TestCase):
    def setUp(self):
        from empreses.models import Empresa, Contacte
        from projectes.models import FitxerAdjunt
        from django.core.files.uploadedfile import SimpleUploadedFile

        self.owner = User.objects.create_user(username="a@b.cat", email="a@b.cat", password="pw12345678")
        self.stranger = User.objects.create_user(username="c@d.cat", email="c@d.cat", password="pw12345678")
        e = Empresa.objects.create(user=self.owner, nom="E", contacte=Contacte(nom="A", email="a@b.cat"))
        self.p = Projecte.objects.create(empresa=e, titol="P", descripcio="d")
        self.f = FitxerAdjunt.objects.create(
            projecte=self.p,
            fitxer=SimpleUploadedFile("doc.pdf", b"pdf-bytes", content_type="application/pdf"),
            nom_original="doc.pdf",
            mida_bytes=9,
            mime_type="application/pdf",
        )

    def test_owner_can_download(self):
        self.client.login(username="a@b.cat", password="pw12345678")
        resp = self.client.get(reverse("projectes:descarregar_fitxer", args=[str(self.f.pk)]))
        self.assertEqual(resp.status_code, 200)

    def test_stranger_gets_403(self):
        self.client.login(username="c@d.cat", password="pw12345678")
        resp = self.client.get(reverse("projectes:descarregar_fitxer", args=[str(self.f.pk)]))
        self.assertEqual(resp.status_code, 403)
```

- [ ] **Step 2: Implement view**

Append to `src/projectes/views.py`:

```python
from django.http import HttpResponse, FileResponse
from django.conf import settings


@login_required
def descarregar_fitxer(request, pk):
    fitxer = get_object_or_404(FitxerAdjunt, pk=pk)
    projecte = fitxer.projecte
    if not (request.user.is_staff or
            (hasattr(request.user, "empresa") and projecte.empresa_id == request.user.empresa.pk)):
        raise PermissionDenied

    # In production (behind nginx), use X-Accel-Redirect
    if not settings.DEBUG:
        response = HttpResponse()
        response["Content-Type"] = fitxer.mime_type
        response["Content-Disposition"] = f'attachment; filename="{fitxer.nom_original}"'
        # nginx internal location is /protected_media/ → /var/www/media/
        response["X-Accel-Redirect"] = f"/protected_media/{fitxer.fitxer.name}"
        return response

    # Dev: stream directly
    return FileResponse(
        fitxer.fitxer.open("rb"),
        as_attachment=True,
        filename=fitxer.nom_original,
        content_type=fitxer.mime_type,
    )
```

Add URL:

```python
path("fitxers/<str:pk>/", views.descarregar_fitxer, name="descarregar_fitxer"),
```

- [ ] **Step 3: Run tests**

- [ ] **Step 4: Commit**

```bash
git add src/projectes/ 
git commit -m "feat(projectes): authenticated file download with X-Accel-Redirect in prod"
```

---

## Phase 6 — Admin (Django Admin + Unfold)

### Task 23: Configure Unfold theme and basic admin

**Files:**
- Modify: `src/config/settings.py` (Unfold config)
- Create: `src/empreses/admin.py`
- Create: `src/projectes/admin.py`

- [ ] **Step 1: Add Unfold config to settings**

Append to `src/config/settings.py`:

```python
UNFOLD = {
    "SITE_TITLE": "DUALIZA Admin",
    "SITE_HEADER": "DUALIZA · ITICBCN",
    "SITE_URL": "/",
    "COLORS": {
        "primary": {
            "500": "47 41 159",   # #2f299f
            "600": "40 35 140",
        },
    },
}
```

- [ ] **Step 2: Register Empresa**

File: `src/empreses/admin.py`

```python
from django.contrib import admin
from unfold.admin import ModelAdmin

from empreses.models import Empresa


@admin.register(Empresa)
class EmpresaAdmin(ModelAdmin):
    list_display = ("nom", "contacte_email", "sector", "mida", "created_at")
    list_filter = ("mida", "sector", "coneix_dual")
    search_fields = ("nom", "cif", "contacte__email", "contacte__nom")
    readonly_fields = ("created_at", "updated_at")

    def contacte_email(self, obj):
        return obj.contacte.email if obj.contacte else ""
    contacte_email.short_description = "Email contacte"
```

- [ ] **Step 3: Register Projecte with filters and actions**

File: `src/projectes/admin.py`

```python
from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline

from projectes.models import Projecte, FitxerAdjunt


class FitxerInline(TabularInline):
    model = FitxerAdjunt
    extra = 0
    readonly_fields = ("nom_original", "mida_bytes", "mime_type", "uploaded_at")


@admin.register(Projecte)
class ProjecteAdmin(ModelAdmin):
    list_display = ("titol", "empresa", "estat_badge", "created_at")
    list_filter = ("estat", "modalitat_treball", "estudiants_previst")
    search_fields = ("titol", "descripcio", "empresa__nom")
    list_editable = ("estat",) if False else ()  # keep actions-based for safety
    readonly_fields = ("created_at", "updated_at")
    inlines = [FitxerInline]
    actions = ["mark_en_revisio", "mark_aprovat", "mark_rebutjat"]

    def estat_badge(self, obj):
        colors = {
            "nou": "#888", "en_revisio": "#d49b12", "aprovat": "#14a86a",
            "rebutjat": "#e6478b", "en_curs": "#0aa89a", "finalitzat": "#4a4a6a",
        }
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:8px;font-size:12px;">{}</span>',
            colors.get(obj.estat, "#888"), obj.get_estat_display()
        )
    estat_badge.short_description = "Estat"

    def _set_estat(self, request, queryset, new_estat):
        for p in queryset:
            old = p.estat
            p.estat = new_estat
            p.save()
        self.message_user(request, f"{queryset.count()} projectes actualitzats a '{new_estat}'.")

    def mark_en_revisio(self, request, qs):
        self._set_estat(request, qs, "en_revisio")
    mark_en_revisio.short_description = "Marcar com en revisió"

    def mark_aprovat(self, request, qs):
        self._set_estat(request, qs, "aprovat")
    mark_aprovat.short_description = "Marcar com aprovat"

    def mark_rebutjat(self, request, qs):
        self._set_estat(request, qs, "rebutjat")
    mark_rebutjat.short_description = "Marcar com rebutjat"


@admin.register(FitxerAdjunt)
class FitxerAdjuntAdmin(ModelAdmin):
    list_display = ("nom_original", "projecte", "mida_bytes", "uploaded_at")
    readonly_fields = ("projecte", "fitxer", "nom_original", "mida_bytes", "mime_type", "uploaded_at")
```

- [ ] **Step 4: Smoke test**

```bash
python manage.py createsuperuser
python manage.py runserver
```

Open `http://localhost:8000/admin/`. Verify Unfold renders, and Empresa/Projecte/FitxerAdjunt are listed.

- [ ] **Step 5: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/empreses/admin.py src/projectes/admin.py src/config/settings.py
git commit -m "feat(admin): Unfold theme + Empresa/Projecte admin with status actions"
```

---

### Task 24: Signal to send email on estat change

**Files:**
- Create: `src/projectes/signals.py`
- Modify: `src/projectes/apps.py`
- Create: `src/templates/emails/canvi_estat.html`
- Create: `src/templates/emails/canvi_estat.txt`
- Modify: `src/projectes/tests.py`

- [ ] **Step 1: Test**

Append to `src/projectes/tests.py`:

```python
class EstatChangeEmailTest(TestCase):
    def setUp(self):
        from empreses.models import Empresa, Contacte
        self.u = User.objects.create_user(username="a@b.cat", email="a@b.cat", password="pw12345678")
        self.e = Empresa.objects.create(user=self.u, nom="E", contacte=Contacte(nom="A", email="a@b.cat"))
        self.p = Projecte.objects.create(empresa=self.e, titol="T", descripcio="d", estat="nou")

    def test_email_sent_on_estat_change(self):
        mail.outbox.clear()
        self.p.estat = "aprovat"
        self.p.save()
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("aprovat", mail.outbox[0].subject.lower())

    def test_no_email_when_other_field_changes(self):
        mail.outbox.clear()
        self.p.titol = "Nou títol"
        self.p.save()
        self.assertEqual(len(mail.outbox), 0)
```

- [ ] **Step 2: Run tests — fail**

- [ ] **Step 3: Implement signal**

File: `src/projectes/signals.py`

```python
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

from projectes.models import Projecte


@receiver(pre_save, sender=Projecte)
def _cache_old_estat(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            instance._old_estat = old.estat
        except sender.DoesNotExist:
            instance._old_estat = None
    else:
        instance._old_estat = None


@receiver(post_save, sender=Projecte)
def _notify_estat_change(sender, instance, created, **kwargs):
    if created:
        return
    old = getattr(instance, "_old_estat", None)
    if old == instance.estat or old is None:
        return

    empresa = instance.empresa
    ctx = {"projecte": instance, "empresa": empresa, "estat_nou": instance.get_estat_display()}
    subject = f"Canvi d'estat de la proposta: {instance.get_estat_display()}"
    text = render_to_string("emails/canvi_estat.txt", ctx)
    html = render_to_string("emails/canvi_estat.html", ctx)

    to = [empresa.contacte.email] if empresa and empresa.contacte else []
    if not to:
        return

    msg = EmailMultiAlternatives(subject, text, settings.DEFAULT_FROM_EMAIL, to)
    msg.attach_alternative(html, "text/html")
    try:
        msg.send()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).exception("Failed sending estat change email: %s", exc)
```

- [ ] **Step 4: Wire signals in apps.py**

File: `src/projectes/apps.py`

```python
from django.apps import AppConfig


class ProjectesConfig(AppConfig):
    default_auto_field = "django_mongodb_backend.fields.ObjectIdAutoField"
    name = "projectes"

    def ready(self):
        from projectes import signals  # noqa: F401
```

- [ ] **Step 5: Email templates**

File: `src/templates/emails/canvi_estat.txt`

```
Hola {{ empresa.contacte.nom }},

L'estat de la vostra proposta "{{ projecte.titol }}" ha canviat a: {{ estat_nou }}.

Podeu consultar-la al vostre compte:
https://dualiza.iticbcn.cat/dashboard/

Atentament,
Equip DUALIZA · ITICBCN
```

File: `src/templates/emails/canvi_estat.html`

```html
<!DOCTYPE html>
<html><body style="font-family:Roboto,Arial,sans-serif;color:#1a1a2e;max-width:640px;margin:auto;">
<h2>Canvi d'estat · DUALIZA</h2>
<p>Hola <strong>{{ empresa.contacte.nom }}</strong>,</p>
<p>L'estat de la vostra proposta <strong>"{{ projecte.titol }}"</strong> ha canviat a:</p>
<p style="font-size:18px;font-weight:bold;">{{ estat_nou }}</p>
<p>Podeu consultar-la al vostre <a href="https://dualiza.iticbcn.cat/dashboard/">compte DUALIZA</a>.</p>
<p>Atentament,<br>Equip DUALIZA · ITICBCN</p>
</body></html>
```

- [ ] **Step 6: Run tests — pass**

- [ ] **Step 7: Commit**

```bash
git add src/projectes/signals.py src/projectes/apps.py src/templates/emails/canvi_estat.* src/projectes/tests.py
git commit -m "feat(projectes): email notification on estat change via signal"
```

---

## Phase 7 — REST API (minimum for future SPA)

### Task 25: Serializers

**Files:**
- Create: `src/api/serializers.py`

- [ ] **Step 1: Write serializers**

File: `src/api/serializers.py`

```python
from rest_framework import serializers
from empreses.models import Empresa
from projectes.models import Projecte, FitxerAdjunt


class ContacteSerializer(serializers.Serializer):
    nom = serializers.CharField()
    carrec = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField()
    telefon = serializers.CharField(required=False, allow_blank=True)


class EmpresaSerializer(serializers.ModelSerializer):
    contacte = ContacteSerializer()

    class Meta:
        model = Empresa
        fields = ["id", "nom", "cif", "sector", "mida", "web", "adreca",
                  "contacte", "coneix_dual", "practiques_passades",
                  "practiques_actuals", "practiques_actuals_detall",
                  "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class FitxerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FitxerAdjunt
        fields = ["id", "nom_original", "mida_bytes", "mime_type", "uploaded_at"]
        read_only_fields = fields


class ProjecteSerializer(serializers.ModelSerializer):
    fitxers = FitxerSerializer(many=True, read_only=True)
    empresa_nom = serializers.CharField(source="empresa.nom", read_only=True)

    class Meta:
        model = Projecte
        fields = ["id", "empresa", "empresa_nom", "titol", "descripcio",
                  "tipus_col_laboracio", "tecnologies", "tecnologies_altres",
                  "estudiants_previst", "modalitat_treball",
                  "data_inici_preferent", "pressupost_orientatiu",
                  "ods", "estat", "fitxers", "created_at", "updated_at"]
        read_only_fields = ["id", "empresa_nom", "fitxers", "created_at", "updated_at"]
```

---

### Task 26: ViewSets and API routes

**Files:**
- Create: `src/api/views.py`
- Create: `src/api/permissions.py`
- Create: `src/api/urls.py`

- [ ] **Step 1: Permission class**

File: `src/api/permissions.py`

```python
from rest_framework import permissions


class IsOwnerOrStaff(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        empresa = getattr(request.user, "empresa", None)
        if empresa is None:
            return False
        if hasattr(obj, "empresa_id"):
            return obj.empresa_id == empresa.pk
        if hasattr(obj, "user_id"):
            return obj.user_id == request.user.pk
        return False
```

- [ ] **Step 2: ViewSets**

File: `src/api/views.py`

```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from projectes.models import Projecte
from empreses.models import Empresa
from api.serializers import ProjecteSerializer, EmpresaSerializer
from api.permissions import IsOwnerOrStaff


class ProjecteViewSet(viewsets.ModelViewSet):
    serializer_class = ProjecteSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrStaff]

    def get_queryset(self):
        qs = Projecte.objects.all()
        if self.request.user.is_staff:
            return qs
        empresa = getattr(self.request.user, "empresa", None)
        return qs.filter(empresa=empresa) if empresa else qs.none()


class EmpresaViewSet(viewsets.ModelViewSet):
    serializer_class = EmpresaSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrStaff]

    def get_queryset(self):
        qs = Empresa.objects.all()
        if self.request.user.is_staff:
            return qs
        empresa = getattr(self.request.user, "empresa", None)
        return qs.filter(pk=empresa.pk) if empresa else qs.none()
```

- [ ] **Step 3: URLs**

File: `src/api/urls.py`

```python
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from django.urls import path, include

from api.views import ProjecteViewSet, EmpresaViewSet

router = DefaultRouter()
router.register(r"projectes", ProjecteViewSet, basename="projecte")
router.register(r"empreses", EmpresaViewSet, basename="empresa")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/token/", obtain_auth_token, name="api_token"),
]
```

- [ ] **Step 4: Smoke test**

```bash
python manage.py runserver
# In another terminal:
curl -X POST http://localhost:8000/api/v1/auth/token/ -d 'username=admin&password=...'
# Then:
curl -H 'Authorization: Token ...' http://localhost:8000/api/v1/projectes/
```

- [ ] **Step 5: Commit**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git add src/api/
git commit -m "feat(api): DRF viewsets for Projecte and Empresa with owner/staff perms"
```

---

## Phase 8 — Production deployment

### Task 27: Production nginx config and env

**Files:**
- Create: `docker/nginx/nginx.prod.conf`

This is identical to `nginx.conf` for now (TLS will be added later when domain is ready). Keep the same `nginx.conf` file; override via `.env` or separate compose file when needed.

- [ ] **Step 1: No change needed, but document the upgrade path**

Append to `README.md`:

```markdown
## HTTPS setup (when domain is ready)

1. Point `dualiza.iticbcn.cat` A record to `150.230.183.140`.
2. SSH to VPS: `ssh ubuntu@150.230.183.140`.
3. Stop nginx container, run certbot standalone once:
   ```bash
   sudo apt install certbot
   sudo certbot certonly --standalone -d dualiza.iticbcn.cat
   ```
4. Update `docker/nginx/nginx.conf` to add `listen 443 ssl;` block referencing `/etc/letsencrypt/live/dualiza.iticbcn.cat/fullchain.pem`.
5. Mount `/etc/letsencrypt` into the nginx container in `docker-compose.yml`.
6. Restart: `docker compose up -d nginx`.
```

```bash
git add README.md
git commit -m "docs: HTTPS upgrade instructions"
```

---

### Task 28: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Generate deploy SSH key**

On the local machine:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/dualiza_deploy -C "github-actions-dualiza" -N ""
cat ~/.ssh/dualiza_deploy.pub
```

- [ ] **Step 2: Add the public key to the VPS**

Copy the contents printed by the previous `cat` step, then run:

```bash
ssh -i ~/.ssh/vps_compa ubuntu@150.230.183.140 "cat >> ~/.ssh/authorized_keys" < ~/.ssh/dualiza_deploy.pub
```

This appends the new deploy key to the VPS's authorized keys. The original `vps_compa` key remains authorized for manual access.

- [ ] **Step 3: Add secrets to GitHub repo**

```bash
gh secret set VPS_HOST -b "150.230.183.140" --repo ZenidX/dualiza
gh secret set VPS_USER -b "ubuntu" --repo ZenidX/dualiza
gh secret set SSH_PRIVATE_KEY < ~/.ssh/dualiza_deploy
```

- [ ] **Step 4: Create the workflow file**

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: SSH deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            set -e
            cd /opt/docker/DUALIZA
            git pull --ff-only origin main
            docker compose -f docker/docker-compose.yml build
            docker compose -f docker/docker-compose.yml up -d
            docker compose -f docker/docker-compose.yml exec -T django python manage.py migrate --noinput
            docker compose -f docker/docker-compose.yml exec -T django python manage.py collectstatic --noinput
            docker compose -f docker/docker-compose.yml logs --tail 30 django
```

- [ ] **Step 5: Commit**

```bash
git add .github/
git commit -m "ci: GitHub Actions deploy on push to main"
```

---

### Task 29: First manual deployment to the VPS

**Files:** none (manual ops)

- [ ] **Step 1: SSH to VPS, create folder, clone repo**

```bash
ssh ubuntu@150.230.183.140
sudo mkdir -p /opt/docker/DUALIZA
sudo chown ubuntu:ubuntu /opt/docker/DUALIZA
cd /opt/docker/DUALIZA
git clone https://github.com/ZenidX/dualiza.git .
# Private repo: use a personal access token or a deploy key.
# For the deploy key approach:
#   cat ~/.ssh/dualiza_deploy_pub (on VPS: add to GitHub repo as deploy key, read-only)
```

Alternative (simpler): clone via HTTPS with a PAT once:

```bash
git clone https://$GH_USER:$GH_TOKEN@github.com/ZenidX/dualiza.git .
```

- [ ] **Step 2: Create `.env` with production values**

```bash
cp .env.example .env
nano .env
# Fill all required secrets, set DJANGO_DEBUG=False, set MONGO_HOST=mongodb.
# Generate a strong DJANGO_SECRET_KEY.
```

- [ ] **Step 3: First build and up**

```bash
docker compose -f docker/docker-compose.yml up -d --build
docker compose -f docker/docker-compose.yml logs -f django
```

Expected: migrations run, collectstatic runs, gunicorn starts.

- [ ] **Step 4: Create superuser**

```bash
docker compose -f docker/docker-compose.yml exec django python manage.py createsuperuser
```

- [ ] **Step 5: Smoke test from your local machine**

```bash
curl -I http://150.230.183.140/formulari/
# Expect: 200 OK (or 301 to /formulari/ with trailing slash handling)

curl -I http://150.230.183.140/admin/
# Expect: 302 to /admin/login/
```

Open in browser: `http://150.230.183.140/formulari/` — fill and submit a test proposal. Verify in admin.

- [ ] **Step 6: Document outcome in README**

No commit for this task unless README gets updated.

---

### Task 30: Verify CI/CD roundtrip

**Files:** none

- [ ] **Step 1: Make a trivial change on a feature branch**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git checkout -b test/ci
echo "Deployed via GitHub Actions." >> README.md
git add README.md
git commit -m "test: ci roundtrip marker"
git push origin test/ci
```

- [ ] **Step 2: Create PR and merge**

```bash
gh pr create --title "test: ci roundtrip" --body "Verifying CI/CD pipeline." --base main --head test/ci
gh pr merge --squash --delete-branch
```

- [ ] **Step 3: Watch the Action**

```bash
gh run watch
```

Expected: green check within ~1 minute. Then curl the VPS again, confirm README change deployed (`curl http://150.230.183.140/` is still fine — README isn't served, but logs show migration ran without errors).

- [ ] **Step 4: Cleanup**

```bash
git checkout main
git pull
git branch -D test/ci
```

---

## Phase 9 — Polish and production hardening

### Task 31: Custom 404 / 500 templates

**Files:**
- Create: `src/templates/404.html`
- Create: `src/templates/500.html`

- [ ] **Step 1: Minimal templates**

File: `src/templates/404.html`

```html
{% extends "base.html" %}
{% block title %}404 · Pàgina no trobada{% endblock %}
{% block content %}
<main style="max-width:480px;margin:80px auto;text-align:center;padding:24px;">
  <h1 style="font-size:64px;margin:0;">404</h1>
  <p>La pàgina que busqueu no existeix.</p>
  <p><a href="/">Tornar a l'inici</a></p>
</main>
{% endblock %}
```

File: `src/templates/500.html`

```html
{% extends "base.html" %}
{% block title %}500 · Error del servidor{% endblock %}
{% block content %}
<main style="max-width:480px;margin:80px auto;text-align:center;padding:24px;">
  <h1 style="font-size:64px;margin:0;">500</h1>
  <p>Hi ha hagut un error al servidor. Hem estat avisats i ho solucionarem ben aviat.</p>
  <p><a href="/">Tornar a l'inici</a></p>
</main>
{% endblock %}
```

- [ ] **Step 2: Commit**

```bash
git add src/templates/404.html src/templates/500.html
git commit -m "feat: custom 404 and 500 error pages in Catalan"
```

---

### Task 32: Logging configuration

**Files:**
- Modify: `src/config/settings.py`

- [ ] **Step 1: Add LOGGING dict**

Append to `src/config/settings.py`:

```python
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {name}: {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "empreses": {"handlers": ["console"], "level": "DEBUG", "propagate": False},
        "projectes": {"handlers": ["console"], "level": "DEBUG", "propagate": False},
        "comptes": {"handlers": ["console"], "level": "DEBUG", "propagate": False},
    },
}
```

- [ ] **Step 2: Commit**

```bash
git add src/config/settings.py
git commit -m "feat: structured stdout logging for Docker"
```

---

### Task 33: Final full-stack smoke test on production

**Files:** none

- [ ] **Step 1: Push all pending changes**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git push origin main
# Watch: gh run watch
```

- [ ] **Step 2: Walk through the full user flow on production**

Open `http://150.230.183.140/formulari/` in a private browsing window:

1. Fill the form with real-ish data (use a test email you control).
2. Submit → confirm redirect to `/enviat/`.
3. Check the inbox for the confirmation email (if Gmail SMTP is configured).
4. Reset password via `/accounts/password/reset/` using the same email.
5. Log in at `/accounts/login/`.
6. Visit `/dashboard/` — see the submitted proposal.
7. Open the proposal detail page.
8. Log out.
9. Log in as admin at `/admin/`.
10. Change the project's estat to "en_revisio" → verify the user receives the notification email.

- [ ] **Step 3: If anything fails, file issues on GitHub**

```bash
gh issue create --title "..." --body "..."
```

Fix, push, deploy, re-test.

---

## Phase 10 — Closing

### Task 34: Documentation updates

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update `README.md` with final state**

Make sure README covers:
- Project overview (1-2 paragraphs)
- Requirements (Python 3.12, Docker)
- Local dev quick start
- Production deployment architecture diagram
- HTTPS setup path
- Google OAuth setup
- Running tests

```bash
git add README.md
git commit -m "docs: README reflects final MVP state"
git push origin main
```

---

### Task 35: Create a GitHub release / tag for the MVP

**Files:** none

- [ ] **Step 1: Tag**

```bash
cd D:/Xavi/ProjectsITIC/dualiza
git tag -a v0.1.0-mvp -m "DUALIZA backend MVP"
git push origin v0.1.0-mvp
```

- [ ] **Step 2: Release**

```bash
gh release create v0.1.0-mvp --title "DUALIZA MVP" --notes "First production release: form submission, company login (password + Google), admin panel, email notifications, auto-deploy."
```

---

## Summary of what to do after this plan

Once all tasks are green:

1. Coordinate with ITIC for the `dualiza.iticbcn.cat` subdomain.
2. Redo DNS → VPS IP, obtain cert, uncomment TLS in nginx.
3. Configure a test → production flow for new features (feature branches + PR + merge-to-main → auto-deploy).
4. Evaluate next milestones from the spec's "Out of scope" section: SPA management UI, backups, Celery for async email, etc.

---

*End of plan. Total: 35 tasks across 10 phases.*
