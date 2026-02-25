import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./group-list/group-list.js').then(m => m.GroupListComponent)
    },
    {
        path: 'create',
        loadComponent: () => import('./group-create/group-create.js').then(m => m.GroupCreateComponent)
    },
    {
        path: ':id',
        loadComponent: () => import('./group-detail/group-detail.js').then(m => m.GroupDetailComponent)
    }
];
