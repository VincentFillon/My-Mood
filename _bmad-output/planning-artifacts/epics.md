---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# my-mood - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for my-mood, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Gestion des utilisateurs & Accès (FR1-FR6) :**
- **FR1:** Un visiteur peut créer un compte avec email et mot de passe
- **FR2:** Un utilisateur peut se connecter et se déconnecter de son compte
- **FR3:** Un utilisateur peut consulter et modifier son profil (nom, email, photo de profil)
- **FR4:** Un utilisateur peut supprimer son compte, entraînant la suppression définitive de toutes ses données
- **FR5:** Un utilisateur peut exporter ses données personnelles (profil, appartenances, humeurs, messages)
- **FR6:** Un utilisateur doit donner son consentement explicite au traitement de ses données à l'inscription

**Gestion des groupes (FR7-FR12) :**
- **FR7:** Un utilisateur peut créer un groupe et en devenir le créateur-administrateur (membre avec panneau d'administration : invitations et révocation d'accès)
- **FR8:** Un créateur-administrateur peut générer un lien d'invitation unique pour son groupe
- **FR9:** Un visiteur peut rejoindre un groupe via un lien d'invitation
- **FR10:** Un créateur-administrateur peut voir la liste des membres et révoquer l'accès d'un membre
- **FR11:** Un utilisateur peut quitter un groupe, entraînant la suppression de ses données dans ce groupe uniquement
- **FR12:** Le système limite un groupe Free à 6 membres maximum et refuse l'ajout au-delà de cette limite

**Humeurs (FR13-FR18) :**
- **FR13:** Un membre peut sélectionner son humeur parmi une grille d'humeurs prédéfinie
- **FR14:** Un membre peut modifier son humeur à tout moment dans la journée
- **FR15:** Un membre peut voir les humeurs actuelles de tous les membres de son groupe en temps réel
- **FR16:** Un membre peut réagir à l'humeur d'un autre membre avec un emoji
- **FR17:** Un membre peut consulter son historique d'humeur personnel sous forme de courbe (axe X : jours, axe Y : niveau d'humeur), limité à 30 jours en plan Free
- **FR18:** Un membre peut consulter la médiane d'humeur de son groupe sous forme de courbe sur la même période que son historique personnel

**Messagerie & Salons (FR19-FR29) :**
- **FR19:** Le système crée automatiquement un salon principal à la création du groupe, accessible à tous les membres
- **FR20:** Un membre peut créer un salon au sein de son groupe
- **FR21:** Un créateur de salon peut nommer et renommer son salon
- **FR22:** Un créateur de salon peut inviter d'autres membres du groupe dans son salon
- **FR23:** Un membre peut quitter un salon
- **FR24:** Un membre peut envoyer un message texte dans un salon auquel il appartient
- **FR25:** Un membre peut partager des images dans un message
- **FR26:** Un membre peut partager des GIFs dans un message
- **FR27:** Un membre peut utiliser des emojis dans ses messages
- **FR28:** Un membre peut réagir à un message avec un emoji
- **FR29:** Un membre peut consulter l'historique des messages d'un salon, limité à 90 jours et 500 Mo de stockage en plan Free

**Mini-défi quotidien (FR30-FR33) :**
- **FR30:** Le système présente un nouveau mini-défi chaque jour à tous les membres du groupe
- **FR31:** Un membre peut participer au mini-défi quotidien en soumettant sa réponse (le type d'interaction dépend du défi : localisation sur image, réponse texte, choix multiple)
- **FR32:** Un membre peut consulter le classement des participants au mini-défi
- **FR33:** Un membre peut voir l'historique des mini-défis passés et des résultats

**Onboarding & Notifications (FR34-FR39) :**
- **FR34:** Un nouvel utilisateur est guidé par un onboarding en 3-5 étapes (bienvenue, présentation grille d'humeur, présentation mini-défi, présentation messagerie, sélection du premier mood) menant au premier check-in en moins de 5 minutes
- **FR35:** Un utilisateur peut recevoir des notifications push via la PWA
- **FR36:** Un utilisateur peut installer l'application comme PWA sur son appareil
- **FR37:** Un membre peut signaler un contenu (message, image, GIF, nom de profil ou photo de profil d'un autre membre) via un bouton dédié
- **FR38:** Le système notifie l'administrateur système par email lorsqu'un contenu est signalé, avec l'identifiant de l'élément concerné
- **FR39:** Le système isole les données de chaque groupe (aucun accès croisé entre groupes)

### NonFunctional Requirements

**Performance :**
- **NFR1:** Les changements d'humeur se propagent à tous les membres connectés du groupe en moins de 2 secondes, vérifié par tests end-to-end automatisés
- **NFR2:** Les messages envoyés apparaissent chez les autres membres du salon en moins de 500ms, vérifié par tests end-to-end automatisés
- **NFR3:** Le chargement initial de l'application (first contentful paint) est inférieur à 3 secondes sur une connexion 4G, mesuré par Lighthouse ou équivalent
- **NFR4:** Les interactions utilisateur (sélection humeur, envoi message, navigation) répondent en moins de 200ms côté client, mesuré par instrumentation front-end
- **NFR5:** L'upload d'images supporte des fichiers jusqu'à 10 Mo avec indication de progression mise à jour au minimum tous les 10% d'avancement

**Sécurité :**
- **NFR6:** Les mots de passe sont hashés avec un algorithme adaptatif nécessitant au minimum 100ms de calcul, jamais stockés en clair, vérifié par audit de code à chaque pull request
- **NFR7:** Les tokens d'authentification ont une durée de vie maximale de 15 minutes avec mécanisme de renouvellement automatique, vérifié par tests automatisés
- **NFR8:** Toutes les communications client-serveur sont chiffrées via TLS 1.2+, vérifié par scan de sécurité automatisé
- **NFR9:** Aucune requête applicative ne peut accéder aux données d'un autre groupe, vérifié par tests de cloisonnement automatisés exécutés en CI à chaque modification
- **NFR10:** Les fichiers stockés ne sont accessibles que via des URLs signées avec expiration de 1 heure maximum, vérifié par tests d'accès automatisés
- **NFR11:** Les données personnelles exportées (FR5) sont servies via un lien à usage unique expirant après 24 heures, vérifié par tests automatisés

**Fiabilité :**
- **NFR12:** L'application maintient un uptime de 99.5% sur 30 jours glissants (cible MVP/beta), évoluant vers 99.9% post-MVP, mesuré par monitoring externe
- **NFR13:** Les connexions temps réel se reconnectent automatiquement dans les 5 secondes suivant une interruption réseau, vérifié par tests de résilience
- **NFR14:** Les messages envoyés pendant une déconnexion inférieure à 1 heure sont livrés à la reconnexion sans perte, vérifié par tests end-to-end automatisés
- **NFR15:** La base de données est sauvegardée quotidiennement avec une rétention de 7 jours minimum, vérifié par test de restauration mensuel

**Scalabilité :**
- **NFR16:** L'architecture supporte au minimum 50 groupes actifs simultanés (un groupe actif = au moins 1 membre connecté), vérifié par load testing (cible MVP)
- **NFR17:** Le système maintient les performances attendues (NFR1-NFR4) avec 6 utilisateurs connectés simultanément par groupe, vérifié par load testing
- **NFR18:** Le stockage et le schéma de données supportent une croissance à 500+ groupes sans refonte architecturale, vérifié par tests de charge et analyse de schéma

### Additional Requirements

**Exigences tirées de l'Architecture :**

- **Starter Template :** Deux projets séparés initialisés via Angular CLI (`ng new frontend --style=tailwind --ssr=false --naming-style=2025`) et NestJS CLI (`nest new backend --strict --package-manager=pnpm`), orchestrés par Docker Compose. Constitue la première story d'implémentation.
- **Infrastructure Docker Compose + Caddy :** PostgreSQL 16 + backend NestJS + frontend Angular statique + Caddy reverse proxy avec auto-HTTPS Let's Encrypt
- **Multi-tenancy RLS Postgres :** Policies RLS ajoutées via SQL raw dans les migrations Prisma. Contexte tenant injecté via `SET app.current_group_id` par middleware Prisma. Tests de cloisonnement automatisés en CI.
- **Validation partagée Zod :** Schemas définis dans `shared/` importés côté frontend ET backend. Custom `ZodValidationPipe` pour NestJS, validation custom dans les Signal Forms Angular.
- **Auth JWT hybride :** Access token 15min en mémoire JS + Refresh token 7j en httpOnly cookie. Rotation du refresh token à chaque utilisation. `APP_INITIALIZER` Angular tente un refresh au boot.
- **Hash Argon2id :** `memoryCost: 65536, timeCost: 3, parallelism: 1` (> 100ms sur serveur cible)
- **Rate limiting :** `@nestjs/throttler` — 100 req/min global, 10/min endpoints auth, 20/min uploads
- **API REST versionnée :** `/api/v1/...` avec format d'erreur standardisé et enveloppe `{ data, meta }`
- **SSE pour broadcast :** Endpoint par groupe `GET /api/v1/groups/:groupId/events`, reconnexion exponentielle
- **WebSocket Socket.io pour messagerie :** Namespace `/groups/:groupId/chat`, rooms pour les salons, auth JWT handshake
- **Stockage Cloudflare R2 :** URLs signées avec expiration 1h, organisation par `group_id/`
- **CI/CD GitHub Actions :** Pipeline lint → tests unitaires → tests RLS → build → Lighthouse (a11y ≥ 90) → deploy SSH Hetzner
- **Monitoring Uptime Kuma :** Self-hosted sur le même VPS
- **Backup PostgreSQL :** `pg_dump` quotidien avec rétention 7 jours
- **Dossier `shared/` :** Types TypeScript inférés des schemas Zod + constantes partagées (limites, événements, erreurs)
- **Modules NestJS séparés :** Auth, Users, Groups, Moods, Messaging, Challenges, Files, Notifications — chacun avec controller, service, module, dto, specs
- **Structure frontend par feature :** core/ (services singleton), shared/ui/ (composants réutilisables), features/ (mood, chat, challenge, onboarding, account, invite) avec lazy loading
- **Conventions de nommage :** Prisma PascalCase → `@@map` snake_case DB → camelCase API JSON. Angular 2025 naming convention. NestJS kebab-case avec suffixe.
- **Anti-patterns interdits :** `any` TypeScript, `console.log`, mutations directes de Signals hors service, requêtes Prisma sans contexte tenant, spinners (toujours skeletons), texte en dur

**Exigences tirées de l'UX Design :**

- **PWA responsive-first :** Mobile-first CSS, breakpoints xs/sm/md/lg/xl, split view desktop ↔ tabs mobile
- **Dark mode par défaut :** Mode sombre natif, option light mode dans paramètres
- **Direction artistique "Sobre + Touches d'accent" :** Fond sombre uniforme, accents de couleur thématiques
- **Grille orbitale :** Avatars en cercles concentriques, adaptatif selon nombre de membres (1 orbite ≤ 6, 2 ≤ 12, 3 ≤ 18+), Canvas ou SVG
- **Ruban horizontal scrollable (MoodRibbon) :** Cards 80px (emoji/img/gif + label), `scroll-snap-type: x mandatory`, conversion mousewheel → scroll horizontal sur desktop
- **Messages système d'humeur dans le chat :** Chaque changement d'humeur génère automatiquement une ligne dans le fil de messagerie
- **Onboarding Spotlight Coach Marks :** 6 spots sur l'app réelle (backdrop blur + cutout spotlight), actions réelles pendant l'onboarding, état persisté
- **Système de thèmes (5 thèmes) :** Bon Pote (défaut Free), Sarcastique, Syndiqué, Vacancier, Besta — impacte les couleurs, labels, ton des messages, animations, easter eggs
- **Virtual scroll CDK :** Pour le fil de messagerie dès le MVP
- **Skeleton screens obligatoires :** Jamais de spinners, shimmer animation respectant `prefers-reduced-motion`
- **emoji-picker-element :** Web component ~12 kB, intégré via `CUSTOM_ELEMENTS_SCHEMA`
- **Klipy GIF API :** Remplace Tenor (fermeture juin 2026), composant `GifPicker` custom
- **Accessibilité WCAG 2.1 AA :** Contraste ≥ 4.5:1, navigation clavier complète, focus visible (CDK FocusMonitor), touch targets ≥ 44x44px, skip links, `LiveAnnouncer` pour événements temps réel, alt text sur images d'humeur, support daltonisme (couleur + emoji + label)
- **`prefers-reduced-motion` :** Désactive animations décoratives, transitions fonctionnelles instantanées
- **`prefers-contrast` :** Bordures plus épaisses, pas de transparence
- **Debounce changement d'humeur :** 2 secondes, seul le dernier changement est envoyé
- **Indicateurs de nouveauté :** Compteurs spécifiques (changements d'humeur + messages) depuis dernière visite
- **Notifications push granulaires :** Activées par défaut, contrôle par catégorie (humeurs, messages, réactions, défi quotidien) dans Mon Compte
- **Faux bouton "Accès Manager" :** Mécanisme de confiance humoristique — page "C'est mort ! Pas de managers ici !"
- **Font Inter :** Variable font, type scale base 16px ratio 1.25 (Major Third)
- **Spacing base 4px :** Tous espacements multiples de 4px
- **Navigation :** Desktop = nav bar haut (48px) + split view. Mobile = nav bar haut + tabs en bas (56px)
- **Conversations privées :** Desktop = fenêtres flottantes (CDK Overlay). Mobile = pages dédiées (navigation stack)
- **Tests a11y :** axe-core dans les tests unitaires, Lighthouse CI (score ≥ 90), tests clavier, tests VoiceOver/NVDA

### FR Coverage Map

- FR1: Epic 1 — Création de compte (email + mot de passe)
- FR2: Epic 1 — Connexion / déconnexion
- FR3: Epic 1 — Consultation et modification du profil
- FR4: Epic 8 — Suppression de compte + cascade complète sur toutes les données
- FR5: Epic 8 — Export complet des données personnelles (RGPD)
- FR6: Epic 1 — Consentement explicite à l'inscription
- FR7: Epic 2 — Création de groupe + rôle créateur-administrateur
- FR8: Epic 2 — Génération de lien d'invitation unique
- FR9: Epic 2 — Rejoindre un groupe via lien d'invitation
- FR10: Epic 2 — Gestion des membres + révocation d'accès
- FR11: Epic 2 — Quitter un groupe + suppression données groupe
- FR12: Epic 2 — Limite 6 membres par groupe Free
- FR13: Epic 3 — Sélection d'humeur via grille prédéfinie
- FR14: Epic 3 — Modification d'humeur à tout moment
- FR15: Epic 3 — Visualisation temps réel des humeurs de l'équipe
- FR16: Epic 3 — Réaction emoji à l'humeur d'un collègue
- FR17: Epic 3 — Historique d'humeur personnel (courbe 30 jours)
- FR18: Epic 3 — Médiane d'humeur de l'équipe (courbe)
- FR19: Epic 4 — Salon principal auto-créé à la création du groupe
- FR20: Epic 4 — Création de salons par les membres
- FR21: Epic 4 — Nommage et renommage de salon
- FR22: Epic 4 — Invitation de membres dans un salon
- FR23: Epic 4 — Quitter un salon
- FR24: Epic 4 — Envoi de messages texte
- FR25: Epic 4 — Partage d'images
- FR26: Epic 4 — Partage de GIFs
- FR27: Epic 4 — Utilisation d'emojis dans les messages
- FR28: Epic 4 — Réaction emoji à un message
- FR29: Epic 4 — Historique des messages (90 jours / 500 Mo Free)
- FR30: Epic 5 — Nouveau mini-défi quotidien
- FR31: Epic 5 — Participation au mini-défi
- FR32: Epic 5 — Classement des participants
- FR33: Epic 5 — Historique des mini-défis
- FR34: Epic 6 — Onboarding guidé (3-5 étapes, premier mood < 5 min)
- FR35: Epic 6 — Notifications push PWA
- FR36: Epic 6 — Installation PWA
- FR37: Epic 7 — Signalement de contenu
- FR38: Epic 7 — Notification email admin sur signalement
- FR39: Epic 2 — Isolation des données par groupe (RLS)

## Epic List

### Epic 1 : Inscription, Authentification & Profil Utilisateur
L'utilisateur peut créer un compte, se connecter et gérer son profil. Inclut l'initialisation du projet (starter template Angular CLI + NestJS CLI + Docker Compose) comme fondation technique.
**FRs couverts :** FR1, FR2, FR3, FR6

### Epic 2 : Création de Groupe & Invitations
L'utilisateur peut créer un groupe, inviter ses collègues par lien unique, gérer les membres et quitter un groupe. Le système isole les données par groupe (RLS) et enforce les limites du plan Free.
**FRs couverts :** FR7, FR8, FR9, FR10, FR11, FR12, FR39

### Epic 3 : Grille d'Humeur & Interactions Sociales
Les membres peuvent exprimer leur humeur via la grille orbitale, voir les humeurs de l'équipe en temps réel (SSE), réagir aux humeurs des collègues, et consulter leur historique + médiane d'équipe.
**FRs couverts :** FR13, FR14, FR15, FR16, FR17, FR18

### Epic 4 : Messagerie Groupe & Salons
Les membres peuvent discuter en temps réel via WebSocket, créer des salons, partager images/GIFs/emojis, réagir aux messages. Les changements d'humeur génèrent des messages système dans le fil.
**FRs couverts :** FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29

### Epic 5 : Mini-Défi Quotidien
Les membres participent à un défi quotidien, consultent le classement et l'historique des défis passés. Le système génère un nouveau défi chaque jour.
**FRs couverts :** FR30, FR31, FR32, FR33

### Epic 6 : Onboarding, Notifications & PWA
Les nouveaux utilisateurs sont guidés par un onboarding Spotlight Coach Marks menant au premier mood en < 5 min. Tous les utilisateurs reçoivent des notifications push et peuvent installer l'app comme PWA.
**FRs couverts :** FR34, FR35, FR36

### Epic 7 : Modération & Signalement
Les membres peuvent signaler un contenu inapproprié, le système notifie l'admin par email. Renforce la confiance dans la safe zone.
**FRs couverts :** FR37, FR38

### Epic 8 : Conformité RGPD (Suppression & Export)
L'utilisateur peut supprimer définitivement son compte (cascade sur toutes les données : humeurs, messages, réactions, participations aux défis, médias R2) et exporter l'intégralité de ses données personnelles au format JSON. Placé en fin de roadmap pour garantir la couverture complète de tous les modèles de données.
**FRs couverts :** FR4, FR5

---

## Epic 1 : Inscription, Authentification & Profil Utilisateur

L'utilisateur peut créer un compte, se connecter et gérer son profil. Inclut l'initialisation du projet (starter template Angular CLI + NestJS CLI + Docker Compose) comme fondation technique. Les droits RGPD (suppression, export) sont traités dans l'Epic 8 après que tous les modèles de données existent.

### Story 1.1 : Initialisation du projet et infrastructure de développement

As a développeur,
I want initialiser les deux projets (frontend Angular 21 + backend NestJS 11) avec Docker Compose, PostgreSQL, Caddy et le dossier shared/,
So that l'équipe dispose d'une base de code fonctionnelle et d'un environnement de développement opérationnel.

**Acceptance Criteria:**

**Given** aucun code source n'existe
**When** les commandes d'initialisation sont exécutées (`ng new frontend --style=tailwind --ssr=false --naming-style=2025` et `nest new backend --strict --package-manager=pnpm`)
**Then** deux projets distincts sont créés dans les dossiers `frontend/` et `backend/`
**And** TypeScript strict mode est activé dans les deux projets

**Given** les deux projets sont initialisés
**When** le fichier `docker-compose.yml` est créé
**Then** les services PostgreSQL 16, backend NestJS et Caddy sont définis
**And** un `docker-compose.override.yml` expose les ports de développement et active le hot reload
**And** `docker compose up` démarre tous les services sans erreur

**Given** Docker Compose est fonctionnel
**When** le dossier `shared/` est créé à la racine
**Then** il contient `schemas/`, `types/` et `constants/` avec les fichiers de base (`common.schema.ts`, `limits.ts`, `events.ts`, `errors.ts`)
**And** les `tsconfig.json` des deux projets résolvent `@shared/*` via `paths`
**And** un import `@shared/constants/limits` compile sans erreur dans les deux projets

**Given** l'infrastructure de base est en place
**When** Prisma 7 est installé dans le backend
**Then** le fichier `schema.prisma` est configuré pour PostgreSQL
**And** `prisma migrate dev` s'exécute avec succès contre le PostgreSQL Docker
**And** `prisma db seed` est configuré (script vide prêt à remplir)

**Given** le Caddyfile est configuré
**When** une requête est faite sur le port 443 (ou 80 en dev)
**Then** `/api/*` est proxifié vers NestJS (port 3000)
**And** `/*` sert les assets Angular statiques (en prod) ou proxifie vers `ng serve` (en dev)

**Given** le projet est configuré
**When** le pipeline CI GitHub Actions est créé (`.github/workflows/ci.yml`)
**Then** il exécute lint, tests unitaires et build pour les deux projets
**And** le pipeline passe au vert sur un push

---

### Story 1.2 : Inscription utilisateur

As a visiteur,
I want créer un compte avec mon email et un mot de passe,
So that je puisse accéder à My Mood et rejoindre un groupe.

**Acceptance Criteria:**

**Given** je suis sur la page d'inscription
**When** je remplis le formulaire avec un nom, un email valide et un mot de passe (min. 8 caractères)
**Then** la validation Zod vérifie les champs côté client avant soumission
**And** les messages d'erreur de validation s'affichent en français sous les champs concernés

**Given** je soumets le formulaire d'inscription avec des données valides
**When** l'endpoint `POST /api/v1/auth/register` traite la requête
**Then** un compte utilisateur est créé en base de données
**And** le mot de passe est hashé avec Argon2id (memoryCost: 65536, timeCost: 3, parallelism: 1)
**And** le mot de passe en clair n'est jamais stocké ni loggé
**And** un horodatage de consentement RGPD est enregistré (FR6)

**Given** l'inscription réussit
**When** le serveur répond
**Then** un access token JWT (15 min) est retourné dans le body
**And** un refresh token (7 jours) est posé en cookie httpOnly (SameSite=Strict, Secure, HttpOnly)
**And** je suis automatiquement connecté et redirigé

**Given** je tente de m'inscrire avec un email déjà utilisé
**When** l'endpoint traite la requête
**Then** une erreur `409 CONFLICT` est retournée avec le format d'erreur standardisé
**And** le message indique que l'email est déjà utilisé sans révéler d'informations supplémentaires

**Given** un acteur malveillant tente du brute force
**When** plus de 10 requêtes d'inscription sont envoyées en 1 minute depuis la même IP
**Then** les requêtes suivantes reçoivent un `429 TOO_MANY_REQUESTS`

**Given** la checkbox de consentement RGPD n'est pas cochée
**When** je tente de soumettre le formulaire
**Then** la soumission est bloquée côté client
**And** un message indique que le consentement est obligatoire

---

### Story 1.3 : Connexion et déconnexion

As a utilisateur inscrit,
I want me connecter et me déconnecter de mon compte,
So that je puisse accéder à mon espace de manière sécurisée et contrôler mes sessions.

**Acceptance Criteria:**

**Given** je suis sur la page de connexion
**When** je saisis mon email et mon mot de passe corrects
**Then** l'endpoint `POST /api/v1/auth/login` vérifie les credentials avec Argon2id
**And** un access token JWT (15 min) est retourné dans le body
**And** un refresh token (7 jours) est posé en cookie httpOnly
**And** je suis redirigé vers la page principale

**Given** je saisis un email ou mot de passe incorrect
**When** l'endpoint traite la requête
**Then** une erreur `401 UNAUTHORIZED` est retournée
**And** le message est générique ("Email ou mot de passe incorrect") sans révéler lequel est faux

**Given** mon access token a expiré (> 15 min)
**When** une requête API est faite
**Then** l'intercepteur Angular `RefreshInterceptor` intercepte le 401
**And** un appel `POST /api/v1/auth/refresh` est fait automatiquement avec le cookie refresh token
**And** un nouveau couple access/refresh token est généré (rotation du refresh token)
**And** la requête originale est rejouée avec le nouveau access token

**Given** mon refresh token a expiré ou est invalide
**When** le refresh échoue
**Then** je suis déconnecté automatiquement
**And** je suis redirigé vers la page de connexion

**Given** je rafraîchis la page ou rouvre l'app
**When** l'`APP_INITIALIZER` Angular s'exécute
**Then** un refresh token est tenté automatiquement
**And** si le refresh réussit, ma session est restaurée sans re-login
**And** si le refresh échoue, la page de connexion est affichée

**Given** je suis connecté
**When** je clique sur "Déconnexion"
**Then** l'endpoint `POST /api/v1/auth/logout` invalide le refresh token côté serveur
**And** l'access token est supprimé de la mémoire JS
**And** le cookie refresh token est supprimé
**And** je suis redirigé vers la page de connexion

**Given** un acteur malveillant tente du brute force sur le login
**When** plus de 10 tentatives sont faites en 1 minute depuis la même IP
**Then** les requêtes suivantes reçoivent un `429 TOO_MANY_REQUESTS`

---

### Story 1.4 : Gestion du profil utilisateur

As a utilisateur connecté,
I want consulter et modifier mon profil (nom, email, photo de profil),
So that mes collègues puissent m'identifier dans l'application.

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à la page Mon Compte (`/account`)
**Then** mon nom, email et photo de profil (ou initiales par défaut) sont affichés
**And** la page utilise des skeleton screens pendant le chargement

**Given** je suis sur la page Mon Compte
**When** je modifie mon nom et/ou email et soumets le formulaire
**Then** l'endpoint `PUT /api/v1/users/me` valide les données avec Zod
**And** les modifications sont persistées en base de données
**And** un toast de succès "Profil mis à jour" s'affiche
**And** la réponse suit le format enveloppe `{ data, meta }`

**Given** je suis sur la page Mon Compte
**When** j'uploade une photo de profil (image ≤ 10 Mo, formats JPEG/PNG/WebP)
**Then** l'image est uploadée vers Cloudflare R2 dans le dossier de l'utilisateur
**And** une URL signée (expiration 1h) est retournée (NFR10)
**And** un indicateur de progression s'affiche pendant l'upload (NFR5)
**And** ma photo de profil est mise à jour dans l'interface

**Given** je tente d'uploader un fichier > 10 Mo ou un format non supporté
**When** la validation s'exécute
**Then** un message d'erreur inline s'affiche sous le champ
**And** l'upload n'est pas envoyé au serveur

**Given** je modifie mon email pour un email déjà utilisé par un autre compte
**When** l'endpoint traite la requête
**Then** une erreur `409 CONFLICT` est retournée
**And** un message d'erreur inline s'affiche

---

## Epic 2 : Création de Groupe & Invitations

L'utilisateur peut créer un groupe, inviter ses collègues par lien unique, gérer les membres et quitter un groupe. Le système isole les données par groupe (RLS) et enforce les limites du plan Free.

### Story 2.1 : Création de groupe et isolation des données (RLS)

As a utilisateur connecté,
I want créer un groupe et en devenir le créateur-administrateur,
So that je puisse rassembler mon équipe dans un espace dédié et isolé.

**Acceptance Criteria:**

**Given** je suis connecté et n'ai pas encore de groupe
**When** je clique sur "Créer un groupe" et saisis un nom de groupe
**Then** l'endpoint `POST /api/v1/groups` crée un nouveau groupe en base de données
**And** je suis automatiquement ajouté comme membre avec le rôle `creator_admin`
**And** un UUID est généré pour le groupe
**And** je suis redirigé vers la page du groupe

**Given** un groupe est créé
**When** les migrations Prisma s'exécutent
**Then** les models `Group` et `GroupMember` sont créés en base avec `@@map` vers les tables `groups` et `group_members`
**And** des policies RLS sont créées pour les tables `groups` et `group_members` filtrant par `group_id`
**And** le middleware Prisma injecte `SET app.current_group_id` à chaque requête authentifiée dans un contexte de groupe

**Given** deux groupes existent (Groupe A et Groupe B)
**When** un membre du Groupe A fait une requête API
**Then** les policies RLS garantissent qu'aucune donnée du Groupe B n'est accessible (NFR9)
**And** un test automatisé de cloisonnement RLS vérifie cette isolation en CI

**Given** je suis connecté
**When** j'accède à la page de sélection de groupe
**Then** la liste de mes groupes est affichée
**And** si je n'ai aucun groupe, un état vide m'invite à créer un groupe ou rejoindre un groupe via un lien d'invitation
**And** la page utilise des skeleton screens pendant le chargement

**Given** je suis `creator_admin` d'un groupe
**When** j'accède à la page du groupe
**Then** un panneau d'administration est accessible (onglet ou section dédiée)
**And** ce panneau affiche les options d'invitation et de gestion des membres

---

### Story 2.2 : Invitation par lien unique et rejoindre un groupe

As a créateur-administrateur,
I want générer un lien d'invitation unique pour mon groupe,
So that mes collègues puissent rejoindre l'espace facilement.

**Acceptance Criteria:**

**Given** je suis `creator_admin` d'un groupe
**When** je clique sur "Générer un lien d'invitation" dans le panneau d'administration
**Then** l'endpoint `POST /api/v1/groups/:groupId/invite` génère un token unique
**And** une URL d'invitation est construite : `{base_url}/invite/{token}`
**And** l'URL est affichée avec un bouton "Copier le lien" (CDK Clipboard)
**And** le token a une durée de validité (7 jours par défaut)

**Given** un lien d'invitation valide existe
**When** un visiteur non connecté clique sur le lien
**Then** il est redirigé vers la page d'inscription avec le token d'invitation pré-rempli
**And** après inscription, il est automatiquement ajouté au groupe avec le rôle `member`

**Given** un lien d'invitation valide existe
**When** un utilisateur déjà connecté clique sur le lien
**Then** l'endpoint `POST /api/v1/groups/join/:token` l'ajoute au groupe
**And** il est redirigé vers la page du groupe
**And** un message de bienvenue s'affiche

**Given** un lien d'invitation a expiré ou est invalide
**When** un visiteur clique sur le lien
**Then** une page d'erreur s'affiche avec un message explicatif
**And** un bouton "Demander un nouveau lien" est proposé (envoie une notification au créateur-admin)

**Given** un utilisateur est déjà membre du groupe
**When** il clique sur le lien d'invitation de ce même groupe
**Then** il est redirigé vers la page du groupe
**And** un message indique qu'il est déjà membre

---

### Story 2.3 : Gestion des membres et limites du plan Free

As a créateur-administrateur,
I want voir la liste des membres et révoquer l'accès d'un membre,
So that je puisse gérer la composition de mon équipe.

**Acceptance Criteria:**

**Given** je suis `creator_admin` d'un groupe
**When** j'accède au panneau d'administration, section "Membres"
**Then** la liste de tous les membres est affichée avec : avatar, nom, email, rôle, date d'ajout
**And** un badge "Admin" est visible à côté de mon nom
**And** chaque membre (sauf moi) a un bouton "Révoquer l'accès"

**Given** je suis `creator_admin`
**When** je clique sur "Révoquer l'accès" d'un membre
**Then** une modale de confirmation s'ouvre
**And** après confirmation, l'endpoint `DELETE /api/v1/groups/:groupId/members/:userId` supprime le membre
**And** les données de ce membre dans le groupe sont supprimées (humeurs, messages liés au groupe)
**And** le membre est notifié de sa révocation (toast à sa prochaine connexion)
**And** la liste des membres se met à jour en temps réel

**Given** un groupe Free a déjà 6 membres
**When** un nouveau visiteur tente de rejoindre via un lien d'invitation
**Then** l'endpoint retourne une erreur `403 FORBIDDEN` avec le code `GROUP_FULL`
**And** le `PlanLimitGuard` bloque l'ajout
**And** une page d'erreur indique que le groupe est plein
**And** le message suggère de contacter le créateur du groupe

**Given** un groupe Free a 6 membres
**When** le créateur-admin consulte le panneau d'administration
**Then** un indicateur "6/6 membres" est affiché
**And** le lien d'invitation est désactivé (grisé) avec un tooltip "Groupe plein — 6 membres maximum en plan Free"

**Given** je suis un simple `member` (pas `creator_admin`)
**When** j'accède à la page du groupe
**Then** le panneau d'administration n'est PAS visible
**And** je ne peux pas accéder aux endpoints de gestion des membres (les guards bloquent avec `403 FORBIDDEN`)

---

### Story 2.4 : Quitter un groupe

As a membre d'un groupe,
I want quitter un groupe,
So that mes données dans ce groupe soient supprimées tout en conservant mon compte et mes autres groupes.

**Acceptance Criteria:**

**Given** je suis membre d'un groupe (pas `creator_admin`)
**When** je clique sur "Quitter le groupe" dans les paramètres du groupe
**Then** une modale de confirmation s'ouvre
**And** un texte explique que mes données dans ce groupe (humeurs, messages) seront supprimées définitivement
**And** un texte précise que mon compte et mes autres groupes ne sont pas affectés

**Given** la modale de confirmation est ouverte
**When** je confirme
**Then** l'endpoint supprime mon appartenance au groupe
**And** mes humeurs dans ce groupe sont supprimées (hard delete)
**And** mes messages restent visibles mais sont attribués à "Utilisateur parti"
**And** mes médias R2 liés à ce groupe sont supprimés
**And** je suis redirigé vers la page de sélection de groupe

**Given** je suis le `creator_admin` d'un groupe
**When** je tente de quitter le groupe
**Then** l'action est bloquée
**And** un message indique que je dois d'abord transférer le rôle d'administrateur à un autre membre ou supprimer le groupe

**Given** je suis le `creator_admin` et le seul membre du groupe
**When** je clique sur "Supprimer le groupe"
**Then** une modale de confirmation s'ouvre
**And** après confirmation, le groupe et toutes ses données sont supprimés définitivement
**And** je suis redirigé vers la page de sélection de groupe

---

## Epic 3 : Grille d'Humeur & Interactions Sociales

Les membres d'un groupe peuvent sélectionner leur humeur via le MoodRibbon, voir les humeurs de l'équipe en temps réel sur la grille orbitale, réagir avec des emojis, et consulter leur historique personnel avec la médiane d'équipe.

### Story 3.1 : Sélection et modification d'humeur via le MoodRibbon

As a membre d'un groupe,
I want sélectionner mon humeur parmi une grille prédéfinie via le MoodRibbon,
So that mes collègues puissent voir comment je me sens aujourd'hui.

**Acceptance Criteria:**

**Given** je suis connecté et membre d'un groupe
**When** j'accède à la page principale du groupe
**Then** le MoodRibbon est affiché sous l'OrbitalGrid (bande horizontale scrollable)
**And** il présente les humeurs prédéfinies de la grille par défaut (happy, neutral, sad, angry, excited, tired, stressed, sick)
**And** chaque humeur est représentée par un emoji et un label
**And** la page utilise des skeleton screens pendant le chargement

**Given** le MoodRibbon est affiché
**When** je clique/tappe sur une humeur
**Then** l'endpoint `POST /api/v1/groups/:groupId/moods` est appelé
**And** l'humeur est persistée avec un timestamp en base de données (model `Mood` avec `@@map('moods')`)
**And** une animation de confirmation visuelle joue sur l'humeur sélectionnée
**And** mon avatar sur l'OrbitalGrid se met à jour avec l'indicateur d'humeur correspondant

**Given** j'ai déjà sélectionné une humeur aujourd'hui
**When** je clique sur une autre humeur dans le MoodRibbon
**Then** l'endpoint `PUT /api/v1/groups/:groupId/moods/today` met à jour mon humeur
**And** la modification est immédiate (pas de confirmation demandée)
**And** un debounce de 500ms évite les appels multiples en cas de clics rapides

**Given** je suis sur mobile (< 768px)
**When** le MoodRibbon s'affiche
**Then** il est scrollable horizontalement avec un hint de scroll (flèche ou dégradé)
**And** les emojis sont dimensionnés pour être facilement cliquables (min 44x44px, WCAG 2.1 AA)

**Given** j'utilise un lecteur d'écran
**When** je navigue dans le MoodRibbon
**Then** chaque humeur a un `aria-label` descriptif (ex: "Sélectionner l'humeur : content")
**And** le MoodRibbon a un `role="radiogroup"` et chaque humeur un `role="radio"`
**And** la navigation au clavier fonctionne avec les flèches gauche/droite

---

### Story 3.2 : Grille orbitale des humeurs en temps réel (OrbitalGrid + SSE)

As a membre d'un groupe,
I want voir les humeurs actuelles de tous les membres en temps réel sur la grille orbitale,
So that je puisse sentir l'ambiance de l'équipe d'un coup d'œil.

**Acceptance Criteria:**

**Given** je suis connecté et membre d'un groupe
**When** j'accède à la page principale du groupe
**Then** l'OrbitalGrid est affiché (zone centrale de la page, layout split view)
**And** chaque membre du groupe est représenté par un avatar disposé en orbite
**And** les avatars ont un indicateur visuel de leur humeur actuelle (bordure colorée ou emoji)
**And** les membres sans humeur aujourd'hui ont un indicateur neutre/grisé

**Given** l'OrbitalGrid est affiché
**When** la connexion SSE est établie via `GET /api/v1/groups/:groupId/moods/stream`
**Then** le client reçoit d'abord un snapshot initial de toutes les humeurs actuelles
**And** le `SseService` NestJS utilise un `Subject` RxJS pour broadcaster les événements

**Given** un membre sélectionne ou modifie son humeur
**When** l'humeur est persistée en base de données
**Then** un événement SSE `mood:updated` est broadcasté à tous les membres connectés du groupe
**And** l'OrbitalGrid de chaque membre se met à jour en temps réel (animation de transition sur l'avatar)
**And** la latence est inférieure à 500ms (NFR1)

**Given** la connexion SSE est perdue (réseau instable)
**When** le client détecte la déconnexion
**Then** une reconnexion automatique est tentée avec backoff exponentiel (1s, 2s, 4s, 8s, max 30s)
**And** après reconnexion, un re-sync complet des humeurs est effectué
**And** un indicateur discret "Reconnexion..." s'affiche dans l'UI pendant la déconnexion

**Given** je suis sur tablette (768px-1024px)
**When** l'OrbitalGrid s'affiche
**Then** le layout passe en split view (grille à gauche, panel d'actions à droite)

**Given** je suis sur mobile (< 768px)
**When** l'OrbitalGrid s'affiche
**Then** le layout passe en vue empilée (grille en haut, actions en dessous)
**And** les avatars sont redimensionnés pour rester lisibles sur petit écran

---

### Story 3.3 : Réactions emoji aux humeurs

As a membre d'un groupe,
I want réagir à l'humeur d'un collègue avec un emoji,
So that je puisse montrer mon soutien ou ma solidarité de façon légère et fun.

**Acceptance Criteria:**

**Given** l'OrbitalGrid est affiché et un collègue a une humeur
**When** je clique/tappe sur l'avatar d'un collègue
**Then** un ReactionPicker s'ouvre (popover avec une sélection d'emojis rapides)
**And** le popover est positionné avec CDK Overlay (connecté à l'avatar)
**And** les emojis proposés sont un sous-ensemble curé (❤️, 👍, 🤗, 💪, ☕, 🎉) — pas un picker complet

**Given** le ReactionPicker est ouvert
**When** je clique sur un emoji
**Then** l'endpoint `POST /api/v1/groups/:groupId/moods/:moodId/reactions` crée la réaction
**And** le model `MoodReaction` est persisté en base avec `@@map('mood_reactions')`
**And** le popover se ferme
**And** une micro-animation (emoji qui pulse) confirme l'envoi

**Given** une réaction est créée
**When** l'événement SSE `reaction:added` est broadcasté
**Then** tous les membres connectés voient la réaction apparaître sur l'avatar du collègue
**And** un compteur de réactions s'affiche en badge sur l'avatar (si > 0)
**And** le collègue qui a reçu la réaction voit un micro-toast éphémère "❤️ de Vincent"

**Given** j'ai déjà réagi à l'humeur d'un collègue
**When** je clique à nouveau sur son avatar
**Then** le ReactionPicker s'ouvre et ma réaction précédente est mise en surbrillance
**And** je peux changer ma réaction (une seule réaction par membre par humeur)
**And** si je re-clique sur ma réaction existante, elle est supprimée (toggle)

**Given** je suis sur mobile
**When** je tappe sur un avatar
**Then** le ReactionPicker s'affiche en bottom sheet (au lieu d'un popover) pour un meilleur confort tactile
**And** les emojis sont dimensionnés pour être facilement cliquables (min 44x44px)

**Given** j'utilise un lecteur d'écran
**When** je navigue sur un avatar
**Then** l'`aria-label` annonce le nom, l'humeur et le nombre de réactions du collègue
**And** je peux ouvrir le ReactionPicker avec Entrée ou Espace
**And** les emojis du picker ont des `aria-label` descriptifs

---

### Story 3.4 : Historique d'humeur personnel et médiane d'équipe

As a membre d'un groupe,
I want consulter mon historique d'humeur sous forme de courbe et voir la médiane de l'équipe,
So that je puisse observer mes tendances et me situer par rapport à l'ambiance générale.

**Acceptance Criteria:**

**Given** je suis connecté et membre d'un groupe
**When** j'accède à la section "Mon historique" (onglet ou vue dédiée)
**Then** une courbe est affichée avec l'axe X = jours et l'axe Y = niveau d'humeur (échelle numérique correspondant aux humeurs)
**And** ma courbe personnelle est affichée en couleur principale
**And** la médiane de l'équipe est affichée en courbe secondaire (couleur atténuée, trait pointillé)
**And** la légende distingue clairement les deux courbes
**And** la page utilise des skeleton screens pendant le chargement

**Given** je suis en plan Free
**When** l'historique se charge
**Then** l'endpoint `GET /api/v1/groups/:groupId/moods/history?days=30` retourne les 30 derniers jours
**And** un message discret indique "Historique limité à 30 jours — Plan Free"
**And** les jours au-delà de 30 ne sont pas accessibles (le `PlanLimitGuard` filtre la requête)

**Given** l'historique est affiché
**When** je survole un point de la courbe (hover ou tap sur mobile)
**Then** un tooltip affiche la date, mon humeur du jour et la médiane d'équipe du jour
**And** le tooltip est positionné de manière à ne pas déborder de l'écran

**Given** la médiane d'équipe est calculée
**When** l'endpoint traite la requête
**Then** les humeurs sont converties en valeur numérique (happy=5, excited=5, neutral=3, tired=2, stressed=2, sad=1, angry=1, sick=1)
**And** la médiane est calculée par jour sur l'ensemble des humeurs du groupe
**And** les calculs sont faits côté serveur pour ne pas exposer les humeurs individuelles des autres membres
**And** seule la valeur de médiane agrégée est retournée au client (respect de la Safe Zone)

**Given** je n'ai aucune humeur enregistrée
**When** j'accède à l'historique
**Then** un état vide est affiché avec un message encourageant "Commence à partager ton humeur pour voir ta courbe apparaître !"
**And** la courbe de médiane d'équipe est quand même affichée (si d'autres membres ont des humeurs)

**Given** je suis sur mobile (< 768px)
**When** l'historique s'affiche
**Then** la courbe est responsive (redimensionnée pour l'écran)
**And** l'interaction passe du hover au tap pour les tooltips
**And** les labels de l'axe X sont espacés pour rester lisibles (un label tous les 5 jours sur mobile)

---

## Epic 4 : Messagerie Groupe & Salons

Les membres peuvent discuter en temps réel via WebSocket (Socket.io), créer des salons, partager images/GIFs/emojis, réagir aux messages. Le système crée automatiquement un salon principal à la création du groupe et enforce les limites du plan Free (90 jours, 500 Mo).

### Story 4.1 : Salon principal automatique et liste des salons

As a membre d'un groupe,
I want accéder à un salon de discussion principal créé automatiquement avec le groupe,
So that mon équipe dispose immédiatement d'un espace de discussion commun.

**Acceptance Criteria:**

**Given** un utilisateur crée un nouveau groupe (Story 2.1)
**When** le groupe est persisté en base de données
**Then** un salon "Général" est automatiquement créé (model `Channel` avec `@@map('channels')`)
**And** le salon a un flag `is_default: true` qui le rend non-supprimable et non-quittable
**And** tous les membres actuels et futurs du groupe sont automatiquement ajoutés à ce salon (model `ChannelMember` avec `@@map('channel_members')`)
**And** les policies RLS filtrent les salons par `group_id`

**Given** je suis connecté et membre d'un groupe
**When** j'accède à la section messagerie du groupe
**Then** la liste des salons est affichée dans un panneau latéral (sidebar)
**And** le salon "Général" apparaît en premier avec une icône distinctive (épinglé)
**And** les salons sont triés : salon par défaut en premier, puis par activité récente (dernier message)
**And** la page utilise des skeleton screens pendant le chargement

**Given** la liste des salons est affichée
**When** je clique sur un salon
**Then** le fil de messages du salon est affiché dans la zone principale (layout split view sur desktop)
**And** la connexion WebSocket (Socket.io) est établie pour ce salon
**And** le salon actif est mis en surbrillance dans la sidebar

**Given** je suis sur mobile (< 768px)
**When** j'accède à la messagerie
**Then** la liste des salons s'affiche en plein écran (navigation stack)
**And** cliquer sur un salon navigue vers une vue dédiée au fil de messages
**And** un bouton retour permet de revenir à la liste des salons

---

### Story 4.2 : Création et gestion de salons

As a membre d'un groupe,
I want créer un salon, le nommer, inviter des membres et pouvoir le quitter,
So that je puisse organiser des conversations thématiques avec certains collègues.

**Acceptance Criteria:**

**Given** je suis membre d'un groupe
**When** je clique sur "Créer un salon" dans la sidebar messagerie
**Then** un formulaire s'ouvre (modale CDK Overlay) demandant un nom de salon
**And** la validation Zod vérifie que le nom a entre 2 et 50 caractères
**And** après validation, l'endpoint `POST /api/v1/groups/:groupId/channels` crée le salon
**And** je suis automatiquement ajouté comme créateur du salon (`role: 'owner'` dans `ChannelMember`)
**And** le nouveau salon apparaît dans la sidebar de tous les membres invités

**Given** je suis le créateur (`owner`) d'un salon
**When** je clique sur le nom du salon dans l'en-tête de la conversation
**Then** un champ d'édition inline s'ouvre
**And** je peux modifier le nom du salon (endpoint `PUT /api/v1/groups/:groupId/channels/:channelId`)
**And** la validation Zod s'applique (2-50 caractères)
**And** le nouveau nom se propage à tous les membres du salon via WebSocket

**Given** je suis le créateur d'un salon
**When** j'accède aux paramètres du salon (icône ⚙️ dans l'en-tête)
**Then** la liste des membres du salon est affichée
**And** un bouton "Inviter un membre" ouvre un sélecteur avec les membres du groupe qui ne sont pas encore dans le salon
**And** l'endpoint `POST /api/v1/groups/:groupId/channels/:channelId/members` ajoute le membre sélectionné
**And** le membre invité reçoit une notification et voit le salon apparaître dans sa sidebar

**Given** je suis membre d'un salon qui n'est PAS le salon par défaut
**When** je clique sur "Quitter le salon" dans les paramètres du salon
**Then** une confirmation est demandée
**And** après confirmation, l'endpoint `DELETE /api/v1/groups/:groupId/channels/:channelId/members/me` me retire du salon
**And** le salon disparaît de ma sidebar
**And** mes messages restent visibles pour les autres membres

**Given** je tente de quitter le salon "Général" (salon par défaut)
**When** je cherche l'option "Quitter"
**Then** l'option n'est pas disponible
**And** un tooltip explique "Le salon Général est commun à tous les membres du groupe"

**Given** je suis un simple membre (pas `owner`) d'un salon
**When** j'accède aux paramètres du salon
**Then** je peux voir la liste des membres mais PAS inviter de nouveaux membres
**And** je peux quitter le salon mais PAS le renommer

---

### Story 4.3 : Envoi et affichage de messages texte en temps réel

As a membre d'un salon,
I want envoyer et recevoir des messages texte en temps réel,
So that je puisse discuter avec mes collègues de manière instantanée.

**Acceptance Criteria:**

**Given** je suis dans un salon
**When** la vue du salon se charge
**Then** une connexion WebSocket (Socket.io) est établie via le namespace `/messaging`
**And** le client rejoint la room Socket.io `channel:{channelId}`
**And** le `MessagingGateway` NestJS vérifie mon JWT et mon appartenance au salon avant de permettre la connexion
**And** les 50 derniers messages sont chargés (endpoint `GET /api/v1/groups/:groupId/channels/:channelId/messages?limit=50`)

**Given** je suis dans un salon avec la connexion WebSocket active
**When** je saisis un message dans la zone de saisie et appuie sur Entrée (ou bouton Envoyer)
**Then** le message est émis via WebSocket (`event: message:send`)
**And** le `MessagingGateway` persiste le message en base (model `Message` avec `@@map('messages')`)
**And** le message est broadcasté à tous les membres connectés au salon via Socket.io
**And** le message apparaît immédiatement dans mon fil (optimistic update)
**And** la latence d'affichage chez les autres membres est < 500ms (NFR2)

**Given** un autre membre envoie un message dans le salon
**When** l'événement WebSocket `message:new` est reçu
**Then** le message apparaît en temps réel dans mon fil de discussion
**And** une animation d'apparition fluide est jouée
**And** si je suis scrollé en bas, le scroll suit automatiquement le nouveau message
**And** si je suis scrollé plus haut, un badge "X nouveaux messages" apparaît en bas

**Given** le salon contient plus de 50 messages
**When** je scrolle vers le haut du fil
**Then** un chargement de messages plus anciens se déclenche (pagination curseur, endpoint `GET .../messages?before={messageId}&limit=50`)
**And** un spinner de chargement s'affiche pendant la requête
**And** les anciens messages sont insérés en haut du fil sans perte de position de scroll

**Given** la connexion WebSocket est perdue
**When** le client détecte la déconnexion
**Then** un indicateur "Reconnexion..." s'affiche dans la barre du salon
**And** Socket.io tente une reconnexion automatique avec backoff exponentiel
**And** après reconnexion, les messages manqués sont récupérés via l'endpoint REST (NFR14)
**And** les messages envoyés pendant la déconnexion (< 1h) sont livrés à la reconnexion

**Given** je saisis un message
**When** le message est vide (espaces uniquement)
**Then** le bouton Envoyer est désactivé
**And** l'envoi par Entrée est bloqué

---

### Story 4.4 : Partage de médias dans les messages (images et GIFs)

As a membre d'un salon,
I want partager des images et des GIFs dans mes messages,
So that je puisse rendre les conversations plus expressives et visuelles.

**Acceptance Criteria:**

**Given** je suis dans un salon
**When** je clique sur l'icône 📎 (pièce jointe) dans la zone de saisie
**Then** un sélecteur de fichiers natif s'ouvre
**And** les formats acceptés sont JPEG, PNG, WebP, GIF (attribut `accept` du file input)
**And** la taille maximale par fichier est de 10 Mo (NFR5)

**Given** j'ai sélectionné une image (JPEG, PNG, WebP)
**When** le fichier est validé (format + taille)
**Then** une prévisualisation (thumbnail) s'affiche dans la zone de saisie au-dessus du champ texte
**And** un bouton ✕ permet de retirer l'image avant envoi
**And** je peux ajouter un texte accompagnant l'image (optionnel)

**Given** j'envoie un message avec une image
**When** le message est soumis
**Then** l'image est uploadée vers Cloudflare R2 via l'endpoint `POST /api/v1/groups/:groupId/channels/:channelId/upload`
**And** un indicateur de progression s'affiche (mis à jour tous les 10% min, NFR5)
**And** le fichier est stocké dans le dossier R2 `groups/{groupId}/channels/{channelId}/`
**And** une URL signée (expiration 1h) est retournée (NFR10)
**And** le message est broadcasté via WebSocket avec l'URL de l'image

**Given** un message avec image est affiché dans le fil
**When** le message est rendu
**Then** l'image est affichée en thumbnail cliquable (max 300px de large)
**And** cliquer sur l'image ouvre une visionneuse plein écran (CDK Overlay)
**And** un lazy loading est appliqué aux images hors viewport

**Given** je veux partager un GIF
**When** je clique sur l'icône GIF dans la zone de saisie
**Then** un panneau de recherche de GIFs s'ouvre (intégration API Klipy)
**And** je peux rechercher un GIF par mot-clé
**And** les résultats s'affichent en grille
**And** cliquer sur un GIF l'attache au message (même flow que les images)

**Given** j'essaie d'uploader un fichier > 10 Mo ou un format non supporté
**When** la validation s'exécute côté client
**Then** un message d'erreur inline s'affiche ("Fichier trop volumineux" ou "Format non supporté")
**And** l'upload n'est pas déclenché

**Given** je suis sur mobile
**When** je clique sur l'icône pièce jointe
**Then** le sélecteur natif propose aussi l'option "Prendre une photo" (via `capture="environment"`)
**And** la prévisualisation s'adapte à la largeur de l'écran

---

### Story 4.5 : Emojis dans les messages et réactions aux messages

As a membre d'un salon,
I want utiliser des emojis dans mes messages et réagir à un message avec un emoji,
So that je puisse m'exprimer de façon rapide et ajouter du fun aux conversations.

**Acceptance Criteria:**

**Given** je suis dans la zone de saisie d'un message
**When** je clique sur l'icône 😊 (emoji picker)
**Then** un picker d'emojis s'ouvre (popover CDK Overlay)
**And** les emojis sont organisés par catégories (smileys, gestes, objets, etc.)
**And** un champ de recherche permet de filtrer les emojis par nom
**And** les emojis récemment utilisés sont affichés en première catégorie

**Given** le picker d'emojis est ouvert
**When** je clique sur un emoji
**Then** l'emoji est inséré à la position du curseur dans la zone de saisie
**And** le picker reste ouvert pour permettre l'ajout de plusieurs emojis
**And** je peux fermer le picker en cliquant en dehors ou sur l'icône

**Given** un message est affiché dans le fil de discussion
**When** je survole le message (desktop) ou long press (mobile)
**Then** un menu de réactions rapides apparaît (6 emojis fréquents : 👍, ❤️, 😂, 😮, 😢, 🎉)
**And** un bouton "+" ouvre le picker complet pour choisir un autre emoji

**Given** je clique sur un emoji de réaction rapide
**When** la réaction est soumise
**Then** l'endpoint `POST /api/v1/groups/:groupId/channels/:channelId/messages/:messageId/reactions` crée la réaction
**And** le model `MessageReaction` est persisté en base avec `@@map('message_reactions')`
**And** la réaction est broadcastée via WebSocket (`event: reaction:added`)
**And** la réaction apparaît sous le message avec un compteur (ex: "👍 3")

**Given** des réactions existent sur un message
**When** le message est affiché
**Then** les réactions sont regroupées par emoji avec un compteur
**And** mes propres réactions sont mises en surbrillance
**And** cliquer sur une réaction existante que j'ai déjà ajoutée la supprime (toggle)
**And** cliquer sur une réaction existante que je n'ai pas encore ajoutée l'ajoute (incrément)

**Given** je suis sur mobile
**When** le picker d'emojis s'ouvre
**Then** il s'affiche en bottom sheet (au lieu d'un popover) pour un meilleur confort tactile
**And** le menu de réactions rapides apparaît via long press (pas de hover)

---

### Story 4.6 : Rétention des messages et limites de stockage (plan Free)

As a membre d'un groupe en plan Free,
I want que le système gère automatiquement la rétention des messages et du stockage,
So that le groupe reste fonctionnel dans les limites du plan gratuit.

**Acceptance Criteria:**

**Given** un groupe est en plan Free
**When** un message a plus de 90 jours
**Then** un job CRON quotidien (`@nestjs/schedule`) identifie les messages expirés
**And** les messages texte au-delà de 90 jours sont supprimés (hard delete)
**And** les médias R2 associés à ces messages sont supprimés du bucket
**And** les réactions associées sont supprimées en cascade

**Given** un groupe Free consomme son stockage médias
**When** le stockage total des médias du groupe atteint 450 Mo (90% de la limite)
**Then** un avertissement est affiché au créateur-admin : "Stockage bientôt plein — 450/500 Mo utilisés"
**And** un événement SSE `storage:warning` est envoyé

**Given** un groupe Free a atteint 500 Mo de stockage
**When** un membre tente d'uploader un nouveau fichier
**Then** l'upload est bloqué avec un message "Stockage plein — 500 Mo maximum en plan Free"
**And** le `PlanLimitGuard` retourne une erreur `403 FORBIDDEN` avec le code `STORAGE_FULL`
**And** les messages texte (sans média) restent autorisés

**Given** un membre consulte l'historique d'un salon
**When** il scrolle vers le haut au-delà de 90 jours
**Then** un message système indique "Les messages antérieurs à 90 jours ne sont plus disponibles — Plan Free"
**And** aucun message au-delà de la limite n'est retourné par l'API

**Given** le créateur-admin consulte les paramètres du groupe
**When** il accède à la section "Stockage"
**Then** une jauge visuelle affiche l'utilisation actuelle (ex: "320/500 Mo")
**And** une répartition par type est affichée (images, GIFs)
**And** un lien vers l'upgrade du plan est proposé si la limite est atteinte

---

## Epic 5 : Mini-Défi Quotidien

Chaque jour, un nouveau mini-défi est proposé à tous les membres du groupe. Les membres participent selon le type de défi (localisation sur image, réponse texte, choix multiple), consultent le classement et l'historique des défis passés.

### Story 5.1 : Affichage du mini-défi quotidien

As a membre d'un groupe,
I want voir un nouveau mini-défi chaque jour sur la page principale,
So that j'aie un rituel quotidien fun qui crée de l'engagement dans l'équipe.

**Acceptance Criteria:**

**Given** je suis connecté et membre d'un groupe
**When** j'accède à la page principale du groupe
**Then** le mini-défi du jour est affiché dans une zone dédiée (carte visuelle distincte)
**And** la carte affiche : l'image du défi, le titre/description, le type d'interaction attendu, et le nombre de participants
**And** si je n'ai pas encore participé, un CTA "Participer" est mis en avant
**And** si j'ai déjà participé, mon résultat est affiché avec un label "Déjà joué"
**And** la page utilise des skeleton screens pendant le chargement

**Given** un nouveau jour commence (minuit UTC)
**When** le job CRON quotidien (`@nestjs/schedule`) s'exécute
**Then** un nouveau défi est sélectionné depuis la banque de défis prédéfinis
**And** le défi est persisté en base (model `DailyChallenge` avec `@@map('daily_challenges')`)
**And** le défi est associé au groupe et à la date du jour
**And** un événement SSE `challenge:new` est broadcasté à tous les membres connectés
**And** la rotation des défis évite de reproposer un défi déjà joué dans les 30 derniers jours

**Given** le mini-défi du jour est de type "localisation sur image"
**When** la carte du défi s'affiche
**Then** une image est affichée avec la consigne "Trouve [élément] dans cette image !"
**And** l'image est chargée depuis Cloudflare R2 (URL signée, NFR10)
**And** l'image est responsive et zoomable sur mobile (pinch-to-zoom)

**Given** le mini-défi est de type "réponse texte"
**When** la carte du défi s'affiche
**Then** une question est affichée avec un champ de saisie texte libre
**And** la réponse attendue est stockée côté serveur (jamais exposée au client)

**Given** le mini-défi est de type "choix multiple"
**When** la carte du défi s'affiche
**Then** une question est affichée avec 3-4 options de réponse
**And** les options sont affichées sous forme de boutons radio stylisés

**Given** il est après minuit et aucun défi n'a été généré pour aujourd'hui
**When** j'accède à la page principale
**Then** un état de fallback "Défi en préparation..." s'affiche
**And** le système tente de générer le défi à la demande (self-healing)

---

### Story 5.2 : Participation au mini-défi

As a membre d'un groupe,
I want participer au mini-défi quotidien en soumettant ma réponse,
So that je puisse m'amuser et me mesurer à mes collègues.

**Acceptance Criteria:**

**Given** le défi du jour est de type "localisation sur image" et je n'ai pas encore participé
**When** je clique/tappe sur l'emplacement que je pense correct dans l'image
**Then** un marqueur visuel (pin) apparaît à l'endroit cliqué
**And** je peux repositionner le marqueur avant de valider
**And** un bouton "Valider ma réponse" apparaît

**Given** je valide ma réponse de type "localisation sur image"
**When** l'endpoint `POST /api/v1/groups/:groupId/challenges/:challengeId/participate` reçoit mes coordonnées (x, y)
**Then** la distance entre mon clic et la zone cible est calculée côté serveur
**And** un score est attribué (plus je suis proche, plus le score est élevé)
**And** la participation est persistée (model `ChallengeParticipation` avec `@@map('challenge_participations')`)
**And** une animation de feedback s'affiche : confettis si score > 80%, encouragement sinon
**And** la zone correcte est révélée visuellement (cercle ou surbrillance)

**Given** le défi du jour est de type "réponse texte" et je n'ai pas encore participé
**When** je saisis ma réponse et clique sur "Valider"
**Then** l'endpoint compare ma réponse à la réponse attendue (comparaison insensible à la casse et aux accents)
**And** un résultat "Correct !" ou "Raté !" s'affiche avec la bonne réponse
**And** le score est binaire (100% correct, 0% incorrect)

**Given** le défi du jour est de type "choix multiple" et je n'ai pas encore participé
**When** je sélectionne une option et clique sur "Valider"
**Then** l'endpoint vérifie ma réponse
**And** l'option correcte est mise en vert, les incorrectes en grisé
**And** si j'ai choisi la bonne réponse, un score de 100% est attribué, sinon 0%

**Given** j'ai déjà participé au défi du jour
**When** j'accède à la carte du défi
**Then** mon résultat est affiché (score, réponse donnée, bonne réponse)
**And** le CTA "Participer" est remplacé par "Voir le classement"
**And** je ne peux PAS rejouer le même défi

**Given** une participation est enregistrée
**When** l'événement SSE `challenge:participation` est broadcasté
**Then** le compteur de participants se met à jour en temps réel pour tous les membres

---

### Story 5.3 : Classement et historique des mini-défis

As a membre d'un groupe,
I want consulter le classement du défi du jour et l'historique des défis passés,
So that je puisse voir comment je me situe et revivre les défis précédents.

**Acceptance Criteria:**

**Given** le défi du jour a au moins un participant
**When** j'accède au classement (bouton "Voir le classement" sur la carte du défi ou onglet dédié)
**Then** l'endpoint `GET /api/v1/groups/:groupId/challenges/:challengeId/leaderboard` retourne le classement
**And** le classement est trié par score décroissant puis par rapidité (timestamp de participation)
**And** chaque entrée affiche : position, avatar, nom, score, temps de réponse
**And** ma propre position est mise en surbrillance
**And** le top 3 est mis en avant visuellement (médailles or/argent/bronze ou couleurs distinctes)

**Given** le classement est affiché
**When** un nouveau membre participe au défi
**Then** le classement se met à jour en temps réel via SSE (`challenge:leaderboard_updated`)
**And** une animation de réordonnancement fluide est jouée si les positions changent

**Given** je suis connecté et membre d'un groupe
**When** j'accède à la section "Historique des défis" (onglet ou navigation dédiée)
**Then** l'endpoint `GET /api/v1/groups/:groupId/challenges?page=1&limit=20` retourne la liste paginée
**And** chaque défi passé est affiché sous forme de carte compacte : date, titre, type, mon score (ou "Non joué")
**And** les défis sont triés du plus récent au plus ancien
**And** la pagination est par scroll infini

**Given** je clique sur un défi passé dans l'historique
**When** le détail du défi se charge
**Then** le défi est affiché avec sa solution révélée
**And** le classement final est affiché
**And** ma participation (si existante) est mise en surbrillance

**Given** je suis sur mobile (< 768px)
**When** le classement s'affiche
**Then** les colonnes sont optimisées (avatar + nom + score, le temps de réponse en ligne secondaire)
**And** le scroll est fluide pour les longs classements

**Given** aucun membre n'a encore participé au défi du jour
**When** j'accède au classement
**Then** un état vide est affiché : "Sois le premier à relever le défi !"
**And** un bouton ramène vers la carte du défi pour participer

---

## Epic 6 : Onboarding, Notifications & PWA

Les nouveaux utilisateurs sont guidés par un onboarding progressif menant au premier check-in en moins de 5 minutes. L'application est installable comme PWA et envoie des notifications push pour maintenir l'engagement quotidien.

### Story 6.1 : Onboarding guidé en 3-5 étapes (Spotlight Coach Marks)

As a nouvel utilisateur,
I want être guidé pas à pas à travers l'application lors de ma première connexion,
So that je comprenne rapidement les fonctionnalités clés et fasse mon premier check-in d'humeur en moins de 5 minutes.

**Acceptance Criteria:**

**Given** je viens de m'inscrire et me connecte pour la première fois (ou je rejoins mon premier groupe)
**When** la page principale du groupe se charge
**Then** l'onboarding se déclenche automatiquement
**And** un overlay semi-transparent apparaît avec un Spotlight Coach Mark sur le premier élément à présenter
**And** un compteur d'étapes est affiché ("1/5", "2/5", etc.)
**And** un bouton "Passer" permet de skip l'onboarding entièrement

**Given** l'onboarding est actif, étape 1 "Bienvenue"
**When** l'étape s'affiche
**Then** un message de bienvenue personnalisé apparaît ("Bienvenue [prénom] ! Voici ton nouvel espace d'équipe")
**And** le texte explique brièvement la philosophie de l'app ("Un espace safe pour ton équipe")
**And** un bouton "Suivant" mène à l'étape 2

**Given** l'onboarding est actif, étape 2 "Grille d'humeur"
**When** l'étape s'affiche
**Then** le Spotlight met en surbrillance le MoodRibbon
**And** le coach mark explique : "Chaque jour, partage ton humeur ici. C'est anonyme vis-à-vis de ton manager."
**And** le bouton "Suivant" mène à l'étape 3

**Given** l'onboarding est actif, étape 3 "Mini-défi"
**When** l'étape s'affiche
**Then** le Spotlight met en surbrillance la carte du mini-défi quotidien
**And** le coach mark explique : "Un petit défi fun chaque jour pour rire ensemble"
**And** le bouton "Suivant" mène à l'étape 4

**Given** l'onboarding est actif, étape 4 "Messagerie"
**When** l'étape s'affiche
**Then** le Spotlight met en surbrillance l'entrée de la messagerie dans la navigation
**And** le coach mark explique : "Discute avec ton équipe dans des salons privés"
**And** le bouton "Suivant" mène à l'étape 5

**Given** l'onboarding est actif, étape 5 "Premier mood"
**When** l'étape s'affiche
**Then** le Spotlight met en surbrillance le MoodRibbon avec un CTA fort : "Allez, dis-nous comment tu te sens !"
**And** le coach mark invite à sélectionner sa première humeur
**And** quand l'utilisateur sélectionne une humeur, l'onboarding se termine avec une animation de célébration (confettis)
**And** un flag `onboarding_completed: true` est persisté sur le profil utilisateur via `PUT /api/v1/users/me`

**Given** j'ai complété ou skippé l'onboarding
**When** je me reconnecte plus tard
**Then** l'onboarding ne se redéclenche PAS
**And** un bouton "Revoir le guide" est accessible dans les paramètres du compte pour le relancer manuellement

**Given** l'onboarding est affiché sur mobile (< 768px)
**When** les coach marks s'affichent
**Then** le positionnement des tooltips s'adapte à l'écran (toujours visible, jamais tronqué)
**And** la navigation entre étapes est possible par swipe gauche/droite en plus des boutons

---

### Story 6.2 : Notifications push PWA

As a utilisateur de l'application,
I want recevoir des notifications push sur mon appareil,
So that je sois informé des événements importants même quand l'app n'est pas ouverte.

**Acceptance Criteria:**

**Given** je me connecte pour la première fois (après l'onboarding ou au 2ème lancement)
**When** l'app détecte que les notifications ne sont pas encore autorisées
**Then** une bannière non-bloquante apparaît : "Active les notifications pour ne rien rater"
**And** un bouton "Activer" déclenche la demande de permission du navigateur (`Notification.requestPermission()`)
**And** un bouton "Plus tard" ferme la bannière (re-proposé au prochain lancement, max 3 fois)
**And** la demande n'est JAMAIS faite au tout premier chargement (pattern UX anti-spam)

**Given** l'utilisateur accepte les notifications
**When** la permission est accordée
**Then** le Service Worker enregistre le `PushSubscription` via l'endpoint `POST /api/v1/users/me/push-subscription`
**And** le subscription est persisté en base (model `PushSubscription` avec `@@map('push_subscriptions')`)
**And** un toast confirme "Notifications activées !"

**Given** les notifications sont activées et un événement se produit
**When** un des événements suivants survient :
- Un membre de mon groupe change d'humeur
- Un nouveau message est posté dans un salon dont je suis membre
- Un nouveau mini-défi quotidien est disponible
- Quelqu'un réagit à mon humeur
**Then** le serveur envoie une notification push via l'API Web Push
**And** la notification affiche un titre, un corps et une icône contextuelle
**And** cliquer sur la notification ouvre l'app sur la page pertinente (deep linking via le champ `data.url` de la notification)

**Given** je suis connecté et l'app est au premier plan (active)
**When** un événement notifiable survient
**Then** aucune notification push n'est envoyée (les mises à jour temps réel SSE/WebSocket suffisent)
**And** seul un in-app toast est affiché si pertinent

**Given** je veux gérer mes préférences de notifications
**When** j'accède aux paramètres de mon compte, section "Notifications"
**Then** je peux activer/désactiver chaque catégorie indépendamment :
- Humeurs de l'équipe (on/off)
- Nouveaux messages (on/off)
- Mini-défi quotidien (on/off)
- Réactions à mes humeurs (on/off)
**And** les préférences sont persistées via `PUT /api/v1/users/me/notification-preferences`
**And** le serveur filtre les notifications selon mes préférences avant envoi

**Given** l'utilisateur a refusé les notifications au niveau du navigateur
**When** il tente d'activer les notifications dans les paramètres de l'app
**Then** un message explique comment réactiver les notifications dans les paramètres du navigateur
**And** un lien ou des instructions adaptées au navigateur (Chrome, Firefox, Safari) sont affichés

---

### Story 6.3 : Installation PWA et mode offline minimal

As a utilisateur,
I want installer l'application sur mon appareil comme une app native,
So that j'y accède rapidement depuis mon écran d'accueil sans passer par le navigateur.

**Acceptance Criteria:**

**Given** j'accède à l'application via un navigateur compatible (Chrome, Edge, Safari 17+, Firefox)
**When** les critères d'installabilité PWA sont remplis (manifest + Service Worker + HTTPS)
**Then** le navigateur propose l'installation native (banner "Ajouter à l'écran d'accueil")
**And** l'app propose aussi un bouton d'installation custom dans le header (événement `beforeinstallprompt`)
**And** le bouton disparaît si l'app est déjà installée (détection via `display-mode: standalone`)

**Given** le Web App Manifest est configuré
**When** le navigateur le charge
**Then** le manifest définit : `name`, `short_name` ("My Mood"), `description`, `start_url: "/"`, `display: "standalone"`, `theme_color`, `background_color`
**And** les icônes sont fournies en plusieurs tailles (192x192, 512x512, maskable)
**And** le `scope` est configuré pour l'ensemble de l'app

**Given** l'utilisateur installe la PWA
**When** il lance l'app depuis son écran d'accueil
**Then** l'app s'ouvre en mode standalone (sans barre d'adresse du navigateur)
**And** le splash screen affiche le logo et le nom de l'app pendant le chargement
**And** la barre de statut utilise la `theme_color` définie dans le manifest

**Given** l'utilisateur est hors ligne
**When** il ouvre la PWA
**Then** le Service Worker sert les assets statiques depuis le cache (App Shell)
**And** une page d'état "Hors ligne" s'affiche avec le logo et un message "Connexion nécessaire pour accéder à tes données"
**And** les données dynamiques (humeurs, messages) ne sont PAS disponibles offline (MVP — le cache offline avancé est hors scope)
**And** dès que la connexion revient, l'app se recharge automatiquement (événement `online`)

**Given** une nouvelle version de l'app est déployée
**When** le Service Worker détecte une mise à jour
**Then** les nouveaux assets sont téléchargés en arrière-plan
**And** un toast propose "Nouvelle version disponible — Recharger" (pas de rechargement forcé)
**And** cliquer sur "Recharger" active le nouveau Service Worker et rafraîchit la page

---

## Epic 7 : Modération & Signalement

Les membres peuvent signaler tout contenu inapproprié (message, image, GIF, profil). L'administrateur système est notifié par email et peut gérer les signalements via un dashboard dédié.

### Story 7.1 : Signalement de contenu par un membre

As a membre d'un groupe,
I want signaler un contenu inapproprié (message, image, GIF, nom ou photo de profil),
So that l'espace d'équipe reste un environnement sûr et respectueux.

**Acceptance Criteria:**

**Given** un message est affiché dans le fil de discussion
**When** je survole le message (desktop) ou long press (mobile)
**Then** un menu contextuel apparaît avec l'option "Signaler"
**And** l'option "Signaler" est représentée par une icône drapeau 🚩

**Given** une image ou un GIF est affiché dans un message
**When** je fais un clic droit (desktop) ou long press (mobile) sur le média
**Then** un menu contextuel apparaît avec l'option "Signaler cette image/ce GIF"

**Given** je consulte le profil d'un autre membre (via l'OrbitalGrid ou la liste des membres)
**When** je clique sur les options du profil
**Then** une option "Signaler ce profil" est disponible
**And** le signalement peut porter sur le nom d'affichage et/ou la photo de profil

**Given** je clique sur "Signaler" (quel que soit le type de contenu)
**When** le formulaire de signalement s'ouvre (modale CDK Overlay)
**Then** le formulaire affiche :
- Le contenu signalé en aperçu (message tronqué, thumbnail de l'image, nom/photo de profil)
- Un champ obligatoire "Motif" avec des options prédéfinies (Contenu offensant, Harcèlement, Spam, Contenu inapproprié, Autre)
- Un champ optionnel "Commentaire" (texte libre, max 500 caractères)
- Un bouton "Envoyer le signalement" et un bouton "Annuler"

**Given** je soumets le formulaire de signalement
**When** l'endpoint `POST /api/v1/reports` reçoit la requête
**Then** le signalement est persisté en base (model `Report` avec `@@map('reports')`)
**And** le signalement contient : `reporter_id`, `content_type` (message/media/profile), `content_id`, `reason`, `comment`, `status: 'pending'`, `created_at`
**And** un toast confirme "Signalement envoyé. Merci de contribuer à un espace safe."
**And** la modale se ferme

**Given** j'ai déjà signalé un contenu spécifique
**When** je tente de le signaler à nouveau
**Then** l'option "Signaler" est remplacée par "Déjà signalé" (grisé)
**And** un tooltip indique "Tu as déjà signalé ce contenu"

**Given** je tente de signaler mon propre contenu
**When** je cherche l'option "Signaler"
**Then** l'option n'est PAS disponible sur mes propres messages, images ou profil

---

### Story 7.2 : Notification admin et gestion des signalements

As a administrateur système,
I want être notifié par email des signalements et pouvoir les gérer,
So that je puisse modérer le contenu et maintenir un environnement sain.

**Acceptance Criteria:**

**Given** un signalement est créé par un membre (Story 7.1)
**When** le signalement est persisté en base
**Then** un email est envoyé à l'adresse de l'administrateur système (configurée en variable d'environnement `ADMIN_EMAIL`)
**And** l'email contient : l'identifiant du signalement, le type de contenu signalé, le motif, le commentaire (si rempli), le nom du groupe, la date
**And** l'email ne contient PAS le contenu signalé directement (pour éviter la diffusion de contenu inapproprié par email)
**And** l'email contient un lien vers le dashboard de modération pour consulter le détail

**Given** je suis administrateur système
**When** j'accède au dashboard de modération (`/admin/reports`)
**Then** la liste des signalements est affichée, triée par date décroissante
**And** chaque signalement affiche : date, type de contenu, motif, statut (pending/reviewed/resolved/dismissed), groupe, signaleur (anonymisé par défaut)
**And** un filtre par statut est disponible (Tous, En attente, Traités, Rejetés)
**And** l'accès est protégé par un guard `SystemAdminGuard` vérifiant le rôle `system_admin`

**Given** je consulte le détail d'un signalement
**When** je clique sur un signalement dans la liste
**Then** le contenu signalé est affiché en intégralité (message complet, image en taille réelle, profil complet)
**And** le contexte est affiché : messages environnants (pour les messages), informations du groupe
**And** l'historique des signalements pour ce même contenu est affiché (si signalé plusieurs fois)
**And** des actions sont disponibles : "Marquer comme traité", "Rejeter", "Supprimer le contenu"

**Given** je clique sur "Supprimer le contenu"
**When** la confirmation est validée
**Then** le contenu est supprimé de la base de données
**And** si c'est un média, le fichier est supprimé de Cloudflare R2
**And** le message est remplacé par "[Contenu supprimé par la modération]" dans le fil de discussion
**And** le statut du signalement passe à `resolved`

**Given** je clique sur "Marquer comme traité" ou "Rejeter"
**When** l'action est confirmée
**Then** le statut du signalement est mis à jour (`reviewed` ou `dismissed`)
**And** un horodatage et l'identifiant de l'admin sont enregistrés
**And** le signalement est déplacé dans la section correspondante du filtre

**Given** plusieurs signalements concernent le même contenu
**When** je traite l'un d'entre eux (suppression du contenu)
**Then** tous les signalements liés à ce contenu passent automatiquement au statut `resolved`
**And** les emails de notification pour les signalements suivants sur ce contenu ne sont plus envoyés

---

## Epic 8 : Conformité RGPD (Suppression & Export)

L'utilisateur peut supprimer définitivement son compte avec cascade sur toutes les données existantes (profil, appartenances, humeurs, réactions, messages, participations aux défis, signalements, médias R2) et exporter l'intégralité de ses données personnelles. Cet epic est placé en fin de roadmap pour garantir la couverture complète de tous les modèles de données créés dans les epics précédents.

**Convention requise :** Toutes les stories des Epics 1-7 qui créent un model Prisma avec un `userId` DOIVENT définir `onDelete: Cascade` sur la relation, afin que la suppression de compte fonctionne par cascade automatique.

### Story 8.1 : Suppression de compte et cascade complète

As a utilisateur connecté,
I want supprimer définitivement mon compte et toutes mes données,
So that j'exerce mon droit à l'oubli conformément au RGPD.

**Acceptance Criteria:**

**Given** je suis sur la page Mon Compte, section "Zone danger"
**When** je clique sur "Supprimer mon compte"
**Then** une modale de confirmation s'ouvre (CDK Overlay, focus trap)
**And** un texte explique ce qui sera supprimé : profil, appartenances aux groupes, humeurs, réactions aux humeurs, messages, réactions aux messages, participations aux défis, médias, signalements
**And** un champ me demande de saisir le mot "SUPPRIMER" pour confirmer

**Given** la modale de confirmation est ouverte
**When** je saisis "SUPPRIMER" et clique sur le bouton de confirmation
**Then** l'endpoint `DELETE /api/v1/users/me` est appelé
**And** la suppression cascade via les relations Prisma `onDelete: Cascade` sur les models : `GroupMember`, `Mood`, `MoodReaction`, `Message`, `MessageReaction`, `ChallengeParticipation`, `PushSubscription`, `Report` (en tant que reporter)
**And** les fichiers R2 associés à l'utilisateur sont supprimés (photo de profil + médias de messages) via un job de nettoyage asynchrone
**And** mes refresh tokens sont invalidés
**And** je suis déconnecté et redirigé vers la page d'accueil

**Given** la modale de confirmation est ouverte
**When** je saisis autre chose que "SUPPRIMER" ou clique sur "Annuler"
**Then** la suppression n'est pas exécutée
**And** la modale se ferme (Annuler) ou le bouton de confirmation reste désactivé (mauvaise saisie)

**Given** mon compte est supprimé
**When** un autre utilisateur consulte un groupe dont j'étais membre
**Then** mes messages restent visibles mais sont attribués à "Utilisateur supprimé"
**And** mon avatar est remplacé par un avatar par défaut grisé

**Given** je suis `creator_admin` d'un groupe
**When** je tente de supprimer mon compte
**Then** la suppression est bloquée
**And** un message indique que je dois d'abord transférer le rôle d'administrateur ou supprimer le groupe

**Given** un test automatisé de cascade existe
**When** le test crée un utilisateur avec des données dans chaque model (mood, message, reaction, challenge participation, report, push subscription, média R2)
**Then** la suppression de l'utilisateur ne laisse aucun orphelin en base
**And** les fichiers R2 associés sont supprimés
**And** ce test est exécuté en CI à chaque modification du schema Prisma

---

### Story 8.2 : Export complet des données personnelles

As a utilisateur connecté,
I want exporter toutes mes données personnelles au format JSON,
So that j'exerce mon droit à la portabilité conformément au RGPD.

**Acceptance Criteria:**

**Given** je suis sur la page Mon Compte
**When** je clique sur "Exporter mes données"
**Then** un toast confirme que l'export est en cours de préparation
**And** l'endpoint `GET /api/v1/users/me/export` déclenche la génération du fichier

**Given** l'export est généré
**When** le fichier JSON est prêt
**Then** il contient l'intégralité des données personnelles organisées par catégorie :
- **Profil :** nom, email, date de création, date de consentement RGPD
- **Appartenances :** liste des groupes (nom, rôle, date d'ajout)
- **Humeurs :** historique complet de toutes les humeurs (date, valeur, groupe)
- **Réactions aux humeurs :** réactions envoyées (emoji, date, humeur cible)
- **Messages :** tous les messages envoyés (contenu, date, salon, groupe)
- **Réactions aux messages :** réactions envoyées (emoji, date, message cible)
- **Participations aux défis :** tous les défis joués (date, score, réponse)
- **Signalements :** signalements émis (date, motif, statut)
- **Préférences :** préférences de notifications, thème, onboarding complété
**And** un lien de téléchargement à usage unique est généré avec une expiration de 24 heures (NFR11)
**And** une notification (toast ou email) informe l'utilisateur que l'export est prêt

**Given** un lien d'export est généré
**When** je clique sur le lien pour la première fois
**Then** le fichier JSON est téléchargé
**And** le lien est invalidé après le premier téléchargement

**Given** un lien d'export a expiré (> 24h) ou a déjà été utilisé
**When** je clique sur le lien
**Then** une erreur `410 GONE` est retournée
**And** un message indique que le lien a expiré et propose de relancer l'export

**Given** un test automatisé d'exhaustivité existe
**When** le test crée un utilisateur avec des données dans chaque model
**Then** l'export JSON contient une section pour chaque model
**And** aucune donnée personnelle n'est omise
**And** ce test est exécuté en CI à chaque ajout d'un nouveau model Prisma
