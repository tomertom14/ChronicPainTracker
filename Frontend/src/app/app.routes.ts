import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';

export const routes: Routes = [
  // When the user navigates to /login, show the LoginComponent
  { path: 'login', component: LoginComponent },
  
  // When the user navigates to the empty path (root), redirect to /login
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Catch-all: If the user types a URL that doesn't exist, redirect to /login
  { path: '**', redirectTo: '/login' }
];