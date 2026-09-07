import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service';

export const homeRedirectGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const role = auth.getRole(); // assuming a signal or getter — adjust as needed

  if (role === 'sales') {
    return router.createUrlTree(['/leads']);
  }

  if (role === 'operator') {
    return router.createUrlTree(['/operations']);
  }

  // admin (or any other role) — allow through
  return true;
};
