import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './pages/home/home.component';
import { ServicesComponent } from './pages/services/services.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { UserRequestsComponent } from './pages/user-requests/user-requests.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'user-requests', component: UserRequestsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' }), CommonModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}
