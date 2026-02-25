# Story 2.1: creation-de-groupe-et-isolation-des-donnees-rls

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur connecté,
I want créer un groupe et en devenir le créateur-administrateur,
so that je puisse rassembler mon équipe dans un espace dédié et isolé.

## Acceptance Criteria

1. **Création du groupe**
   - **Given** je suis connecté et n'ai pas encore de groupe
   - **When** je clique sur "Créer un groupe" et saisis un nom de groupe
   - **Then** l'endpoint `POST /api/v1/groups` crée un nouveau groupe en base de données
   - **And** je suis automatiquement ajouté comme membre avec le rôle `creator_admin`
   - **And** un UUID est généré pour le groupe
   - **And** je suis redirigé vers la page du groupe

2. **Base de données et Isolation (RLS)**
   - **Given** un groupe est créé
   - **When** les migrations Prisma s'exécutent
   - **Then** les models `Group` et `GroupMember` sont créés en base avec `@@map` vers les tables `groups` et `group_members`
   - **And** des policies RLS sont créées pour les tables `groups` et `group_members` filtrant par `group_id`
   - **And** le middleware Prisma injecte `SET app.current_group_id` à chaque requête authentifiée dans un contexte de groupe

3. **Sécurité d'isolement inter-groupe**
   - **Given** deux groupes existent (Groupe A et Groupe B)
   - **When** un membre du Groupe A fait une requête API
   - **Then** les policies RLS garantissent qu'aucune donnée du Groupe B n'est accessible (NFR9)
   - **And** un test automatisé de cloisonnement RLS vérifie cette isolation en CI

4. **Liste des groupes / État vide**
   - **Given** je suis connecté
   - **When** j'accède à la page de sélection de groupe
   - **Then** la liste de mes groupes est affichée
   - **And** si je n'ai aucun groupe, un état vide m'invite à créer un groupe ou rejoindre un groupe via un lien d'invitation
   - **And** la page utilise des skeleton screens pendant le chargement

5. **Panneau d'administration**
   - **Given** je suis `creator_admin` d'un groupe
   - **When** j'accède à la page du groupe
   - **Then** un panneau d'administration est accessible (onglet ou section dédiée)
   - **And** ce panneau affiche les options d'invitation et de gestion des membres

## Tasks / Subtasks

- [x] Task 1: Implémentation du backend (Bases de données & API)
  - [x] Créer les modèles Prisma `Group` et `GroupMember` (avec mapping `groups` et `group_members` en snake_case).
  - [x] Créer la migration Prisma avec le SQL raw pour activer Row-Level Security (RLS) sur les tables `groups` et `group_members` et écrire les policies en fonction du `app.current_group_id`.
  - [x] Mettre à jour le service Prisma pour injecter le paramètre PostgreSQL via `SET app.current_group_id` sur chaque requête lorsque le `groupId` est connu dans la session / token auth.
  - [x] Implémenter le module `GroupsModule` avec `GroupsController` et `GroupsService`.
  - [x] Ajouter l'endpoint `POST /api/v1/groups` avec sa validation Zod dans `@shared/schemas`.
  - [x] Implémenter les tests de cloisonnement RLS côté backend.

- [x] Task 2: Implémentation du frontend
  - [x] Créer les écrans pour la "liste des groupes" (état vide avec bouton de création, liste des groupes rejoints).
  - [x] Développer la vue du groupe cible avec une gestion par onglets (ou sous-routage) pour le panneau d'administration (`creator_admin`).
  - [x] Gérer les requêtes API via Angular resource/http avec gestion de l'état loading (Skeleton screens obligatoires, pas de spinners).
  - [x] Ajouter la gestion d'erreur formattée standard avec Angular interceptors en conformité avec `error.interceptor.ts`.

## Dev Notes

- **Architecture Compliance:**
  - Prisma models doivent être en **PascalCase**, et le `@map` en **snake_case plural**. Les UUIDv4 doivent être générés via `gen_random_uuid()` et jamais exposés de valeurs auto-incrémentées.
  - Zod doit rester l'unique validateur pour le endpoint de création. DTOs importés de `shared/schemas/group.schema.ts`.
  - Endpoint responses doivent être formatées telles que `{ "data": { ... } }`.
  - Mots-clés / Anti-patterns à éviter: pas de `any` (utiliser `unknown`), pas de mutations directes des Angular Signals hors du service.

- **Stack Details:** NestJS 11.1+, Prisma 7, Angular 21, PostgreSQL 16.
- RLS Policy implementation via raw SQL migration in Prisma is the critical point of this story.
- Frontend Signals usage: `groupService.loading()` -> render `<skeleton />`.
- **Safe Zone Extensibility**: ManagerSpace not needed yet, but keeping group isolation clean paves the path for it.

### Project Structure Notes

- Créer / utiliser le dossier de module backend `backend/src/modules/groups/`
- Ajouter les UI paths: `frontend/src/app/features/account` ou `frontend/src/app/features/groups` si ce n'est pas déjà spécifié dans les specs existantes (bien suivre l'architecture lazy loadée via `app.routes.ts`)

### References

- [Source: epics.md#Epic 2 : Création de Groupe & Invitations]
- [Source: architecture.md#Data Architecture (RLS Details)]
- [Source: architecture.md#Naming Patterns]

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- ✅ Implemented Prisma models and raw SQL RLS policies in generated migration
- ✅ Established AsyncLocalStorage for secure tenant isolation via Prisma Client extension
- ✅ Handled automatic group admin assignment at creation
- ✅ Created cohesive frontend validation schemas using Zod
- ✅ Bootstrapped GroupList, GroupCreate, and GroupDetail Angular components
- ✅ Built RLS data isolation tests and ran successfully
- ✅ Code review completed: Patched Prisma RLS SQL injection and implemented tabs in GroupDetail UI

### File List
- backend/prisma/schema.prisma
- backend/prisma/migrations/20260225132811_init_group_and_rls/migration.sql
- backend/src/prisma/prisma.service.ts
- backend/src/common/context/app.context.ts
- backend/src/groups/groups.controller.ts
- backend/src/groups/groups.service.ts
- backend/src/groups/groups.module.ts
- backend/src/app.module.ts
- backend/test/rls/group-isolation.spec.ts
- shared/schemas/group.schema.ts
- frontend/src/app/app.routes.ts
- frontend/src/app/features/groups/groups.routes.ts
- frontend/src/app/features/groups/groups.service.ts
- frontend/src/app/features/groups/group-list/group-list.ts
- frontend/src/app/features/groups/group-create/group-create.ts
- frontend/src/app/features/groups/group-detail/group-detail.ts
- frontend/src/app/shared/ui/skeleton/skeleton.ts
