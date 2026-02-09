---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments:
  - '_bmad-output/brainstorming/brainstorming-session-2026-02-06.md'
  - 'CLAUDE.md'
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 0
  projectContext: 1
classification:
  projectType: 'saas_b2b'
  domain: 'general'
  complexity: 'medium'
  projectContext: 'greenfield'
---

# Product Requirements Document - my-mood

**Author:** Vincent
**Date:** 2026-02-09

## Executive Summary

**Vision :** My Mood est le "babyfoot numérique" pour équipes distribuées — un espace de cohésion d'équipe quotidien qui remplace la machine à café perdue avec le remote. Positionnement : "By employees, for employees".

**Différenciateur :** Architecture Dual Face — deux espaces hermétiquement cloisonnés (safe zone employé + espace manager) avec séparation structurelle garantie par RLS Postgres. Aucun concurrent ne propose cette garantie architecturale. Le manager n'a aucun accès à la safe zone ; la séparation est structurelle, pas cosmétique.

**Cible :** Équipes distribuées/hybrides (5-15 personnes) qui ont perdu les interactions informelles du bureau. Adoption bottom-up par les employés (gratuit), monétisation par upgrade entreprise (Team/Business).

**Produit :** SaaS B2B multi-tenant, PWA responsive-first. Le MVP valide le rituel quotidien (humeur + mini-défi + messagerie) avec un plan Free. Le ton est underground/fun — le produit ne doit JAMAIS ressembler à un outil RH corporate.

**Tension fondamentale :** La valeur utilisateur (espace informel, humour, safe zone) est en opposition directe avec la valeur acheteur (analytics, suivi). Chaque feature doit être évaluée à travers ce prisme Fun vs. Flicage. Résolution : Architecture Dual Face + adoption bottom-up.

## Success Criteria

### User Success

- **Check-in humeur quotidien :** 60%+ des membres actifs sélectionnent leur humeur chaque jour
- **Participation mini-défi :** 50-60% des membres actifs participent au mini-défi quotidien
- **Engagement messagerie :** 1+ message ou réaction par utilisateur actif par semaine
- **Time to Value :** Premier check-in d'humeur dans les minutes suivant l'inscription via l'onboarding guidé
- **Moment "aha!" :** Découverte que la safe zone est un espace de confiance sans visibilité managériale — ce que Slack/Teams ne peut pas offrir

### Business Success

- **Autofinancement à 3 mois :** Revenus couvrant les coûts d'infrastructure (serveurs, IA, domaine) dans les 3 premiers mois post-lancement payant
- **Rentabilité à 12 mois :** Écart significatif revenus/coûts, début de bénéfice réel
- **Conversion Free → Team :** 5-7% cible initiale, baisse acceptable avec la croissance de la base gratuite
- **Premiers abonnements payants :** 3 à 6 mois après le lancement public
- **Leviers de conversion naturels :** Limite historique 30 jours + limite utilisateurs en gratuit comme déclencheurs organiques

### Technical Success

- **Temps réel :** Propagation des changements d'humeur < 2 secondes via SSE
- **Disponibilité :** 99.9% d'uptime — coupures limitées aux mises à jour (Node.js restart rapide)
- **Cloisonnement Dual Face :** Isolation architecturale RLS Postgres + modules NestJS séparés — zéro fuite safe zone → espace manager
- **Protection des données :** Audit RGPD à moyen terme (photos, emails, données personnelles)
- **Confiance par le design :** Branding underground "by employees, for employees" + onboarding transparent, pas de certifications

### Measurable Outcomes

| Métrique | Cible MVP | Cible 12 mois |
|----------|-----------|---------------|
| Check-in humeur quotidien | 60%+ de l'équipe | 60%+ maintenu |
| Participation mini-défi | 50-60% | 50-60% maintenu |
| Messages/réactions par user actif | 1+/semaine | croissance |
| Time to first mood | < 5 min post-inscription | < 2 min |
| Latence SSE (humeurs) | < 2s | < 1s |
| Uptime | 99.5% (beta) | 99.9% |
| Conversion Free → Team | — | 5-7% |

## User Journeys

*Les journeys décrivent la vision complète du produit. Fonctionnalités hors MVP (DMs, vocaux, espace manager, IA, SSO...) → voir "Project Scoping & Phased Development" pour le périmètre par phase.*

### Journey 1 — Sarah, développeuse frontend (Membre d'équipe)

**Persona :** Sarah, 28 ans, dev frontend, full remote depuis 2 ans dans une équipe de 8 devs. Ses collègues sont sympas mais elle ne les voit qu'en visio. La machine à café n'existe plus. Elle a parfois des journées de merde sans oser le dire sur Slack parce que "c'est pas pro".

**Opening Scene :** Son collègue Romain lui envoie un lien d'invitation My Mood sur Slack : "Viens voir ce truc, c'est marrant". Elle clique, arrive sur une page d'inscription rapide. Un onboarding guidé lui présente les fonctionnalités clés — la grille d'humeur, le mini-défi, la messagerie — et l'invite à sélectionner son humeur. Le flow est suffisamment engageant pour qu'elle n'ait pas envie de skipper : elle choisit "Fatiguée mais ça va".

**Rising Action :** Romain réagit à son humeur avec un emoji. Puis il envoie un message dans le groupe : "T'as vu le petit défi ? C'est quotidien, il y a même un classement ! T'as réussi ?" Elle participe et répond : "Oui, et je l'ai trouvé plus vite que toi ! On verra si demain tu arrives à faire mieux 😁". Le rituel est lancé.

Dans la journée, Romain sort d'une réunion et bascule son humeur en négatif. Sarah réagit par un "?" — il répond : "Réunion de merde !". Elle s'étonne : "😱 c'est direct !", il la rassure : "T'inquiètes ici on est entre nous !". Elle comprend. Elle répond : "Les réunions ou l'art de perdre du temps pour des trucs inutiles !". Romain réagit avec un 👍.

**Climax :** Dans la semaine, un collègue affiche un coup de blues. Sarah envoie immédiatement un gif drôle dans le chat. Il réagit "Mdr 😂" et remonte légèrement son humeur. Elle réalise que cet espace a un vrai impact — les gens s'expriment, se soutiennent, et ça change quelque chose.

Une collègue entame une conversation privée avec elle — des confidences sur le chef, une rumeur. Elles échangent en confiance : gifs, photos, vocaux. Sarah supprime une photo partagée — elle disparaît instantanément pour les deux. "On sait jamais je préfère que personne ne tombe là-dessus 😅".

**Resolution :** My Mood est devenu le premier onglet qu'elle ouvre le matin. Elle check son humeur, regarde le défi du jour, jette un œil aux messages. C'est son espace informel — ce que la machine à café était avant le remote.

### Journey 2 — Thomas, directeur technique (Manager + Membre safe zone)

**Persona :** Thomas, 38 ans, directeur technique, gère une équipe de 10 devs en hybride. Il est aussi membre du groupe "Comité de direction" avec 4 autres directeurs. Entreprise en plan Business.

**Opening Scene — Espace Manager :** Thomas ouvre My Mood sur l'espace d'administration de son groupe. Il voit son dashboard : gestion des membres, liens d'invitation, et les actions rapides (événement, sondage, défi). Pas d'humeurs visibles, pas de messages — juste des outils de cohésion.

L'IA lui suggère discrètement : "Il serait temps de décompresser ! → Créer un événement". Cette suggestion est basée sur une analyse long terme de l'ambiance de l'équipe — tendances d'humeur et style de communication — sans jamais révéler de données individuelles ou de contenu spécifique. Les suggestions restent vagues et actionnables, toujours "politiquement correctes" même si l'équipe est crue en privé.

**Rising Action — Le signal :** Une alerte apparaît en premier plan : Élodie a cliqué sur "J'ai besoin d'en parler". Un canal privé s'ouvre entre Thomas et Élodie. L'IA suggère un message d'amorce adapté au style de communication du groupe pour aider Thomas à entamer la discussion de manière naturelle.

**Climax — Le context switch :** Thomas clique sur le bouton de bascule dans le header et passe sur sa safe zone "Comité de direction". L'interface change complètement — il est un simple membre. Il se met en "Fatigué" et lâche dans le groupe : "Le client m'a incendié ce matin, il en a marre d'attendre sa feature". Puis : "Et pour compléter le tableau j'ai Élodie qui me fait une crise existentielle faut que j'arrive à la rebooster on a besoin d'elle ! Des idées ?"

Les directeurs répondent : "File-lui une prime ! 😂" — "T'as trouvé le moyen de faire pousser les billets sur les arbres ? lol" — "Non plus sérieusement, j'ai entendu parler d'un nouveau restau dans la zone. Invite-les un midi !"

**Resolution :** Thomas retourne dans l'espace manager de son groupe. Il crée un événement "On se teste le nouveau restau !" pour jeudi midi avec limite de réponse jusqu'à jeudi matin. Il édite la phrase du jour de l'équipe : "Tout seul on va vite, ensemble on va loin ! (mais pour l'instant on va se contenter du restau d'à côté 😅😁)". Les deux espaces sont des URLs distinctes — il les a en favoris dans deux onglets permanents.

### Journey 3 — Claire, DRH (Administrateur entreprise)

**Persona :** Claire, 45 ans, DRH d'une entreprise de 200 personnes réparties en 15 équipes. Elle cherche à renforcer la cohésion d'équipe en remote/hybride sans ajouter un énième outil corporate que personne n'utilise.

**Opening Scene :** Claire souscrit au plan Business. Elle accède à un espace d'administration entreprise. Sa première tâche : créer la structure. Elle crée les 15 équipes une par une (ou par import), et assigne un ou plusieurs managers à chacune. Elle se nomme elle-même manager du groupe "Managers" — une safe zone pour ses directeurs.

**Rising Action :** Claire délègue la gestion des invitations aux managers de chaque équipe. Chacun invite ses membres. L'adoption démarre organiquement, équipe par équipe. Pour le SSO/AD, elle suit un guide pas-à-pas adapté au système de l'entreprise (Azure AD, Okta, etc.). L'intégration SSO garantit qu'un manager ne peut pas créer un faux compte pour infiltrer la safe zone de son équipe.

**Climax :** Après quelques semaines, Claire consulte son dashboard. Elle voit les stats d'engagement par équipe : taux de check-in humeur quotidien/hebdomadaire, participation aux mini-défis, volume de messages échangés. Côté management : nombre d'événements et sondages créés par période, nombre de demandes d'aide traitées. Tout est anonymisé — jamais de contenu de safe zone, jamais d'humeurs individuelles.

**Resolution :** Claire constate que 12 équipes sur 15 ont un taux d'engagement supérieur à 60%. Ses managers créent des événements régulièrement, traitent les demandes d'aide, et lancent des sondages. Elle voit l'impact concret sur la cohésion — pour une fraction du coût d'un séminaire trimestriel. Elle renouvelle l'abonnement sans hésiter.

### Journey 4 — Mehdi, ops/support (Admin plateforme)

**Persona :** Mehdi, 32 ans, ingénieur DevOps, gère l'infrastructure et le support de la plateforme My Mood.

**Opening Scene :** Mehdi consulte chaque matin son dashboard d'administration plateforme. Il surveille l'uptime, le stockage (R2), les logs (warnings/erreurs), et l'usage par tenant (engagement, fréquentation). Tout est vert — journée tranquille.

**Rising Action :** Un ticket arrive : un utilisateur ne reçoit plus ses notifications push. Mehdi vérifie que le système est up, consulte les logs du tenant concerné. Pas de bug serveur — il identifie un problème spécifique au navigateur de l'utilisateur qui bloque les service workers. Il suggère une action côté client et met à jour la documentation/FAQ pour ce cas précis.

Un autre ticket : un admin entreprise a un souci d'intégration SSO avec un AD particulier. Mehdi identifie une incompatibilité de configuration, guide l'admin et crée un ticket de dev pour améliorer la gestion de ce cas dans l'onboarding SSO.

**Climax — Edge case :** Un signalement remonte : un groupe a un comportement abusif (contenu illicite). Mehdi a accès aux actions critiques — il peut bloquer/supprimer des accès utilisateurs, des groupes, ou même une entreprise entière si nécessaire.

**Resolution :** Mehdi maintient la plateforme stable à 99.9% d'uptime. Les mises à jour se déploient avec des coupures de quelques secondes (restart Node.js). Il améliore continuellement la documentation et l'onboarding en fonction des tickets récurrents.

### Journey Requirements Summary

| Capability | Journey 1 (Sarah) | Journey 2 (Thomas) | Journey 3 (Claire) | Journey 4 (Mehdi) |
|---|---|---|---|---|
| **Inscription / Invitation par lien** | ✓ | | ✓ (délègue) | |
| **Onboarding guidé** | ✓ | | | |
| **Grille d'humeur + réactions** | ✓ | ✓ (safe zone) | | |
| **Mini-défi + classement** | ✓ | | | |
| **Messagerie groupe + DM** | ✓ | ✓ (safe zone) | | |
| **Médias riches (GIF, photo, vocaux)** | ✓ | ✓ | | |
| **Suppression messages pour tous** | ✓ | | | |
| **Context switch manager ↔ safe zone** | | ✓ | | |
| **URLs distinctes par espace** | | ✓ | | |
| **Gestion membres / invitations** | | ✓ (manager) | ✓ (admin) | |
| **Signal "J'ai besoin d'en parler"** | | ✓ (reçoit) | | |
| **Canal privé manager ↔ membre** | | ✓ | | |
| **Suggestions IA anonymisées** | | ✓ | | |
| **Phrase du jour manager** | | ✓ | | |
| **Événements + RSVP** | | ✓ | | |
| **Dashboard admin entreprise** | | | ✓ | |
| **Stats engagement anonymisées** | | | ✓ | |
| **Stats management** | | | ✓ | |
| **Configuration SSO/AD** | | | ✓ | ✓ (support) |
| **Auto-assignation manager** | | | ✓ | |
| **Monitoring plateforme** | | | | ✓ |
| **Logs / Support / Tickets** | | | | ✓ |
| **Actions critiques (block/delete)** | | | | ✓ |

## Domain-Specific Requirements

### Compliance & Réglementaire

**RGPD / Protection des données personnelles :**
- **Consentement explicite** à l'inscription : stockage des données, utilisation anonymisée pour l'amélioration du service (IA)
- **Droit à la suppression :** suppression de toutes les données utilisateur (humeurs, messages, médias, profil) à la suppression du compte. Si l'utilisateur quitte un groupe sans supprimer son compte, suppression des données associées à ce groupe uniquement
- **Droit à la portabilité :** export des données personnelles — informations du compte (nom, email, photo de profil), appartenances aux groupes, historique des humeurs, liste des messages et médias envoyés
- **Registre des traitements :** différé post-MVP

### Confidentialité Dual Face — Contraintes architecturales

- **Séparation structurelle et infranchissable** entre safe zone et espace manager, garantie par RLS Postgres + modules NestJS séparés
- **Tests automatisés de cloisonnement** exécutés à chaque modification (CI/CD) pour vérifier qu'aucune policy RLS ne permet de fuite de données safe zone vers l'espace manager
- **Accès légal :** en cas de demande judiciaire, seul l'administrateur système (ops) avec un accès direct BDD admin peut extraire des données safe zone. Aucun chemin applicatif ne permet cet accès
- **SSO/AD comme garde-fou :** empêche un manager de créer un faux compte pour infiltrer la safe zone de son équipe

### Modération de contenu — Approche hybride

**Principe directeur :** Zéro surveillance proactive. La safe zone reste un espace de liberté. L'intervention n'a lieu que sur signalement.

**Flow de signalement :**
1. Un utilisateur signale un contenu → sélection de la raison/catégorie
2. **Si catégorie critique** (pédopornographie, terrorisme, contenu manifestement illicite) → escalade directe vers admin plateforme, sans vote
3. **Sinon** → vote créé, notification envoyée à tous les membres du groupe/conversation. Le contenu est immédiatement **flouté/spoiler** (consultable volontairement par ceux qui le souhaitent)
4. Résultat du vote à la majorité **OU** après timeout de 24h → contenu supprimé définitivement ou restauré (sans flou/spoiler)
5. **Bypass :** si le vote restaure le contenu mais qu'un membre reste choqué, il peut re-signaler → escalade vers admin plateforme

**CGU :**
- Conditions d'utilisation claires acceptées à l'inscription : liberté d'expression dans la safe zone, mais contenu manifestement illicite interdit
- Conformité LCEN + Digital Services Act (obligation de retrait prompt sur notification)

### Rétention des données

- **Plan Free :** historique 30 jours pour les humeurs, messagerie 90 jours / 500 Mo
- **Plans payants :** historique illimité, messagerie illimitée
- **Suppression de compte/groupe :** suppression effective et définitive des données (pas de soft delete pour les données utilisateur)

### Risques et mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Fuite de données safe zone vers manager | **Critique** — mort du produit | RLS + tests automatisés CI + séparation architecturale modules |
| Manager infiltrant la safe zone | **Critique** — perte de confiance | SSO/AD obligatoire (Business), un compte = un rôle par groupe |
| Demande RGPD non traitée | Légal — amende | Mécanismes d'export et suppression intégrés au produit |
| Contenu illicite non modéré | Légal — responsabilité hébergeur | Système hybride signalement + escalade |
| Suggestions IA trop précises | Confiance — perception de surveillance | Filtrage strict, analyse long terme uniquement, aucune donnée brute transmise |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Architecture Dual Face — Inversion du paradigme engagement**
Les outils existants (Officevibe, 15Five, Culture Amp) sont des outils manager avec anonymisation cosmétique. My Mood inverse le modèle : l'espace employé est premier et architecturalement isolé (RLS Postgres). Le manager n'a aucun accès — la séparation est structurelle, pas une couche d'UI. Aucun concurrent ne propose cette garantie architecturale.

**2. Suggestions IA anonymisées — People analytics sans données**
L'IA analyse les tendances d'ambiance long terme (humeurs + style de communication) côté serveur et ne remonte au manager que des suggestions d'action vagues et positives. Le manager tire de la valeur des données safe zone sans jamais y accéder. Approche inédite qui résout la tension fondamentale surveillance vs. bien-être.

**3. Mood Bot adaptatif par équipe**
Un bot IA qui apprend le style de communication du groupe et développe une "personnalité" propre à chaque équipe. Plus qu'un chatbot : un personnage qui renforce l'identité et l'unicité de chaque safe zone. L'équipe choisit son archétype (sarcastique, bienveillant, absurde...) et le bot s'y adapte.

**4. Team Wrapped — Spotify Wrapped pour la cohésion d'équipe**
Bilan annuel auto-généré façon Spotify Wrapped : montages photos, stats fun, évolution des humeurs, classement du mini-défi, moments forts. Transposition inédite d'un concept B2C viral dans un contexte B2B. Double fonction : rétention ("un an de souvenirs, tu ne veux pas perdre ça") et conversion organique (les employés montrent le Wrapped à leur manager).

**5. Modération démocratique auto-gérée**
Système de signalement → vote à la majorité → escalade. Les groupes se gouvernent eux-mêmes. Inhabituel pour un outil B2B, renforce le sentiment d'autonomie et de confiance dans la safe zone.

**6. Adoption bottom-up en B2B**
Modèle d'acquisition inversé : les employés adoptent en gratuit, l'entreprise formalise ensuite. Inspiré de Slack, mais appliqué au domaine de la cohésion d'équipe plutôt qu'à la communication professionnelle.

### Market Context & Competitive Landscape

| Concurrent | Approche | Différence My Mood |
|-----------|---------|-------------------|
| Officevibe / 15Five | Pulse surveys manager-driven, analytics RH | My Mood est employee-first, zéro analytics RH |
| Slack / Teams | Communication pro, pas d'espace informel garanti | My Mood crée un espace protégé hors canaux officiels |
| Donut / Bonusly | Gamification légère, pas de safe zone | My Mood offre un espace de confiance architecturalement garanti |
| Culture Amp | Analytics lourds, top-down | My Mood est bottom-up, fun-first |

**Positionnement unique :** Aucun concurrent ne combine safe zone architecturale + fun/gamification + outils manager cloisonnés. My Mood crée une catégorie : le "babyfoot numérique".

### Validation Approach

- **MVP validation :** Tester le concept safe zone + engagement quotidien avec des équipes partenaires (proches, bêta-testeurs). Mesurer le taux de check-in 60%+ et le rituel quotidien.
- **Team Wrapped validation :** Générer un premier Wrapped après quelques mois de données — mesurer le taux de partage et l'impact sur la rétention.
- **IA validation :** Commencer avec le Mood Bot basique, puis itérer sur l'adaptation au style du groupe. Mesurer l'engagement avec le bot par rapport à un bot standard.

### Risk Mitigation

| Innovation | Risque | Fallback |
|-----------|--------|----------|
| Dual Face | Complexité technique RLS | Architecture modulaire NestJS qui fonctionne même sans RLS parfait au début |
| Suggestions IA | Suggestions perçues comme surveillance | Désactivable par l'équipe, transparence sur le fonctionnement |
| Mood Bot adaptatif | Bot qui dérape (contenu inapproprié) | Filtrage strict, personnalité encadrée par des guardrails |
| Team Wrapped | Pas assez de données la première année | Version "aperçu" même avec peu de données, enrichir au fil du temps |
| Bottom-up adoption | Difficile d'atteindre le décideur acheteur | Le produit gratuit crée de la demande — l'employé devient l'ambassadeur |

## SaaS B2B Specific Requirements

### Project-Type Overview

SaaS B2B multi-tenant avec architecture Dual Face. Tenancy triple : Organisation (Business) > Groupe (Team) > Utilisateur. Cloisonnement RLS à tous les niveaux.

### Multi-Tenancy Model

**Structure hiérarchique :**
- **Niveau Organisation** (plan Business) : une entreprise avec N groupes, gérée par un admin entreprise
- **Niveau Groupe** (plan Team ou sous-groupe Business) : une équipe avec son manager et ses membres, cloisonnée par RLS
- **Niveau Utilisateur** : un compte unique avec des rôles contextuels par groupe (membre dans un groupe, manager dans un autre)

**Isolation des données :**
- Chaque groupe est un tenant isolé via RLS Postgres
- Les données safe zone sont isolées des données manager space au sein du même groupe
- Un utilisateur multi-groupes a des données séparées par groupe (humeurs, messages) — quitter un groupe supprime uniquement les données de ce groupe

### RBAC — Matrice des permissions

| Permission | Membre | Manager | Admin Entreprise | Admin Plateforme |
|-----------|--------|---------|-----------------|-----------------|
| Voir/modifier sa propre humeur | ✓ | ✓ (safe zone) | | |
| Voir humeurs de l'équipe (safe zone) | ✓ | ✗ | ✗ | ✗ |
| Messagerie groupe/DM (safe zone) | ✓ | ✓ (safe zone) | | |
| Mini-défi + classement | ✓ | ✓ (safe zone) | | |
| Signaler un contenu | ✓ | ✓ (safe zone) | | |
| Signal "J'ai besoin d'en parler" | ✓ | | | |
| Recevoir alertes "Besoin d'en parler" | | ✓ | | |
| Gérer membres / invitations du groupe | | ✓ | ✓ | ✓ |
| Créer événements / sondages / défis | | ✓ | | |
| Éditer phrase du jour | | ✓ | | |
| Voir suggestions IA anonymisées | | ✓ | | |
| Créer / supprimer des groupes | | | ✓ | ✓ |
| Assigner des managers aux groupes | | | ✓ | ✓ |
| S'auto-assigner manager d'un groupe | | | ✓ | |
| Dashboard stats engagement anonymisées | | | ✓ | ✓ |
| Configurer SSO / AD | | | ✓ | ✓ (support) |
| Gestion facturation / abonnement | | | ✓ | |
| Monitoring / logs plateforme | | | | ✓ |
| Block / delete utilisateurs-groupes-entreprises | | | | ✓ |
| Modération contenu (escalade) | | | | ✓ |

**Règle fondamentale :** Un manager ne peut PAS être membre de la safe zone du groupe qu'il manage. Il peut être membre de la safe zone d'un AUTRE groupe.

### Subscription Tiers — Architecture technique

| Aspect technique | Free | Team | Business |
|-----------------|------|------|----------|
| **Tenancy** | Groupe unique, auto-géré | Groupe unique + manager | Organisation + N groupes |
| **Utilisateurs** | 5-6 max | Illimité | Illimité + multi-équipes |
| **Auth** | JWT (email/password) | JWT (email/password) | JWT + SSO/AD |
| **Stockage** | 500 Mo (R2) | Illimité | Illimité |
| **Historique humeurs** | 30 jours | Illimité | Illimité |
| **Messagerie** | 90 jours | Illimitée | Illimitée + E2E (futur) |
| **IA** | Mood Bot standard | Bot personnalisable | Bot + suggestions manager |
| **Admin** | Créateur = admin simple | Manager dédié | Admin entreprise + managers |
| **Temps réel** | SSE + WebSocket | SSE + WebSocket | SSE + WebSocket |

### Integration List

**MVP :** Aucune intégration externe — le produit est autonome.

**Post-MVP / Vision :**

| Intégration | Scope | Plan |
|------------|-------|------|
| **SSO / AD** (Azure AD, Okta, Keycloak) | Auth entreprise, garde-fou anti-infiltration | Business |
| **Calendrier** (Google Cal, Outlook) | Sync événements manager → agenda entreprise | Business |
| **Slack / Teams** | Notifications sélectives (ex: nouveau défi, événement créé) | Team / Business |
| **Webhooks sortants** | Événements uniquement (création/modification/suppression) pour intégration calendrier interne | Business |

**Exclus :** Pas d'API publique — risque de sécurité pour la safe zone trop élevé par rapport au bénéfice. Le produit reste un système fermé.

### Technical Architecture Considerations

**Communication temps réel :**
- **SSE** pour tout le broadcast serveur → client (grille d'humeur, notifications, mises à jour) — traverse les proxies d'entreprise sans problème
- **WebSocket (Socket.io)** uniquement pour la messagerie (bidirectionnel nécessaire)

**PWA responsive-first :**
- Installable sur mobile sans stores, mode mobile allégé pour check-in rapide
- Lazy loading agressif par module Angular (Safe Zone / Manager / Messaging)
- Service workers pour notifications push et cache offline basique

**Stockage fichiers :**
- Cloudflare R2 (compatible S3, zéro frais de bande passante sortante)
- Quotas par plan (500 Mo free, illimité payant)

### Implementation Considerations

- **Modules NestJS séparés :** SafeZone, ManagerSpace, Messaging, Auth, Admin — le cloisonnement Dual Face est architectural
- **Guards multi-tenant :** Chaque requête est validée contre le tenant_id ET le rôle contextuel de l'utilisateur dans ce groupe
- **Migration de plan :** Prévoir le passage Free → Team → Business sans perte de données
- **Onboarding différencié :** Flow différent selon le rôle (premier membre, invité, manager, admin entreprise)

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**Approche MVP :** Experience MVP — créer un moment quotidien addictif et un espace de confiance. Pas de démonstration de l'architecture complète (Dual Face, manager space, IA) mais validation que des collègues veulent interagir dans un espace informel protégé, chaque jour.

**Philosophie :** "Si 6 personnes ouvrent My Mood chaque matin pour checker leur humeur, regarder le défi et lire les messages, on a gagné."

**Ressources :** Développeur solo (Vincent), temps libre. Transition full-time conditionnée au succès du test MVP avec des bêta-testeurs.

### MVP Feature Set (Phase 1) — "La Safe Zone qui marche"

**Périmètre utilisateur :** Un seul rôle (Membre). Le créateur du groupe est admin simple (gestion invitations/membres). Pas de rôle Manager, pas d'admin entreprise.

**Plan tarifaire :** Free uniquement (5-6 utilisateurs max par groupe).

**Core User Journeys supportés :**
- Journey 1 (Sarah) — version simplifiée : inscription, onboarding, grille d'humeur, réactions, mini-défi avec classement, messagerie groupe avec images/gifs/emojis
- Journeys 2, 3, 4 — non supportés dans le MVP (nécessitent les rôles manager, admin entreprise, admin plateforme)

**Must-Have Capabilities :**
- Inscription / login (JWT, email + password)
- Création de groupe + invitation par lien unique
- Grille d'humeur par défaut (sélection + réactions émoji par les pairs)
- Propagation temps réel des humeurs via SSE
- Historique d'humeur personnel (courbe 30 jours) + médiane d'équipe
- Onboarding guidé menant au premier mood en < 5 minutes
- Messagerie groupe avec rooms (WebSocket) — texte + images + gifs + emojis
- Mini-défi quotidien (image par défaut, classement des participants)
- Notifications push PWA basiques
- Stockage fichiers Cloudflare R2 (images, gifs)
- Multi-tenancy RLS Postgres (isolation par groupe)
- Gestion de profil utilisateur (nom, email, photo de profil)
- Enforcement des limites Free (6 membres/groupe, historique 30 jours, messagerie 90 jours / 500 Mo)
- Modération basique : signalement de contenu + notification email admin
- Suppression de compte + données associées (RGPD minimal)
- PWA responsive-first, installable, lazy loading

**Exclus du MVP (différé volontairement) :**
- Messages privés (DMs) — post-MVP, potentiellement feature payante
- Messages vocaux — post-MVP, feature payante
- Contenu riche avancé (vidéos, fichiers) — post-MVP
- Suppression de messages pour tous — post-MVP
- Mood Bot — post-MVP
- Sondages — post-MVP
- Humeurs custom — post-MVP (levier conversion)
- Signal "J'ai besoin d'en parler" — Phase 2
- Espace Manager — Phase 3
- SSO/AD — Phase 3

### Post-MVP Features

**Phase 2 — "L'engagement complet + premiers revenus" :**
- DMs (conversations privées entre membres)
- Messages vocaux
- Contenu riche étendu (au-delà images/gifs)
- Suppression de messages pour tous
- Mood Bot basique puis personnalisable
- Sondages équipe
- Humeurs custom par équipe + mini-défi custom (image uploadable)
- Historique illimité + export données personnelles
- Messagerie illimitée (fin limite 90 jours)
- Signal "J'ai besoin d'en parler" (pont Dual Face)
- Introduction du rôle Manager + context switch
- Cloisonnement Dual Face complet (safe zone vs manager space)
- Modération hybride (signalement → vote → escalade)
- Lancement Plan Team (~3-4 EUR/user/mois)

**Phase 3 — "L'enterprise" :**
- Espace Manager complet (événements, album souvenir, sondages manager, challenges)
- Multi-équipes + rôle admin entreprise
- SSO / Active Directory (Azure AD, Okta, Keycloak)
- Suggestions IA anonymisées pour managers
- Team Wrapped annuel (façon Spotify Wrapped)
- E2E encryption messagerie
- Intégrations calendrier (Google Cal, Outlook)
- Notifications Slack/Teams sélectives
- Webhooks sortants (événements uniquement)
- Templates d'humeurs sectoriels
- Admin plateforme (monitoring, modération escaladée, support)
- Lancement Plan Business (~6-8 EUR/user/mois)

### Risk Mitigation Strategy

**Risques techniques :**
- Le RLS Postgres + architecture Dual Face est le composant le plus complexe pour un dev solo
- **Mitigation :** Le MVP n'a qu'un seul rôle (Membre) → pas besoin de Dual Face en Phase 1. Le RLS est simplifié à l'isolation par groupe. La couche Dual Face (safe zone vs manager space) est introduite en Phase 2 avec le rôle Manager, quand l'architecture est stabilisée

**Risques marché :**
- Risque principal : "Est-ce que les gens veulent vraiment un espace informel en plus de Slack/Teams ?"
- **Mitigation :** MVP focalisé sur le rituel quotidien (humeur + mini-défi + messagerie). Test avec des groupes réels (amis, anciens collègues). KPI clair : check-in 60%+, mini-défi 50%+, 1 msg/semaine. Si le rituel ne prend pas → pivot ou abandon avant investissement majeur

**Risques ressources :**
- Dev solo sur temps libre, capacité limitée, pas de backup
- **Mitigation :** Scope MVP volontairement réduit — pas de DM, pas de vocaux, pas de bot, pas de manager space. Stack maîtrisée (Angular + NestJS + Postgres). Si le test MVP est concluant → transition full-time. Si non → coût limité (temps personnel + ~10-20 EUR/mois Hetzner)

## Functional Requirements

### Gestion des utilisateurs & Accès

- **FR1:** Un visiteur peut créer un compte avec email et mot de passe
- **FR2:** Un utilisateur peut se connecter et se déconnecter de son compte
- **FR3:** Un utilisateur peut consulter et modifier son profil (nom, email, photo de profil)
- **FR4:** Un utilisateur peut supprimer son compte, entraînant la suppression définitive de toutes ses données
- **FR5:** Un utilisateur peut exporter ses données personnelles (profil, appartenances, humeurs, messages)
- **FR6:** Un utilisateur doit donner son consentement explicite au traitement de ses données à l'inscription

### Gestion des groupes

- **FR7:** Un utilisateur peut créer un groupe et en devenir le créateur-administrateur (membre avec panneau d'administration : invitations et révocation d'accès)
- **FR8:** Un créateur-administrateur peut générer un lien d'invitation unique pour son groupe
- **FR9:** Un visiteur peut rejoindre un groupe via un lien d'invitation
- **FR10:** Un créateur-administrateur peut voir la liste des membres et révoquer l'accès d'un membre
- **FR11:** Un utilisateur peut quitter un groupe, entraînant la suppression de ses données dans ce groupe uniquement
- **FR12:** Le système limite un groupe Free à 6 membres maximum et refuse l'ajout au-delà de cette limite

### Humeurs

- **FR13:** Un membre peut sélectionner son humeur parmi une grille d'humeurs prédéfinie
- **FR14:** Un membre peut modifier son humeur à tout moment dans la journée
- **FR15:** Un membre peut voir les humeurs actuelles de tous les membres de son groupe en temps réel
- **FR16:** Un membre peut réagir à l'humeur d'un autre membre avec un emoji
- **FR17:** Un membre peut consulter son historique d'humeur personnel sous forme de courbe (axe X : jours, axe Y : niveau d'humeur), limité à 30 jours en plan Free
- **FR18:** Un membre peut consulter la médiane d'humeur de son groupe sous forme de courbe sur la même période que son historique personnel

### Messagerie & Salons

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

### Mini-défi quotidien

- **FR30:** Le système présente un nouveau mini-défi chaque jour à tous les membres du groupe
- **FR31:** Un membre peut participer au mini-défi quotidien en soumettant sa réponse (le type d'interaction dépend du défi : localisation sur image, réponse texte, choix multiple)
- **FR32:** Un membre peut consulter le classement des participants au mini-défi
- **FR33:** Un membre peut voir l'historique des mini-défis passés et des résultats

### Onboarding & Notifications

- **FR34:** Un nouvel utilisateur est guidé par un onboarding en 3-5 étapes (bienvenue, présentation grille d'humeur, présentation mini-défi, présentation messagerie, sélection du premier mood) menant au premier check-in en moins de 5 minutes
- **FR35:** Un utilisateur peut recevoir des notifications push via la PWA
- **FR36:** Un utilisateur peut installer l'application comme PWA sur son appareil

### Modération & Sécurité

- **FR37:** Un membre peut signaler un contenu (message, image, GIF, nom de profil ou photo de profil d'un autre membre) via un bouton dédié
- **FR38:** Le système notifie l'administrateur système par email lorsqu'un contenu est signalé, avec l'identifiant de l'élément concerné
- **FR39:** Le système isole les données de chaque groupe (aucun accès croisé entre groupes)

## Non-Functional Requirements

### Performance

- **NFR1:** Les changements d'humeur se propagent à tous les membres connectés du groupe en moins de 2 secondes, vérifié par tests end-to-end automatisés
- **NFR2:** Les messages envoyés apparaissent chez les autres membres du salon en moins de 500ms, vérifié par tests end-to-end automatisés
- **NFR3:** Le chargement initial de l'application (first contentful paint) est inférieur à 3 secondes sur une connexion 4G, mesuré par Lighthouse ou équivalent
- **NFR4:** Les interactions utilisateur (sélection humeur, envoi message, navigation) répondent en moins de 200ms côté client, mesuré par instrumentation front-end
- **NFR5:** L'upload d'images supporte des fichiers jusqu'à 10 Mo avec indication de progression mise à jour au minimum tous les 10% d'avancement

### Sécurité

- **NFR6:** Les mots de passe sont hashés avec un algorithme adaptatif nécessitant au minimum 100ms de calcul, jamais stockés en clair, vérifié par audit de code à chaque pull request
- **NFR7:** Les tokens d'authentification ont une durée de vie maximale de 15 minutes avec mécanisme de renouvellement automatique, vérifié par tests automatisés
- **NFR8:** Toutes les communications client-serveur sont chiffrées via TLS 1.2+, vérifié par scan de sécurité automatisé
- **NFR9:** Aucune requête applicative ne peut accéder aux données d'un autre groupe, vérifié par tests de cloisonnement automatisés exécutés en CI à chaque modification
- **NFR10:** Les fichiers stockés ne sont accessibles que via des URLs signées avec expiration de 1 heure maximum, vérifié par tests d'accès automatisés
- **NFR11:** Les données personnelles exportées (FR5) sont servies via un lien à usage unique expirant après 24 heures, vérifié par tests automatisés

### Fiabilité

- **NFR12:** L'application maintient un uptime de 99.5% sur 30 jours glissants (cible MVP/beta), évoluant vers 99.9% post-MVP, mesuré par monitoring externe
- **NFR13:** Les connexions temps réel se reconnectent automatiquement dans les 5 secondes suivant une interruption réseau, vérifié par tests de résilience
- **NFR14:** Les messages envoyés pendant une déconnexion inférieure à 1 heure sont livrés à la reconnexion sans perte, vérifié par tests end-to-end automatisés
- **NFR15:** La base de données est sauvegardée quotidiennement avec une rétention de 7 jours minimum, vérifié par test de restauration mensuel

### Scalabilité

- **NFR16:** L'architecture supporte au minimum 50 groupes actifs simultanés (un groupe actif = au moins 1 membre connecté), vérifié par load testing (cible MVP)
- **NFR17:** Le système maintient les performances attendues (NFR1-NFR4) avec 6 utilisateurs connectés simultanément par groupe, vérifié par load testing
- **NFR18:** Le stockage et le schéma de données supportent une croissance à 500+ groupes sans refonte architecturale, vérifié par tests de charge et analyse de schéma
