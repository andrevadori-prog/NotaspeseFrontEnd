import { Routes } from '@angular/router';
import { AuthGuard } from 'mch-authentication-v2-lib';

export const routes: Routes = [

    {
        path: 'home',
        loadComponent: () =>
            import('./modules/home/home.component')
                .then(m => m.HomeComponent)
    },
    {
        path: 'login',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'configuration',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        loadChildren: () =>
            import('./modules/configuration/configuration.module')
                .then(m => m.ConfigurationModule)
    },
    {
        path: 'expenses',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        loadChildren: () =>
            import('./modules/expenses/expenses.module')
                .then(m => m.ExpensesModule)
    },

    {
        path: 'unauthorized',
        redirectTo: 'expenses/reports',
        pathMatch: 'full'
    },

    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },

    {
        path: '**',
        redirectTo: 'home'
    }
];