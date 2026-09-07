import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as string[];

  if (!allowedRoles || auth.hasPermission(allowedRoles)) {
    return true;
  }

  // redirect if unauthorized
  router.navigate(['/unauthorized']); // or /dashboard
  return false;
};
