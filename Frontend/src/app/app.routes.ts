import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard';

import { PracticeComponent } from './features/practice/practice';
import { authGuard } from './core/guards/auth-guard'; 

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component:  RegisterComponent},
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  
  
  { path: 'practice', component: PracticeComponent, canActivate: [authGuard] },
  
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];