import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (token) {
    // If the user is already logged in, redirect to the home page
    router.navigate(['/']);
    return false;
  }
  // Allow access to the login page if not logged in
  return true;
};
