import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
// Adjust the path to your AuthService if necessary
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  // We use inject() to get our services inside a functional guard
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if the user has a valid token
  if (authService.isLoggedIn()) {
    return true; // Access granted!
  }

  // Instead of returning false, we return a UrlTree.
  // This explicitly tells the Angular Router to redirect the user.
  return router.createUrlTree(['/login']);
};