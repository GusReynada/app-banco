import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.LoginComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'transferencia',
    loadComponent: () => import('./transferencia/transferencia').then(m => m.TransferenciaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'nuevo-contacto',
    loadComponent: () => import('./nuevo-contacto/nuevo-contacto').then(m => m.NuevoContactoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'monto',
    loadComponent: () => import('./monto/monto').then(m => m.MontoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'confirmacion',
    loadComponent: () => import('./confirmacion/confirmacion').then(m => m.ConfirmacionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'exito',
    loadComponent: () => import('./exito/exito').then(m => m.ExitoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'movimientos',
    loadComponent: () => import('./movimientos/movimientos').then(m => m.MovimientosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'mis-tarjetas',
    loadComponent: () => import('./mis-tarjetas/mis-tarjetas').then(m => m.MisTarjetasComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
