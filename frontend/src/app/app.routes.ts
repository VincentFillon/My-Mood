import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login').then((m) => m.LoginComponent),
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account/account-page').then(
        (m) => m.AccountPageComponent,
      ),
  },
  {
    path: 'groups',
    canActivate: [authGuard],
    loadChildren: () => import('./features/groups/groups.routes.js').then((m) => m.routes),
  },
  {
    path: 'invite/:token',
    loadComponent: () => import('./features/groups/join-group/join-group.js').then((m) => m.JoinGroupComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
