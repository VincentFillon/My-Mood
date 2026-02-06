---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Transformation de My Mood en produit SaaS B2B - définition produit, features, stack technique, business model et plan d''action'
session_goals: 'Tri des features existantes, nouvelles features pro, stack technique multi-tenant, business model, roadmap de développement'
selected_approach: 'ai-recommended'
techniques_used: ['Six Thinking Hats', 'SCAMPER Method', 'Cross-Pollination']
ideas_generated: 33
session_active: false
workflow_completed: true
context_file: ''
---

# Brainstorming Session Results

**Facilitateur:** Vincent
**Date:** 2026-02-06

## Session Overview

**Sujet:** Transformation de My Mood (application de suivi d'humeur entre collègues) en produit SaaS B2B commercialisable auprès d'entreprises

**Objectifs:**
1. Tri des features existantes - garder, abandonner, adapter
2. Nouvelles features "pro" - valeur pour décideurs RH/managers (analytics, events, alertes...)
3. Stack technique - architecture multi-tenant solide et scalable
4. Business model - pricing, positionnement, go-to-market
5. Plan d'action - roadmap de développement priorisée

### Context Guidance

_Application existante utilisée quotidiennement par un groupe de collègues. Features actuelles : grille d'humeur interactive, historique et courbes d'humeur, messagerie instantanée avec rooms, mood bot IA, sondages, mini-jeux, profils utilisateurs, météo. Refonte complète nécessaire (mono-tenant, dette technique, features trop spécifiques)._

### Session Setup

_Session de brainstorming multi-dimensionnelle couvrant produit, technique et business. Approche sélectionnée : Recommandations IA pour les techniques de créativité._

## Technique Selection

**Approche:** Recommandations IA
**Contexte d'analyse:** Transformation produit B2B avec focus sur tri features, nouvelles features pro, stack technique, business model et roadmap

**Techniques recommandées:**

- **Six Thinking Hats:** Analyse multi-perspective des features existantes — faits, émotions, risques, opportunités, créativité, vision d'ensemble
- **SCAMPER Method:** Transformation systématique des features existantes en version "pro" et génération de nouvelles fonctionnalités
- **Cross-Pollination:** Inspiration externe depuis d'autres domaines/produits B2B pour le business model, la stack et le positionnement

**Raisonnement IA:** Séquence en 3 phases progressives — déconstruire l'existant, générer le nouveau, ancrer dans des patterns éprouvés. Couvre les 5 objectifs de session de manière complémentaire.

---

## Technique Execution Results

### Six Thinking Hats — Déconstruction de l'existant

**Chapeau Blanc (faits d'usage) :**

| Feature existante | Usage réel | Signal |
|-------------------|-----------|--------|
| Grille d'humeur | Quotidien, coeur de l'app | Fort |
| Messagerie | Active, "zone grise" — ce qu'on ne dit pas sur Slack | Très intéressant |
| Mood bot IA | Lu, réactions mitigées, à améliorer | Moyen |
| Sondages | Très rare | Faible |
| Mini-jeu quotidien ("Où est la teub") | Niche mais fidèle | Polarisant |
| Jeux (morpion/pong) | Quasi jamais | Nul — ABANDONNÉ |
| Météo | Gadget cosmétique | Décoratif — ABANDONNÉ |
| Titre dynamique (heures de travail) | Contexte uniquement | Spécifique — ABANDONNÉ |
| Countdown GTA 6 | Blague interne | Spécifique — ABANDONNÉ |

**Chapeau Rouge (émotions / instinct) :**

Insight majeur : l'application a créé spontanément un **espace informel de confiance** — une "safe zone" émotionnelle à côté des canaux officiels (Slack, Teams). Les utilisateurs y envoient des messages qu'ils n'oseraient pas mettre ailleurs. L'humour (noir, sarcastique) est le moteur principal d'engagement. La grille d'humeur est utilisée autant de manière sincère que sarcastique — c'est un outil de **communication**, pas juste de suivi.

La "direction artistique" actuelle est volontairement pessimiste (plus d'humeurs négatives, bot moqueur, médiane basse) — propre au groupe d'origine mais ce ton "underground" pourrait être un différenciateur en B2B.

**Chapeau Noir (risques) :**

**TENSION FONDAMENTALE IDENTIFIÉE :** Le paradoxe Fun vs. Flicage. La valeur utilisateur (espace informel, humour, safe zone) est en opposition directe avec la valeur acheteur (analytics RH, suivi comportemental). L'ajout de l'un risque de détruire l'autre. L'anonymisation dans les petites équipes (5-6 personnes) est une illusion — si l'humeur globale chute un mardi et que seuls 2 personnes étaient là, l'anonymat n'existe plus.

**Chapeau Jaune (opportunités) :**

Repositionnement : les entreprises dépensent des fortunes en cohésion d'équipe (escape games, séminaires, afterworks). My Mood fait la même chose, tous les jours, en continu, pour une fraction du prix. L'argument n'est pas "surveillez vos employés" mais "créez de la cohésion quotidienne".

**Chapeau Vert (créativité) :**

Résolution de la tension par le modèle Dual Face + Opt-in Signal (voir architecture ci-dessous).

### SCAMPER — Transformation systématique des features

Application de SCAMPER sur les features existantes pour les transformer en version B2B et générer de nouvelles fonctionnalités (intégré dans l'inventaire d'idées ci-dessous).

### Cross-Pollination — Inspiration externe

Inspiration des modèles de Slack (adoption bottom-up, freemium), Spotify (Wrapped annuel), Officevibe/15Five (pulse checks), et des pratiques de cohésion d'équipe traditionnelles (babyfoot, machine à café) pour le positionnement et le business model.

---

## Inventaire complet des idées (33 idées)

### Architecture Produit

**[#1] Tension Fun vs. Flicage**
_Concept :_ La valeur utilisateur (espace informel, humour, safe zone) est en opposition directe avec la valeur acheteur (analytics RH, suivi comportemental). L'ajout de l'un risque de détruire l'autre.
_Décision :_ Cette tension est le guide fondamental de TOUTES les décisions produit. Chaque feature doit être évaluée à travers ce prisme.

**[#5] Modèle Dual Face + Opt-in Signal**
_Concept :_ Deux espaces hermétiquement cloisonnés. Espace Equipe = safe zone (humeurs, messagerie, fun) où le manager n'a AUCUNE visibilité. Espace Manager = outils de cohésion (events, sondages, challenges). Le seul pont : un signal volontaire initié par l'utilisateur ("j'ai besoin d'en parler").
_Statut :_ ARCHITECTURE RETENUE — Pilier central du produit.

**[#14] Branding "By employees, for employees"**
_Concept :_ Direction artistique underground/fun, storytelling fondateur authentique ("créé par un dev pour survivre au quotidien avec ses collègues"), ton décalé. Le produit ne ressemble PAS à un outil RH. La confiance est transmise par l'ADN visuel et narratif, pas par une page CGU.
_Statut :_ RETENU — Le packaging EST la garantie de confiance.

**[#15] Paradoxe du branding dual**
_Concept :_ Le produit doit paraître subversif pour les employés ET professionnel pour l'acheteur. Résolu par l'approche bottom-up : on ne vend jamais au manager. Le manager achète parce que ses employés lui ont dit "on adore ce truc".
_Statut :_ RÉSOLU par le modèle freemium bottom-up.

### Espace Equipe (Safe Zone)

**[#6] Grille d'humeur personnalisable par équipe**
_Concept :_ Chaque équipe peut personnaliser ses humeurs, son ton, sa "direction artistique". Une équipe de devs, de commerciaux ou de créatifs aura ses propres humeurs. C'est l'équipe qui définit sa culture.
_Statut :_ RETENU — Grille par défaut en gratuit, custom en payant.

**[#7] Messagerie Safe Zone**
_Concept :_ Messagerie informelle avec rooms et engagement de confidentialité architectural — jamais indexée, jamais analysée, jamais accessible à un admin supérieur.
_Statut :_ RETENU — Pilier d'engagement.

**[#8] Mood Bot adaptatif**
_Concept :_ Bot IA qui commente les humeurs avec un ton adaptable au groupe. L'équipe choisit son "personnage" : sarcastique, bienveillant, coach, absurde. Le bot apprend le style du groupe.
_Statut :_ RETENU — Standard en gratuit, personnalisable en payant.

**[#13] Mini-défi quotidien customisable**
_Concept :_ "Trouve l'objet caché" avec image par défaut fun mais soft, et possibilité pour chaque équipe d'uploader sa propre image. Classement, points, médailles. Rituel quotidien.
_Statut :_ RETENU — Image par défaut en gratuit, custom en payant.

**[#26] Onboarding avec premier mood obligatoire**
_Concept :_ Tour guidé à la première connexion qui force le choix d'une première humeur. Réduit l'angoisse de la page blanche. Le nouveau voit les humeurs des collègues déjà inscrits.
_Statut :_ RETENU — Critique pour l'adoption.

### Espace Manager (Outils de cohésion)

**[#9] Organisateur d'événements d'équipe**
_Concept :_ Afterworks, séminaires, déjeuners — avec gestion des participants, listes "qui ramène quoi", budget, vote sur la date/lieu.
_Statut :_ RETENU — Disponible dès le plan Team.

**[#10] Sondages & Pulse checks manager**
_Concept :_ Le manager crée des sondages (anonymes ou non) sur l'ambiance, les choix techniques, la vie d'équipe. Canal officiel de "prise de température" distinct de la safe zone.
_Statut :_ RETENU — Basique en Team, avancé en Business.

**[#11] Challenges & objectifs d'équipe**
_Concept :_ Le manager propose des challenges ("semaine sans réunion", "défi lecture", "objectif 0 bug"). Gamification managériale positive.
_Statut :_ RETENU — Plan Business uniquement.

**[#12] Album souvenir d'équipe**
_Concept :_ Chaque événement devient un espace média partagé — photos, documents, commentaires. Timeline visuelle de la vie d'équipe.
_Statut :_ RETENU — Transforme l'outil d'organisation éphémère en patrimoine émotionnel.

**[#22] Team Wrapped — Bilan annuel fun**
_Concept :_ Rapport annuel auto-généré façon Spotify Wrapped. Montages photos, stats fun, évolution des humeurs, classement du mini-jeu, moments forts. Souvenir d'équipe ludique et partageable.
_Statut :_ RETENU — Feature "wow" de rétention. Plan Team et Business.

**[#23] Team Wrapped comme levier de conversion**
_Concept :_ Les équipes en gratuit voient un aperçu flouté. Un an de données émotionnelles et de souvenirs... personne ne veut perdre ça. Levier de conversion temporel.
_Statut :_ RETENU — Intégré dans la stratégie freemium.

### Business Model

**[#2] Positionnement "Babyfoot Numérique"**
_Concept :_ Positionner My Mood comme un outil de culture d'équipe quotidien — le remplaçant numérique du babyfoot et de la machine à café. On vend de la cohésion, pas de la data. Le ROI c'est la rétention, pas le reporting.
_Statut :_ RETENU — Angle de communication principal.

**[#3] Modèle Opt-in inversé**
_Concept :_ Zéro données remontées par défaut. C'est l'employé qui décide de signaler quelque chose via un bouton "J'ai besoin d'en parler". Le manager ne surveille pas, il reçoit des signaux volontaires.
_Statut :_ RETENU — Intégré dans l'architecture Dual Face.

**[#16] Freemium à limites stratégiques**
_Concept :_ Le plan gratuit est suffisamment généreux pour créer l'addiction ET suffisamment frustrant pour créer le besoin de payer. Chaque limite est un "moment de conversion" naturel.
_Statut :_ RETENU — Principe directeur du pricing.

**[#17] Humeurs custom comme feature premium**
_Concept :_ Grille par défaut en gratuit (fun, universelle). Personnalisation complète en payant.
_Statut :_ RETENU.

**[#18] Historique d'humeur limité en gratuit**
_Concept :_ Gratuit = 30 jours. Payant = illimité + export. Plus on utilise, plus on a envie de payer.
_Statut :_ RETENU.

**[#19] Mood Bot basique vs. personnalisé**
_Concept :_ Gratuit = personnalité standard. Payant = choix de personnalité, ton adaptable.
_Statut :_ RETENU.

**[#20] Mini-défi limité en gratuit**
_Concept :_ Gratuit = image par défaut. Payant = image custom, classement historique.
_Statut :_ RETENU.

**[#21] Espace Manager = payant**
_Concept :_ Tout l'espace manager est exclusivement payant. L'employé n'est jamais frustré par des limites sur SA safe zone.
_Statut :_ RETENU — Outils événements dès le plan Team, reste en Business.

**[#25] Positionnement marketing remote-first**
_Concept :_ Pitch orienté équipes hybrides/remote : "Vos équipes distribuées ont perdu la machine à café. My Mood la remplace." Le pain point remote est plus aigu et plus vendeur.
_Statut :_ RETENU — Axe marketing principal pour le lancement.

### Pricing

| | Free | Team (~3-4 EUR/user/mois) | Business (~6-8 EUR/user/mois) |
|---|------|------|----------|
| **Utilisateurs** | 5-6 max | Illimité | Illimité + multi-équipes |
| **Humeurs** | Grille par défaut | Custom complet | Custom + templates sectoriels |
| **Messagerie** | 90 jours, 500 Mo | Illimité | Illimité + E2E |
| **Mood Bot** | Standard | Personnalisable | Multi-personnalités |
| **Mini-défi** | Image par défaut | Image custom + historique | Défis custom manager |
| **Courbe humeur** | 30 jours | Illimité + export | Illimité + export |
| **Événements + Album** | Non | Oui | Oui + intégrations agenda |
| **Sondages manager** | Non | Basique | Avancé + anonyme |
| **Challenges manager** | Non | Non | Oui |
| **Team Wrapped** | Aperçu flouté | Complet | Complet + export PDF |
| **SSO / AD** | Non | Non | Oui |
| **Signal "Besoin d'aide"** | Oui | Oui | Oui + routing manager |

### Stack Technique

**[#24] PWA responsive-first**
_Concept :_ Progressive Web App pensée mobile-first, installable sur smartphone sans stores. Mode mobile allégé pour check-in rapide, mode desktop complet.

**[#27] Angular 19+ avec PWA native**
_Concept :_ Angular avec standalone components, signals, @angular/pwa. Lazy loading par module (Safe Zone / Manager / Messaging).

**[#28] PostgreSQL + RLS pour multi-tenancy**
_Concept :_ Row Level Security natif de Postgres pour cloisonner les données par tenant directement au niveau base. Muraille de Chine architecturale entre les équipes/entreprises.

**[#29] NestJS modulaire**
_Concept :_ Modules séparés (SafeZone, ManagerSpace, Messaging, Auth). Guards pour isolation multi-tenant. Le cloisonnement dual-face est architectural, pas juste UI.

**[#30→#33] SSE par défaut, WebSocket minimal**
_Concept :_ SSE pour tout le broadcast serveur→client (grille d'humeur, notifications, mises à jour). WebSocket uniquement pour la messagerie (bidirectionnel). SSE passe par HTTP standard, traverse les proxies d'entreprise sans problème.

**[#31] Infra évolutive**
_Concept :_ Docker + Hetzner VPS pour commencer (20-50 EUR/mois), scale cloud quand les revenus le justifient. Cloudflare R2 pour le stockage fichiers (zéro frais de bande passante sortante).

**[#32] Auth JWT → SSO futur**
_Concept :_ Auth propre avec JWT/Passport.js en v1. SSO via Auth0 ou Keycloak pour le plan Business. Abstraction prévue dès le début.

### Stack finale

```
Frontend:  Angular 19+ (standalone, signals, PWA, responsive-first)
Backend:   NestJS (TypeScript, modules, guards)
BDD:       PostgreSQL (RLS pour multi-tenancy)
ORM:       Prisma
Temps réel: SSE par défaut — WebSocket (Socket.io) uniquement pour la messagerie
Stockage:  Cloudflare R2
Auth:      JWT/Passport.js → SSO (Auth0/Keycloak) en plan Business
AI:        API Claude/OpenAI (modèle léger pour mood bot)
Infra:     Docker + Hetzner VPS → scale cloud plus tard
```

---

## Roadmap priorisée

### MVP (Phase 1) — "La Safe Zone qui marche"
_Objectif : Un produit utilisable par une équipe de 5-6 personnes. Validation du concept coeur._

| # | Feature | Justification |
|---|---------|---------------|
| 1 | Infra de base (Docker, Hetzner, Postgres, NestJS, Angular PWA) | Fondation technique |
| 2 | Auth (inscription, login, JWT, profil basique) | Prérequis à tout |
| 3 | Création d'espace / invitation de membres | Multi-tenancy de base |
| 4 | Grille d'humeur (grille par défaut) + SSE temps réel | Le coeur du produit |
| 5 | Historique d'humeur personnel (courbe 30 jours) + médiane équipe | Valeur différenciante immédiate |
| 6 | Onboarding guidé (tour + premier mood) | Première impression critique |
| 7 | Notifications push basiques (PWA) | Rétention quotidienne |

### V1.0 (Phase 2) — "L'engagement quotidien"
_Objectif : Les features qui créent le rituel et l'habitude. Lancement du plan gratuit public._

| # | Feature | Justification |
|---|---------|---------------|
| 8 | Messagerie avec rooms + images (WebSocket) | 2ème pilier d'engagement |
| 9 | Mini-défi quotidien (image par défaut) | Rituel + gamification |
| 10 | Mood Bot basique (personnalité standard) | Fun + différenciation |
| 11 | Sondages équipe (basiques) | Interaction de groupe |
| 12 | Stockage fichiers (Cloudflare R2) | Support messagerie + images |

### V1.5 (Phase 3) — "Le déclencheur payant"
_Objectif : Les features premium qui déclenchent la conversion Free → Team. Premiers revenus._

| # | Feature | Justification |
|---|---------|---------------|
| 13 | Humeurs custom par équipe | Premier levier premium |
| 14 | Mood Bot personnalisable | Deuxième levier premium |
| 15 | Mini-défi custom (image uploadable) | Troisième levier |
| 16 | Historique illimité + export | Levier de conversion temporel |
| 17 | Messagerie illimitée (fin limite 90 jours) | "Ne perdez pas vos messages" |
| 18 | Signal "J'ai besoin d'en parler" | Le pont entre les deux faces |

### V2.0 (Phase 4) — "L'espace Manager"
_Objectif : Le plan Business ciblant les décideurs._

| # | Feature | Justification |
|---|---------|---------------|
| 19 | Espace Manager (interface séparée) | Nouveau pan du produit |
| 20 | Organisation d'événements + participants | Premier outil manager |
| 21 | Album souvenir (photos par événement) | Valeur émotionnelle long terme |
| 22 | Sondages manager (anonymes, avancés) | Pulse check officiel |
| 23 | Challenges d'équipe | Gamification managériale |
| 24 | Multi-équipes (un manager, plusieurs équipes) | Scale B2B |

### V3.0 (Phase 5) — "L'enterprise"
_Objectif : Scale et grandes entreprises._

| # | Feature | Justification |
|---|---------|---------------|
| 25 | SSO / Active Directory (Auth0/Keycloak) | Prérequis enterprise |
| 26 | Team Wrapped annuel | Feature "wow" de rétention |
| 27 | E2E encryption (messagerie premium) | Argument sécurité enterprise |
| 28 | Intégrations agenda (Google Cal, Outlook) | Confort enterprise |
| 29 | Templates d'humeurs sectoriels | Scale horizontal |

---

## Session Summary and Insights

### Accomplissements clés

- **33 idées** générées couvrant 5 domaines (architecture, features, business model, stack, roadmap)
- **Architecture Dual Face** identifiée comme pilier central — résout la tension fondamentale Fun vs. Flicage
- **Business model freemium bottom-up** défini avec 3 plans et limites stratégiques
- **Stack technique complète** validée, alignée sur les compétences du fondateur
- **Roadmap en 5 phases** de MVP à Enterprise, chaque phase autonome et délivrable

### Breakthrough moments

1. **La safe zone comme valeur cachée** — La messagerie utilisée pour les messages "qu'on n'oserait pas mettre sur Slack" révèle que l'app crée un espace de confiance unique, potentiellement plus précieux que la grille d'humeur elle-même.
2. **Le paradoxe Fun vs. Flicage** — Identifier cette tension tôt a permis de construire une architecture (Dual Face) et un business model (bottom-up) qui la résolvent structurellement plutôt que cosmétiquement.
3. **Le Team Wrapped** — L'idée du "Spotify Wrapped d'équipe" comme feature de rétention et outil de conversion organique (les employés montrent le Wrapped à leur manager).
4. **Le branding comme mécanisme de confiance** — La confiance ne se construit pas par des mesures techniques ou légales, mais par un signal culturel ("by employees, for employees").

### Creative Facilitation Narrative

_Session de brainstorming riche et pragmatique. Vincent a montré une capacité remarquable à identifier les tensions fondamentales de son produit (notamment le paradoxe Fun vs. Flicage) et à les résoudre par le design plutôt que par le compromis. La session a naturellement évolué du tri de features vers une redéfinition complète du positionnement produit — passant d'un "outil de suivi d'humeur" à un "babyfoot numérique pour équipes distribuées". Les idées les plus fortes (Dual Face, bottom-up, Team Wrapped) sont venues de la collision entre la vision "fun" du créateur et les contraintes du marché B2B._
