import { Routes } from '@angular/router';
import { RegisterPageComponent } from './pages/register-page/register-page';
import { LoginPageComponent } from './pages/login-page/login-page';
import { loginGuard } from '../../core/auth/login-guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [loginGuard]
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [loginGuard]
  }
];
