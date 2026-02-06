# My Mood — Guide Projet

## Vision

Transformer une application "délire entre collègues" de suivi d'humeur en un **produit SaaS B2B** commercialisable. Positionnement : **"Le babyfoot numérique pour équipes distribuées"** — un outil de cohésion d'équipe quotidien, PAS un outil de surveillance RH.

**Pitch :** "Vos équipes distribuées ont perdu la machine à café. My Mood la remplace."

**Branding :** "By employees, for employees" — direction artistique underground/fun, ton décalé. Le produit ne doit JAMAIS ressembler à un outil RH corporate.

## Architecture Fondamentale — Le Modèle "Dual Face"

**PRINCIPE CARDINAL :** Deux espaces hermétiquement cloisonnés avec une muraille de Chine entre les données.

### Espace Equipe (Safe Zone)
- Grille d'humeur interactive (personnalisable par équipe)
- Messagerie informelle avec rooms (confidentialité architecturale)
- Mood Bot IA (personnalité configurable par équipe)
- Mini-défi quotidien (image customisable)
- Courbes d'humeur personnelles + médiane d'équipe
- Sondages d'équipe

**REGLE ABSOLUE :** Le manager n'a AUCUNE visibilité sur cet espace. Les données de la safe zone ne remontent JAMAIS. Cette séparation doit être architecturale (RLS Postgres, modules NestJS séparés), pas juste cosmétique.

### Espace Manager (Outils de cohésion)
- Organisation d'événements + album photo souvenir
- Sondages manager (anonymes ou non)
- Challenges & objectifs d'équipe
- Team Wrapped annuel (bilan fun façon Spotify Wrapped)

### Le Pont — Signal "Opt-in"
Le seul lien entre les deux espaces : un bouton "J'ai besoin d'en parler" initié VOLONTAIREMENT par l'employé. Le manager ne surveille pas, il reçoit des signaux volontaires.

## Tension Fondamentale — Fun vs. Flicage

Chaque feature, chaque décision de design doit être évaluée à travers ce prisme :
- **La valeur utilisateur** (espace informel, humour, safe zone) est en opposition directe avec la **valeur acheteur** (analytics, suivi)
- L'ajout de fonctionnalités de surveillance risque de détruire la confiance et donc l'adoption
- L'anonymisation dans les petites équipes (5-6 personnes) est une illusion
- La confiance se construit par le **signal culturel** (branding, ton, storytelling), pas par des pages légales

**Résolution :** Architecture Dual Face + adoption bottom-up (on ne vend jamais au manager, les employés adoptent d'abord puis l'entreprise formalise).

## Stack Technique

```
Frontend:  Angular 19+ (standalone components, signals, PWA, responsive-first)
Backend:   NestJS (TypeScript, modules, guards, interceptors)
BDD:       PostgreSQL (Row Level Security pour multi-tenancy)
ORM:       Prisma
Temps réel: SSE par défaut (broadcast serveur→client) — WebSocket (Socket.io) uniquement pour la messagerie
Stockage:  Cloudflare R2 (compatible S3, zéro frais de bande passante sortante)
Auth:      JWT + Passport.js (SSO Auth0/Keycloak prévu pour plan Business)
AI:        API Claude ou OpenAI (modèle léger pour mood bot)
Infra:     Docker + Hetzner VPS (scale cloud plus tard)
```

### Principes techniques
- **Multi-tenancy** via RLS Postgres — cloisonnement au niveau le plus bas
- **Modules NestJS séparés** : SafeZone, ManagerSpace, Messaging, Auth — le cloisonnement dual-face est architectural
- **SSE partout sauf messagerie** — traverse les proxies d'entreprise, moins coûteux que WebSocket
- **PWA responsive-first** — installable sans stores, mode mobile allégé pour check-in rapide
- **Lazy loading agressif** par module Angular (safe zone / manager / messaging)

## Business Model — Freemium Bottom-Up

Adoption par les employés (gratuit), monétisation par l'upgrade (Team/Business).

| | Free | Team (~3-4 EUR/user/mois) | Business (~6-8 EUR/user/mois) |
|---|------|------|----------|
| Utilisateurs | 5-6 max | Illimité | Illimité + multi-équipes |
| Humeurs | Grille par défaut | Custom complet | Custom + templates sectoriels |
| Messagerie | 90 jours, 500 Mo | Illimité | Illimité + E2E |
| Mood Bot | Standard | Personnalisable | Multi-personnalités |
| Mini-défi | Image par défaut | Image custom + historique | Défis custom manager |
| Courbe humeur | 30 jours | Illimité + export | Illimité + export |
| Événements + Album | Non | Oui | Oui + intégrations agenda |
| Sondages manager | Non | Basique | Avancé + anonyme |
| Challenges manager | Non | Non | Oui |
| Team Wrapped | Aperçu flouté | Complet | Complet + export PDF |
| SSO / AD | Non | Non | Oui |
| Signal "Besoin d'aide" | Oui | Oui | Oui + routing manager |

## Roadmap

### MVP (Phase 1) — "La Safe Zone qui marche"
Infra de base, Auth JWT, Création d'espace/invitation, Grille d'humeur + SSE, Historique 30 jours + médiane, Onboarding guidé, Notifications push PWA.

### V1.0 (Phase 2) — "L'engagement quotidien"
Messagerie avec rooms (WebSocket), Mini-défi quotidien, Mood Bot basique, Sondages équipe, Stockage fichiers R2.
**=> Lancement du plan gratuit public.**

### V1.5 (Phase 3) — "Le déclencheur payant"
Humeurs custom, Mood Bot personnalisable, Mini-défi custom, Historique illimité + export, Messagerie illimitée, Signal "J'ai besoin d'en parler".
**=> Premiers revenus.**

### V2.0 (Phase 4) — "L'espace Manager"
Espace Manager séparé, Événements + album souvenir, Sondages manager, Challenges d'équipe, Multi-équipes.
**=> Plan Business vendable.**

### V3.0 (Phase 5) — "L'enterprise"
SSO/AD, Team Wrapped annuel, E2E encryption, Intégrations agenda, Templates sectoriels.

## Features ABANDONNEES (de l'app d'origine)

Ne PAS réimplémenter :
- Jeux (morpion, pong) — jamais utilisés
- Météo — gadget cosmétique sans valeur produit
- Titre dynamique (heures de travail) — trop spécifique
- Countdown GTA 6 — blague interne
- "Où est la teub" — le MECANISME (mini-défi quotidien) est gardé, le THEME est remplacé par quelque chose de soft et customisable

## Conventions de développement

- **Langue du code :** Anglais (noms de variables, fonctions, commentaires techniques)
- **Langue du produit :** Français pour le contenu utilisateur par défaut, mais prévoir l'internationalisation
- **Langue de communication :** Français (Vincent est francophone)

## Documents de référence

- Session de brainstorming complète : `_bmad-output/brainstorming/brainstorming-session-2026-02-06.md`
