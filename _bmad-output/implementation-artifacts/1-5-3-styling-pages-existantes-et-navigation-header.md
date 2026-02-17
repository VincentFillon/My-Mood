# Story 1.5.3: Styling pages existantes et navigation header

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur de My Mood (et Vincent en tant que développeur),
I want que toutes les pages existantes (register, login, account, profile-editor) soient restylées selon le design system et qu'un header de navigation avec avatar et menu compte soit implémenté,
so that l'application présente une expérience visuelle cohérente, underground/fun, responsive mobile-first, conforme au UX Spec et au positionnement "anti-corporate" de My Mood.

## Acceptance Criteria

1. **AC1 — Page Register restylée** : Given la page `/register`, When elle est affichée, Then elle utilise les composants `CardComponent`, `InputComponent` et `ButtonComponent` du design system, And le layout est centré verticalement et horizontalement avec max-width 400px (desktop) / full-width (mobile), And le fond est `--surface-0`, la card est `--surface-1` avec `--radius-xl`, And le titre "Rejoins My Mood" est en `--text-2xl` weight 700, And les erreurs de validation s'affichent inline sous chaque champ en `--text-xs` couleur `--error`, And un lien "Déjà un compte ? Connecte-toi" en variante Ghost redirige vers `/login`, And les hardcoded hex colors (#6c63ff, etc.) sont remplacées par des design tokens.

2. **AC2 — Page Login restylée** : Given la page `/login`, When elle est affichée, Then elle suit les mêmes patterns que la page Register (composants UI, design tokens, layout centré), And le titre est "Connecte-toi", And le bouton principal est "Se connecter", And un lien "Pas encore de compte ? Rejoins-nous" redirige vers `/register`, And les erreurs serveur s'affichent via NotificationToast (variante error, 5s auto-dismiss).

3. **AC3 — Page Account restylée** : Given la page `/account`, When elle est affichée, Then les sections sont organisées en `CardComponent` séparées (Profil, Sécurité, Zone Danger), And les couleurs hardcodées (#3b82f6, #334155, etc.) sont remplacées par les design tokens, And le titre "Mon compte" est en `--text-2xl` weight 700, And les boutons utilisent `ButtonComponent` avec les variantes appropriées (Primary pour sauvegarder, Danger pour supprimer), And le layout est max-width 600px (desktop) / full-width (mobile) avec padding `--space-6` / `--space-4`.

4. **AC4 — Profile Editor restylé** : Given le composant d'édition de profil/avatar, When il est affiché, Then les couleurs hardcodées sont remplacées par des design tokens, And l'avatar est affiché dans un cadre circulaire utilisant le composant `AvatarComponent`, And le bouton d'upload utilise `ButtonComponent` variante Secondary.

5. **AC5 — Composant Avatar** : Given le composant Avatar, When il est rendu, Then il supporte les tailles xs (24px), sm (32px), md (40px), lg (48px), xl (64px), And il affiche l'image de profil en crop circulaire (`border-radius: 50%`), And en l'absence d'image il affiche les initiales de l'utilisateur sur fond `--accent-primary`, And il supporte un indicateur de statut optionnel (online/offline dot).

6. **AC6 — Header/Navigation** : Given un utilisateur authentifié, When il navigue dans l'app, Then un header fixe de 48px (`--space-12`) est affiché en haut avec fond `--surface-1` et bordure basse `--border`, And le logo "My Mood" est à gauche en `--text-lg` weight 600 cliquable vers `/`, And l'avatar de l'utilisateur (taille md, 40px) est à droite, And le clic sur l'avatar ouvre un menu dropdown via CDK Menu.

7. **AC7 — Menu dropdown compte** : Given le menu dropdown ouvert, When l'utilisateur interagit, Then il affiche le nom et l'email de l'utilisateur en en-tête, And un item "Mon compte" navigue vers `/account`, And un item "Déconnexion" en couleur `--error` appelle `authService.logout()`, And Escape et clic extérieur ferment le menu, And le menu utilise `CdkMenu`/`CdkMenuTrigger` avec navigation clavier (flèches, Enter), And le fond est `--surface-1`, bordure `--border`, radius `--radius-md`, largeur min 200px.

8. **AC8 — Responsive mobile-first** : Given un écran mobile (<640px), When les pages sont affichées, Then les cards auth sont full-width avec padding `--space-4`, And le header conserve sa hauteur 48px avec logo et avatar, And la page Account est full-width sans max-width, And tous les touch targets font minimum 44x44px.

9. **AC9 — Accessibilité** : Given les composants modifiés/créés, When ils sont utilisés au clavier ou lecteur d'écran, Then le focus visible utilise `outline: 2px solid var(--accent-primary); outline-offset: 2px`, And le menu dropdown a `role="menu"` avec `role="menuitem"` sur les items, And tous les champs de formulaire ont des `<label>` associés et `aria-describedby` pour les erreurs, And `prefers-reduced-motion` désactive les animations non-essentielles.

10. **AC10 — Tests** : Given les modifications apportées, When `pnpm --filter frontend test` est exécuté, Then tous les 155 tests existants continuent de passer, And les nouveaux composants (Avatar, Header, Menu) ont des tests couvrant : rendu par défaut, variantes/tailles, accessibilité (aria), And le build production `pnpm --filter frontend build` réussit sans erreur.

## Tasks / Subtasks

### Nouveaux composants réutilisables

- [ ] Task 1 — Créer le composant Avatar (AC: #5, #10)
  - [ ] Créer `frontend/src/app/shared/ui/avatar/avatar.ts` — standalone component
  - [ ] Inputs : `src` (string | null), `name` (string — pour générer les initiales), `size` ('xs' | 'sm' | 'md' | 'lg' | 'xl'), `showStatus` (boolean), `online` (boolean)
  - [ ] Tailles : xs=24px, sm=32px, md=40px, lg=48px, xl=64px
  - [ ] Image : `<img>` standard (pas NgOptimizedImage — trop lourd pour petits avatars), crop circulaire `border-radius: 50%`, `object-fit: cover`
  - [ ] Fallback initiales : extraire 1-2 premières lettres du `name`, fond `--accent-primary`, texte blanc, font-weight 600
  - [ ] Indicateur statut : dot 8px en bas à droite, `--online` (#4CAF50) ou `--offline` (#666666), position absolute
  - [ ] Gestion erreur image : si `src` échoue (`(error)` event), basculer sur les initiales
  - [ ] Créer `frontend/src/app/shared/ui/avatar/avatar.spec.ts` — tests rendu image, fallback initiales, tailles, indicateur statut

- [ ] Task 2 — Créer le composant Header/Navigation (AC: #6, #7, #9, #10)
  - [ ] Créer `frontend/src/app/core/layout/header/header.ts` — standalone component
  - [ ] Layout : `position: fixed`, top 0, full-width, height 48px, `z-index: 100`, fond `--surface-1`, border-bottom 1px `--border`
  - [ ] Zone gauche : logo texte "My Mood" en `--text-lg` weight 600, `--text-primary`, `routerLink="/"`, padding-left `--space-6`
  - [ ] Zone droite : `AvatarComponent` taille md (40px) avec image profil ou initiales de `authService.currentUser()`
  - [ ] Menu dropdown via `CdkMenuTrigger` / `CdkMenu` / `CdkMenuItem` (imports depuis `@angular/cdk/menu`)
  - [ ] Template menu : en-tête (nom + email), séparateur, item "Mon compte" (`routerLink="/account"`), item "Déconnexion" (couleur `--error`, appelle `authService.logout()`)
  - [ ] Styles menu : fond `--surface-1`, border 1px `--border`, radius `--radius-md`, min-width 200px, padding `--space-3`, shadow subtile
  - [ ] Accessibilité : `role="menu"`, `role="menuitem"`, navigation clavier (flèches, Enter, Escape)
  - [ ] **ATTENTION Angular 21 + zoneless** : CdkMenu a un issue connu (#28984) avec zoneless — tester que le menu s'ouvre/ferme correctement, si bug utiliser `ChangeDetectorRef.markForCheck()` ou fallback CDK Overlay raw
  - [ ] Créer `frontend/src/app/core/layout/header/header.spec.ts` — tests rendu, menu ouverture/fermeture, items menu, accessibilité

- [ ] Task 3 — Mettre à jour App Component pour intégrer le Header (AC: #6)
  - [ ] Modifier `frontend/src/app/app.ts` — importer `HeaderComponent`
  - [ ] Modifier `frontend/src/app/app.html` — remplacer le `<header>` actuel (bouton déconnexion basique) par `<app-header>` conditionnel sur `authService.isAuthenticated()`
  - [ ] Ajouter `padding-top: 48px` sur le contenu principal (compenser le header fixe)
  - [ ] Supprimer la méthode `onLogout()` de App (déplacée dans Header)

### Restyling des pages Auth

- [ ] Task 4 — Restyler la page Register (AC: #1, #8, #9, #10)
  - [ ] Modifier `frontend/src/app/features/auth/register.ts`
  - [ ] Importer et utiliser `CardComponent`, `InputComponent`, `ButtonComponent` du design system
  - [ ] Remplacer tous les hex colors hardcodés par des CSS custom properties (`--surface-0`, `--surface-1`, `--text-primary`, `--accent-primary`, `--error`, etc.)
  - [ ] Layout container : `display: flex; justify-content: center; align-items: center; min-height: 100vh; background: var(--surface-0); padding: var(--space-4)`
  - [ ] Card form : max-width 400px, padding `--space-8`, radius `--radius-xl`
  - [ ] Titre "Rejoins My Mood" : `font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary)`
  - [ ] Adapter la validation Zod existante pour passer les messages d'erreur aux `InputComponent` via leur prop `error`
  - [ ] Bouton submit : `<app-button variant="primary" type="submit" [disabled]="loading()">Créer mon compte</app-button>`, full-width
  - [ ] Lien login : `<app-button variant="ghost" routerLink="/login">Déjà un compte ? Connecte-toi</app-button>` ou lien stylé
  - [ ] Responsive : mobile full-width card, padding `--space-4`
  - [ ] Mettre à jour `register.spec.ts` si les tests cassent suite au refactoring

- [ ] Task 5 — Restyler la page Login (AC: #2, #8, #9, #10)
  - [ ] Modifier `frontend/src/app/features/auth/login.ts`
  - [ ] Même pattern que Register : importer Card/Input/Button, remplacer hex colors, layout centré
  - [ ] Titre "Connecte-toi", bouton "Se connecter", lien "Pas encore de compte ? Rejoins-nous"
  - [ ] Erreurs serveur : utiliser `ToastService.error()` pour les messages d'erreur API (401, 500, etc.)
  - [ ] Mettre à jour `login.spec.ts` si nécessaire

### Restyling des pages Account

- [ ] Task 6 — Restyler la page Account (AC: #3, #8, #9, #10)
  - [ ] Modifier `frontend/src/app/features/account/account-page.ts`
  - [ ] Organiser en sections `CardComponent` : section Profil, section Sécurité, section Zone Danger
  - [ ] Remplacer les couleurs hardcodées (#3b82f6, #334155, #e2e8f0, etc.) par design tokens
  - [ ] Titre "Mon compte" : `--text-2xl` weight 700
  - [ ] Section Profil : Card `--surface-1`, champs nom/email via `InputComponent`, avatar via `AvatarComponent` (taille lg 48px)
  - [ ] Section Sécurité : Card `--surface-1`, titre "Sécurité" en `--text-lg` weight 600, bouton "Changer mon mot de passe" variante Secondary
  - [ ] Section Zone Danger : Card avec bordure `--error`, titre "Zone danger" en couleur `--error`, bouton "Supprimer mon compte" variante Danger, confirmation via `ModalService.confirm()`
  - [ ] Layout : max-width 600px centré, padding `--space-6` (desktop) / `--space-4` (mobile)
  - [ ] Bouton save : `ButtonComponent` variante Primary, disabled si pas de modifications, loading state
  - [ ] Conserver le pattern skeleton screen existant (bon pattern, juste aligner les couleurs)
  - [ ] Mettre à jour `account-page.spec.ts` si nécessaire

- [ ] Task 7 — Restyler le Profile Editor (AC: #4, #10)
  - [ ] Modifier `frontend/src/app/features/account/profile-editor.ts`
  - [ ] Remplacer couleurs hardcodées par design tokens
  - [ ] Utiliser `AvatarComponent` (taille xl 64px) pour l'affichage de l'avatar actuel
  - [ ] Bouton upload : `ButtonComponent` variante Secondary ("Changer ma photo")
  - [ ] Conserver la logique d'upload fichier existante (progress tracking)
  - [ ] Mettre à jour `profile-editor.spec.ts` si nécessaire

### Validation finale

- [ ] Task 8 — Tests et vérification globale (AC: #10)
  - [ ] `pnpm --filter frontend test` — tous les tests passent (116 existants + nouveaux)
  - [ ] Build production `pnpm --filter frontend build` — aucune erreur
  - [ ] Vérification visuelle : design tokens appliqués (fond sombre, accent teal, font Inter), header visible avec avatar, menu dropdown fonctionnel
  - [ ] Vérification responsive : pages auth full-width sur mobile, header adapté
  - [ ] Vérification accessibilité : navigation clavier dans le menu, focus visible sur tous les éléments interactifs

## Dev Notes

### Architecture et conventions Angular 21

**CRITIQUE — Cette story est 100% frontend.** Ne modifier AUCUN fichier dans `backend/` ni `shared/`.

**Standalone components uniquement** — pas de NgModule. Chaque composant déclare ses imports explicitement.

**Angular 21 naming convention** — fichiers sans suffixe `.component` :
- `avatar.ts` (pas `avatar.component.ts`)
- `header.ts` (pas `header.component.ts`)

**Input signals** — utiliser `input()` et `input.required()` d'Angular 21 (PAS le décorateur `@Input()`) :
```typescript
// ✅ BON
readonly size = input<AvatarSize>('md');
readonly name = input.required<string>();

// ❌ MAUVAIS
@Input() size: AvatarSize = 'md';
```

**Signals pour l'état** — `signal()`, `computed()`, jamais de `WritableSignal` exposé publiquement.

**@let dans les templates** — disponible et recommandé pour cacher des expressions complexes :
```html
@let user = authService.currentUser();
@if (user) {
  <app-avatar [name]="user.name" [src]="user.avatarUrl" />
}
```

### CDK Menu — Pattern pour le dropdown header

**Utiliser `CdkMenu` / `CdkMenuTrigger` / `CdkMenuItem`** (PAS raw Overlay) pour le menu dropdown du header. C'est une abstraction de plus haut niveau qui gère automatiquement :
- Navigation clavier (flèches haut/bas, Enter, Escape)
- Focus management
- Rôles ARIA (`role="menu"`, `role="menuitem"`)
- Fermeture sur clic extérieur

**Imports standalone :**
```typescript
import { CdkMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
```

**Pattern d'implémentation :**
```html
<button [cdkMenuTriggerFor]="accountMenu" class="avatar-trigger">
  <app-avatar [name]="user.name" [src]="user.avatarUrl" size="md" />
</button>

<ng-template #accountMenu>
  <div cdkMenu class="account-menu">
    <div class="menu-header">...</div>
    <hr class="menu-separator" />
    <a cdkMenuItem routerLink="/account" class="menu-item">Mon compte</a>
    <button cdkMenuItem (cdkMenuItemTriggered)="onLogout()" class="menu-item menu-item--danger">Déconnexion</button>
  </div>
</ng-template>
```

**ALERTE ZONELESS** : Angular 21 utilise le mode zoneless dans ce projet. Le CDK Menu a un issue connu (#28984) qui peut empêcher la mise à jour du DOM. Si le menu ne s'ouvre/ferme pas correctement :
1. Essayer `inject(ChangeDetectorRef).markForCheck()` après les interactions
2. En dernier recours, fallback sur CDK Overlay raw (comme le ModalComponent de Story 1.5.2)

### Angular 21 Popover API — Impact sur les overlays

Angular 21 a introduit le **native Popover API** pour les overlays CDK. Cela change le comportement par défaut : les overlays ne sont plus forcément appendés dans `.cdk-overlay-container` au niveau du `<body>`. Des problèmes de z-index et positionnement sont documentés.

**Actions préventives :**
- Tester le positionnement du menu dropdown sur desktop ET mobile
- Si le menu apparaît derrière d'autres éléments, ajouter un `z-index` explicite supérieur à 100 (header)
- Consulter les articles de référence si des bugs de positionnement apparaissent

### Design tokens — Comment les consommer

**Deux approches disponibles, choisir la cohérence :**

1. **Tailwind utility classes mappées** (via `@theme` dans `styles.css`) :
```html
<div class="bg-surface-0 text-text-primary">
```

2. **CSS custom properties directes** (dans les styles inline des components) :
```css
.container { background: var(--surface-0); color: var(--text-primary); }
```

**Règle : utiliser l'approche Tailwind classes quand c'est simple, CSS vars quand les Tailwind mappings ne suffisent pas** (ex: `border-color`, `outline-color`, `box-shadow`). Les composants de Story 1.5.2 (Button, Input, Card, etc.) utilisent les CSS vars dans leurs styles inline — rester cohérent.

### Composants UI disponibles (Story 1.5.2) — API à utiliser

**ButtonComponent** (`shared/ui/button/button.ts`) :
```html
<app-button variant="primary" type="submit" [disabled]="loading()">Label</app-button>
<app-button variant="secondary">Label</app-button>
<app-button variant="ghost" routerLink="/login">Lien</app-button>
<app-button variant="danger" (click)="onDelete()">Supprimer</app-button>
```
- Variants : `primary` | `secondary` | `ghost` | `danger` | `icon-only`
- Sizes : `sm` (36px) | `md` (44px, défaut) | `lg` (52px)

**InputComponent** (`shared/ui/input/input.ts`) :
```html
<app-input label="Email" type="email" [error]="fieldErrors().email" placeholder="ton.email@exemple.com" />
```
- Props : `label`, `placeholder`, `type`, `error` (string — message affiché en rouge), `disabled`
- Accessibilité intégrée : `aria-invalid`, `aria-describedby` automatiques

**CardComponent** (`shared/ui/card/card.ts`) :
```html
<app-card>Contenu par défaut (surface-1)</app-card>
<app-card [elevated]="true">Contenu surélevé (surface-2)</app-card>
```
- Content projection via `<ng-content>`

**ToastService** (`core/services/toast.service.ts`) :
```typescript
this.toastService.success('Profil mis à jour');
this.toastService.error('Erreur de connexion');
```

**ModalService** (`core/services/modal.service.ts`) :
```typescript
this.modalService.confirm('Supprimer ?', 'Cette action est irréversible.').subscribe(confirmed => {
  if (confirmed) { /* ... */ }
});
```

### Hiérarchie des pages auth — Layout pattern

Les pages Register et Login partagent le même layout. Pattern recommandé :

```css
:host {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--surface-0);
  padding: var(--space-4);
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

.auth-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-6);
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auth-link {
  text-align: center;
  margin-top: var(--space-4);
}
```

**Mobile (<640px)** : le `max-width: 400px` est naturellement ignoré car le viewport est plus petit. Le `padding: var(--space-4)` (16px) assure un espacement correct.

### Page Account — Layout pattern

```css
:host {
  display: block;
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-6);
}

@media (max-width: 639px) {
  :host {
    padding: var(--space-4);
  }
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.danger-card {
  border: 1px solid var(--error);
}

.danger-title {
  color: var(--error);
}
```

### Intégration InputComponent avec la validation Zod existante

L'`InputComponent` implémente **ControlValueAccessor** (corrigé en code review Story 1.5.2) — il est donc **compatible `ngModel` et `formControl`**. Les pages Register et Login utilisent déjà `[(ngModel)]` sur des `<input>` natifs, il suffit de remplacer par `<app-input>` avec le même binding :

```typescript
// Pattern existant (conserver la logique)
readonly fieldErrors = signal<Record<string, string>>({});

// Validation Zod (conserver)
const result = registerSchema.safeParse(formData);
if (!result.success) {
  const errors: Record<string, string> = {};
  result.error.issues.forEach(issue => {
    errors[issue.path[0] as string] = issue.message;
  });
  this.fieldErrors.set(errors);
}
```

```html
<!-- Template — remplacement direct, ngModel fonctionne sur app-input -->
<app-input
  label="Email"
  type="email"
  [(ngModel)]="form.email"
  [error]="fieldErrors().email"
  placeholder="ton.email@exemple.com"
/>
```

**Conserver `FormsModule` dans les imports** du composant page (déjà présent pour `[(ngModel)]`).

### CRITIQUE — AuthService n'a PAS d'avatarUrl

Le type `UserInfo` de `AuthService.currentUser()` ne contient que `{ id, name, email }`. **Pas d'`avatarUrl`.**

Le `UserProfile` de `UserService.getProfile()` contient `{ id, name, email, avatarUrl }`.

**Impact sur le Header :** Le composant Header ne peut PAS afficher la photo de profil depuis `authService.currentUser()` seul. **Options :**

1. **Initiales uniquement dans le header** (recommandé pour cette story) : L'avatar du header affiche toujours les initiales via `authService.currentUser().name`. Simple, pas de requête HTTP supplémentaire. La photo complète est visible sur la page Account qui charge déjà `UserService.getProfile()`.

2. **Étendre AuthService** : Ajouter `avatarUrl` à `UserInfo` et le populer au login/refresh. Plus complet mais modifie le backend/shared (hors scope de cette story).

**Décision recommandée : option 1** — initiales dans le header, photo sur la page Account. L'option 2 pourra être ajoutée dans une story ultérieure.

### UserService — API disponible pour la page Account

```typescript
// Injection
private readonly userService = inject(UserService);

// Récupérer le profil (inclut avatarUrl)
this.userService.getProfile()        // → Observable<{ data: UserProfile }>

// Mettre à jour le profil (nom uniquement)
this.userService.updateProfile(dto)  // → Observable<{ data: UserProfile }>

// Upload avatar (séparé du profil)
this.userService.uploadAvatar(file)  // → Observable<HttpEvent<{ data: { avatarUrl: string } }>>
```

**`UserProfile` : `{ id: string, name: string, email: string, avatarUrl: string | null }`**

L'upload d'avatar est une requête séparée du `updateProfile`. La page Account gère déjà les deux — cette story doit conserver cette logique et juste restyler.

### Patterns de la Story 1.5.2 à ne PAS casser

- **Tokens CSS** dans `styles/tokens/_base.css` et `styles/tokens/bon-pote.css` — NE PAS modifier
- **Mapping `@theme` Tailwind v4** dans `styles.css` — NE PAS modifier (sauf ajout de nouveaux mappings si nécessaire)
- **Font Inter** importée dans `index.html` — conserver
- **Classe `theme-bon-pote`** sur `<body>` — conserver
- **Skeleton utilities** (`.skeleton`, `.skeleton-text`, etc.) — conserver et utiliser
- **Composants UI** (Button, Input, Card, Toast, Modal) — ne PAS les modifier, les CONSOMMER tels quels
- **Services** (ToastService, ModalService) — ne PAS les modifier, les utiliser via `inject()`
- **155 tests existants** — TOUS doivent continuer de passer

### Patterns des stories 1.1-1.4 à ne PAS casser

- **NestJS ESM strict** (`backend/`) — cette story ne touche PAS le backend
- **Prisma 7 Driver Adapters** — pas impacté
- **Zod 4 schemas dans `shared/schemas/`** — pas de modification, seulement consommation côté frontend
- **JWT hybride** (access token in-memory, refresh httpOnly cookie) — pas impacté
- **refreshInterceptor** (`core/interceptors/`) — ne PAS toucher
- **ResponseWrapperInterceptor** — ne PAS toucher
- **Guards auth/guest** (`core/guards/`) — ne PAS toucher, seulement consommés par les routes

### Fichiers créés/modifiés par cette story

| Fichier | Action | Notes |
|---------|--------|-------|
| `frontend/src/app/shared/ui/avatar/avatar.ts` | NEW | Composant Avatar réutilisable |
| `frontend/src/app/shared/ui/avatar/avatar.spec.ts` | NEW | Tests Avatar |
| `frontend/src/app/core/layout/header/header.ts` | NEW | Composant Header/Navigation |
| `frontend/src/app/core/layout/header/header.spec.ts` | NEW | Tests Header |
| `frontend/src/app/app.ts` | MODIFIED | Import HeaderComponent, suppression onLogout() |
| `frontend/src/app/app.html` | MODIFIED | Remplacement header basique par `<app-header>`, padding-top |
| `frontend/src/app/app.css` | MODIFIED | Ajout padding-top pour compenser header fixe |
| `frontend/src/app/features/auth/register.ts` | MODIFIED | Restyle complet avec design system |
| `frontend/src/app/features/auth/register.spec.ts` | MODIFIED | Adaptation tests si nécessaire |
| `frontend/src/app/features/auth/login.ts` | MODIFIED | Restyle complet avec design system |
| `frontend/src/app/features/auth/login.spec.ts` | MODIFIED | Adaptation tests si nécessaire |
| `frontend/src/app/features/account/account-page.ts` | MODIFIED | Restyle complet avec design system |
| `frontend/src/app/features/account/account-page.spec.ts` | MODIFIED | Adaptation tests si nécessaire |
| `frontend/src/app/features/account/profile-editor.ts` | MODIFIED | Restyle avec design tokens + AvatarComponent |
| `frontend/src/app/features/account/profile-editor.spec.ts` | MODIFIED | Adaptation tests si nécessaire |

**Fichiers qui ne doivent PAS être modifiés :**
- `backend/**` — cette story est 100% frontend
- `shared/**` — aucun schéma partagé impacté
- `frontend/src/styles.css` — déjà configuré en Story 1.5.2 (sauf ajout d'utilitaires si strictement nécessaire)
- `frontend/src/styles/tokens/*` — tokens déjà définis
- `frontend/src/index.html` — déjà configuré (Inter, theme-bon-pote)
- `frontend/src/app/core/interceptors/*` — interceptors intacts
- `frontend/src/app/core/auth/*` — service auth intact (consommé, pas modifié)
- `frontend/src/app/core/guards/*` — guards intacts
- `frontend/src/app/shared/ui/button/*` — composant consommé, pas modifié
- `frontend/src/app/shared/ui/input/*` — composant consommé, pas modifié
- `frontend/src/app/shared/ui/card/*` — composant consommé, pas modifié
- `frontend/src/app/shared/ui/toast/*` — composant consommé, pas modifié
- `frontend/src/app/shared/ui/modal/*` — composant consommé, pas modifié
- `frontend/src/app/core/services/toast.service.ts` — service consommé, pas modifié
- `frontend/src/app/core/services/modal.service.ts` — service consommé, pas modifié

### Structure cible après cette story

```
frontend/src/app/
├── app.ts                           # MODIFIED (import Header)
├── app.html                         # MODIFIED (<app-header> + padding-top)
├── app.css                          # MODIFIED (padding-top header fixe)
├── core/
│   ├── layout/
│   │   └── header/
│   │       ├── header.ts            # NEW — Header/Navigation
│   │       └── header.spec.ts       # NEW — Tests Header
│   ├── auth/                        # INCHANGÉ
│   ├── guards/                      # INCHANGÉ
│   ├── interceptors/                # INCHANGÉ
│   └── services/                    # INCHANGÉ (toast.service, modal.service)
├── shared/
│   └── ui/
│       ├── avatar/
│       │   ├── avatar.ts            # NEW — Composant Avatar
│       │   └── avatar.spec.ts       # NEW — Tests Avatar
│       ├── button/                  # INCHANGÉ (consommé)
│       ├── input/                   # INCHANGÉ (consommé)
│       ├── card/                    # INCHANGÉ (consommé)
│       ├── toast/                   # INCHANGÉ (consommé)
│       └── modal/                   # INCHANGÉ (consommé)
└── features/
    ├── auth/
    │   ├── register.ts              # MODIFIED — restyle design system
    │   ├── register.spec.ts         # MODIFIED — adaptation tests
    │   ├── login.ts                 # MODIFIED — restyle design system
    │   └── login.spec.ts            # MODIFIED — adaptation tests
    └── account/
        ├── account-page.ts          # MODIFIED — restyle design system
        ├── account-page.spec.ts     # MODIFIED — adaptation tests
        ├── profile-editor.ts        # MODIFIED — restyle + AvatarComponent
        └── profile-editor.spec.ts   # MODIFIED — adaptation tests
```

### Project Structure Notes

- Le `HeaderComponent` va dans `core/layout/` (pas `shared/ui/`) car c'est un composant de layout applicatif, pas un composant UI générique réutilisable
- L'`AvatarComponent` va dans `shared/ui/` car il sera réutilisé dans le header, les pages account, et plus tard dans la grille d'humeur (Epic 3)
- Les pages features (`auth/`, `account/`) consomment les composants UI de `shared/ui/` — la dépendance est unidirectionnelle

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color System] — Palette surfaces, fonctionnels, thématiques
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography System] — Inter, type scale, graisses
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Spacing & Layout Foundation] — Échelle spacing, radius, breakpoints
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Button Hierarchy] — Variantes boutons, touch targets
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Navigation Patterns] — Header desktop/mobile, avatar menu, bottom tabs
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns] — Inputs, validation inline, états focus/error
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Modal & Overlay Patterns] — CDK Overlay, focus trap
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Accessibility Considerations] — WCAG AA, focus visible, prefers-reduced-motion
- [Source: _bmad-output/implementation-artifacts/epic-1-retro-2026-02-13.md#Décision 1] — Scope Story 1.5.3
- [Source: _bmad-output/implementation-artifacts/1-5-2-design-tokens-tailwind-et-composants-de-base.md] — Composants UI disponibles, patterns établis
- [Source: _bmad-output/implementation-artifacts/1-5-1-fix-tsc-alias-et-stabilisation-infra-dev.md] — Patterns ESM/Prisma à ne pas casser
- [Source: Angular CDK Menu docs — material.angular.dev/cdk/menu] — CdkMenu, CdkMenuTrigger, CdkMenuItem
- [Source: Angular CDK Overlay issue Angular 21 — Popover API changes] — Risques z-index/positionnement

### Previous Story Intelligence (Story 1.5.2)

**Apprentissages clés de la Story 1.5.2 :**

- **Tailwind v4 config = CSS, PAS JS** : Pas de `tailwind.config.ts`. Tout se configure via `@theme` dans `styles.css`. Ne PAS créer de fichier de config JS.
- **@theme namespace Tailwind v4** : Les couleurs doivent être mappées avec le préfixe `--color-*`, les fonts avec `--font-*`, les radius avec `--radius-*`. Exemple : `--color-surface-0: var(--surface-0)` permet d'utiliser `bg-surface-0`.
- **Angular CDK version** : `@angular/cdk` est installé et doit être de la même version majeure que `@angular/core` (~21.x). Déjà installé, pas besoin de réinstaller.
- **Pattern composant UI** : Chaque composant = 1 dossier dans `shared/ui/` avec `component.ts` + `component.spec.ts`. Styles inline dans le `@Component`. Input signals avec `input()` / `input.required()`.
- **Tests Vitest** : Runner = `@angular/build:unit-test` via `pnpm --filter frontend test`. PAS `vitest` directement. 155 tests passent actuellement.
- **Build OK** : `pnpm --filter frontend build` réussit sans erreur.
- **Aucun incident de debug** sur la Story 1.5.2 — implémentation fluide.

**Fichiers créés en 1.5.2 à connaître (ne pas recréer) :**
- `shared/ui/button/button.ts` — 5 variantes, 3 tailles
- `shared/ui/input/input.ts` — label, error, disabled, focus states
- `shared/ui/card/card.ts` — default/elevated, content projection
- `shared/ui/toast/*` + `core/services/toast.service.ts` — 4 variantes, auto-dismiss, empilable
- `shared/ui/modal/*` + `core/services/modal.service.ts` — CDK FocusTrap, confirm()

### Git Intelligence

**5 derniers commits :**
```
de520a1 Story 1.5.2 : Implémentation du style et des composants de base + creation du premier theme
83166e0 Story 1.5.1 : Correctif environnement de dev
7abd2d1 Epic 1 : retrospective - ajout epic 1.5
b966602 Story 1.4 : Gestion profil utilisateur
e45ef85 Story 1.3 : Connexion et déconnexion
```

**Insights du dernier commit (1.5.2) :**
- 22 fichiers modifiés, +1617 / -66 lignes
- Design tokens, 5 composants UI, 2 services, skeleton utilities
- `styles.css` passé de 1 ligne à 117 lignes (tokens + @theme + skeleton)
- `index.html` modifié (Google Fonts Inter + classe theme-bon-pote)
- `@angular/cdk` ajouté dans `package.json`

**Pattern de commit à suivre :** `Story 1.5.3: Description courte en français`

### Latest Tech Information

**Angular 21 — Points de vigilance :**

1. **Native Popover API** : Angular 21 utilise le Popover API natif du navigateur pour les overlays CDK. Changement d'architecture : les overlays ne sont plus forcément dans `.cdk-overlay-container`. Des bugs de z-index/positionnement sont documentés (articles Medium, janvier 2026).

2. **CdkMenu + Zoneless** : Issue GitHub #28984 signale des incompatibilités entre `CdkMenuTrigger` et le mode zoneless. Le menu peut ne pas se fermer correctement. Workaround : `ChangeDetectorRef.markForCheck()` ou fallback CDK Overlay raw.

3. **@let template syntax** : Disponible depuis Angular 17, stable en 21. Syntaxe : `@let user = expression;` — read-only, scopé à la vue courante.

4. **NgOptimizedImage** : Non recommandé pour les petits avatars. Conçu pour les images LCP (Largest Contentful Paint). Utiliser `<img>` standard pour les avatars.

5. **RouterLinkActive** : Pas de breaking changes en Angular 21. Utiliser `ariaCurrentWhenActive="page"` pour l'accessibilité. Matching exact avec `[routerLinkActiveOptions]="{exact: true}"` pour la route `/`.

6. **CdkMenu imports standalone** :
```typescript
import { CdkMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
```
Pas besoin d'importer un module complet — imports directs en standalone.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
