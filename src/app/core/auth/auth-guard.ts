import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

    console.warn('Access denied - No token found');
  if (token) {
    return true;
  } else {
    router.navigate(['/auth/login']);
    return false;
  }
};
