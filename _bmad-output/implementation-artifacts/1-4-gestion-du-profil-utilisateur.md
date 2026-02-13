# Story 1.4: Gestion du profil utilisateur

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur connecté,
I want consulter et modifier mon profil (nom, email, photo de profil),
so that mes collègues puissent m'identifier dans l'application.

## Acceptance Criteria

1. **AC1 — Consultation du profil** : Given je suis connecté, When j'accède à la page Mon Compte (`/account`), Then mon nom, email et photo de profil (ou initiales par défaut) sont affichés, And la page utilise des skeleton screens pendant le chargement.

2. **AC2 — Modification nom/email** : Given je suis sur la page Mon Compte, When je modifie mon nom et/ou email et soumets le formulaire, Then l'endpoint `PUT /api/v1/users/me` valide les données avec Zod, And les modifications sont persistées en base de données, And un toast de succès "Profil mis à jour" s'affiche, And la réponse suit le format enveloppe `{ data, meta }`.

3. **AC3 — Upload photo de profil** : Given je suis sur la page Mon Compte, When j'uploade une photo de profil (image ≤ 10 Mo, formats JPEG/PNG/WebP), Then l'image est uploadée vers Cloudflare R2 dans le dossier de l'utilisateur, And une URL signée (expiration 1h) est retournée (NFR10), And un indicateur de progression s'affiche pendant l'upload (NFR5), And ma photo de profil est mise à jour dans l'interface.

4. **AC4 — Validation upload côté client** : Given je tente d'uploader un fichier > 10 Mo ou un format non supporté, When la validation s'exécute, Then un message d'erreur inline s'affiche sous le champ, And l'upload n'est pas envoyé au serveur.

5. **AC5 — Conflit email** : Given je modifie mon email pour un email déjà utilisé par un autre compte, When l'endpoint traite la requête, Then une erreur `409 CONFLICT` est retournée, And un message d'erreur inline s'affiche.

## Tasks / Subtasks

### Backend

- [x] Task 1 — Schéma Zod partagé pour la mise à jour de profil (AC: #2, #5)
  - [x] Créer `shared/schemas/user.schema.ts` avec `updateProfileSchema` (name: string min 2 max 50, email: email)
  - [x] Exporter les types inférés dans `shared/types/index.ts`
  - [x] Ajouter les constantes d'erreur dans `shared/constants/errors.ts` (`PROFILE_UPDATE_FAILED`, `AVATAR_UPLOAD_FAILED`)

- [x] Task 2 — Migration Prisma : ajouter `avatarUrl` au modèle User (AC: #3)
  - [x] Ajouter le champ `avatarUrl String? @map("avatar_url")` au modèle `User` dans `schema.prisma`
  - [x] Générer et appliquer la migration `add_user_avatar`

- [x] Task 3 — UsersController : endpoints `GET /users/me` et `PUT /users/me` (AC: #1, #2, #5)
  - [x] Créer `backend/src/users/users.controller.ts` avec `@UseGuards(JwtAuthGuard)`
  - [x] `GET /users/me` : retourne `{ data: { id, name, email, avatarUrl } }`
  - [x] `PUT /users/me` : valide avec `ZodValidationPipe(updateProfileSchema)`, appelle `UsersService.update()`
  - [x] Gérer le conflit email 409 dans `UsersService.update()` (catch unique constraint violation Prisma P2002)
  - [x] Enrichir `UsersService` avec `findById()` et `update()` methods

- [x] Task 4 — FilesModule : upload photo de profil vers R2 (AC: #3)
  - [x] Installer `@aws-sdk/client-s3` et `@aws-sdk/s3-request-presigner`
  - [x] Créer `backend/src/files/files.module.ts`, `files.service.ts`, `files.controller.ts`
  - [x] `FilesService` : `uploadAvatar(userId, file)` → upload vers R2 key `users/{userId}/avatar.{ext}`
  - [x] `FilesService` : `getSignedUrl(key)` → URL signée 1h via `@aws-sdk/s3-request-presigner`
  - [x] `FilesController` : `POST /api/v1/users/me/avatar` avec `@UseInterceptors(FileInterceptor('file'))` et `@UseGuards(JwtAuthGuard)`
  - [x] Validation côté serveur : taille ≤ 10Mo, MIME type `image/jpeg|image/png|image/webp`
  - [x] Après upload R2, mettre à jour `User.avatarUrl` avec la clé R2 (pas l'URL signée)
  - [x] Ajouter les variables d'environnement R2 dans `env.validation.ts` : `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` (optionnel)

- [x] Task 5 — Tests unitaires backend (AC: #1-5)
  - [x] `users.controller.spec.ts` : GET /me, PUT /me (succès, conflit email 409)
  - [x] `users.service.spec.ts` : findById, update (succès, P2002 conflict)
  - [x] `files.service.spec.ts` : uploadAvatar (succès, mock S3), getSignedUrl
  - [x] `files.controller.spec.ts` : POST /users/me/avatar (succès, fichier trop gros, mauvais format)

### Frontend

- [x] Task 6 — Composant AccountPage (AC: #1, #2)
  - [x] Créer `frontend/src/app/features/account/account-page.ts` (standalone component)
  - [x] Layout : section profil avec avatar (photo ou initiales), nom, email, formulaire d'édition
  - [x] Signal Forms avec validation Zod partagée (`updateProfileSchema`)
  - [x] Skeleton screens pendant le chargement (shimmer sur avatar circulaire + 2 rectangles pour les champs)
  - [x] Toast "Profil mis à jour" sur succès via un `NotificationService` simple (injectable, signal-based)

- [x] Task 7 — Composant ProfileEditor : upload photo (AC: #3, #4)
  - [x] Créer `frontend/src/app/features/account/profile-editor.ts` (standalone, enfant de AccountPage)
  - [x] Input file caché + bouton "Changer la photo" (click forwarding)
  - [x] Validation côté client avant envoi : taille ≤ 10Mo, format JPEG/PNG/WebP (via `file.type`)
  - [x] Message d'erreur inline si validation échoue (AC4)
  - [x] Indicateur de progression upload via `HttpClient.post()` avec `reportProgress: true` et `observe: 'events'`
  - [x] Après upload réussi, mettre à jour l'avatar affiché (URL signée retournée par l'API)

- [x] Task 8 — Service et routing (AC: #1-5)
  - [x] Créer `frontend/src/app/core/services/user.service.ts` : `getProfile()`, `updateProfile()`, `uploadAvatar()`
  - [x] Ajouter la route `/account` dans `app.routes.ts` avec lazy loading et `authGuard`
  - [x] Gérer l'erreur 409 dans le formulaire : message inline "Cet email est déjà utilisé"

- [x] Task 9 — Tests unitaires frontend (AC: #1-5)
  - [x] `account-page.spec.ts` : rendu skeleton, affichage profil, soumission formulaire, toast succès, erreur 409
  - [x] `profile-editor.spec.ts` : validation fichier, upload avec progression, affichage erreur inline
  - [x] `user.service.spec.ts` : appels HTTP GET/PUT/POST

### Tests d'intégration

- [x] Task 10 — Test E2E auth/profile (AC: #1-5)
  - [x] Ajouter dans `backend/test/e2e/` un test `users.e2e-spec.ts` : GET /users/me (200), PUT /users/me (200, 409), POST /users/me/avatar (200, 400)

## Dev Notes

### Patterns architecturaux établis (hérités de Story 1.1-1.3)

- **NestJS ESM strict** : `"type": "module"` dans `package.json`, imports avec `.js` extension, ESLint ESM config
- **Prisma 7 Driver Adapters** : `@prisma/adapter-pg` + `pg.Pool` dans `PrismaService`, `prisma.config.ts` pour le typage
- **Zod 4 partagé** : Schemas dans `shared/schemas/`, types inférés via `z.infer<>`, `ZodValidationPipe` custom pour NestJS
- **JWT hybride** : access token 15min in-memory, refresh 7j httpOnly cookie. `JwtAuthGuard` déjà exporté depuis `AuthModule`
- **ResponseWrapperInterceptor** : auto-wraps les réponses en `{ data }`. Le controller retourne l'objet brut.
- **GlobalExceptionFilter** : formate les erreurs en `{ statusCode, error, message, details, timestamp }`
- **Angular 21 zoneless** : `provideExperimentalZonelessChangeDetection()`, standalone components, Signal Forms
- **Angular 2025 naming** : fichiers sans suffixe component (ex: `login.ts`, pas `login.component.ts`), selector en `app-*`
- **Anti-patterns interdits** : pas de `any`, pas de `console.log`, pas de `localStorage` pour tokens, pas de `class-validator`, pas de spinners (skeleton screens uniquement)

### Nouveau pattern introduit : Cloudflare R2 (FilesModule)

C'est la **première story** qui introduit le stockage fichier Cloudflare R2. Le pattern doit être réutilisable pour les futures stories (4.4 — images dans les messages).

**Configuration R2 :**
```typescript
// backend/src/files/files.service.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3Client configuré avec l'endpoint R2 :
// endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
// region: 'auto'
// credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY }
```

**Organisation des clés R2 :**
- Avatars : `users/{userId}/avatar.{ext}` (une seule photo par user, écrasement)
- Futurs médias messages : `groups/{groupId}/channels/{channelId}/{messageId}.{ext}`

**Important :** Le champ `User.avatarUrl` stocke la **clé R2** (ex: `users/abc-123/avatar.png`), pas l'URL signée. L'URL signée est générée à la volée par `GET /users/me` (ou un endpoint dédié) car elle expire après 1h.

### Extraction de l'utilisateur depuis le JWT

Le `JwtStrategy` existant (`backend/src/auth/strategies/jwt.strategy.ts`) retourne `{ userId, email }` dans `request.user`. Utiliser un décorateur custom `@CurrentUser()` pour extraire proprement :

```typescript
// backend/src/auth/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Format de réponse PUT /users/me

```json
{
  "data": {
    "id": "uuid",
    "name": "Nouveau nom",
    "email": "nouveau@email.com",
    "avatarUrl": "https://signed-r2-url/users/uuid/avatar.png?X-Amz-..."
  }
}
```

Le `ResponseWrapperInterceptor` wraps automatiquement en `{ data }`, donc le controller retourne juste l'objet user.

### Upload avec progression côté frontend

```typescript
// frontend/src/app/core/services/user.service.ts
uploadAvatar(file: File): Observable<HttpEvent<any>> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post('/api/v1/users/me/avatar', formData, {
    reportProgress: true,
    observe: 'events',
  });
}
```

Le composant `ProfileEditor` écoute les `HttpEventType.UploadProgress` pour afficher la barre de progression.

### Navigation Mon Compte

Depuis l'UX Spec : Mon Compte est accessible via l'avatar dans la nav bar, avec slide-in depuis la droite (250ms). Pour le MVP (pas encore de nav bar complète), on utilise une route `/account` standard avec lazy loading.

### Project Structure Notes

- **Backend** : Les fichiers suivent la convention NestJS kebab-case avec suffixe (`users.controller.ts`, `files.service.ts`). Le `FilesModule` est un nouveau module dans `backend/src/files/`.
- **Frontend** : Convention Angular 2025 sans suffixe component. `account-page.ts` dans `features/account/`, `profile-editor.ts` dans le même dossier.
- **Shared** : Nouveau schema `shared/schemas/user.schema.ts` pour la validation profil.
- Pas de conflit détecté avec la structure existante.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4] — Acceptance Criteria complets
- [Source: _bmad-output/planning-artifacts/architecture.md#API Endpoints] — `GET/PUT/DELETE /api/v1/users/me` (ligne 846)
- [Source: _bmad-output/planning-artifacts/architecture.md#Stockage fichiers] — R2 signed URLs, organisation par `group_id/` (lignes 870, 929)
- [Source: _bmad-output/planning-artifacts/architecture.md#File Structure] — `modules/files/` avec controller, service, spec (lignes 797-800)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Composants Mon Compte] — AccountPage, ProfileEditor, NotificationSettings (lignes 1050-1065)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns] — Success toast "Profil mis à jour", Error inline, Skeleton screens (lignes 1180-1186)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Navigation] — Mon Compte via avatar nav bar, slide-in 250ms (lignes 1244, 1257)
- [Source: _bmad-output/implementation-artifacts/1-3-connexion-et-deconnexion.md] — Patterns JWT, guards, interceptors, conventions établies
- [Source: backend/src/auth/guards/jwt-auth.guard.ts] — JwtAuthGuard existant
- [Source: backend/src/users/users.service.ts] — UsersService existant (findByEmail, create — à enrichir avec findById, update)
- [Source: shared/schemas/auth.schema.ts] — Pattern Zod existant à suivre
- [Source: shared/constants/errors.ts] — Constantes d'erreur existantes à enrichir

## Dev Agent Record

### Agent Model Used

Claude Opus 4 (claude-opus-4-6) via Bmad Dev mode

### Debug Log References

- Fix `@UsePipes` → `@Body(pipe)` pour éviter validation du param `@CurrentUser()` (E2E PUT /me retournait 400)
- Fix `FilesController` : ajout guard `!file` → `BadRequestException` (E2E POST avatar sans fichier retournait 500)
- Fix assertion E2E : code d'erreur `EMAIL_ALREADY_EXISTS` (pas `CONFLICT`)
- `forwardRef()` sur AuthModule ↔ UsersModule pour dépendance circulaire
- Jest 30 ESM : `jest.mock` ne fonctionne pas → mock direct `(service as any).s3`

### Completion Notes List

- Backend : 16 tests unitaires pass, 9 tests E2E pass
- Frontend : 37 tests pass (6 suites : account-page, profile-editor, user.service, login, register, app)
- Frontend build vérifié (`ng build --configuration=development`)
- Upload avatar : validation client + serveur, progression, URL signée R2

### File List

**Shared (nouveau/modifié) :**
- `shared/schemas/user.schema.ts` — NEW
- `shared/types/index.ts` — MODIFIED
- `shared/constants/errors.ts` — MODIFIED

**Backend (nouveau/modifié) :**
- `backend/package.json` — MODIFIED (ajout @aws-sdk/client-s3, @aws-sdk/s3-request-presigner)
- `backend/pnpm-lock.yaml` — MODIFIED
- `backend/prisma/schema.prisma` — MODIFIED
- `backend/prisma/migrations/20260212165107_add_user_avatar/migration.sql` — NEW
- `backend/src/auth/decorators/current-user.decorator.ts` — NEW
- `backend/src/auth/auth.module.ts` — MODIFIED (forwardRef)
- `backend/src/users/users.service.ts` — MODIFIED (findById, update, updateAvatarUrl)
- `backend/src/users/users.controller.ts` — NEW
- `backend/src/users/users.module.ts` — MODIFIED (controller, forwardRef)
- `backend/src/files/files.service.ts` — NEW
- `backend/src/files/files.controller.ts` — NEW
- `backend/src/files/files.module.ts` — NEW
- `backend/src/app.module.ts` — MODIFIED (FilesModule)
- `backend/src/config/env.validation.ts` — MODIFIED (R2 env vars)
- `backend/src/users/users.service.spec.ts` — NEW
- `backend/src/users/users.controller.spec.ts` — NEW
- `backend/src/files/files.service.spec.ts` — NEW
- `backend/src/files/files.controller.spec.ts` — NEW
- `backend/test/e2e/users.e2e-spec.ts` — NEW

**Frontend (nouveau/modifié) :**
- `frontend/src/app/core/services/user.service.ts` — NEW
- `frontend/src/app/core/services/notification.service.ts` — NEW
- `frontend/src/app/features/account/account-page.ts` — NEW
- `frontend/src/app/features/account/profile-editor.ts` — NEW
- `frontend/src/app/app.routes.ts` — MODIFIED (/account route)
- `frontend/src/app/features/account/account-page.spec.ts` — NEW
- `frontend/src/app/features/account/profile-editor.spec.ts` — NEW
- `frontend/src/app/core/services/user.service.spec.ts` — NEW
