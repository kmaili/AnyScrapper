import { Routes } from '@angular/router';
import { RegisterPageComponent } from './pages/register-page/register-page';
import { LoginPageComponent } from './pages/login-page/login-page';

export const AUTH_ROUTES: Routes = [
  {
    path: 'register',
    component: RegisterPageComponent
  },
  {
    path: 'login',
    component: LoginPageComponent
  }
];
