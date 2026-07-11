import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TransferenciaService } from './transferencia.service';

export const authGuard: CanActivateFn = (route, state) => {
  const transferService = inject(TransferenciaService);
  const router = inject(Router);

  if (transferService.isAutenticado()) {
    return true;
  }

  // Redirigir al inicio de sesión (PIN Pad)
  router.navigate(['/login']);
  return false;
};
