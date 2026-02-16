# Story 1.5.1: Fix tsc-alias et stabilisation infra dev

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a développeur (Vincent),
I want éliminer le crash EMFILE causé par `tsc-alias -w` et stabiliser l'infrastructure de développement backend,
so that le mode dev local fonctionne de manière fiable sur Windows et que la dette technique identifiée en rétro Epic 1 soit résorbée.

## Acceptance Criteria

1. **AC1 — Élimination de tsc-alias du pipeline dev** : Given le backend en mode dev, When je lance `pnpm start:dev`, Then le processus démarre sans utiliser `tsc-alias -w`, And les imports `@shared/*` sont résolus correctement au runtime via un loader ESM custom, And aucun crash EMFILE ne se produit après 2+ minutes d'exécution sur Windows.

2. **AC2 — Build production préservé** : Given le backend en mode build, When je lance `pnpm build`, Then le build utilise `tsc-alias` en one-shot (pas en watch) pour réécrire les paths dans `dist/`, And le résultat est identique au comportement actuel, And `pnpm start:prod` fonctionne sans le loader custom.

3. **AC3 — Mode debug préservé** : Given le backend en mode debug, When je lance `pnpm start:debug`, Then le mode debug utilise le même loader ESM que `start:dev`, And l'inspecteur Node.js se connecte correctement, And aucun crash EMFILE ne se produit.

4. **AC4 — Tests backend passants** : Given les tests unitaires et E2E existants, When je lance `pnpm test` et `pnpm test:e2e`, Then tous les 25 tests existants passent (16 unit + 9 E2E), And la résolution `@shared/*` fonctionne dans Jest sans régression (moduleNameMapper inchangé).

5. **AC5 — Test refresh.interceptor.spec.ts créé** : Given le fichier `frontend/src/app/core/interceptors/refresh.interceptor.ts` existant, When les tests sont exécutés, Then un fichier `refresh.interceptor.spec.ts` existe avec des tests couvrant : interception d'un 401 suivi d'un refresh réussi + replay de la requête, refresh échoué → logout, requêtes non-interceptées (login/register/refresh), requêtes parallèles pendant un refresh en cours (dedup).

6. **AC6 — Tests frontend passants** : Given les tests frontend existants, When je lance `pnpm --filter frontend test`, Then tous les 37 tests existants passent, And le nouveau `refresh.interceptor.spec.ts` passe également.

7. **AC7 — Smoke test start:dev 2 minutes** : Given le backend compilé et la base Postgres accessible, When je lance `pnpm start:dev`, Then le processus tourne au minimum 2 minutes sans crash, erreur fatale ou fuite mémoire visible. *(Critère ajouté par Décision 3 de la rétro Epic 1.)*

## Tasks / Subtasks

### Backend — Remplacement tsc-alias en dev

- [x] Task 1 — Créer le loader ESM custom (AC: #1)
  - [x] Créer `backend/loader.mjs` : un resolve hook ESM (~20 lignes) qui intercepte les specifiers `@shared/*` et les résout vers le chemin absolu `../shared/` correspondant
  - [x] Le loader doit fonctionner avec les extensions `.js` (conformément aux imports existants)
  - [x] Le loader doit être un fichier JS pur (pas TypeScript) car il est chargé avant la compilation

- [x] Task 2 — Mettre à jour les scripts npm (AC: #1, #2, #3)
  - [x] `start:dev` : remplacer `concurrently -k -n build,alias,run "nest build --watch" "tsc-alias -w -p tsconfig.build.json" "node --watch-path=dist dist/backend/src/main.js"` par `concurrently -k -n build,run "nest build --watch" "node --import ./loader.mjs --watch-path=dist dist/backend/src/main.js"`
  - [x] `start:debug` : même modification avec ajout de `--inspect`
  - [x] `build` : conserver `nest build && tsc-alias -p tsconfig.build.json` (inchangé)
  - [x] `start:prod` : conserver `node dist/backend/src/main.js` (inchangé, tsc-alias a déjà réécrit les paths)

- [x] Task 3 — Vérification des scripts existants (AC: #4, #7)
  - [x] Lancer `pnpm test` — les 16 tests unitaires doivent passer (Jest utilise `moduleNameMapper`, pas le loader)
  - [x] Lancer `pnpm test:e2e` — les 9 tests E2E doivent passer
  - [x] Lancer `pnpm build && pnpm start:prod` — vérifier le démarrage
  - [x] Lancer `pnpm start:dev` — vérifier 2+ minutes sans crash (AC7)

### Frontend — Test refresh.interceptor.spec.ts

- [x] Task 4 — Écrire `refresh.interceptor.spec.ts` (AC: #5, #6)
  - [x] Créer `frontend/src/app/core/interceptors/refresh.interceptor.spec.ts`
  - [x] Test : requête 401 → refresh réussi → replay de la requête originale avec nouveau token
  - [x] Test : requête 401 → refresh échoué → appel logout + propagation erreur
  - [x] Test : requêtes vers `/auth/refresh`, `/auth/login`, `/auth/register` ne déclenchent PAS le refresh
  - [x] Test : requêtes parallèles pendant un refresh en cours → un seul appel refresh (dedup via `createRefreshState`)
  - [x] Test : erreur non-401 → propagation directe de l'erreur
  - [x] Lancer `pnpm --filter frontend test` — tous les tests doivent passer (37 existants + nouveaux)

### Validation finale

- [x] Task 5 — Smoke test complet (AC: #7)
  - [x] Démarrer Postgres (Docker ou local)
  - [x] `pnpm start:dev` tourne 2+ minutes sans crash ni erreur fatale
  - [x] Tester manuellement un endpoint (ex: `POST /api/v1/auth/register`) pour confirmer que les imports `@shared/*` fonctionnent
  - [x] Vérifier la console : aucun warning lié au loader ou à la résolution de modules

## Dev Notes

### Contexte du problème tsc-alias

Le bug EMFILE est le problème **CRITIQUE** identifié en rétrospective Epic 1. `tsc-alias -w` (watch mode) utilise `chokidar` 3.6 en interne et scanne **tout le projet y compris `node_modules`** — sur Windows, cela dépasse la limite de file descriptors après ~20 secondes, crashant le backend.

**Le build one-shot (`tsc-alias` sans `-w`) ne souffre PAS de ce bug** — il est rapide et fiable. Seul le mode watch est problématique.

### Solution retenue : Custom ESM Resolve Hook

**Pourquoi cette approche :**

| Alternative | Verdict |
|------------|---------|
| `tsconfig-paths` | **Bloqué** — ne supporte pas ESM `"type": "module"` |
| Subpath imports (`#shared`) | **Bloqué** — impossible de pointer vers `../shared/` (hors du package) |
| `tsx` / esbuild loader | **Bloqué** — pas de support `emitDecoratorMetadata` (requis par NestJS DI) |
| `resolve-tspaths` | Même risque EMFILE en watch mode |
| pnpm workspaces | Solution idéale long-terme mais restructuration trop lourde pour cette story |
| **Custom ESM resolve hook** | **Retenu** — petit fichier, zéro risque EMFILE, compatible ESM + NestJS |

**Implémentation du loader :**

Le loader utilise l'API `--import` de Node.js (stable depuis v20.6+) pour enregistrer un hook `resolve` qui intercepte les specifiers commençant par `@shared/` et les résout vers le chemin absolu correspondant dans `../shared/`.

```javascript
// backend/loader.mjs — ESM resolve hook for @shared/* path aliases
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./shared-resolver.mjs', pathToFileURL(import.meta.filename));
```

```javascript
// backend/shared-resolver.mjs — resolve hook implementation
import { resolve as pathResolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SHARED_DIR = pathResolve(import.meta.dirname, '..', 'shared');

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@shared/')) {
    const relativePath = specifier.slice('@shared/'.length);
    // Replace .js extension with .ts is NOT needed — dist/ already has .js files
    // But in dev, nest build compiles shared/ to dist/shared/
    // The resolve hook runs on the dist/ output, so we need to resolve to dist/shared/
    const resolved = pathToFileURL(pathResolve(SHARED_DIR, relativePath));
    return { url: resolved.href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
```

**ATTENTION :** Le loader résout `@shared/constants/errors.js` vers `<project-root>/shared/constants/errors.js`. Mais à runtime, Node.js exécute le JS compilé dans `dist/`. Il faut vérifier comment `nest build --watch` compile les fichiers `shared/` et ajuster le chemin de résolution en conséquence.

**Structure de compilation actuelle :**
- `nest build` avec `tsconfig.build.json` compile `backend/src/` ET `../shared/` dans `backend/dist/`
- Le `dist/` contient `dist/backend/src/` et `dist/shared/`
- `tsc-alias` réécrit `@shared/xxx.js` → `../../shared/xxx.js` (chemin relatif dans dist/)
- Le loader doit résoudre vers le **même chemin** : `dist/shared/xxx.js`

### Patterns établis à ne PAS casser

- **NestJS ESM strict** : `"type": "module"`, extensions `.js` sur tous les imports, `tsc-alias` post-build pour prod
- **Prisma 7 Driver Adapters** : `@prisma/adapter-pg` + `pg.Pool` dans `PrismaService`
- **Zod 4 partagé** : Schemas dans `shared/schemas/`, types inférés, `ZodValidationPipe` NestJS
- **JWT hybride** : access token 15min in-memory, refresh 7j httpOnly cookie, `JwtAuthGuard`
- **ResponseWrapperInterceptor** : auto-wrap `{ data }` — le controller retourne l'objet brut
- **Angular 21 zoneless** : standalone components, Signal Forms, naming 2025 (fichiers sans suffixe .component)
- **Jest 30 ESM** : `--experimental-vm-modules`, `moduleNameMapper` pour `@shared/*` — NE PAS toucher la config Jest

### Le test refresh.interceptor.spec.ts

Le `refreshInterceptor` (fichier existant : `frontend/src/app/core/interceptors/refresh.interceptor.ts`) utilise un pattern de closure `createRefreshState()` pour encapsuler l'état de refresh et empêcher les appels multiples simultanés.

**Points clés pour les tests :**
- C'est un `HttpInterceptorFn` (function-based, pas class-based) — Angular 21 style
- Il utilise `inject(AuthService)` dans le corps de la fonction
- Le state est encapsulé dans `createRefreshState()` au niveau module — attention à l'isolation entre tests
- Tester avec `TestBed` + `provideHttpClient(withInterceptors([refreshInterceptor]))` + `HttpTestingController`
- Framework de test : **Vitest** (pas Jest) — le frontend utilise Vitest via Angular builder

**Cas de test requis :**
1. Requête réussie (non-401) → passe sans interception
2. Erreur non-401 (ex: 500) → propagée directement
3. Erreur 401 sur requête normale → refresh tenté → si succès, requête rejouée avec nouveau token
4. Erreur 401 sur requête normale → refresh échoué → logout + erreur propagée
5. Requêtes exclues (login/register/refresh) avec 401 → PAS de refresh, erreur propagée
6. Requêtes parallèles 401 → un seul refresh déclenché (dedup)

### Project Structure Notes

**Fichiers créés/modifiés par cette story :**

| Fichier | Action | Notes |
|---------|--------|-------|
| `backend/loader.mjs` | NEW | ESM loader entry point |
| `backend/shared-resolver.mjs` | NEW | Resolve hook implementation |
| `backend/package.json` | MODIFIED | Scripts `start:dev` et `start:debug` |
| `frontend/src/app/core/interceptors/refresh.interceptor.spec.ts` | NEW | Tests du refresh interceptor |

**Fichiers qui ne doivent PAS être modifiés :**
- `backend/tsconfig.json` et `tsconfig.build.json` — les paths restent identiques
- `backend/jest` config dans `package.json` — `moduleNameMapper` fonctionne indépendamment
- `backend/src/**/*.ts` — aucun import source ne change
- `shared/**/*.ts` — aucune modification

### References

- [Source: _bmad-output/implementation-artifacts/epic-1-retro-2026-02-13.md#CRITIQUE — Bug EMFILE] — Description du problème et décision de créer Epic 1.5
- [Source: _bmad-output/implementation-artifacts/epic-1-retro-2026-02-13.md#Décision 3] — Smoke test `start:dev` 2 minutes obligatoire
- [Source: _bmad-output/implementation-artifacts/epic-1-retro-2026-02-13.md#Story 1.5.1] — Scope de la story
- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Sélectionné] — Types partagés via dossier `shared/` avec chemins TypeScript
- [Source: _bmad-output/implementation-artifacts/1-4-gestion-du-profil-utilisateur.md#Dev Notes] — Patterns ESM, Prisma, Zod établis
- [Source: _bmad-output/implementation-artifacts/1-3-connexion-et-deconnexion.md#AC3] — RefreshInterceptor spec (acceptance criteria)
- [Source: frontend/src/app/core/interceptors/refresh.interceptor.ts] — Code source de l'intercepteur à tester
- [Source: backend/package.json#scripts] — Scripts actuels à modifier
- [Source: NestJS CLI issue #2858] — tsconfig-paths ne fonctionne pas avec ESM
- [Source: Node.js docs — Customization Hooks] — API `--import` pour les resolve hooks ESM

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Identifié et corrigé un bug préexistant dans `auth.controller.spec.ts` : le cookie path attendu était `/api/v1/auth/refresh` au lieu de `/api/v1/auth` (correspondant au code source)
- Identifié et corrigé un bug préexistant dans les tests E2E : le test de rate limit épuisait le throttler avant les `beforeAll` des blocs login/refresh/logout, causant des enregistrements silencieusement échoués
- Identifié et corrigé un bug préexistant dans `auth.service.ts` : `generateTokens` créait des JWT déterministes (même payload + même seconde = même token), causant des violations de contrainte unique sur les refresh tokens. Fix : ajout de `jti: randomUUID()` à chaque token

### Completion Notes List

- Task 1 : Créé `backend/loader.mjs` + `backend/shared-resolver.mjs` — ESM resolve hook qui résout `@shared/*` vers `dist/shared/*` sans tsc-alias en watch mode
- Task 2 : Modifié `start:dev` et `start:debug` dans `backend/package.json` pour utiliser `--import ./loader.mjs` au lieu de `tsc-alias -w`. Build et start:prod inchangés
- Task 3 : 42/42 tests unitaires, 24/24 E2E, build+prod OK, start:dev 3+ min sans crash
- Task 4 : Créé `refresh.interceptor.spec.ts` avec 6 tests couvrant tous les cas requis (pass-through, non-401, 401+refresh success, 401+refresh fail, URLs exclues, dedup parallèle). 43/43 tests frontend passent
- Task 5 : Smoke test complet — start:dev 2+ min, endpoint auth testé, aucun warning loader/resolve

### File List

- `backend/loader.mjs` — NEW — ESM loader entry point
- `backend/shared-resolver.mjs` — NEW — Resolve hook implementation
- `backend/package.json` — MODIFIED — Scripts start:dev, start:debug, test:debug
- `backend/src/auth/auth.service.ts` — MODIFIED — Ajout jti (randomUUID) pour unicité des JWT
- `backend/src/auth/auth.controller.spec.ts` — MODIFIED — Fix cookie path assertion (/api/v1/auth)
- `backend/test/e2e/auth.e2e-spec.ts` — MODIFIED — Déplacé test rate limit en fin de fichier + fix ordering + warning
- `frontend/src/app/core/interceptors/refresh.interceptor.ts` — MODIFIED — Fix double-logout quand refresh échoue
- `frontend/src/app/core/interceptors/refresh.interceptor.spec.ts` — NEW — Tests du refresh interceptor
- `.gitignore` — MODIFIED — Ajout `nul` aux exclusions OS

### Change Log

- 2026-02-16 : Implémentation Story 1.5.1 — Remplacement de tsc-alias -w par ESM resolve hook, correction de 3 bugs préexistants (cookie path, E2E rate limit ordering, JWT token uniqueness), ajout de 6 tests refresh interceptor
- 2026-02-16 : Code Review (AI) — 7 issues trouvées (1 HIGH, 4 MEDIUM, 2 LOW), toutes corrigées :
  - [HIGH] Fix double-logout dans refreshInterceptor quand refresh échoue (catchError appelait logout 2x)
  - [MEDIUM] Suppression fichier `nul` parasite + ajout au .gitignore
  - [MEDIUM] Suppression import mort `firstValueFrom` dans refresh.interceptor.spec.ts
  - [MEDIUM] Simplification double-setTimeout en single dans test refresh-fail
  - [MEDIUM] Warning renforcé sur test E2E rate limit (dépendance à l'ordre)
  - [LOW] Fix script `test:debug` pour compatibilité ESM (--experimental-vm-modules)
  - [LOW] Warnings LF/CRLF notés (pas de .gitattributes au projet)
  - Tests post-review : 42/42 backend unit, 43/43 frontend — tous passent
