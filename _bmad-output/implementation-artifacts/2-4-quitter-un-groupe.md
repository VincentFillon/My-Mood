# Story 2.4: Quitter un groupe

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a membre d'un groupe,
I want quitter un groupe,
so that mes données dans ce groupe soient supprimées tout en conservant mon compte et mes autres groupes.

## Acceptance Criteria

1. **Given** je suis membre d'un groupe (pas `creator_admin`)
   **When** je clique sur "Quitter le groupe" dans les paramètres du groupe
   **Then** une modale de confirmation s'ouvre
   **And** un texte explique que mes données dans ce groupe (humeurs, messages) seront supprimées définitivement
   **And** un texte précise que mon compte et mes autres groupes ne sont pas affectés

2. **Given** la modale de confirmation est ouverte
   **When** je confirme
   **Then** l'endpoint supprime mon appartenance au groupe
   **And** mes humeurs dans ce groupe sont supprimées (hard delete)
   **And** mes messages restent visibles mais sont attribués à "Utilisateur parti"
   **And** mes médias R2 liés à ce groupe sont supprimés
   **And** je suis redirigé vers la page de sélection de groupe

3. **Given** je suis le `creator_admin` d'un groupe
   **When** je tente de quitter le groupe
   **Then** l'action est bloquée
   **And** un message indique que je dois d'abord transférer le rôle d'administrateur à un autre membre ou supprimer le groupe

4. **Given** je suis le `creator_admin` et le seul membre du groupe
   **When** je clique sur "Supprimer le groupe"
   **Then** une modale de confirmation s'ouvre
   **And** après confirmation, le groupe et toutes ses données sont supprimés définitivement
   **And** je suis redirigé vers la page de sélection de groupe

## Tasks / Subtasks

- [x] Task 1: Backend - Endpoint Quitter le groupe
  - [x] Intercepter ou créer un endpoint `DELETE /api/v1/groups/:groupId/leave` dans `groups.controller.ts`.
  - [x] Vérifier que l'utilisateur demandeur *n'est pas* le `creator_admin` (sauf s'il est le seul membre, pour supprimer le groupe).
  - [x] Supprimer (hard delete) l'entrée dans `GroupMember` pour cet utilisateur et ce groupe.
  - [x] Supprimer (hard delete) les entrées associées dans `Mood` pour ce membre/groupe.
  - [x] Anonymiser les entrées dans `Message` pour ce membre/groupe en changeant l'auteur avec un identifiant de système "Utilisateur parti" ou `null` selon le schéma Prisma, tout en conservant le contenu du message.
  - [x] Appeler le `FileService` pour supprimer ses médias Cloudflare R2 du groupe si applicable.
  
- [x] Task 2: Backend - Endpoint Supprimer le groupe (Creator Admin unique membre)
  - [x] Intercepter ou créer un endpoint `DELETE /api/v1/groups/:groupId` autorisé uniquement au `creator_admin`.
  - [x] Vérifier si le `creator_admin` est le seul membre restant. Si non, renvoyer une erreur explicite.
  - [x] Supprimer le groupe (cascade sur tous les membres, salons, etc.).

- [x] Task 3: Frontend - Composant de paramètres groupe
  - [x] Dans l'interface (ex: `group-detail` / panneau préférences), ajouter le bouton "Quitter le groupe".
  - [x] Implémenter la logique pour n'afficher le bouton que pour les simples membres, ou adapter le texte/action pour l'admin unique.
  - [x] Intégrer la modale CDK Overlay de confirmation avec texte d'alerte sur la perte des données.
  
- [x] Task 4: Base de données et Prisma
  - [x] S'assurer que le modèle `Message` supporte une relation optionnelle vers l'utilisateur (ex: `userId String?`) pour appliquer le processus d'anonymisation sans enfreindre les contraintes de clés étrangères. Si nécessaire, rédiger une migration Prisma pour appliquer la méthode "Utilisateur parti".

- [x] Task 5: Tests Backend & E2E
  - [x] Test : un `creator_admin` avec d'autres membres ne peut pas quitter.
  - [x] Test : un `creator_admin` seul peut supprimer le groupe.
  - [x] Test : vérifier l'anonymisation correcte des messages du membre qui quitte.

## Dev Notes

### Technical Requirements
- **PostgreSQL RLS:** Toutes les suppressions et anonymisations (Prisma) doivent respecter le contexte `app.current_group_id`.
- **Méthode d'anonymisation:** Mettre à `null` l'ID utilisateur (si la relation `Message -> User` est nullable), et gérer l'affichage de `Utilisateur parti` au niveau du front ou via un `User` fantôme système (à clarifier). Le schéma existant doit être respecté ou migré en conséquence.
- **REST Response:** L'API doit retourner au format `{ data, meta }` ou rien (HTTP 204 No Content) pour un `DELETE`. Les erreurs suivent le format uniformisé `{"statusCode": 403, "error": "FORBIDDEN", "message": "..."}`.

### Architecture Compliance
- PWA Mobile First & Tailwind CSS (sans spinner, préférer les `skeleton` screens si nécessaire).
- Validation stricte via Zod si inputs supplémentaires (non applicable pour suppression simple mais la règle perdure).
- NestJS : Guards stricts (tenant_id valide).

### Framework & Library Requirements
- Angular 21 (Zoneless, Signals)
- NestJS 11
- Prisma 7

### Previous Story Intelligence
Dans la Story 2.3, un membre pouvait être exclu (`removeMember`). La règle "les messages restent visibles mais sont attribués à 'Utilisateur parti'" a été dictée. Vous devez vous assurer que la logique implémentée (anonymisation) dans la Story 2.3 et la Story 2.4 partage si possible la même fonction de service (ex: `cleanUpUserData`).

### Project Context Reference
- [Source: epics.md#Story 2.4 : Quitter un groupe]
- [Source: architecture.md#Data Architecture]
- [Source: 2-3-gestion-des-membres-et-limites-du-plan-free.md#Dev Notes]

## Dev Agent Record

### Agent Model Used
Gemini 2.5 Pro (Antigravity)

### Debug Log References

### Completion Notes List
- Fixed missing DB models by adding `Mood` and `Message` to Prisma schema.
- Added RLS migration ensuring full tenant isolation via `app.current_group_id`.
- Implemented actual hard delete of `Moods` and anonymization of `Messages` on `leaveGroup` and `removeMember` using Prisma `$transaction`.
- Clarified UI text explaining separation of account/group data on the confirmation modal.
- Fixed E2E test suite by adding missing test asserting successful anonymization of messages when an user leaves.

### File List
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260302073251_init_moods_and_messages/migration.sql`
- `backend/src/groups/groups.service.ts`
- `frontend/src/app/features/groups/group-detail/group-detail.ts`
- `backend/test/e2e/groups.e2e-spec.ts`
