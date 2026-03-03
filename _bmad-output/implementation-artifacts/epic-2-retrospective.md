---
epic: 2
title: "Création de Groupe & Invitations"
status: done
date: "2026-03-03"
---

# Retrospective: Epic 2 - Création de Groupe & Invitations

## 1. Ce qui a bien fonctionné (What went well)
- La mise en place du RLS (Row-Level Security) via PostgreSQL s'est avérée être un choix architectural robuste pour garantir l'isolation stricte des données entre les groupes sans alourdir la logique applicative.
- L'utilisation des signaux (`Signals`) Angular couplée aux interceptors a permis de gérer proprement les redirections et l'état de l'authentification (ex: token d'invitation conservé pendant l'inscription).
- Les tests E2E ont permis d'identifier une faille critique de suppression de groupe (qui avait été oubliée dans le périmètre initial des stories) de manière proactive.

## 2. Ce qui doit être amélioré (What needs improvement)
- **Oublis lors de la phase de conception (PRD/Stories)** :
  - La fonctionnalité de suppression des données liées au groupe lorsqu'un utilisateur quitte ce dernier n'était pas complètement décrite (oubli de la suppression des `Mood` et `Message`).
  - L'architecture UI/UX n'a pas été systématiquement contrainte au Design System créé lors de l'Epic 1.5. Les LLM ont produit du code HTML/Tailwind brut au lieu d'utiliser `<app-card>`, `<app-button>`, etc.

## 3. Décisions Clés (Key Decisions)
- Les imports utilisant l'alias `@shared` nécessitaient des ajustements dans les options de compilation et les chemins relatifs. Nous avons stabilisé `tsconfig.json` pour pointer sur `../shared/*` depuis le frontend.
- Le paramètre "Safe Zone" a été renforcé : un utilisateur doit explicitement pouvoir gérer ses données (quitter un groupe -> hard delete de ses moods locaux au groupe).

## 4. Plan d'Action pour l'Epic Suivant (Next Epic Action Items)
**Concerne l'Epic 3 : Grille d'Humeur & Interactions Sociales**

- **UX/UI & Design System** : L'interface visuelle est le cœur du produit. Pour les composants complexes à venir (MoodRibbon, OrbitalGrid), le design (ergonomie, lisibilité immédiate) doit primer.
  - **ACTION** : Dès l'écriture des Stories 3.x, ajouter des contraintes techniques strictes exigeant l'utilisation des composants réutilisables du dossier `shared/ui` (`app-button`, `app-card`, etc.).
  - **ACTION** : Maximiser l'accessibilité de l'information (humeurs et messages visibles d'un coup d'œil sans clics superflus).
- **Temps Réel (SSE)** : Appliquer la stratégie de reconnexion robuste (backoff) étudiée dans l'architecture.

## 5. Conclusion
L'Epic 2 vient clore les fonctionnalités "administratives" de la plateforme (Auth & Gestion de locataires). La fondation est solide. L'Epic 3 constituera le premier vrai test de la promesse produit : l'interaction sociale et la restitution de l'humeur.
