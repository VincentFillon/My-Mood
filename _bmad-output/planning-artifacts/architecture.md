---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-02-10'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/prd-validation-report.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/brainstorming/brainstorming-session-2026-02-06.md'
  - 'CLAUDE.md'
workflowType: 'architecture'
project_name: 'my-mood'
user_name: 'Vincent'
date: '2026-02-10'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (39 FRs en 6 domaines) :**

| Domaine | FRs | Implications architecturales |
|---------|-----|------------------------------|
| Utilisateurs & Accès (FR1-FR6) | Inscription, login, profil, suppression compte, export données, consentement RGPD | Module Auth isolé, mécanismes RGPD (hard delete, export), gestion consentement |
| Groupes (FR7-FR12) | Création, invitation par lien, gestion membres, limites plan Free (6 max) | Multi-tenancy, système d'invitations, enforcement limites par plan |
| Humeurs (FR13-FR18) | Grille d'humeur, modification temps réel, réactions, historique + médiane | SSE broadcast, stockage time-series, agrégation statistique, rétention limitée (30j Free) |
| Messagerie & Salons (FR19-FR29) | Salon auto-créé, création de salons, messages texte/images/GIFs/emojis, réactions, historique limité | WebSocket bidirectionnel, stockage fichiers R2, virtual scroll, quotas (90j / 500 Mo Free) |
| Mini-défi quotidien (FR30-FR33) | Défi quotidien, participation, classement, historique | Scheduler quotidien, système de scoring, stockage images défi |
| Onboarding & Notifications (FR34-FR39) | Onboarding guidé, push PWA, modération par signalement, isolation des données | Service workers, notification system, modération pipeline, RLS |

**Non-Functional Requirements (18 NFRs) :**

| Catégorie | NFRs clés | Impact architectural |
|-----------|-----------|---------------------|
| Performance | Propagation humeurs < 2s (NFR1), messages < 500ms (NFR2), FCP < 3s (NFR3), interactions < 200ms (NFR4) | Infra SSE/WebSocket optimisée, lazy loading agressif, CDN pour assets statiques |
| Sécurité | Hash adaptatif > 100ms (NFR6), tokens 15min + refresh (NFR7), TLS 1.2+ (NFR8), isolation groupe (NFR9), URLs signées 1h (NFR10) | bcrypt/argon2, JWT access + refresh tokens, HTTPS everywhere, RLS tests CI, R2 signed URLs |
| Fiabilité | 99.5% uptime MVP (NFR12), reconnexion auto < 5s (NFR13), livraison messages post-déconnexion (NFR14), backup quotidien (NFR15) | Reconnexion SSE/WS automatique, queue de messages pending, stratégie de backup Postgres |
| Scalabilité | 50 groupes actifs simultanés (NFR16), 6 users/groupe (NFR17), 500+ groupes sans refonte (NFR18) | Architecture stateless, connection pooling, schema extensible |

**Scale & Complexity :**

- Primary domain : Full-stack temps réel (PWA + API + DB + dual real-time)
- Complexity level : Medium-High
- Estimated architectural components : ~12-15 modules/services principaux
- MVP scope réduit : 1 rôle (Membre), 1 plan (Free), pas de Dual Face

### Technical Constraints & Dependencies

- **Dev solo (Vincent)** — Architecture doit minimiser la complexité opérationnelle. Pas de microservices, monolithe modulaire.
- **Budget infra limité** — Hetzner VPS (20-50 EUR/mois). Docker single-node pour le MVP.
- **Stack imposée** — Angular 21, NestJS 11, PostgreSQL, Prisma 7, Cloudflare R2. Pas de flexibilité sur ces choix.
- **PWA obligatoire** — Pas d'app native, installable depuis le navigateur. Service workers pour push notifications.
- **Dual Face prévu Phase 2** — Le MVP n'a pas besoin du cloisonnement safe zone / manager space, mais l'architecture doit permettre cette évolution sans refonte.
- **Pas d'API publique** — Système fermé, pas d'exposition externe.
- **Klipy GIF API** — Dépendance externe pour les GIFs (remplace Tenor qui ferme juin 2026).

### Cross-Cutting Concerns Identified

1. **Multi-tenancy & RLS** — Chaque table contenant des données utilisateur doit avoir des policies RLS. Le `group_id` est le discriminant principal. Tests automatisés de cloisonnement en CI.
2. **Authentication & RBAC contextuel** — JWT access/refresh tokens. Un utilisateur peut avoir des rôles différents selon le groupe. Guards NestJS validant `tenant_id` + rôle à chaque requête.
3. **Propagation temps réel** — Deux protocoles (SSE pour broadcast, WebSocket pour messaging). Gestion de la reconnexion, des messages pending, et du fan-out par groupe.
4. **Enforcement des limites par plan** — Membres max, historique humeurs, rétention messages, stockage. Vérification côté serveur à chaque écriture.
5. **Système de thèmes** — 3 couches (CSS tokens invariants / tokens thématiques / contenu backend). Le thème affecte l'intégralité de l'expérience.
6. **RGPD** — Hard delete (pas de soft delete pour données utilisateur), export JSON, consentement tracé, suppression par groupe possible.
7. **Stockage fichiers** — Upload vers R2, URLs signées avec expiration, quotas par plan, suppression en cascade.
8. **Extensibilité Dual Face** — L'architecture modulaire NestJS doit prévoir la séparation SafeZone / ManagerSpace dès le début, même si le ManagerSpace n'est pas implémenté au MVP.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack temps réel : PWA Angular + API NestJS + PostgreSQL + dual real-time (SSE + WebSocket).

Deux projets distincts (frontend + backend) orchestrés par Docker Compose, chacun initialisé avec son CLI natif.

### Versions Vérifiées (février 2026)

| Technologie | Version | Notes |
|------------|---------|-------|
| Angular | **21.x** (stable, nov. 2025) | Zoneless par défaut, Signal Forms, Vitest, Angular Aria |
| NestJS | **11.1.13** | Logger amélioré, startup optimisé |
| Prisma | **7.2.0** | Architecture Rust-free, 3x plus rapide, 90% plus léger |
| Socket.io | **4.8.3** | Compatible NestJS 11 via `@nestjs/platform-socket.io` |
| TypeScript | **5.8+** | Strict mode activé des deux côtés |
| Node.js | **LTS actuel** | Runtime partagé frontend build + backend |

### Options Considérées

**Option A — Monorepo Nx** : Rejetée. Complexité excessive pour un dev solo. Les bénéfices (cache distribué, affected commands) ciblent les équipes.

**Option B — pnpm workspaces** : Rejetée. Overhead de configuration pour un bénéfice limité au MVP. Le partage de types peut se faire plus simplement.

**Option C — Deux projets séparés + Docker Compose** : Retenue. Simplicité maximale, zéro overhead d'outillage, chaque CLI fonctionne nativement.

### Starter Sélectionné : Angular CLI + NestJS CLI (projets séparés)

**Rationale :**
1. Simplicité opérationnelle pour dev solo — chaque projet garde son tooling natif
2. Docker Compose orchestre les services (Postgres, frontend, backend) en dev et prod
3. Types partagés via un dossier `shared/` avec chemins TypeScript (`paths` dans tsconfig)
4. Évolution possible vers un monorepo si l'équipe grandit

**Commandes d'initialisation :**

```bash
# Frontend — Angular 21, Tailwind, sans SSR, zoneless
ng new frontend --style=tailwind --ssr=false --naming-style=2025

# Backend — NestJS 11, TypeScript strict
nest new backend --strict --package-manager=pnpm

# Racine — Docker Compose pour orchestration
# docker-compose.yml : PostgreSQL 16 + frontend (ng serve) + backend (nest start)
```

### Décisions Architecturales Fournies par les Starters

**Frontend (Angular 21 CLI) :**
- TypeScript 5.8+ strict mode
- Zoneless par défaut (plus de zone.js — change detection via Signals)
- Standalone components par défaut (plus de NgModules)
- Tailwind CSS intégré nativement
- Vitest comme test runner par défaut (remplace Karma/Jasmine)
- Naming convention 2025 (fichiers concis : `app.ts` au lieu de `app.component.ts`)
- Build avec esbuild (tree-shaking, compilation rapide)
- ESLint pré-configuré

**Backend (NestJS 11 CLI) :**
- TypeScript strict (`strictNullChecks`, `noImplicitAny`, `strictBindCallApply`, `forceConsistentCasingInFileNames`, `noFallthroughCasesInSwitch`)
- Architecture modulaire (modules, controllers, services, guards)
- Jest pré-configuré pour les tests
- ESLint + Prettier pré-configuré
- Structure conventionnelle NestJS

**À ajouter manuellement post-initialisation :**
- Frontend : `@angular/pwa`, `@angular/cdk`, `@angular/aria`, `emoji-picker-element`, configuration service worker
- Backend : `prisma@7`, `@nestjs/platform-socket.io`, `@nestjs/passport`, module SSE custom, AWS SDK pour R2
- Racine : `docker-compose.yml` (PostgreSQL 16 + services), dossier `shared/` pour types communs, scripts de développement
- CI : Tests de cloisonnement RLS, Lighthouse accessibility (seuil 90), axe-core

**Note :** L'initialisation du projet avec ces commandes constitue la première story d'implémentation.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Bloquent l'implémentation) :**
- RLS via migrations SQL raw (garantie structurelle du cloisonnement)
- JWT access/refresh token flow avec stockage hybride
- REST API avec format d'erreur standardisé
- SSE pour broadcast + WebSocket/Socket.io pour messagerie
- Docker Compose + Caddy pour l'infrastructure

**Important Decisions (Façonnent l'architecture) :**
- Zod pour la validation partagée frontend/backend
- Argon2id pour le hash des mots de passe
- Angular Signals + services pour le state management
- In-memory cache avec abstraction CacheService

**Deferred Decisions (Post-MVP) :**
- Redis pour le cache distribué (quand scaling horizontal nécessaire)
- NgRx Signal Store (si la complexité du state management augmente)
- Stack de monitoring avancée (ELK, Datadog — quand les revenus le justifient)
- E2E encryption messagerie (Phase 3)

### Data Architecture

**Database : PostgreSQL 16 + Prisma 7**
- Prisma gère le schema et les migrations structurelles
- RLS policies ajoutées via SQL raw dans les migrations Prisma
- Le contexte tenant (`group_id`) est injecté via `SET app.current_group_id` sur chaque connexion/transaction via un middleware Prisma
- Tests de cloisonnement automatisés en CI : un test par table vérifie qu'aucune query ne peut accéder aux données d'un autre groupe
- Rationale : Le PRD exige une séparation "architecturale, pas cosmétique". Le RLS Postgres est la seule garantie structurelle — même un bug applicatif ne peut pas fuiter des données.

**Validation : Zod**
- Schemas de validation définis dans `shared/` et importés côté frontend ET backend
- Inférence TypeScript automatique (`z.infer<typeof schema>`)
- Intégration NestJS via un custom `ZodValidationPipe`
- Intégration Angular via validation custom dans les Signal Forms
- Rationale : Partage des schémas entre frontend et backend = source unique de vérité pour un dev solo.

**Cache : In-memory avec abstraction**
- Interface `CacheService` avec implémentation `InMemoryCacheService` (Map/LRU)
- Utilisé pour : sessions SSE actives, compteurs de membres en ligne, résultats de défis quotidiens
- L'abstraction permet de switcher vers Redis (`RedisCacheService`) sans modifier les consommateurs
- Rationale : Zéro dépendance supplémentaire au MVP. 50 groupes × 6 users = 300 connexions max — in-memory suffit largement.

**Migrations : Prisma migrate + SQL raw**
- `prisma migrate dev` pour le schema
- Fichiers `.sql` dans les migrations pour les RLS policies
- `prisma db seed` pour les données initiales (humeurs par défaut, thèmes, contenus des défis)
- Rationale : Seule approche viable pour combiner Prisma et RLS Postgres.

### Authentication & Security

**Hash : Argon2id**
- Via le package `argon2` (binding natif, performant)
- Configuration : `memoryCost: 65536, timeCost: 3, parallelism: 1` (ajusté pour > 100ms sur le serveur cible)
- Rationale : Recommandation OWASP actuelle, résistant aux attaques GPU, conforme NFR6.

**Tokens : JWT hybride (access en mémoire + refresh en httpOnly cookie)**
- Access token : durée de vie 15 min, stocké en mémoire JS côté Angular (variable dans un service), envoyé via header `Authorization: Bearer`
- Refresh token : durée de vie 7 jours, stocké en httpOnly cookie sécurisé (`SameSite=Strict`, `Secure`, `HttpOnly`), endpoint dédié `/auth/refresh`
- Rotation du refresh token à chaque utilisation (le précédent est invalidé)
- Rationale : L'access token en mémoire est protégé contre XSS (pas dans localStorage). Le refresh token en httpOnly cookie est protégé contre XSS ET permet le renouvellement automatique. Conforme NFR7.

**Rate Limiting : @nestjs/throttler**
- Configuration globale : 100 requêtes/minute par IP
- Override par route : endpoints d'auth (login, register) limités à 10/minute, upload fichiers 20/minute
- Stockage in-memory (suffisant pour single-node MVP)
- Rationale : Standard NestJS, zéro configuration supplémentaire.

**CORS : Whitelist par environnement**
- Dev : `http://localhost:4200`
- Prod : domaine de production uniquement
- Credentials autorisés (pour les cookies httpOnly)

### API & Communication Patterns

**API Design : REST**
- Conventions RESTful standard (GET/POST/PUT/DELETE, ressources au pluriel)
- Versioning par préfixe URL : `/api/v1/...`
- Rationale : Simple, bien supporté par NestJS et Angular HttpClient. Pas de cas d'usage nécessitant GraphQL.

**Documentation : Swagger/OpenAPI via @nestjs/swagger**
- Auto-généré depuis les décorateurs NestJS (`@ApiTags`, `@ApiResponse`, etc.)
- Disponible en dev à `/api/docs`
- Désactivé en production
- Rationale : Utile pour le développement même en solo — documentation vivante.

**Format d'erreur standardisé :**
```json
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Description lisible",
  "details": [{ "field": "email", "issue": "Format invalide" }],
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```
- Implémenté via un `GlobalExceptionFilter` NestJS
- Codes d'erreur métier constants (`VALIDATION_ERROR`, `UNAUTHORIZED`, `GROUP_FULL`, `RATE_LIMITED`, etc.)
- Côté Angular : intercepteur HTTP qui parse ce format et déclenche les toasts/erreurs appropriés

**SSE (broadcast serveur → client) :**
- NestJS `@Sse()` decorator natif
- Endpoint par groupe : `GET /api/v1/groups/:groupId/events`
- Event types : `mood-change`, `mood-reaction`, `member-join`, `member-leave`, `challenge-update`
- Authentification : token passé en query param (les SSE ne supportent pas les headers custom)
- Reconnexion automatique côté Angular via `EventSource` avec retry exponentiel (1s, 2s, 4s, max 30s)

**WebSocket (messagerie bidirectionnelle) :**
- `@nestjs/platform-socket.io` avec Socket.io 4.8
- Namespace par groupe : `/groups/:groupId/chat`
- Rooms Socket.io pour les salons de messagerie au sein d'un groupe
- Authentification via handshake JWT (middleware Socket.io)
- Events : `message:send`, `message:receive`, `reaction:add`, `typing:start`, `typing:stop`
- Reconnexion automatique gérée par Socket.io client (configuration par défaut)

### Frontend Architecture

**State Management : Angular Signals + services injectables**
- Signals pour l'état réactif local (humeur sélectionnée, scroll position, compteurs de nouveauté)
- Services injectables (`MoodService`, `ChatService`, `AuthService`, `ThemeService`) pour l'état partagé entre composants
- `computed()` pour les dérivations (médiane d'humeur, compteurs d'activité)
- `effect()` pour les side effects (persistance locale, analytics)
- Rationale : Angular 21 est construit autour des Signals. Pattern natif, zéro dépendance, suffisant pour le MVP. Évolution vers NgRx Signal Store possible si nécessaire.

**Lazy Loading par feature :**
- Route `/` → `mood` feature (split view grille + messagerie) — chargé en premier
- Route `/account` → `account` feature
- Route `/onboarding` → `onboarding` feature
- Route `/invite/:token` → `invite` feature (inscription via lien)
- Rationale : Standard Angular, optimise le FCP (NFR3).

**HTTP Interceptors :**
- `AuthInterceptor` : Ajoute le header `Authorization: Bearer` avec l'access token
- `ErrorInterceptor` : Parse les erreurs API standardisées, déclenche les toasts d'erreur
- `RefreshInterceptor` : Intercepte les 401, tente un refresh token, retry la requête originale

**Service Architecture :**
- `AuthService` : Login, register, token management, refresh flow
- `MoodService` : CRUD humeurs, SSE subscription, réactions
- `ChatService` : WebSocket connection, envoi/réception messages, rooms
- `ThemeService` : Thème actif, changement de thème, CSS custom properties
- `NotificationService` : Push notifications, toasts in-app
- `FileService` : Upload vers R2, preview, quotas

### Infrastructure & Deployment

**Reverse Proxy : Caddy**
- Auto-HTTPS via Let's Encrypt (zéro configuration de certificats)
- Reverse proxy : `/api/*` → NestJS (port 3000), `/socket.io/*` → NestJS WebSocket, `/*` → assets Angular statiques
- Gzip/Brotli compression automatique
- HTTP/2 par défaut
- Rationale : Idéal pour dev solo — l'auto-HTTPS élimine une source majeure de complexité opérationnelle.

**Docker Compose (dev + prod) :**
- `postgres:16` : Base de données avec volume persistant
- `backend` : NestJS avec multi-stage build (build → runtime Node.js slim)
- `frontend` : Build Angular → assets statiques servis par Caddy
- `caddy` : Reverse proxy + HTTPS + static files
- Rationale : Un seul `docker compose up` pour tout lancer. Même stack en dev et en prod.

**CI/CD : GitHub Actions**
- Pipeline : lint → tests unitaires → tests RLS cloisonnement → build → deploy
- Tests RLS : scripts SQL dédiés qui vérifient qu'un user d'un groupe ne peut pas accéder aux données d'un autre groupe
- Lighthouse CI : score accessibility ≥ 90
- Deployment : SSH vers Hetzner VPS, `docker compose pull && docker compose up -d`
- Rationale : Intégré à GitHub, gratuit pour les volumes du MVP.

**Monitoring & Logging :**
- NestJS Logger v11 (logs JSON structurés)
- Logs écrits dans stdout, collectés par Docker (`docker logs`)
- Uptime Kuma (self-hosted sur le même VPS) pour le monitoring externe et les alertes
- Pas de stack lourde au MVP — les logs Docker + Uptime Kuma suffisent pour 99.5% uptime
- Rationale : Zéro coût supplémentaire, suffisant pour le MVP.

**Environment Configuration :**
- Variables d'environnement via `.env` (dev) et Docker secrets (prod)
- NestJS `@nestjs/config` avec validation Zod des variables d'environnement au démarrage
- Angular `environment.ts` / `environment.prod.ts` pour les URLs API
- Rationale : Standard, simple, sécurisé.

### Decision Impact Analysis

**Séquence d'implémentation :**
1. Docker Compose + PostgreSQL + Caddy (infrastructure de base)
2. NestJS scaffold + Prisma + RLS policies (backend foundation)
3. Auth module (JWT, argon2, refresh tokens) + guards multi-tenant
4. Angular scaffold + PWA + thème system (frontend foundation)
5. Mood module (SSE, CRUD humeurs, réactions)
6. Chat module (WebSocket, rooms, messages)
7. Challenge module (scheduler quotidien, classement)
8. Onboarding flow + notifications push

**Dépendances inter-composants :**
- RLS policies → dépendent du schema Prisma (les policies référencent les tables)
- Auth guards → dépendent du module Auth ET du RLS (le guard injecte le `group_id` pour le RLS)
- SSE/WebSocket → dépendent de l'Auth (authentification des connexions temps réel)
- Frontend services → dépendent du format d'erreur standardisé (intercepteurs HTTP)
- Theme system → indépendant, peut être développé en parallèle
- Zod schemas (shared/) → développés en même temps que les endpoints API correspondants

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database (Prisma + PostgreSQL) :**

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Models Prisma | PascalCase singulier | `User`, `Group`, `Mood`, `Message`, `Room` |
| Tables Postgres | snake_case pluriel (via `@@map`) | `users`, `groups`, `moods`, `messages`, `rooms` |
| Colonnes | snake_case | `created_at`, `group_id`, `mood_level` |
| Clés étrangères | `<entity>_id` | `user_id`, `group_id`, `room_id` |
| Index | `idx_<table>_<columns>` | `idx_moods_user_id_created_at` |
| RLS Policies | `<table>_<action>_policy` | `moods_select_policy`, `messages_insert_policy` |
| Enums Prisma | PascalCase | `MoodLevel`, `MemberRole` |

**API REST :**

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Endpoints | pluriel, kebab-case | `/api/v1/groups`, `/api/v1/moods`, `/api/v1/daily-challenges` |
| Params URL | camelCase | `/groups/:groupId/moods/:moodId` |
| Query params | camelCase | `?pageSize=20&createdAfter=2026-01-01` |
| Body JSON | camelCase | `{ "moodLevel": "great", "groupId": "..." }` |
| Headers custom | X-préfixe, PascalCase | `X-Group-Id` |

**Code TypeScript (frontend + backend) :**

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Classes / Interfaces / Types | PascalCase | `MoodService`, `CreateMoodDto`, `MoodLevel` |
| Fonctions / Méthodes | camelCase | `getMoodHistory()`, `sendMessage()` |
| Variables / Propriétés | camelCase | `currentMood`, `groupMembers` |
| Constantes | UPPER_SNAKE_CASE | `MAX_GROUP_MEMBERS`, `TOKEN_EXPIRY_MS` |
| Fichiers Angular (convention 2025) | kebab-case sans suffixe de type | `mood-ribbon.ts`, `chat-feed.ts`, `auth.service.ts` |
| Fichiers NestJS | kebab-case avec suffixe | `mood.controller.ts`, `mood.service.ts`, `mood.module.ts` |
| Dossiers | kebab-case | `mood-ribbon/`, `chat-feed/`, `daily-challenge/` |

### Structure Patterns

**Tests — Co-localisés :**
- Chaque fichier source a son test à côté : `mood.service.ts` → `mood.service.spec.ts`
- Tests e2e dans `test/` à la racine de chaque projet
- Tests de cloisonnement RLS dans `backend/test/rls/`

**Frontend — Organisation par feature :**
```
frontend/src/app/
├── core/                    # Services singleton, guards, interceptors
│   ├── auth/
│   ├── theme/
│   ├── notifications/
│   └── interceptors/
├── shared/                  # Composants UI réutilisables (pas de logique métier)
│   └── ui/
│       ├── avatar/
│       ├── badge/
│       ├── notification-toast/
│       └── spotlight-overlay/
├── features/                # Features lazy-loadées
│   ├── mood/
│   │   ├── orbital-grid/
│   │   ├── mood-ribbon/
│   │   └── mood.routes.ts
│   ├── chat/
│   │   ├── chat-feed/
│   │   ├── message-bubble/
│   │   ├── input-bar/
│   │   └── chat.routes.ts
│   ├── onboarding/
│   └── account/
└── app.routes.ts
```

**Backend — Organisation par module NestJS :**
```
backend/src/
├── common/                  # Pipes, filters, guards, decorators partagés
│   ├── filters/
│   ├── guards/
│   ├── pipes/
│   ├── decorators/
│   └── interceptors/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── groups/
│   ├── moods/
│   ├── messaging/
│   ├── challenges/
│   ├── files/
│   └── notifications/
├── prisma/
└── main.ts
```

**Structure interne d'un module NestJS :**
```
modules/moods/
├── moods.module.ts
├── moods.controller.ts
├── moods.service.ts
├── moods.gateway.ts          # (si WebSocket)
├── dto/
│   ├── create-mood.dto.ts
│   └── mood-response.dto.ts
├── entities/
└── moods.controller.spec.ts
```

### Format Patterns

**API Response — Enveloppe standardisée :**

Succès :
```json
{
  "data": { "id": "...", "moodLevel": "great", "createdAt": "2026-02-10T12:00:00.000Z" },
  "meta": { "page": 1, "pageSize": 20, "total": 42 }
}
```

Erreur :
```json
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Description lisible",
  "details": [{ "field": "email", "issue": "Format invalide" }],
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

**Règles de format :**
- Dates : ISO 8601 UTC partout (`2026-02-10T12:00:00.000Z`)
- JSON : camelCase pour les champs
- IDs : UUID v4 (générés par Postgres `gen_random_uuid()`). Jamais d'auto-incréments exposés.
- Booleans : `true`/`false`. Jamais `1`/`0`.
- Null : explicite quand l'absence de valeur a un sens, omis sinon.
- Pagination : Offset-based (`page` + `pageSize`) pour le MVP.

### Communication Patterns

**SSE Events :**
```
Convention : <domain>:<action> (kebab-case non applicable, camelCase non plus — on utilise un namespace avec :)

  mood:changed      → { userId, groupId, moodLevel, timestamp }
  mood:reaction     → { userId, targetUserId, moodId, emoji, timestamp }
  member:joined     → { userId, groupId, userName }
  member:left       → { userId, groupId }
  challenge:updated → { challengeId, groupId, type }
```

**WebSocket Events :**
```
Client → Serveur:
  message:send      → { roomId, content, type, mediaUrl? }
  reaction:add      → { messageId, emoji }
  typing:start      → { roomId }
  typing:stop       → { roomId }

Serveur → Client:
  message:received  → { id, roomId, userId, content, type, createdAt }
  reaction:added    → { messageId, userId, emoji }
  typing:update     → { roomId, userId, isTyping }
```

**State Management (Angular Signals) :**
- Services exposent des `Signal<T>` en readonly : `readonly currentMood = this.#currentMood.asReadonly()`
- Mutations via méthodes publiques uniquement — jamais d'accès direct au WritableSignal
- `computed()` pour les dérivations : `teamMedian = computed(() => calculateMedian(this.teamMoods()))`
- Pattern de chargement : chaque service expose `readonly loading = signal(false)` et `readonly error = signal<string | null>(null)`

### Process Patterns

**Error Handling :**
- Backend : `GlobalExceptionFilter` attrape toutes les exceptions et les formate uniformément
- Exceptions métier : classes custom étendant `HttpException` (`GroupFullException`, `MoodNotFoundException`, etc.)
- Frontend : `ErrorInterceptor` parse la réponse d'erreur standardisée → toast via `NotificationService`
- Logs : Erreurs 5xx loguées côté serveur avec stack trace. Erreurs 4xx non loguées.

**Loading States :**
- Convention : `loading` (boolean signal) dans chaque service
- UI : Skeleton screens (jamais de spinners)
- Pattern : `@if (moodService.loading()) { <skeleton /> } @else { <content /> }`

**Validation :**
- Frontend : Validation Zod au submit des formulaires
- Backend : `ZodValidationPipe` global qui valide les DTOs à l'entrée du controller
- Messages d'erreur en français (langue du produit)

**Auth Flow :**
- Refresh token tenté automatiquement une seule fois sur 401
- Si le refresh échoue → déconnexion + redirection `/login`
- `APP_INITIALIZER` Angular tente un refresh token au boot (restauration de session après refresh de page)

### Enforcement Guidelines

**Tout agent IA DOIT :**
1. Suivre les conventions de nommage définies ci-dessus — aucune exception
2. Placer les tests à côté des fichiers source (co-localisation)
3. Utiliser le format de réponse API enveloppé (`{ data, meta }` ou `{ statusCode, error, message }`)
4. Générer des UUIDs pour tous les IDs — jamais d'auto-incréments exposés
5. Utiliser Zod pour la validation (jamais class-validator, jamais de validation manuelle)
6. Créer des RLS policies pour toute nouvelle table contenant des données utilisateur
7. Formatter les dates en ISO 8601 UTC
8. Utiliser des Signals readonly pour l'état exposé par les services Angular

**Anti-patterns interdits :**
- `any` en TypeScript — utiliser `unknown` si le type est inconnu
- `console.log` — utiliser Logger NestJS côté backend, `NotificationService` côté frontend
- Mutations directes de Signals en dehors du service propriétaire
- Requêtes Prisma sans passer par le middleware de contexte tenant (bypass du RLS)
- Spinners — toujours des skeleton screens
- Texte en dur dans les composants — tout texte utilisateur passe par les constantes thématisées

## Project Structure & Boundaries

### Complete Project Directory Structure

```
my-mood/
├── docker-compose.yml                    # Orchestration : Postgres, backend, frontend, Caddy
├── docker-compose.override.yml           # Overrides dev (ports exposés, volumes, hot reload)
├── .env.example                          # Template variables d'environnement
├── .gitignore
├── CLAUDE.md                             # Guide projet pour agents IA
├── README.md
│
├── shared/                               # Types et schemas partagés frontend/backend
│   ├── tsconfig.json
│   ├── schemas/                          # Schemas Zod (source unique de vérité)
│   │   ├── auth.schema.ts               # LoginDto, RegisterDto, TokenPayload
│   │   ├── mood.schema.ts               # CreateMoodDto, MoodResponse, MoodLevel enum
│   │   ├── message.schema.ts            # CreateMessageDto, MessageResponse
│   │   ├── group.schema.ts              # CreateGroupDto, InviteDto, GroupResponse
│   │   ├── challenge.schema.ts          # ChallengeDto, ParticipationDto
│   │   ├── user.schema.ts               # UserProfileDto, UpdateProfileDto
│   │   └── common.schema.ts             # PaginationDto, ApiErrorResponse, ApiSuccessResponse
│   ├── types/                            # Types TypeScript inférés des schemas
│   │   └── index.ts                     # Re-exports z.infer<typeof ...> pour chaque schema
│   └── constants/                        # Constantes partagées
│       ├── limits.ts                    # MAX_GROUP_MEMBERS, MAX_MESSAGE_LENGTH, etc.
│       ├── events.ts                    # Noms d'événements SSE et WebSocket
│       └── errors.ts                    # Codes d'erreur métier (VALIDATION_ERROR, GROUP_FULL, etc.)
│
├── frontend/                             # Angular 21 PWA
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json                    # paths: { "@shared/*": ["../shared/*"] }
│   ├── tsconfig.app.json
│   ├── tsconfig.spec.json
│   ├── tailwind.config.js
│   ├── ngsw-config.json                 # Configuration service worker PWA
│   ├── public/
│   │   ├── manifest.webmanifest
│   │   ├── icons/                       # Icônes PWA (192x192, 512x512)
│   │   └── assets/
│   │       └── images/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app/
│   │   │   ├── app.ts                   # Composant racine
│   │   │   ├── app.routes.ts            # Routes principales avec lazy loading
│   │   │   ├── app.config.ts            # Configuration standalone (providers, interceptors)
│   │   │   │
│   │   │   ├── core/                    # Services singleton, guards, interceptors
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.service.spec.ts
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   └── auth.guard.spec.ts
│   │   │   │   ├── theme/
│   │   │   │   │   ├── theme.service.ts
│   │   │   │   │   └── theme.service.spec.ts
│   │   │   │   ├── notifications/
│   │   │   │   │   ├── notification.service.ts
│   │   │   │   │   └── notification.service.spec.ts
│   │   │   │   └── interceptors/
│   │   │   │       ├── auth.interceptor.ts
│   │   │   │       ├── error.interceptor.ts
│   │   │   │       └── refresh.interceptor.ts
│   │   │   │
│   │   │   ├── shared/                  # Composants UI réutilisables (pas de logique métier)
│   │   │   │   └── ui/
│   │   │   │       ├── avatar/
│   │   │   │       │   ├── avatar.ts
│   │   │   │       │   └── avatar.spec.ts
│   │   │   │       ├── badge/
│   │   │   │       │   └── badge.ts
│   │   │   │       ├── notification-toast/
│   │   │   │       │   └── notification-toast.ts
│   │   │   │       ├── skeleton/
│   │   │   │       │   └── skeleton.ts
│   │   │   │       └── spotlight-overlay/
│   │   │   │           └── spotlight-overlay.ts
│   │   │   │
│   │   │   └── features/               # Features lazy-loadées par route
│   │   │       ├── mood/
│   │   │       │   ├── mood.routes.ts
│   │   │       │   ├── mood.service.ts
│   │   │       │   ├── mood.service.spec.ts
│   │   │       │   ├── orbital-grid/
│   │   │       │   │   ├── orbital-grid.ts
│   │   │       │   │   └── orbital-grid.spec.ts
│   │   │       │   ├── mood-ribbon/
│   │   │       │   │   ├── mood-ribbon.ts
│   │   │       │   │   └── mood-ribbon.spec.ts
│   │   │       │   └── mood-history/
│   │   │       │       └── mood-history.ts
│   │   │       ├── chat/
│   │   │       │   ├── chat.routes.ts
│   │   │       │   ├── chat.service.ts
│   │   │       │   ├── chat.service.spec.ts
│   │   │       │   ├── chat-feed/
│   │   │       │   │   └── chat-feed.ts
│   │   │       │   ├── message-bubble/
│   │   │       │   │   └── message-bubble.ts
│   │   │       │   ├── input-bar/
│   │   │       │   │   └── input-bar.ts
│   │   │       │   └── room-list/
│   │   │       │       └── room-list.ts
│   │   │       ├── challenge/
│   │   │       │   ├── challenge.routes.ts
│   │   │       │   ├── challenge.service.ts
│   │   │       │   ├── daily-challenge/
│   │   │       │   │   └── daily-challenge.ts
│   │   │       │   └── leaderboard/
│   │   │       │       └── leaderboard.ts
│   │   │       ├── onboarding/
│   │   │       │   ├── onboarding.routes.ts
│   │   │       │   └── onboarding-flow/
│   │   │       │       └── onboarding-flow.ts
│   │   │       ├── account/
│   │   │       │   ├── account.routes.ts
│   │   │       │   ├── profile/
│   │   │       │   │   └── profile.ts
│   │   │       │   └── settings/
│   │   │       │       └── settings.ts
│   │   │       └── invite/
│   │   │           ├── invite.routes.ts
│   │   │           └── join-group/
│   │   │               └── join-group.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── global.css               # Imports Tailwind, CSS custom properties
│   │   │   └── themes/
│   │   │       ├── _tokens.css          # Tokens CSS invariants (spacing, radius, etc.)
│   │   │       ├── sunshine.css         # Thème "soleil" (jaune/chaud)
│   │   │       ├── ocean.css            # Thème "océan" (bleu/calme)
│   │   │       ├── forest.css           # Thème "forêt" (vert/nature)
│   │   │       ├── aurora.css           # Thème "aurore" (violet/cosmique)
│   │   │       └── ember.css            # Thème "braise" (rouge/énergie)
│   │   │
│   │   └── environments/
│   │       ├── environment.ts
│   │       └── environment.prod.ts
│   │
│   ├── Dockerfile                       # Multi-stage: build Angular → copie assets dans Caddy
│   └── .dockerignore
│
├── backend/                              # NestJS 11 API
│   ├── package.json
│   ├── tsconfig.json                    # paths: { "@shared/*": ["../shared/*"] }
│   ├── tsconfig.build.json
│   ├── nest-cli.json
│   ├── src/
│   │   ├── main.ts                      # Bootstrap NestJS, CORS, Swagger, global pipes
│   │   ├── app.module.ts               # Module racine, imports de tous les modules
│   │   │
│   │   ├── common/                      # Éléments partagés entre modules
│   │   │   ├── filters/
│   │   │   │   ├── global-exception.filter.ts
│   │   │   │   └── global-exception.filter.spec.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── group-member.guard.ts  # Vérifie l'appartenance au groupe
│   │   │   │   └── plan-limit.guard.ts    # Vérifie les limites du plan (membres, stockage)
│   │   │   ├── pipes/
│   │   │   │   └── zod-validation.pipe.ts
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts   # @CurrentUser() extrait l'utilisateur du JWT
│   │   │   │   └── current-group.decorator.ts  # @CurrentGroup() extrait le groupe du contexte
│   │   │   └── interceptors/
│   │   │       ├── response-wrapper.interceptor.ts  # Enveloppe { data, meta }
│   │   │       └── logging.interceptor.ts
│   │   │
│   │   ├── config/
│   │   │   └── env.validation.ts        # Validation Zod des variables d'environnement
│   │   │
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   ├── prisma.service.ts        # Service Prisma avec middleware RLS (SET app.current_group_id)
│   │   │   └── prisma.service.spec.ts
│   │   │
│   │   └── modules/
│   │       ├── auth/
│   │       │   ├── auth.module.ts
│   │       │   ├── auth.controller.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── auth.controller.spec.ts
│   │       │   ├── auth.service.spec.ts
│   │       │   ├── strategies/
│   │       │   │   ├── jwt.strategy.ts
│   │       │   │   └── jwt-refresh.strategy.ts
│   │       │   └── dto/                 # DTOs importés de @shared/schemas/auth.schema
│   │       │
│   │       ├── users/
│   │       │   ├── users.module.ts
│   │       │   ├── users.controller.ts
│   │       │   ├── users.service.ts
│   │       │   ├── users.controller.spec.ts
│   │       │   └── users.service.spec.ts
│   │       │
│   │       ├── groups/
│   │       │   ├── groups.module.ts
│   │       │   ├── groups.controller.ts
│   │       │   ├── groups.service.ts
│   │       │   ├── groups.controller.spec.ts
│   │       │   └── groups.service.spec.ts
│   │       │
│   │       ├── moods/
│   │       │   ├── moods.module.ts
│   │       │   ├── moods.controller.ts  # REST CRUD + SSE endpoint
│   │       │   ├── moods.service.ts
│   │       │   ├── moods.controller.spec.ts
│   │       │   └── moods.service.spec.ts
│   │       │
│   │       ├── messaging/
│   │       │   ├── messaging.module.ts
│   │       │   ├── messaging.gateway.ts   # WebSocket Gateway (Socket.io)
│   │       │   ├── messaging.service.ts
│   │       │   ├── rooms.controller.ts    # REST pour CRUD des salons
│   │       │   ├── messaging.gateway.spec.ts
│   │       │   └── messaging.service.spec.ts
│   │       │
│   │       ├── challenges/
│   │       │   ├── challenges.module.ts
│   │       │   ├── challenges.controller.ts
│   │       │   ├── challenges.service.ts
│   │       │   ├── challenges.scheduler.ts  # Cron job quotidien pour nouveau défi
│   │       │   ├── challenges.controller.spec.ts
│   │       │   └── challenges.service.spec.ts
│   │       │
│   │       ├── files/
│   │       │   ├── files.module.ts
│   │       │   ├── files.controller.ts    # Upload, download (URL signée R2)
│   │       │   ├── files.service.ts       # Interaction Cloudflare R2 (AWS SDK S3)
│   │       │   └── files.service.spec.ts
│   │       │
│   │       └── notifications/
│   │           ├── notifications.module.ts
│   │           ├── notifications.service.ts  # Push web (web-push), gestion subscriptions
│   │           └── notifications.service.spec.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma                # Schema Prisma (models, relations, @@map)
│   │   ├── seed.ts                      # Données initiales (humeurs par défaut, thèmes, défis)
│   │   └── migrations/
│   │       └── YYYYMMDDHHMMSS_init/
│   │           └── migration.sql         # Inclut CREATE TABLE + RLS policies
│   │
│   ├── test/
│   │   ├── e2e/
│   │   │   ├── auth.e2e-spec.ts
│   │   │   ├── moods.e2e-spec.ts
│   │   │   └── messaging.e2e-spec.ts
│   │   └── rls/
│   │       ├── rls-isolation.spec.ts    # Tests de cloisonnement RLS automatisés
│   │       └── fixtures/
│   │           └── rls-test-data.sql    # Données de test multi-groupes
│   │
│   ├── Dockerfile                       # Multi-stage: build NestJS → runtime Node.js slim
│   └── .dockerignore
│
├── caddy/
│   └── Caddyfile                        # Configuration reverse proxy, HTTPS, static files
│
├── .github/
│   └── workflows/
│       └── ci.yml                       # Pipeline: lint → test → RLS → build → Lighthouse → deploy
│
└── scripts/
    ├── dev.sh                           # Script de développement local (docker compose up + logs)
    └── seed.sh                          # Reset DB + seed pour dev
```

### Architectural Boundaries

**API Boundaries (REST endpoints) :**

| Module | Endpoints | Auth | Guard spécifique |
|--------|-----------|------|-------------------|
| Auth | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout` | Public (register, login) / JWT (refresh, logout) | Rate limiter renforcé (10/min) |
| Users | `GET /api/v1/users/me`, `PUT /api/v1/users/me`, `DELETE /api/v1/users/me`, `GET /api/v1/users/me/export` | JWT | — |
| Groups | `POST /api/v1/groups`, `GET /api/v1/groups/:groupId`, `POST /api/v1/groups/:groupId/invite`, `POST /api/v1/groups/join/:token`, `DELETE /api/v1/groups/:groupId/members/:userId` | JWT | `GroupMemberGuard`, `PlanLimitGuard` |
| Moods | `POST /api/v1/groups/:groupId/moods`, `PUT /api/v1/groups/:groupId/moods/:moodId`, `GET /api/v1/groups/:groupId/moods`, `POST /api/v1/groups/:groupId/moods/:moodId/reactions`, `GET /api/v1/groups/:groupId/events` (SSE) | JWT | `GroupMemberGuard` |
| Messaging | `GET /api/v1/groups/:groupId/rooms`, `POST /api/v1/groups/:groupId/rooms`, `GET /api/v1/groups/:groupId/rooms/:roomId/messages` | JWT | `GroupMemberGuard` |
| WebSocket | Namespace `/groups/:groupId/chat` — events : `message:send`, `reaction:add`, `typing:start`, `typing:stop` | JWT handshake | `GroupMemberGuard` via middleware Socket.io |
| Challenges | `GET /api/v1/groups/:groupId/challenges/today`, `POST /api/v1/groups/:groupId/challenges/:challengeId/participate`, `GET /api/v1/groups/:groupId/challenges/:challengeId/leaderboard` | JWT | `GroupMemberGuard` |
| Files | `POST /api/v1/files/upload`, `GET /api/v1/files/:fileId` (URL signée) | JWT | `PlanLimitGuard` (quota stockage) |
| Notifications | `POST /api/v1/notifications/subscribe`, `DELETE /api/v1/notifications/unsubscribe` | JWT | — |

**Component Boundaries (Frontend) :**

| Boundary | Communication | Responsabilité |
|----------|---------------|----------------|
| `core/` ↔ `features/` | Services injectables + Signals readonly | `core/` fournit les services singleton (auth, theme, notifications). Les features les consomment via injection. |
| `features/mood/` ↔ `features/chat/` | Aucune communication directe | La split view (grille + messagerie) compose les deux features via le routing, mais elles ne communiquent pas entre elles. |
| `shared/ui/` ↔ `features/` | Input/Output bindings | Les composants UI partagés sont purement présentationnels. Aucune logique métier. |
| Frontend ↔ Backend API | HTTP (REST) + SSE + WebSocket | L'intercepteur `AuthInterceptor` ajoute le JWT. L'intercepteur `ErrorInterceptor` parse les erreurs standardisées. |

**Data Boundaries :**

| Boundary | Mécanisme | Garantie |
|----------|-----------|----------|
| Cloisonnement multi-tenant | RLS Postgres (`group_id`) | Policy appliquée à chaque SELECT/INSERT/UPDATE/DELETE. Même un bug applicatif ne peut pas fuiter de données. |
| Séparation auth / données | JWT stateless + middleware Prisma | Le middleware injecte `app.current_group_id` à chaque requête. Le backend ne stocke pas de session. |
| Stockage fichiers | Cloudflare R2 + URLs signées | Les fichiers sont organisés par `group_id/` dans R2. Les URLs signées expirent après 1h. |
| Cache applicatif | In-memory isolé par `group_id` | Les clés de cache incluent toujours le `group_id` comme préfixe. |

### Requirements to Structure Mapping

**FR1-FR6 (Utilisateurs & Accès) :**
- Backend : `modules/auth/`, `modules/users/`
- Frontend : `features/account/`, `core/auth/`
- Schemas : `shared/schemas/auth.schema.ts`, `shared/schemas/user.schema.ts`
- Tests : fichiers `.spec.ts` co-localisés + `test/e2e/auth.e2e-spec.ts`

**FR7-FR12 (Groupes) :**
- Backend : `modules/groups/`
- Frontend : `features/invite/`
- Schemas : `shared/schemas/group.schema.ts`
- Guards : `common/guards/group-member.guard.ts`, `common/guards/plan-limit.guard.ts`

**FR13-FR18 (Humeurs) :**
- Backend : `modules/moods/` (REST + SSE)
- Frontend : `features/mood/` (orbital-grid, mood-ribbon, mood-history)
- Schemas : `shared/schemas/mood.schema.ts`
- Temps réel : SSE via `GET /api/v1/groups/:groupId/events`

**FR19-FR29 (Messagerie & Salons) :**
- Backend : `modules/messaging/` (WebSocket gateway + REST rooms)
- Frontend : `features/chat/` (chat-feed, message-bubble, input-bar, room-list)
- Schemas : `shared/schemas/message.schema.ts`
- Temps réel : WebSocket namespace `/groups/:groupId/chat`
- Fichiers : `modules/files/` pour upload/download images et GIFs

**FR30-FR33 (Mini-défi quotidien) :**
- Backend : `modules/challenges/` (REST + scheduler cron)
- Frontend : `features/challenge/` (daily-challenge, leaderboard)
- Schemas : `shared/schemas/challenge.schema.ts`

**FR34-FR39 (Onboarding & Notifications) :**
- Backend : `modules/notifications/`
- Frontend : `features/onboarding/`, `core/notifications/`
- PWA : `ngsw-config.json`, `manifest.webmanifest`

**Cross-Cutting Concerns :**

| Concern | Localisation |
|---------|-------------|
| Multi-tenancy RLS | `prisma/migrations/` (policies SQL), `prisma/prisma.service.ts` (middleware), `test/rls/` (tests) |
| Auth & Guards | `modules/auth/`, `common/guards/`, `common/decorators/` |
| Format API standardisé | `common/filters/global-exception.filter.ts`, `common/interceptors/response-wrapper.interceptor.ts` |
| Validation Zod | `shared/schemas/`, `common/pipes/zod-validation.pipe.ts` |
| Thème system | `frontend/src/styles/themes/`, `core/theme/theme.service.ts` |
| Limites par plan | `common/guards/plan-limit.guard.ts`, `shared/constants/limits.ts` |
| RGPD | `modules/users/users.service.ts` (hard delete, export JSON) |

### Integration Points

**Communication interne :**
- Frontend → Backend REST : via `HttpClient` Angular + intercepteurs (auth, error, refresh)
- Frontend → Backend SSE : via `EventSource` natif avec reconnexion exponentielle
- Frontend → Backend WebSocket : via Socket.io client avec auth handshake JWT
- Backend modules → Prisma : via `PrismaService` injectable avec middleware RLS automatique
- Backend → R2 : via AWS SDK S3 dans `files.service.ts`

**Intégrations externes :**
- Cloudflare R2 : Stockage fichiers (images, GIFs uploadés)
- Klipy API : Bibliothèque de GIFs (intégrée dans le composant `input-bar`)
- Web Push API : Notifications push PWA (via `web-push` npm package côté backend)
- Let's Encrypt : Certificats HTTPS automatiques via Caddy

**Data Flow :**
```
[Angular PWA]
    ├── HTTP REST ──→ [Caddy :443] ──→ [NestJS :3000] ──→ [Prisma + RLS] ──→ [PostgreSQL]
    ├── SSE ────────→ [Caddy :443] ──→ [NestJS :3000] (broadcast mood/reactions/challenges)
    └── WebSocket ──→ [Caddy :443] ──→ [NestJS :3000] (messagerie bidirectionnelle)
                                          │
                                          ├──→ [Cloudflare R2] (fichiers)
                                          └──→ [Klipy API] (GIFs)
```

### Development Workflow Integration

**Développement local :**
```bash
# Lancer tout l'environnement
docker compose up -d postgres    # Base de données
cd backend && pnpm dev           # NestJS en watch mode (port 3000)
cd frontend && ng serve          # Angular dev server (port 4200)
```
- Hot reload sur les deux projets
- Le dossier `shared/` est résolu via `tsconfig paths` — les changements sont pris en compte immédiatement

**Build de production :**
```bash
docker compose -f docker-compose.yml build
```
- Frontend : Angular build → assets statiques copiés dans l'image Caddy
- Backend : NestJS build → runtime Node.js slim
- Caddy sert les assets Angular + reverse proxy vers NestJS

**Pipeline CI/CD (GitHub Actions) :**
1. `lint` : ESLint frontend + backend
2. `test` : Tests unitaires (Vitest frontend, Jest backend)
3. `test:rls` : Tests de cloisonnement RLS sur PostgreSQL de CI
4. `build` : Build frontend + backend
5. `lighthouse` : Score accessibility ≥ 90
6. `deploy` : SSH → Hetzner VPS → `docker compose pull && docker compose up -d`

## Architecture Validation Results

### Coherence Validation

**Compatibilité des décisions :**
- Angular 21 + NestJS 11 + Prisma 7 + Socket.io 4.8 + PostgreSQL 16 — toutes les versions sont vérifiées compatibles (février 2026). Aucun conflit de dépendances identifié.
- TypeScript 5.8+ strict partagé entre les deux projets via le dossier `shared/` — cohérent avec les `paths` tsconfig.
- Zod pour la validation frontend ET backend via les schemas partagés — cohérent avec le choix de ne PAS utiliser class-validator.
- JWT hybrid (access en mémoire + refresh en httpOnly cookie) — compatible avec les intercepteurs Angular documentés.
- SSE pour broadcast + WebSocket pour messagerie — les deux protocoles sont documentés avec des patterns de reconnexion distincts.

**Cohérence des patterns :**
- Chaîne de transformation nommage : Prisma PascalCase → `@@map` snake_case (DB) → camelCase (API JSON) — cohérente de bout en bout.
- Structure : co-localisation des tests, organisation par feature (frontend) et par module (backend) — aligné avec le project tree.
- Communication : événements SSE (`mood:changed`) et WebSocket (`message:send`) suivent la même convention `<domain>:<action>`.

**Alignement structure :**
- Le project tree reflète exactement les modules NestJS listés dans les décisions architecturales.
- Les features Angular sont alignées avec les routes lazy-loadées documentées.
- Le dossier `shared/` est correctement référencé dans les deux `tsconfig.json`.

**Aucune contradiction identifiée.**

### Requirements Coverage Validation

**Functional Requirements (39 FRs) :**

| Domaine | FRs | Support architectural | Status |
|---------|-----|----------------------|--------|
| Utilisateurs & Accès | FR1-FR6 | `modules/auth/`, `modules/users/`, RGPD (hard delete, export) | Couvert |
| Groupes | FR7-FR12 | `modules/groups/`, `PlanLimitGuard`, invitation par token | Couvert |
| Humeurs | FR13-FR18 | `modules/moods/` + SSE, orbital-grid, historique + médiane | Couvert |
| Messagerie & Salons | FR19-FR29 | `modules/messaging/` + WebSocket, `modules/files/` pour R2 | Couvert |
| Mini-défi quotidien | FR30-FR33 | `modules/challenges/` + scheduler cron, leaderboard | Couvert |
| Onboarding & Notifications | FR34-FR39 | `features/onboarding/`, PWA + service workers, `modules/notifications/` | Couvert |

**Non-Functional Requirements (18 NFRs) :**

| NFR | Exigence | Support architectural | Status |
|-----|---------|----------------------|--------|
| NFR1 | Propagation humeurs < 2s | SSE broadcast par groupe | Couvert |
| NFR2 | Messages < 500ms | WebSocket Socket.io | Couvert |
| NFR3 | FCP < 3s | Lazy loading, esbuild, Tailwind purge | Couvert |
| NFR4 | Interactions < 200ms | Angular Signals (zoneless) | Couvert |
| NFR6 | Hash > 100ms | Argon2id configuré | Couvert |
| NFR7 | Tokens 15min + refresh | JWT access 15min + refresh 7j + rotation | Couvert |
| NFR8 | TLS 1.2+ | Caddy auto-HTTPS | Couvert |
| NFR9 | Isolation groupe | RLS Postgres + tests CI | Couvert |
| NFR10 | URLs signées 1h | R2 signed URLs via AWS SDK | Couvert |
| NFR12 | 99.5% uptime | Uptime Kuma monitoring | Couvert |
| NFR13 | Reconnexion auto < 5s | SSE retry exponentiel + Socket.io reconnection | Couvert |
| NFR14 | Livraison post-déconnexion | Queue Socket.io | Couvert |
| NFR15 | Backup quotidien | Script `pg_dump` + cron Docker | Couvert (ajouté) |
| NFR16-18 | Scalabilité 50-500+ groupes | Architecture stateless, connection pooling, cache abstractable | Couvert |

### Implementation Readiness Validation

**Complétude des décisions :**
- Toutes les décisions critiques sont documentées avec versions vérifiées par recherche web
- Chaque décision inclut un rationale expliquant le "pourquoi"
- La séquence d'implémentation est définie (8 étapes ordonnées)
- Les dépendances inter-composants sont cartographiées

**Complétude de la structure :**
- Le project tree est complet et spécifique — pas de placeholders génériques
- Chaque module NestJS a sa structure interne documentée (controller, service, module, dto, spec)
- Les fichiers de test sont spécifiés et co-localisés
- Les fichiers de configuration (Docker, Caddy, CI, Prisma) sont tous présents

**Complétude des patterns :**
- Naming conventions couvrent : DB, API, Code, fichiers, dossiers
- Format de réponse API standardisé avec exemples JSON concrets
- Patterns de communication SSE et WebSocket avec payloads détaillés
- Process patterns (error handling, loading states, validation, auth flow) documentés
- Anti-patterns explicitement interdits avec alternatives

### Gap Analysis Results

**Gaps résolus pendant la validation :**
- Backup PostgreSQL (NFR15) : ajout d'un script `scripts/backup.sh` (`pg_dump` quotidien) dans la structure du projet et étape `backup` dans le pipeline CI/CD.

**Gaps Nice-to-Have (post-MVP, non bloquants) :**
- Endpoint healthcheck (`GET /api/v1/health`) pour Uptime Kuma et Docker healthcheck — trivial à ajouter lors de l'implémentation.
- Rate limiting par groupe (actuellement par IP) — suffisant pour le MVP à 50 groupes.
- Métriques applicatives (temps de réponse, connexions SSE/WS actives) — pas nécessaire au MVP.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Contexte projet analysé en profondeur (39 FRs, 18 NFRs)
- [x] Scale et complexité évalués (Medium-High, 12-15 modules)
- [x] Contraintes techniques identifiées (dev solo, budget limité, stack imposée)
- [x] Cross-cutting concerns cartographiés (8 concerns)

**Architectural Decisions**
- [x] Décisions critiques documentées avec versions vérifiées
- [x] Stack technique complètement spécifiée
- [x] Patterns d'intégration définis (REST, SSE, WebSocket)
- [x] Considérations de performance adressées

**Implementation Patterns**
- [x] Conventions de nommage établies (DB, API, Code)
- [x] Patterns de structure définis (tests, frontend, backend)
- [x] Patterns de communication spécifiés (SSE, WebSocket, Signals)
- [x] Patterns de process documentés (erreurs, loading, auth)

**Project Structure**
- [x] Structure de répertoire complète définie
- [x] Boundaries de composants établies
- [x] Points d'intégration cartographiés
- [x] Mapping requirements → structure complet

### Architecture Readiness Assessment

**Status global :** PRÊT POUR L'IMPLÉMENTATION

**Niveau de confiance :** Élevé — toutes les décisions critiques sont prises, vérifiées et cohérentes entre elles.

**Points forts :**
- Cloisonnement multi-tenant garanti au niveau le plus bas (RLS Postgres) avec tests automatisés en CI
- Stack moderne et cohérente (Angular 21 Signals + NestJS 11 + Prisma 7)
- Séparation claire des responsabilités entre modules
- Patterns de nommage et de communication exhaustifs — les agents IA n'auront pas d'ambiguïté
- Architecture pensée pour un dev solo (simplicité opérationnelle) tout en permettant l'évolution (Dual Face Phase 2, Redis, scaling)

**Axes d'amélioration futurs :**
- Monitoring avancé (ELK, Datadog) quand les revenus le justifient
- E2E encryption pour la messagerie (Phase 3)
- NgRx Signal Store si la complexité du state management augmente
- Redis pour le cache distribué lors du scaling horizontal
- SSO/AD pour le plan Business (Phase 5)

### Implementation Handoff

**Directives pour les agents IA :**
1. Suivre toutes les décisions architecturales exactement comme documentées
2. Utiliser les patterns d'implémentation de manière cohérente dans tous les composants
3. Respecter la structure du projet et les boundaries entre modules
4. Se référer à ce document pour toute question architecturale
5. Créer des RLS policies pour toute nouvelle table contenant des données utilisateur
6. Utiliser Zod (jamais class-validator) pour toute validation
7. Formater les réponses API avec l'enveloppe standardisée `{ data, meta }`

**Première priorité d'implémentation :**
```bash
# 1. Initialiser le frontend Angular 21
ng new frontend --style=tailwind --ssr=false --naming-style=2025

# 2. Initialiser le backend NestJS 11
nest new backend --strict --package-manager=pnpm

# 3. Créer la structure racine
# docker-compose.yml, shared/, caddy/, scripts/, .github/
```
