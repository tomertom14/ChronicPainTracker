import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
// Corrected import path without '.component'
import { DashboardComponent } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard] 
  },
  // Update the root redirect to point to the dashboard
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  { path: '**', redirectTo: '/login' }
];