# Story 2.3: Gestion des membres et limites du plan Free

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a créateur-administrateur,
I want voir la liste des membres et révoquer l'accès d'un membre,
so that je puisse gérer la composition de mon équipe.

## Acceptance Criteria

1. **Given** je suis `creator_admin` d'un groupe
   **When** j'accède au panneau d'administration, section "Membres"
   **Then** la liste de tous les membres est affichée avec : avatar, nom, email, rôle, date d'ajout
   **And** un badge "Admin" est visible à côté de mon nom
   **And** chaque membre (sauf moi) a un bouton "Révoquer l'accès"

2. **Given** je suis `creator_admin`
   **When** je clique sur "Révoquer l'accès" d'un membre
   **Then** une modale de confirmation s'ouvre
   **And** après confirmation, l'endpoint `DELETE /api/v1/groups/:groupId/members/:userId` supprime le membre
   **And** les données de ce membre dans le groupe sont supprimées (humeurs, messages liés au groupe)
   **And** le membre est notifié de sa révocation (toast à sa prochaine connexion)
   **And** la liste des membres se met à jour en temps réel

3. **Given** un groupe Free a déjà 6 membres
   **When** un nouveau visiteur tente de rejoindre via un lien d'invitation
   **Then** l'endpoint retourne une erreur `403 FORBIDDEN` avec le code `GROUP_FULL`
   **And** le `PlanLimitGuard` bloque l'ajout
   **And** une page d'erreur indique que le groupe est plein
   **And** le message suggère de contacter le créateur du groupe

4. **Given** un groupe Free a 6 membres
   **When** le créateur-admin consulte le panneau d'administration
   **Then** un indicateur "6/6 membres" est affiché
   **And** le lien d'invitation est désactivé (grisé) avec un tooltip "Groupe plein — 6 membres maximum en plan Free"

5. **Given** je suis un simple `member` (pas `creator_admin`)
   **When** j'accède à la page du groupe
   **Then** le panneau d'administration n'est PAS visible
   **And** je ne peux pas accéder aux endpoints de gestion des membres (les guards bloquent avec `403 FORBIDDEN`)

## Tasks / Subtasks

- [ ] Task 1: Backend - Endpoint de suppression de membre
  - [ ] Mettre à jour `groups.service.ts` pour implémenter la méthode `removeMember(groupId, userId)`.
  - [ ] S'assurer que le service vérifie que l'utilisateur qui fait la requête est bien un `creator_admin` de ce groupe (utiliser `RolesGuard` et `@Roles('creator_admin')` si existant, ou validation manuelle dans le service/controller).
  - [ ] S'assurer que le `creator_admin` ne peut pas se supprimer lui-même via cet endpoint.
  - [ ] Implémenter l'endpoint `DELETE /api/v1/groups/:groupId/members/:userId` dans `groups.controller.ts`.
  - [ ] Supprimer (hard delete) les entrées associées au membre dans le groupe (`Moods`, etc.) via Prisma. Note: certaines entités comme `Messages` liés au groupe devront peut-être être anonymisées ou supprimées (vérifier l'implémentation de Story 2.4 "Quitter un groupe" ou prendre la décision architecturale de suppression/anonymisation de messages si la relation est CASCADE). Le PRD dit "mes messages restent visibles mais sont attribués à 'Utilisateur parti'" pour Quitter, appliquer la même règle pour l'exclusion.

- [ ] Task 2: Backend - Gestion des limites de plan
  - [ ] Intercepter la logique de "join" (`POST /api/v1/groups/join/:token` et inscripton avec token) pour implémenter le blocage si `memberCount >= MAX_GROUP_MEMBERS` (défini à 6 dans `shared/constants/limits`).
  - [ ] Retourner `403 FORBIDDEN` avec le code métier `GROUP_FULL` si le groupe dépasse la limite de 6 membres.
  - [ ] Mettre à jour ou créer un intercepteur/guard global de limite si applicable, sinon implémenter directement dans `groups.service.ts`.

- [ ] Task 3: Frontend - Panneau Administration : Section Membres
  - [ ] Dans la vue `group-detail` (panneau admin), ajouter une section ou onglet "Membres".
  - [ ] Afficher la liste des membres actuels avec leur avatar (ou skeleton si loading), nom, email, rôle et date d'ajout. *Besoin d'un appel `GET /api/v1/groups/:groupId/members` s'il n'existe pas déjà, ou utiliser les données du groupe.*
  - [ ] Intégrer un badge "Admin" pour le créateur.
  - [ ] Intégrer un bouton "Révoquer l'accès" pour les utilisateurs autres que l'admin actuel.
  - [ ] Implémenter une modale de confirmation lors du clic sur le bouton de révocation (utiliser `@angular/cdk/dialog` si disponible, sinon overlay personnalisé ou modale simple CSS/Tailwind).

- [ ] Task 4: Frontend - Mises à jour UI limites groupes
  - [ ] Dans le panneau d'invitation (créé en 2.2), afficher un indicateur de nombre de membres "X/6 membres".
  - [ ] Le bouton "Générer un lien d'invitation" doit être désactivé si `memberCount >= 6` et le lien d'invitation existant grisé avec tooltip approprié.
  - [ ] Dans le composant de `join-group` (visiteur ou connecté rejoignant), s'assurer que l'erreur métier `GROUP_FULL` (HTTP 403) affiche correctement "Groupe plein - 6 membres maximum en plan Free".

- [ ] Task 5: Backend & Frontend - SSE pour la liste des membres
  - [ ] Si SSE défini, l'action `removeMember` doit émettre un événement de type `member:left`. S'assurer que côté frontend, l'utilisateur exclu est notifié de sa révocation lors de sa prochaine connexion, ou directement redirigé.
  - [ ] Assurer la mise à jour en temps réel de la liste des membres (ajout ou exclusion) via l'abonnement SSE.

- [ ] Task 6: Tests Backend & E2E
  - [ ] Ajouter des tests pour vérifier le déclenchement de `403 FORBIDDEN` lors de l'intégration au delà de la limite Free.
  - [ ] Vérifier que seul un `creator_admin` peut exécuter le `DELETE` sur membre.
  - [ ] Vérifier qu'un admin ne peut pas se supprimer soi-même via le `DELETE`.

## Dev Notes

### Technical & Architecture Guardrails
- **Multi-Tenancy RLS (PostgreSQL):** Toute requête Prisma pour supprimer un membre *doit* s'exécuter dans le contexte du bon tenant.
- **Shared Constants:** Utiliser `@shared/constants/limits` (ex: `MAX_GROUP_MEMBERS = 6`) et `@shared/constants/errors` (ex: `GROUP_FULL_ERROR = 'GROUP_FULL'`) si existants. Ne pas coder ces valeurs "en dur".
- **Format API REST:** La réponse d'erreur REST en cas de dépassement de la limite de membre *doit* suivre ce format strict :
  ```json
  {
    "statusCode": 403,
    "error": "GROUP_FULL",
    "message": "Groupe plein — 6 membres maximum en plan Free",
    "timestamp": "2026-02-10T12:00:00.000Z"
  }
  ```
- **Structure API REST:** Les URLs des APIs (défini au-dessus) doivent suivre la convention:
  `DELETE /api/v1/groups/:groupId/members/:userId`
- **UI & CSS (Frontend):** L'interface doit être développée de façon "Mobile-first" et utiliser "Tailwind CSS". Ne *jamais* utiliser de spinners de chargement, utiliser *uniquement* des skeletons (`<skeleton />`).
- **Garde-fous des Rôles:** Toujours valider via un Guard NestJS que le `role === 'creator_admin'` pour les requêtes sur `/members/:userId`. Les membres normaux ne doivent pas y avoir accès.
- **Gestion des Erreurs (Frontend):** Vérifier la présence ou créer un Intercepteur Angular qui va lire la réponse d'erreur `"GROUP_FULL"` de l'API REST et lancer un Toast d'Information.

### Previous Intelligence (Story 2.2)
- Pendant la Story 2.2, le flow d'enregistrement et d'invitation par jeton a été complété et corrigé (les invitations expiré/invalide et les statuts déja-membre ont été renforcés). Assurez-vous que la règle `GROUP_FULL` s'injecte très en amont pour éviter de créer de faux états transitoires.
- Continuez à utiliser le modèle `GroupInvite` / Dto d'invitation si mis en place lors du 2.2.
- Dans le `groups.service.ts` développé pour le 2.2, il existe probablement la logique `join`. Intercepter l'inscription ici pour compter la limite de membre (via `Prisma.groupMember.count({ where: { groupId }})`).

### Workspace Layout
- Backend Controller / Service: `backend/src/groups/groups.controller.ts`, `backend/src/groups/groups.service.ts`
- Guards backend: `backend/src/groups/guards/roles.guard.ts` (ou un nouveau garde `creator-admin.guard.ts`) et `plan-limit.guard.ts`.
- Frontend Admin Panel: `frontend/src/app/features/groups/group-detail/group-detail.ts`
- Frontend Join flow: `frontend/src/app/features/groups/join-group/join-group.ts`

### References
- [Source: epics.md#Story 2.3 : Gestion des membres et limites du plan Free]
- [Source: architecture.md#API & Communication Patterns] pour les logs d'erreurs
- [Source: architecture.md#Enforcement Guidelines]
- [Source: ux-design-specification.md] pour les directives "anti-corporate", messages légers mais clairs.

## Dev Agent Record

### Agent Model Used
{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
