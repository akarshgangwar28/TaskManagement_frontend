import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../../features/auth/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.currentUser() !== null) {
    return true;
  }

  // Redirect to login if user is not authenticated
  return router.parseUrl('/login');
};
