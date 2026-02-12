# Story 1.2: Inscription utilisateur

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visiteur,
I want créer un compte avec mon email et un mot de passe,
So that je puisse accéder à My Mood et rejoindre un groupe.

## Acceptance Criteria

1. **AC1 — Validation côté client du formulaire d'inscription**
   - **Given** je suis sur la page d'inscription
   - **When** je remplis le formulaire avec un nom, un email valide et un mot de passe (min. 8 caractères)
   - **Then** la validation Zod vérifie les champs côté client avant soumission
   - **And** les messages d'erreur de validation s'affichent en français sous les champs concernés

2. **AC2 — Création de compte et hachage du mot de passe**
   - **Given** je soumets le formulaire d'inscription avec des données valides
   - **When** l'endpoint `POST /api/v1/auth/register` traite la requête
   - **Then** un compte utilisateur est créé en base de données
   - **And** le mot de passe est hashé avec Argon2id (memoryCost: 65536, timeCost: 3, parallelism: 1)
   - **And** le mot de passe en clair n'est jamais stocké ni loggé
   - **And** un horodatage de consentement RGPD est enregistré (FR6)

3. **AC3 — Réponse JWT après inscription réussie**
   - **Given** l'inscription réussit
   - **When** le serveur répond
   - **Then** un access token JWT (15 min) est retourné dans le body
   - **And** un refresh token (7 jours) est posé en cookie httpOnly (SameSite=Strict, Secure, HttpOnly)
   - **And** je suis automatiquement connecté et redirigé

4. **AC4 — Gestion de l'email déjà utilisé**
   - **Given** je tente de m'inscrire avec un email déjà utilisé
   - **When** l'endpoint traite la requête
   - **Then** une erreur `409 CONFLICT` est retournée avec le format d'erreur standardisé
   - **And** le message indique que l'email est déjà utilisé sans révéler d'informations supplémentaires

5. **AC5 — Rate limiting sur l'inscription**
   - **Given** un acteur malveillant tente du brute force
   - **When** plus de 10 requêtes d'inscription sont envoyées en 1 minute depuis la même IP
   - **Then** les requêtes suivantes reçoivent un `429 TOO_MANY_REQUESTS`

6. **AC6 — Consentement RGPD obligatoire**
   - **Given** la checkbox de consentement RGPD n'est pas cochée
   - **When** je tente de soumettre le formulaire
   - **Then** la soumission est bloquée côté client
   - **And** un message indique que le consentement est obligatoire

## Tasks / Subtasks

- [x] Task 1 — Schéma Prisma User et migration (AC: #2)
  - [x] 1.1 Ajouter le model `User` dans `backend/prisma/schema.prisma` avec les champs : `id` (UUID, `gen_random_uuid()`), `name` (String), `email` (String, unique), `passwordHash` (String), `gdprConsentAt` (DateTime), `createdAt`, `updatedAt`
  - [x] 1.2 Ajouter `@@map("users")` et mapper les colonnes en snake_case (`password_hash`, `gdpr_consent_at`, `created_at`, `updated_at`)
  - [x] 1.3 Vérifier que `url = env("DATABASE_URL")` est bien présent dans le `datasource db` block (ajouté en code review story 1.1 — si absent, l'ajouter)
  - [x] 1.4 Exécuter `prisma migrate dev --name add-user-model` pour créer la migration
  - [x] 1.5 Vérifier que la table `users` est créée avec les bons types et contraintes (unique sur email, UUID par défaut)

- [x] Task 2 — Schemas Zod partagés pour l'auth (AC: #1, #2)
  - [x] 2.1 Créer `shared/schemas/auth.schema.ts` avec `RegisterSchema` : `{ name: z.string().min(1).max(100), email: z.string().email(), password: z.string().min(8).max(128), gdprConsent: z.literal(true) }`
  - [x] 2.2 Ajouter `RegisterResponse` schema : `{ accessToken: z.string(), user: { id, name, email } }`
  - [x] 2.3 Ajouter `EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS'` et `CONFLICT: 'CONFLICT'` dans `shared/constants/errors.ts`
  - [x] 2.4 Exporter les types inférés (`RegisterInput`, `RegisterResponse`) dans `shared/types/index.ts`
  - [x] 2.5 Vérifier que les imports `@shared/schemas/auth.schema` compilent dans les deux projets

- [x] Task 3 — Module Auth backend NestJS (AC: #2, #3, #4, #5)
  - [x] 3.1 Installer les dépendances : `argon2`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/throttler`, `@nestjs/config`, `cookie-parser` et leurs types
  - [x] 3.2 Configurer `ConfigModule.forRoot({ validate: validateEnv, isGlobal: true })` dans `AppModule` pour charger les variables d'environnement via le `env.validation.ts` existant
  - [x] 3.3 Créer `backend/src/auth/auth.module.ts` importé dans `AppModule`, configurant `JwtModule.registerAsync` (secret depuis `ConfigService`, expiration 15min) et `ThrottlerModule` (global 100/min)
  - [x] 3.4 Créer `backend/src/auth/auth.service.ts` avec méthode `register(dto)` : vérification unicité email → hash Argon2id → create Prisma → génération access + refresh tokens
  - [x] 3.5 Créer `backend/src/auth/auth.controller.ts` avec endpoint `POST /api/v1/auth/register` : validation Zod via pipe → appel service → réponse enveloppée `{ data }` + cookie refresh
  - [x] 3.6 Appliquer `@Throttle({ default: { limit: 10, ttl: 60000 } })` sur le endpoint register (AC: #5)

- [x] Task 4 — Infrastructure commune backend (AC: #2, #4)
  - [x] 4.1 Créer `backend/src/common/pipes/zod-validation.pipe.ts` : pipe NestJS qui valide le body avec un schema Zod et retourne les erreurs au format standardisé
  - [x] 4.2 Créer `backend/src/common/filters/global-exception.filter.ts` : attrape toutes les exceptions et formate en `{ statusCode, error, message, details, timestamp }`
  - [x] 4.3 Créer `backend/src/common/interceptors/response-wrapper.interceptor.ts` : enveloppe les réponses en `{ data, meta? }`
  - [x] 4.4 Enregistrer le pipe, le filtre et l'intercepteur globalement dans `main.ts`
  - [x] 4.5 Configurer `cookie-parser` dans `main.ts`
  - [x] 4.6 Configurer CORS dans `main.ts` : origin depuis `FRONTEND_URL` env, credentials: true

- [x] Task 5 — Module Users backend (AC: #2)
  - [x] 5.1 Créer `backend/src/users/users.module.ts` et `users.service.ts` avec méthodes `findByEmail(email)` et `create(data)`
  - [x] 5.2 Exporter `UsersModule` pour injection dans `AuthModule`

- [x] Task 6 — Page d'inscription Angular (AC: #1, #6)
  - [x] 6.1 Créer le feature module `frontend/src/app/features/auth/` avec `register.ts` (standalone component)
  - [x] 6.2 Implémenter le formulaire avec Angular Signal Forms : champs nom, email, mot de passe, checkbox consentement RGPD
  - [x] 6.3 Intégrer la validation Zod du `RegisterSchema` partagé : erreurs affichées en français sous chaque champ en `--error` (#F44336)
  - [x] 6.4 Bloquer la soumission si le consentement RGPD n'est pas coché (AC: #6)
  - [x] 6.5 Afficher un skeleton screen pendant le chargement, états loading/error via Signals
  - [x] 6.6 Styliser avec Tailwind CSS : dark mode par défaut, font Inter, surfaces `--surface-0`/`--surface-2`, spacing 4px multiples

- [x] Task 7 — Service Auth Angular + routing (AC: #3)
  - [x] 7.1 Créer `frontend/src/app/core/auth/auth.service.ts` : Signal-based, expose `readonly currentUser`, `readonly loading`, `readonly error`, méthode `register(dto)`
  - [x] 7.2 Configurer `provideHttpClient(withInterceptors([...]))` dans `app.config.ts`
  - [x] 7.3 Créer `frontend/src/app/core/interceptors/error.interceptor.ts` : parse les erreurs API standardisées
  - [x] 7.4 Ajouter les routes dans `app.routes.ts` : `/register` → lazy-load `register.ts`, `/login` → placeholder (story 1.3)
  - [x] 7.5 Après inscription réussie, stocker l'access token en mémoire (jamais localStorage) et rediriger

- [x] Task 8 — Tests unitaires et e2e (AC: #1-#6)
  - [x] 8.1 Tests unitaires `auth.service.spec.ts` backend : register success, email duplicate → 409, password hashing vérifié, RGPD consent stocké
  - [x] 8.2 Tests unitaires `auth.controller.spec.ts` backend : validation Zod, rate limiting, format réponse, cookie refresh token
  - [x] 8.3 Tests unitaires `register.spec.ts` frontend : validation formulaire, affichage erreurs, consentement RGPD bloquant
  - [x] 8.4 Test e2e `backend/test/e2e/auth.e2e-spec.ts` : flow complet register → vérification BDD → tokens valides

## Dev Notes

### Versions techniques exactes (héritées de Story 1.1)

| Technologie | Version | Notes |
|------------|---------|-------|
| Angular | **21.1.0** | Zoneless, Signal Forms, Vitest, naming 2025 |
| NestJS | **11.1.13** | Strict mode, Logger amélioré |
| Prisma | **7.3.0** | Rust-free, 3x plus rapide |
| Zod | **4.3.6** | Partagé frontend/backend via `@shared/` |
| TypeScript | **5.8+** | Strict mode activé des deux côtés |
| PostgreSQL | **16** | Avec support RLS natif |
| Node.js | **LTS** | pnpm dans le backend |

### Dépendances à installer (cette story)

**Backend (`backend/`):**
```bash
pnpm add argon2 @nestjs/jwt @nestjs/passport passport passport-jwt @nestjs/throttler @nestjs/config cookie-parser
pnpm add -D @types/passport-jwt @types/cookie-parser
```

**Note :** `@nestjs/config` est indispensable pour injecter `ConfigService` dans `JwtModule.registerAsync()` et accéder aux variables d'env de manière typée. Le fichier `env.validation.ts` existe déjà (story 1.1) — il suffit de le brancher via `ConfigModule.forRoot({ validate: validateEnv, isGlobal: true })`.

### Architecture Auth — Spécifications critiques

**Hash Argon2id :**
```typescript
import * as argon2 from 'argon2';

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,
  parallelism: 1,
});
// NFR6: hash DOIT prendre > 100ms sur le serveur cible
```

**JWT Hybrid (access en mémoire + refresh en cookie httpOnly) :**
- Access token : durée 15 min (`TOKEN_EXPIRY_ACCESS_MS`), payload `{ sub: userId, email }`, header `Authorization: Bearer`
- Refresh token : durée 7 jours (`TOKEN_EXPIRY_REFRESH_MS`), cookie `SameSite=Strict`, `Secure` (sauf dev), `HttpOnly`, path `/api/v1/auth/refresh`
- Le refresh token n'est PAS implémenté dans cette story (story 1.3) — mais le cookie DOIT être posé dès l'inscription

**Cookie refresh token :**
```typescript
response.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth/refresh',
  maxAge: TOKEN_EXPIRY_REFRESH_MS, // 7 jours
});
```

**Rate Limiting (`@nestjs/throttler`) :**
```typescript
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
})
// Sur le controller auth :
@Throttle({ default: { limit: 10, ttl: 60000 } })
```

### Format de réponse API

**Succès (register) :**
```json
{
  "data": {
    "accessToken": "eyJ...",
    "user": {
      "id": "uuid-v4",
      "name": "Vincent",
      "email": "vincent@example.com"
    }
  }
}
```

**Erreur (email duplicate) — 409 :**
```json
{
  "statusCode": 409,
  "error": "CONFLICT",
  "message": "Cet email est déjà utilisé",
  "timestamp": "2026-02-12T12:00:00.000Z"
}
```

**Erreur (validation) — 400 :**
```json
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Les données soumises sont invalides",
  "details": [
    { "field": "email", "issue": "Format d'email invalide" },
    { "field": "password", "issue": "Minimum 8 caractères requis" }
  ],
  "timestamp": "2026-02-12T12:00:00.000Z"
}
```

**Erreur (rate limit) — 429 :**
```json
{
  "statusCode": 429,
  "error": "RATE_LIMITED",
  "message": "Trop de tentatives, réessayez dans quelques minutes",
  "timestamp": "2026-02-12T12:00:00.000Z"
}
```

### Model Prisma User

```prisma
model User {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name           String   @db.VarChar(100)
  email          String   @unique @db.VarChar(255)
  passwordHash   String   @map("password_hash")
  gdprConsentAt  DateTime @map("gdpr_consent_at")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

- **UUID v4** via `gen_random_uuid()` PostgreSQL — JAMAIS d'auto-incréments
- **`@@map("users")`** — table snake_case pluriel
- Le champ `passwordHash` n'est JAMAIS sélectionné dans les requêtes de lecture (utiliser `select` ou `omit` Prisma)
- **Note :** Pas de RLS sur la table `users` dans cette story — le RLS sera ajouté dans l'Epic 2 quand les groupes seront créés (le cloisonnement est par `group_id`, pas par user)

### Schema Zod Auth partagé

```typescript
// shared/schemas/auth.schema.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères requis').max(128),
  gdprConsent: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions d\'utilisation' }),
  }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const RegisterResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
  }),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
```

### Structure de fichiers à créer/modifier

**Nouveaux fichiers :**
```
shared/
  schemas/
    auth.schema.ts                        # RegisterSchema, RegisterResponseSchema

backend/src/
  auth/
    auth.module.ts                        # AuthModule (JwtModule, ThrottlerModule)
    auth.controller.ts                    # POST /api/v1/auth/register
    auth.service.ts                       # register(), generateTokens()
    auth.controller.spec.ts               # Tests controller
    auth.service.spec.ts                  # Tests service
  users/
    users.module.ts                       # UsersModule
    users.service.ts                      # findByEmail(), create()
    users.service.spec.ts                 # Tests service
  common/
    pipes/
      zod-validation.pipe.ts             # ZodValidationPipe global
    filters/
      global-exception.filter.ts         # GlobalExceptionFilter
    interceptors/
      response-wrapper.interceptor.ts    # ResponseWrapperInterceptor
  test/
    e2e/
      auth.e2e-spec.ts                   # Test e2e inscription

frontend/src/app/
  features/
    auth/
      register.ts                        # RegisterComponent (standalone)
      register.spec.ts                   # Tests component
  core/
    auth/
      auth.service.ts                    # AuthService (Signal-based)
      auth.service.spec.ts               # Tests service
    interceptors/
      error.interceptor.ts               # ErrorInterceptor
```

**Fichiers modifiés :**
```
backend/prisma/schema.prisma              # Ajout model User
backend/src/app.module.ts                 # Import AuthModule, UsersModule, PrismaModule, ThrottlerModule
backend/src/main.ts                       # GlobalFilter, GlobalPipe, GlobalInterceptor, CORS, cookie-parser
shared/types/index.ts                     # Export RegisterInput, RegisterResponse
frontend/src/app/app.routes.ts            # Route /register
frontend/src/app/app.config.ts            # provideHttpClient, interceptors
```

### UX — Spécifications de la page d'inscription

**Layout :**
- Page centrée, max-width 400px, padding `--space-8` (32px)
- Surface `--surface-1` (#1a1a1a) pour le card, `--surface-0` (#0f0f0f) pour le fond
- Border radius `--radius-xl` (16px) sur le card
- Dark mode par défaut

**Formulaire :**
- Font Inter (déjà chargée via Google Fonts variable)
- Titre : "Rejoins My Mood" en `--text-2xl` (24px), `font-weight: 700`
- Labels : `--text-sm` (14px), `--text-secondary` (#a0a0a0)
- Inputs : `--surface-2` (#242424), border `--border` (#2a2a2a), radius `--radius-md` (8px), height 44px, padding `--space-3` (12px)
- Focus state : border `--accent-primary` avec glow subtil
- Erreurs inline : texte `--error` (#F44336) sous le champ, `--text-xs` (12px)

**Boutons :**
- Primary : "Créer mon compte" — fond `--accent-primary`, texte blanc, radius `--radius-md`, height 44px
- Ghost : "Déjà un compte ? Connecte-toi" — lien vers `/login`

**Checkbox RGPD :**
- Checkbox avec label en `--text-sm` : "J'accepte les conditions d'utilisation et la politique de confidentialité"
- Texte bloquant si non coché : `--error`

**Feedback :**
- Loading : bouton disabled + skeleton pulse
- Erreur serveur : toast notification rouge (5s auto-dismiss)
- Succès : redirection automatique (pas de toast)
- Erreurs de validation : inline sous chaque champ concerné, persistant jusqu'à correction

**Responsive :**
- Mobile (< 640px) : card plein écran, padding `--space-4` (16px)
- Desktop (>= 1024px) : card centré, max-width 400px

**Accessibilité :**
- Touch target minimum 44x44px sur tous les éléments interactifs
- Contraste texte ≥ 4.5:1 vérifié
- Labels associés aux inputs via `for` / `id`
- `aria-invalid` et `aria-describedby` sur les champs en erreur
- Focus visible sur tous les éléments interactifs
- `prefers-reduced-motion` : pas d'animations de pulse

### Conventions de nommage — Rappel

| Contexte | Convention | Exemple dans cette story |
|----------|-----------|--------------------------|
| Models Prisma | PascalCase singulier | `User` |
| Tables PostgreSQL | snake_case pluriel | `users` |
| Colonnes | snake_case | `password_hash`, `gdpr_consent_at` |
| Endpoints API | pluriel, kebab-case | `/api/v1/auth/register` |
| Body JSON | camelCase | `{ "gdprConsent": true }` |
| Classes NestJS | PascalCase | `AuthService`, `AuthController` |
| Fichiers NestJS | kebab-case + suffixe | `auth.controller.ts`, `auth.service.ts` |
| Fichiers Angular (2025) | kebab-case sans suffixe | `register.ts`, `auth.service.ts` |
| Constantes | UPPER_SNAKE_CASE | `TOKEN_EXPIRY_ACCESS_MS` |

### Anti-patterns INTERDITS

- `any` en TypeScript → utiliser `unknown`
- `console.log` → utiliser `Logger` NestJS côté backend
- `localStorage` pour les tokens → access token en mémoire JS uniquement
- `class-validator` → utiliser Zod exclusivement
- Spinners → skeleton screens uniquement
- Auto-incréments → UUID v4 via `gen_random_uuid()`
- Texte en dur → messages d'erreur dans les schemas Zod ou constantes
- `password` dans les logs ou réponses API → JAMAIS

### Intelligence de la Story 1.1 (précédente)

**Learnings critiques :**
- Prisma 7 génère le client dans `generated/prisma/client.js` — requiert l'extension `.js` explicite pour les imports `nodenext`
- PrismaService utilise le pattern composition (pas héritage) : `this.client = new PrismaClient()`
- PrismaModule est déjà `@Global()` — pas besoin de le ré-importer dans chaque module
- Le schema Prisma existant a `datasource db { provider = "postgresql" }` SANS `url = env("DATABASE_URL")` dans le fichier actuel — ATTENTION : le code review de la story 1.1 a noté que l'URL a été ajoutée, vérifier avant la migration
- L'env validation (`backend/src/config/env.validation.ts`) existe déjà avec `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` validés par Zod
- Angular 21 est zoneless par défaut — pas de `zone.js`, change detection via Signals uniquement
- Les tests frontend utilisent Vitest (pas Jasmine/Karma)
- Les tests backend utilisent Jest
- Tailwind CSS 4.x est intégré via `@tailwindcss/postcss`

**Fichiers existants qui seront modifiés :**
- `backend/prisma/schema.prisma` — actuellement vide (juste generator + datasource), ajouter model User
- `backend/src/app.module.ts` — actuellement vide (juste AppController/AppService), ajouter imports
- `backend/src/main.ts` — ajouter globals (filter, pipe, interceptor, CORS, cookies)
- `frontend/src/app/app.routes.ts` — actuellement `routes = []`, ajouter routes auth
- `frontend/src/app/app.config.ts` — ajouter `provideHttpClient`
- `shared/types/index.ts` — ajouter exports auth

### Git Intelligence

**Derniers commits :**
```
24f805b Story 1.1: Initialisation du projet et infrastructure de dev
b431728 Planning du sprint
d8f3902 Définition des epics/stories pour le MVP
5987f4e Définition de l'architecture
deefad5 Spécifications UX Design
```

**Patterns observés :**
- Messages de commit en français
- Format : `Story X.Y: Description courte`
- Commit unique par story (squash probable)

### Project Structure Notes

- Structure 100% alignée avec le document d'architecture
- Les dossiers `backend/src/auth/`, `backend/src/users/`, `backend/src/common/` n'existent pas encore — ils seront créés dans cette story
- Les dossiers `frontend/src/app/features/`, `frontend/src/app/core/` n'existent pas encore — ils seront créés dans cette story
- Le fichier `shared/schemas/auth.schema.ts` n'existe pas encore — il sera créé
- PrismaModule existe déjà dans `backend/src/prisma/` (créé en story 1.1) — il est `@Global()` donc disponible partout

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2] — Acceptance Criteria BDD complets
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security] — Hash Argon2id, JWT hybrid, rate limiting, CORS
- [Source: _bmad-output/planning-artifacts/architecture.md#API Design] — REST conventions, error format, response enveloppe
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — Prisma 7, PostgreSQL 16, Zod validation, RLS
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — Angular Signals, lazy loading, interceptors, AuthService
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns] — Naming, anti-patterns, enforcement
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure] — Arborescence auth module, common, shared
- [Source: _bmad-output/planning-artifacts/prd.md#FR1] — Création de compte email + mot de passe
- [Source: _bmad-output/planning-artifacts/prd.md#FR6] — Consentement explicite RGPD à l'inscription
- [Source: _bmad-output/planning-artifacts/prd.md#NFR6] — Hash adaptatif > 100ms
- [Source: _bmad-output/planning-artifacts/prd.md#NFR7] — Tokens 15min + refresh automatique
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Flow 1] — Flow inscription + onboarding
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns] — Erreurs inline, toast, skeleton
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color System] — Dark mode, surfaces, error color
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography] — Inter, type scale, weights
- [Source: _bmad-output/implementation-artifacts/1-1-initialisation-du-projet-et-infrastructure-de-developpement.md] — Versions exactes, structure existante, debug learnings

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Prisma 7 ne supporte plus `url = env("DATABASE_URL")` dans le schema — utiliser `prisma.config.ts`
- Prisma 7 PrismaClient requiert Driver Adapters (`@prisma/adapter-pg` + `pg.Pool`) — plus de constructor vide
- Zod 4 : `z.literal(true, { message: '...' })` au lieu de `errorMap`
- Backend ESM : `"type": "module"` + `.js` extensions sur tous les imports + `tsc-alias` post-build
- `shared/package.json` nécessaire avec `"type": "module"` pour résolution nodenext
- NestJS dist structure change avec imports cross-package — `entryFile: "backend/src/main"` dans nest-cli.json
- Angular `inject()` requis pour property initializers (pas constructor injection)
- Jest ESM : `import { jest } from '@jest/globals'` requis pour `jest.fn()`
- Jest moduleNameMapper : mapper spécifique `@shared/(.*)\\.js$` avant le mapper général pour strip `.js`

### Completion Notes List

- 8 tasks complétées, toutes les Acceptance Criteria couvertes
- Backend unit tests : 8/8 (app.controller + auth.service 4 tests + auth.controller 3 tests)
- Frontend tests : 12/12 (app 2 tests + register 10 tests)
- Backend e2e tests : 6/6 (app GET / + auth register flow 5 tests)
- Flow complet vérifié via curl : register → JWT + user, duplicate → 409, validation → 400
- PrismaService ferme proprement le pg.Pool dans onModuleDestroy

### Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.6 — 2026-02-12
**Verdict:** Approved with fixes applied

**13 issues found (5 HIGH, 5 MEDIUM, 3 LOW) — 10 fixed, 3 LOW accepted:**

| # | Sev | Issue | Fix |
|---|-----|-------|-----|
| H1 | HIGH | `errorInterceptor` was a no-op (catch+rethrow unchanged) | Implemented structured API error parsing with `ApiError` interface |
| H2 | HIGH | `auth.controller.spec.ts` missing ConflictException propagation test | Added test for error propagation |
| H3 | HIGH | AC5 rate limiting never tested (unit or e2e) | Added e2e rate limiting test |
| H4 | HIGH | `process.env['NODE_ENV']` used directly instead of ConfigService | Injected ConfigService in AuthController |
| H5 | HIGH | Magic number `10` in @Throttle instead of `RATE_LIMIT_AUTH` constant | Used `RATE_LIMIT_AUTH` from shared/constants/limits |
| M1 | MED | `findByEmail` selected `passwordHash` unnecessarily | Split into `findByEmail` (no hash) + `findByEmailWithCredentials` |
| M2 | MED | Frontend tests only tested Zod validation, not registration flow | Added 3 tests: AuthService call, validation guard, server error display |
| M3 | MED | Redundant `serverError` signal copied from `authService.error()` | Aliased directly to `authService.error` |
| M4 | MED | Timing side-channel revealed email existence | Reordered: hash password before checking email existence |
| M5 | MED | `gdprConsent as true` dangerous type cast | Removed cast: pass raw form to `safeParse`, use `result.data` |
| L1 | LOW | `EMAIL_ALREADY_EXISTS` code defined but never used | Accepted — may be used for granular error codes later |
| L2 | LOW | `/login` route points to RegisterComponent | Accepted — placeholder for story 1.3 |
| L3 | LOW | Unused deps: passport, passport-jwt, @nestjs/passport | Accepted — forward dependencies for story 1.3 |

### File List

**Nouveaux fichiers créés :**
- `shared/schemas/auth.schema.ts` — RegisterSchema, RegisterResponseSchema, types
- `shared/package.json` — Package config pour résolution ESM nodenext
- `backend/prisma/migrations/20260212100145_add_user_model/migration.sql` — Migration table users
- `backend/src/auth/auth.module.ts` — AuthModule (JwtModule, UsersModule)
- `backend/src/auth/auth.service.ts` — register(), generateTokens()
- `backend/src/auth/auth.controller.ts` — POST /api/v1/auth/register
- `backend/src/auth/auth.service.spec.ts` — 4 tests unitaires
- `backend/src/auth/auth.controller.spec.ts` — 3 tests unitaires
- `backend/src/users/users.module.ts` — UsersModule
- `backend/src/users/users.service.ts` — findByEmail(), findByEmailWithCredentials(), create()
- `backend/src/common/pipes/zod-validation.pipe.ts` — ZodValidationPipe
- `backend/src/common/filters/global-exception.filter.ts` — GlobalExceptionFilter
- `backend/src/common/interceptors/response-wrapper.interceptor.ts` — ResponseWrapperInterceptor
- `backend/test/e2e/auth.e2e-spec.ts` — 5 tests e2e
- `backend/.npmrc` — Approbation build argon2
- `frontend/src/app/features/auth/register.ts` — RegisterComponent standalone
- `frontend/src/app/features/auth/register.spec.ts` — 10 tests Vitest
- `frontend/src/app/core/auth/auth.service.ts` — AuthService Signal-based
- `frontend/src/app/core/interceptors/error.interceptor.ts` — ErrorInterceptor + ApiError interface

**Fichiers modifiés :**
- `backend/prisma/schema.prisma` — Ajout model User
- `backend/prisma.config.ts` — Interpolation variables DATABASE_URL
- `backend/prisma/seed.ts` — Adapter pattern PrismaPg
- `backend/src/app.module.ts` — ConfigModule, ThrottlerModule, AuthModule, UsersModule, ThrottlerGuard
- `backend/src/main.ts` — cookieParser, CORS, GlobalExceptionFilter, ResponseWrapperInterceptor
- `backend/src/app.controller.ts` — Fix import .js extension
- `backend/src/config/env.validation.ts` — Signature validateEnv pour ConfigModule
- `backend/src/prisma/prisma.service.ts` — PrismaPg adapter + pool.end()
- `backend/nest-cli.json` — entryFile pour dist structure
- `backend/package.json` — "type": "module", dépendances, Jest ESM config, scripts build
- `backend/test/jest-e2e.json` — ESM config + moduleNameMapper
- `shared/constants/errors.ts` — CONFLICT, EMAIL_ALREADY_EXISTS
- `shared/types/index.ts` — Exports RegisterInput, RegisterResponse
- `frontend/src/app/app.routes.ts` — Routes /register, /login
- `frontend/src/app/app.config.ts` — provideHttpClient, error interceptor
- `frontend/src/app/app.html` — Simplifié à router-outlet
- `frontend/src/app/app.spec.ts` — Adapté au nouveau template
