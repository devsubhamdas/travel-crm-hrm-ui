import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const jwtHelper = new JwtHelperService();

  if (!isPlatformBrowser(platformId)) return true;

  const token = localStorage.getItem('accessToken');

  if (token && !jwtHelper.isTokenExpired(token)) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
