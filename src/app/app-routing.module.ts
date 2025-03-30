import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HodComponent } from './pages/dashboard/hod/hod.component'; 
import { StaffComponent } from './pages/dashboard/staff/staff.component';
import { AuthGuard } from './shared/guards/auth.guard'; 

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'hod', component: HodComponent, canActivate: [AuthGuard] }, 
  { path: 'staff', component: StaffComponent, canActivate: [AuthGuard] }, 
  { path: '**', redirectTo: 'login' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}