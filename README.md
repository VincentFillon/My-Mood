# My Mood

**Le babyfoot numerique pour les equipes distribuees.**

My Mood est une plateforme SaaS B2B de cohesion d'equipe. Un espace informel et fun ou les collaborateurs partagent leur humeur du jour, echangent librement et creent des rituels quotidiens qui renforcent les liens — meme a distance.

> Vos equipes distribuees ont perdu la machine a cafe. My Mood la remplace.

---

## Le concept

Dans un open space, on lit naturellement l'ambiance : un collegue qui soupire, un autre qui rigole, un cafe partage apres une reunion difficile. En remote ou en hybride, ces micro-interactions disparaissent.

My Mood les recree numeriquement a travers :

- **Une grille d'humeur interactive** — Chaque membre de l'equipe se positionne dans une humeur, visible par tous. Un geste simple qui donne le ton avant d'entamer une discussion.
- **Des courbes d'humeur** — Historique personnel et median d'equipe pour suivre l'evolution du moral collectif.
- **Une messagerie informelle** — Un espace d'echange decontracte, a cote des canaux officiels.
- **Un bot IA** — Un compagnon qui reagit aux changements d'humeur avec humour et personnalite.
- **Un mini-defi quotidien** — Un rituel ludique pour creer de l'engagement et un classement amical.

---

## Architecture — Le modele "Dual Face"

My Mood repose sur un principe fondamental : **la confiance des utilisateurs**.

Le produit est compose de deux espaces hermetiquement cloisonnes :

```
+-------------------------------+       +-------------------------------+
|        ESPACE EQUIPE          |       |       ESPACE MANAGER          |
|         (Safe Zone)           |       |    (Outils de cohesion)       |
|                               |       |                               |
|  Grille d'humeur              |       |  Organisation d'evenements    |
|  Messagerie informelle        |       |  Album souvenir d'equipe      |
|  Mood Bot IA                  |       |  Sondages & pulse checks      |
|  Mini-defi quotidien          |       |  Challenges d'equipe          |
|  Courbes d'humeur             |       |  Team Wrapped annuel          |
|  Sondages d'equipe            |       |                               |
+-------------------------------+       +-------------------------------+
        |                                           ^
        |        Signal volontaire                  |
        +------- "J'ai besoin d'en parler" --------+
                 (initie par l'employe)
```

**Le manager n'a aucune visibilite sur la Safe Zone.** Le seul pont entre les deux espaces est un signal volontaire, initie par l'employe. Ce cloisonnement est architectural (base de donnees, API, modules), pas juste cosmétique.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Angular 19+ (standalone, signals, PWA) |
| Backend | NestJS (TypeScript) |
| Base de donnees | PostgreSQL (Row Level Security) |
| ORM | Prisma |
| Temps reel | SSE (broadcast) + WebSocket (messagerie) |
| Stockage | Cloudflare R2 |
| Auth | JWT / Passport.js |
| AI | API Claude / OpenAI |
| Infra | Docker + Hetzner VPS |

---

## Business model

Adoption bottom-up en freemium : les equipes adoptent gratuitement, l'entreprise formalise en payant.

| | Free | Team | Business |
|---|:---:|:---:|:---:|
| Utilisateurs | 5-6 max | Illimite | Illimite + multi-equipes |
| Humeurs custom | - | Oui | Oui + templates |
| Messagerie | 90 jours | Illimitee | Illimitee + E2E |
| Mood Bot perso | - | Oui | Multi-personnalites |
| Mini-defi custom | - | Oui | Oui |
| Historique humeur | 30 jours | Illimite | Illimite + export |
| Evenements + Album | - | Oui | Oui + agenda |
| Sondages manager | - | Basique | Avance |
| Team Wrapped | Apercu | Complet | Complet + PDF |
| SSO / AD | - | - | Oui |

---

## Roadmap

| Phase | Nom | Objectif |
|-------|-----|----------|
| MVP | La Safe Zone qui marche | Grille d'humeur + historique + onboarding |
| V1.0 | L'engagement quotidien | Messagerie + mini-defi + mood bot |
| V1.5 | Le declencheur payant | Features premium + premiers revenus |
| V2.0 | L'espace Manager | Evenements, sondages, challenges |
| V3.0 | L'enterprise | SSO, Team Wrapped, E2E, integrations |

---

## Developpement

### Prerequisites

- Node.js 20+ LTS
- Docker & Docker Compose
- pnpm 10+

### Installation et premier lancement

```bash
# 1. Cloner le repo et installer les dependances
git clone <repo-url>
cd my-mood

# 2. Creer le fichier .env a partir du template
cp .env.example .env

# 3. Installer les dependances frontend
cd frontend
pnpm install
cd ..

# 4. Installer les dependances backend
cd backend
pnpm install
cd ..

# 5. Demarrer PostgreSQL via Docker
docker compose up -d postgres

# 6. Executer la migration initiale Prisma (OBLIGATOIRE au premier lancement)
cd backend
npx prisma migrate dev --name init
cd ..

# 7. Demarrer le backend en watch mode
cd backend
pnpm start:dev
# Le backend sera accessible sur http://localhost:3000

# 8. Dans un autre terminal, demarrer le frontend
cd frontend
pnpm start
# Le frontend sera accessible sur http://localhost:4200
```

### Workflow de developpement quotidien

```bash
# Demarrer tous les services (PostgreSQL uniquement)
docker compose up -d postgres

# Backend (terminal 1)
cd backend && pnpm start:dev

# Frontend (terminal 2)
cd frontend && pnpm start
```

### Build de production avec Docker

```bash
# Build et demarrage complet via Docker Compose
docker compose up --build
```

### Notes importantes

- **Prisma migrations**: La commande `prisma migrate dev --name init` doit etre executee manuellement au premier setup car l'environnement sandbox ne peut pas acceder au PostgreSQL Docker.
- **Shared folder**: Le dossier `shared/` contient les types et schemas partages entre frontend et backend, resolus via `tsconfig paths`.
- **Hot reload**: Les deux projets (frontend et backend) supportent le hot reload en developpement.

---

## Licence

Projet prive — Tous droits reserves.
