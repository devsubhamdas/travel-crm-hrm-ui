import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // SSR safe
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }
  // Skip auth endpoints
  if (req.url.includes('/auth/login')) {
    return next(req);
  }
  const token = localStorage.getItem('accessToken');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
