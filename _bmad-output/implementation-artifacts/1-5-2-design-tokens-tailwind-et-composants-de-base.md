# Story 1.5.2: Design tokens Tailwind et composants de base

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a développeur (Vincent),
I want implémenter les design tokens du UX Spec dans Tailwind CSS v4 et créer les composants UI de base réutilisables,
so that toutes les stories suivantes disposent d'un design system cohérent, thématisable et conforme au positionnement underground/anti-corporate de My Mood.

## Acceptance Criteria

1. **AC1 — Design tokens CSS implémentés** : Given le fichier `frontend/src/styles.css`, When je consulte les custom properties CSS, Then les tokens suivants sont définis : surfaces (`--surface-0` à `--surface-3`), textes (`--text-primary`, `--text-secondary`, `--text-muted`), bordures (`--border`, `--separator`), couleurs fonctionnelles (`--success`, `--warning`, `--error`, `--info`, `--online`, `--offline`), couleurs d'accent thématiques (`--accent-primary`, `--accent-secondary`, `--accent-glow`), couleurs d'humeur (`--mood-great` à `--mood-terrible`), bulles (`--bubble-self`, `--bubble-other`, `--system-message`), spacing (`--space-1` à `--space-12`), radius (`--radius-sm` à `--radius-full`), typographie (`--text-xs` à `--text-3xl`), And les valeurs dark mode correspondent exactement au UX Spec.

2. **AC2 — Thème "Bon Pote" par défaut** : Given l'application chargée, When aucun thème n'est sélectionné, Then le thème "Bon Pote" est appliqué par défaut avec `--accent-primary: #4ECDC4`, And le mode sombre est le mode natif, And les CSS custom properties sont bien consommées par Tailwind v4 via `@theme`.

3. **AC3 — Font Inter configurée** : Given l'application, When elle se charge, Then la font Inter (variable font) est importée depuis Google Fonts, And elle est configurée comme police par défaut dans Tailwind, And les graisses 400/500/600/700 sont disponibles.

4. **AC4 — Composant Button** : Given les 5 variantes de boutons (Primary, Secondary, Ghost, Danger, Icon-only), When chaque variante est rendue, Then elle respecte la hiérarchie du UX Spec (couleurs, radius-md, height 44px, touch target 44x44px), And la variante Primary utilise `--accent-primary`, And les hover/focus/disabled states sont implémentés, And `prefers-reduced-motion` est respecté.

5. **AC5 — Composant Input** : Given un champ de saisie, When il est rendu, Then il utilise `--surface-2` en fond, `--border` en bordure, `--text-primary` pour le texte, And les états focus (bordure `--accent-primary`), error (bordure `--error` + message inline), disabled sont implémentés, And le label est positionné au-dessus, And la taille minimale respecte 44px de hauteur.

6. **AC6 — Composant Card** : Given un conteneur card, When il est rendu, Then il utilise `--surface-1` en fond, `--radius-lg` en border-radius, `--space-4` en padding, And il supporte une variante elevated (`--surface-2`).

7. **AC7 — Composant NotificationToast** : Given une notification toast, When elle est déclenchée, Then elle apparaît en haut à droite (desktop) / haut centre (mobile), And elle supporte les variantes success/error/warning/info, And elle se ferme automatiquement après 5s, And elle est empilable (max 3 visibles), And elle utilise les couleurs fonctionnelles correspondantes.

8. **AC8 — Composant Modal (Confirmation)** : Given un modal de confirmation, When il est déclenché, Then un overlay assombri apparaît, And le contenu est centré, And les boutons "Annuler" / "Confirmer" sont présents, And Escape ferme le modal, And le clic sur le backdrop ferme le modal, And le focus est piégé dans le modal (CDK FocusTrap).

9. **AC9 — Angular CDK installé** : Given le projet frontend, When les composants sont buildés, Then `@angular/cdk` est installé comme dépendance, And les modules `OverlayModule`, `A11yModule`, `PortalModule` sont importables.

10. **AC10 — Tests des composants** : Given chaque composant créé, When les tests sont exécutés via `pnpm --filter frontend test`, Then chaque composant a un fichier `.spec.ts` avec au minimum : test de rendu par défaut, test des variantes, test d'accessibilité basique (aria labels, rôles), And tous les tests existants (43) continuent de passer.

11. **AC11 — Skeleton screen utilities** : Given les classes utilitaires skeleton, When elles sont appliquées à un élément, Then un effet shimmer horizontal (gradient animé 2s) est visible, And `prefers-reduced-motion` le remplace par un pulse opacity simple.

## Tasks / Subtasks

### Design Tokens & Configuration Tailwind

- [x] Task 1 — Implémenter les design tokens CSS (AC: #1, #2)
  - [x]Créer `frontend/src/styles/tokens/_base.css` avec les tokens invariants (surfaces, textes, bordures, fonctionnels, spacing, radius, typographie)
  - [x]Créer `frontend/src/styles/tokens/bon-pote.css` avec les tokens d'accent du thème "Bon Pote" (accent, mood, bulles, system-message)
  - [x]Mettre à jour `frontend/src/styles.css` pour importer les tokens avant `@import "tailwindcss"` et configurer le mapping `@theme` Tailwind v4
  - [x]Appliquer la classe `theme-bon-pote` sur le `<body>` dans `index.html` (thème par défaut)
  - [x]Vérifier que les CSS custom properties sont accessibles dans les utility classes Tailwind (ex: `bg-[var(--surface-0)]` ou mapping via `@theme`)

- [x] Task 2 — Configurer la font Inter (AC: #3)
  - [x]Ajouter le lien Google Fonts Inter (variable, wght 400..700) dans `frontend/src/index.html`
  - [x]Configurer Inter comme `font-family` par défaut dans le `@theme` Tailwind ou en CSS global
  - [x]Vérifier le rendu en 400, 500, 600, 700

### Composants UI de base

- [x] Task 3 — Installer Angular CDK (AC: #9)
  - [x]`pnpm --filter frontend add @angular/cdk`
  - [x]Vérifier que `OverlayModule`, `A11yModule`, `PortalModule` sont importables sans erreur de build

- [x] Task 4 — Créer le composant Button (AC: #4, #10)
  - [x]Créer `frontend/src/app/shared/ui/button/button.ts` — standalone component
  - [x]Inputs : `variant` ('primary' | 'secondary' | 'ghost' | 'danger' | 'icon-only'), `disabled`, `type` ('button' | 'submit'), `size` ('sm' | 'md' | 'lg')
  - [x]Styles via classes Tailwind consommant les design tokens
  - [x]Hover, focus (outline `--accent-primary` 2px offset 2px), disabled states
  - [x]Respect `prefers-reduced-motion` sur les transitions
  - [x]Créer `frontend/src/app/shared/ui/button/button.spec.ts` — tests de rendu, variantes, accessibilité

- [x] Task 5 — Créer le composant Input (AC: #5, #10)
  - [x]Créer `frontend/src/app/shared/ui/input/input.ts` — standalone component
  - [x]Inputs : `label`, `placeholder`, `type`, `error` (message d'erreur), `disabled`
  - [x]Label positionné au-dessus (block), input 44px height minimum
  - [x]États : default, focus (bordure `--accent-primary`), error (bordure `--error` + message), disabled
  - [x]Créer `frontend/src/app/shared/ui/input/input.spec.ts`

- [x] Task 6 — Créer le composant Card (AC: #6, #10)
  - [x]Créer `frontend/src/app/shared/ui/card/card.ts` — standalone component
  - [x]Inputs : `elevated` (boolean)
  - [x]Content projection via `<ng-content>`
  - [x]Fond `--surface-1` (default) ou `--surface-2` (elevated), radius-lg, padding space-4
  - [x]Créer `frontend/src/app/shared/ui/card/card.spec.ts`

- [x] Task 7 — Créer le composant NotificationToast (AC: #7, #10)
  - [x]Créer `frontend/src/app/shared/ui/toast/toast.ts` — standalone component
  - [x]Créer `frontend/src/app/shared/ui/toast/toast-container.ts` — orchestrateur de toasts (overlay CDK)
  - [x]Créer `frontend/src/app/core/services/toast.service.ts` — service injectable pour déclencher les toasts
  - [x]Variantes : success, error, warning, info avec icône et couleur fonctionnelle correspondante
  - [x]Auto-dismiss 5s, empilable (max 3), animation slide-in/slide-out
  - [x]Positionnement : haut-droite desktop, haut-centre mobile (via `BreakpointObserver`)
  - [x]Créer `frontend/src/app/shared/ui/toast/toast.spec.ts` et `toast-container.spec.ts`

- [x] Task 8 — Créer le composant Modal / ConfirmDialog (AC: #8, #10)
  - [x]Créer `frontend/src/app/shared/ui/modal/modal.ts` — standalone component
  - [x]Créer `frontend/src/app/core/services/modal.service.ts` — service injectable pour ouvrir des modals
  - [x]CDK Overlay centré + backdrop assombri (`rgba(0,0,0,0.6)`)
  - [x]CDK FocusTrap pour piéger le focus
  - [x]Escape et backdrop click ferment le modal
  - [x]Content projection pour le corps, slots pour titre et actions
  - [x]Méthode `confirm(title, message, confirmLabel?)` retournant `Observable<boolean>`
  - [x]Créer `frontend/src/app/shared/ui/modal/modal.spec.ts`

### Utilitaires de design system

- [x] Task 9 — Créer les utilitaires skeleton (AC: #11)
  - [x]Ajouter dans `frontend/src/styles.css` ou fichier dédié : classe `.skeleton` avec animation shimmer (gradient linéaire gauche→droite, 2s infinite)
  - [x]Variante `prefers-reduced-motion` : opacity pulse simple
  - [x]Classes utilitaires : `.skeleton-text` (hauteur 1em, radius-sm), `.skeleton-circle` (ratio 1:1, radius-full), `.skeleton-rect` (ratio libre)

### Validation

- [x] Task 10 — Tests et vérification globale (AC: #10)
  - [x]`pnpm --filter frontend test` — tous les tests passent (43 existants + nouveaux)
  - [x]Build production `pnpm --filter frontend build` — aucune erreur
  - [x]Vérification visuelle : les tokens sont effectivement appliqués (fond sombre, accent teal, font Inter)

## Dev Notes

### Tailwind CSS v4 — Configuration par CSS, pas par JS

**CRITIQUE :** Ce projet utilise **Tailwind CSS v4** (`tailwindcss: ^4.1.18`). En v4, la configuration se fait **dans le CSS**, PAS dans un fichier `tailwind.config.ts` ou `.js`. Le fichier actuel `styles.css` contient uniquement `@import "tailwindcss"`.

**Architecture Tailwind v4 pour les design tokens :**

```css
/* frontend/src/styles.css */
@import "tailwindcss";

/* Import des tokens */
@import "./styles/tokens/_base.css";
@import "./styles/tokens/bon-pote.css";

/* Mapping tokens → Tailwind via @theme */
@theme {
  --color-surface-0: var(--surface-0);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  --color-text-primary: var(--text-primary);
  --color-accent-primary: var(--accent-primary);
  /* etc. — permet d'utiliser bg-surface-0, text-text-primary, etc. */

  --font-sans: 'Inter', sans-serif;

  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --radius-full: var(--radius-full);
}
```

**ATTENTION aux noms de tokens :** Tailwind v4 utilise le préfixe `--color-*` pour les couleurs, `--font-*` pour les fonts, `--radius-*` pour les radius. Les CSS custom properties définies dans les tokens (`--surface-0`, etc.) doivent être mappées vers les namespace Tailwind dans `@theme`.

**Alternative plus simple :** Au lieu du mapping `@theme`, utiliser directement les CSS vars dans les classes : `bg-[var(--surface-0)]`, `text-[var(--text-primary)]`. C'est plus verbeux mais évite la couche de mapping. **Choisir une approche et s'y tenir.**

### Tokens du UX Spec — Valeurs exactes

**Palette surfaces (dark mode, invariant entre thèmes) :**

| Token | Valeur | Usage |
|-------|--------|-------|
| `--surface-0` | `#0f0f0f` | Background principal |
| `--surface-1` | `#1a1a1a` | Panneaux, cards |
| `--surface-2` | `#242424` | Éléments surélevés (input, modals) |
| `--surface-3` | `#2e2e2e` | Hover states |
| `--text-primary` | `#f0f0f0` | Texte principal |
| `--text-secondary` | `#a0a0a0` | Texte secondaire |
| `--text-muted` | `#666666` | Timestamps, métadonnées |
| `--border` | `#2a2a2a` | Bordures subtiles |
| `--separator` | `#1f1f1f` | Séparateurs |

**Couleurs fonctionnelles (invariantes) :**

| Token | Valeur |
|-------|--------|
| `--success` | `#4CAF50` |
| `--warning` | `#FFC107` |
| `--error` | `#F44336` |
| `--info` | `#2196F3` |
| `--online` | `#4CAF50` |
| `--offline` | `#666666` |

**Thème "Bon Pote" (défaut) :**

| Token | Valeur |
|-------|--------|
| `--accent-primary` | `#4ECDC4` |
| `--accent-secondary` | `#45B7AA` |
| `--accent-glow` | `#4ECDC440` |
| `--mood-great` | `#4ECDC4` |
| `--mood-good` | `#7ED68A` |
| `--mood-neutral` | `#FFD93D` |
| `--mood-bad` | `#FF8C42` |
| `--mood-terrible` | `#FF6B6B` |
| `--bubble-self` | `#1a3a36` |
| `--bubble-other` | `#242424` |
| `--system-message` | `#1a1a2e` |

**Spacing (multiples de 4px) :**

| Token | Valeur |
|-------|--------|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |

**Border radius :**

| Token | Valeur |
|-------|--------|
| `--radius-sm` | `4px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-xl` | `16px` |
| `--radius-full` | `9999px` |

**Type scale (Inter, base 16px, ratio Major Third 1.25) :**

| Token | Taille | Graisse |
|-------|--------|---------|
| `--text-xs` | `0.75rem` (12px) | 400 |
| `--text-sm` | `0.875rem` (14px) | 400 |
| `--text-base` | `1rem` (16px) | 400 |
| `--text-lg` | `1.125rem` (18px) | 500 |
| `--text-xl` | `1.25rem` (20px) | 600 |
| `--text-2xl` | `1.5rem` (24px) | 700 |
| `--text-3xl` | `1.875rem` (30px) | 700 |

**Line heights :** Corps 1.5, titres 1.2, messages chat 1.4.

### Hiérarchie des boutons (UX Spec)

| Niveau | Fond | Texte | Bordure | Height |
|--------|------|-------|---------|--------|
| Primary | `--accent-primary` | blanc | — | 44px |
| Secondary | transparent | `--accent-primary` | `--accent-primary` | 44px |
| Ghost | transparent | `--text-secondary` | — | 44px |
| Danger | `--error` | blanc | — | 44px |
| Icon-only | transparent | `--text-secondary` | — | 44px (zone tap) |

Focus visible : `outline: 2px solid var(--accent-primary); outline-offset: 2px;`
Hover Primary : légère luminosité/saturation accrue.
Hover Ghost : fond `--surface-3`.

### Angular CDK — Modules nécessaires

- `OverlayModule` — pour toast container et modal
- `A11yModule` — `FocusTrap`, `FocusMonitor` pour modal et composants interactifs
- `PortalModule` — pour projeter les toasts et modals dans le DOM overlay
- `BreakpointObserver` — pour positionner le toast (desktop vs mobile)

**Installation :** `pnpm --filter frontend add @angular/cdk`

**ATTENTION version :** Installer la version compatible avec Angular 21. Le CDK doit être de la même version majeure que `@angular/core` (~21.x).

### Conventions Angular établies

- **Standalone components uniquement** — pas de NgModule
- **Angular 21 naming** — fichiers sans suffixe `.component` (ex: `button.ts`, pas `button.component.ts`)
- **Signals** pour l'état réactif
- **Vitest** pour les tests (pas Jest) — le runner est `@angular/build:unit-test`
- **Fichiers HTML séparés** ou inline selon la taille — les composants existants utilisent les deux patterns
- **Input signals** : utiliser `input()` et `input.required()` d'Angular 21 (pas `@Input()`)

### Patterns de la story 1-5-1 à ne PAS casser

- **NestJS ESM strict** : `"type": "module"`, extensions `.js`, tsc-alias prod uniquement
- **Prisma 7 Driver Adapters** : `@prisma/adapter-pg` + `pg.Pool`
- **Zod 4 partagé** : schemas dans `shared/schemas/`
- **JWT hybride** : access token in-memory, refresh httpOnly cookie
- **ResponseWrapperInterceptor** : auto-wrap `{ data }`
- **refreshInterceptor** : closure pattern `createRefreshState()`
- **Jest 30 ESM** côté backend : `--experimental-vm-modules`

### Fichiers créés/modifiés par cette story

| Fichier | Action | Notes |
|---------|--------|-------|
| `frontend/src/styles/tokens/_base.css` | NEW | Tokens invariants (surfaces, textes, spacing, radius, typo) |
| `frontend/src/styles/tokens/bon-pote.css` | NEW | Tokens thème "Bon Pote" (accents, humeurs, bulles) |
| `frontend/src/styles.css` | MODIFIED | Import tokens + config @theme Tailwind v4 + skeleton utils |
| `frontend/src/index.html` | MODIFIED | Google Fonts Inter + classe theme-bon-pote sur body |
| `frontend/src/app/shared/ui/button/button.ts` | NEW | Composant bouton |
| `frontend/src/app/shared/ui/button/button.spec.ts` | NEW | Tests bouton |
| `frontend/src/app/shared/ui/input/input.ts` | NEW | Composant input |
| `frontend/src/app/shared/ui/input/input.spec.ts` | NEW | Tests input |
| `frontend/src/app/shared/ui/card/card.ts` | NEW | Composant card |
| `frontend/src/app/shared/ui/card/card.spec.ts` | NEW | Tests card |
| `frontend/src/app/shared/ui/toast/toast.ts` | NEW | Composant toast |
| `frontend/src/app/shared/ui/toast/toast-container.ts` | NEW | Orchestrateur toasts |
| `frontend/src/app/shared/ui/toast/toast.spec.ts` | NEW | Tests toast |
| `frontend/src/app/shared/ui/toast/toast-container.spec.ts` | NEW | Tests toast container |
| `frontend/src/app/shared/ui/modal/modal.ts` | NEW | Composant modal |
| `frontend/src/app/shared/ui/modal/modal.spec.ts` | NEW | Tests modal |
| `frontend/src/app/core/services/toast.service.ts` | NEW | Service de notification toast |
| `frontend/src/app/core/services/modal.service.ts` | NEW | Service de modal/confirmation |
| `frontend/package.json` | MODIFIED | Ajout @angular/cdk |

**Fichiers qui ne doivent PAS être modifiés :**
- `backend/**` — cette story est 100% frontend
- `shared/**` — aucun schéma partagé impacté
- `frontend/src/app/core/interceptors/*` — les interceptors restent intacts
- `frontend/src/app/core/auth/*` — le service auth reste intact
- `frontend/src/app/features/auth/*` — les pages login/register ne sont PAS restylées dans cette story (c'est Story 1.5.3)
- `frontend/src/app/features/account/*` — les pages account ne sont PAS restylées dans cette story (c'est Story 1.5.3)

### Structure cible après cette story

```
frontend/src/
├── index.html                    # MODIFIED (Inter font, theme-bon-pote)
├── styles.css                    # MODIFIED (tokens + @theme + skeleton)
├── styles/
│   └── tokens/
│       ├── _base.css             # NEW — tokens invariants
│       └── bon-pote.css          # NEW — thème Bon Pote
├── app/
│   ├── shared/
│   │   └── ui/
│   │       ├── button/
│   │       │   ├── button.ts     # NEW
│   │       │   └── button.spec.ts
│   │       ├── input/
│   │       │   ├── input.ts      # NEW
│   │       │   └── input.spec.ts
│   │       ├── card/
│   │       │   ├── card.ts       # NEW
│   │       │   └── card.spec.ts
│   │       ├── toast/
│   │       │   ├── toast.ts      # NEW
│   │       │   ├── toast-container.ts
│   │       │   ├── toast.spec.ts
│   │       │   └── toast-container.spec.ts
│   │       └── modal/
│   │           ├── modal.ts      # NEW
│   │           └── modal.spec.ts
│   └── core/
│       └── services/
│           ├── toast.service.ts  # NEW
│           └── modal.service.ts  # NEW
```

### Project Structure Notes

- Les composants UI vont dans `shared/ui/` conformément à l'architecture du UX Spec
- Chaque composant = 1 dossier avec `.ts` + `.spec.ts` (+ `.html` si template volumineux)
- Les services d'orchestration (toast, modal) vont dans `core/services/`
- La structure `styles/tokens/` prépare l'ajout de futurs thèmes (syndique.css, vacancier.css, etc.)

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color System] — Palette complète surfaces, fonctionnels, thématiques
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography System] — Inter, type scale, graisses, line heights
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Spacing & Layout Foundation] — Échelle spacing 4px, radius, breakpoints
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation] — Architecture CSS tokens + Tailwind
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Button Hierarchy] — Variantes boutons, règles, touch targets
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns] — Toast patterns, loading, skeleton
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Modal & Overlay Patterns] — CDK Overlay, focus trap, backdrop
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Accessibility Considerations] — WCAG AA, focus visible, prefers-reduced-motion
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy] — Architecture des composants, CDK primitives
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design Direction Decision] — Sobre + touches d'accent retenu
- [Source: _bmad-output/implementation-artifacts/epic-1-retro-2026-02-13.md#Décision 1] — Scope Story 1.5.2
- [Source: _bmad-output/implementation-artifacts/1-5-1-fix-tsc-alias-et-stabilisation-infra-dev.md#Dev Notes] — Patterns établis à ne pas casser

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Aucun incident de debug notable.

### Completion Notes List

- **Task 1-2** : Design tokens CSS implémentés dans `styles/tokens/_base.css` (tokens invariants : surfaces, textes, bordures, fonctionnels, spacing, radius, typographie) et `styles/tokens/bon-pote.css` (thème "Bon Pote" : accents, humeurs, bulles). Mapping `@theme` Tailwind v4 configuré dans `styles.css`. Font Inter importée depuis Google Fonts. Classe `theme-bon-pote` appliquée sur `<body>`.
- **Task 3** : `@angular/cdk` installé — OverlayModule, A11yModule, PortalModule disponibles.
- **Task 4** : Composant `ButtonComponent` — 5 variantes (primary, secondary, ghost, danger, icon-only), 3 tailles (sm, md, lg), focus-visible avec outline accent-primary, `prefers-reduced-motion` respecté. 18 tests.
- **Task 5** : Composant `InputComponent` — Label positionné au-dessus, 44px minimum, états focus/error/disabled, aria-invalid + aria-describedby pour l'accessibilité. 16 tests.
- **Task 6** : Composant `CardComponent` — Fond surface-1 (défaut) ou surface-2 (elevated), content projection via ng-content. 7 tests.
- **Task 7** : Composant `ToastComponent` + `ToastContainerComponent` + `ToastService` — 4 variantes (success/error/warning/info), auto-dismiss 5s, max 3 visibles, top-right desktop / top-center mobile via BreakpointObserver. 18 tests.
- **Task 8** : Composant `ModalComponent` + `ModalService` — Overlay backdrop sombre, CDK FocusTrap, Escape + backdrop click ferment, boutons Annuler/Confirmer, confirm() retourne Observable<boolean>. 14 tests.
- **Task 9** : Classes utilitaires skeleton : `.skeleton` (shimmer gradient 2s), `.skeleton-text`, `.skeleton-circle`, `.skeleton-rect`. `prefers-reduced-motion` => pulse opacity.
- **Task 10** : 116 tests passent (43 existants + 73 nouveaux), build production réussi.

### File List

**Nouveaux fichiers :**
- `frontend/src/styles/tokens/_base.css` — Tokens invariants
- `frontend/src/styles/tokens/bon-pote.css` — Thème "Bon Pote"
- `frontend/src/app/shared/ui/button/button.ts` — Composant Button
- `frontend/src/app/shared/ui/button/button.spec.ts` — Tests Button
- `frontend/src/app/shared/ui/input/input.ts` — Composant Input
- `frontend/src/app/shared/ui/input/input.spec.ts` — Tests Input
- `frontend/src/app/shared/ui/card/card.ts` — Composant Card
- `frontend/src/app/shared/ui/card/card.spec.ts` — Tests Card
- `frontend/src/app/shared/ui/toast/toast.ts` — Composant Toast
- `frontend/src/app/shared/ui/toast/toast-container.ts` — Toast Container
- `frontend/src/app/shared/ui/toast/toast.spec.ts` — Tests Toast
- `frontend/src/app/shared/ui/toast/toast-container.spec.ts` — Tests Toast Container
- `frontend/src/app/shared/ui/modal/modal.ts` — Composant Modal
- `frontend/src/app/shared/ui/modal/modal.spec.ts` — Tests Modal
- `frontend/src/app/core/services/toast.service.ts` — Service Toast
- `frontend/src/app/core/services/modal.service.ts` — Service Modal

**Fichiers modifiés :**
- `frontend/src/styles.css` — Import tokens + @theme Tailwind v4 + skeleton utilities
- `frontend/src/index.html` — Google Fonts Inter + classe theme-bon-pote sur body
- `frontend/package.json` — Ajout @angular/cdk

### Change Log

- 2026-02-17 : Implémentation complète du design system — design tokens CSS (surfaces, textes, fonctionnels, spacing, radius, typo), thème "Bon Pote" par défaut, mapping Tailwind v4 @theme, font Inter, 5 composants UI de base (Button, Input, Card, Toast, Modal), services d'orchestration (ToastService, ModalService), utilitaires skeleton. 73 nouveaux tests, 116 total, build production OK.
