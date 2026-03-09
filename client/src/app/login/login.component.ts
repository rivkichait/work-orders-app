import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
/** Handles user login: sends credentials to backend and navigates on success. */
export class LoginComponent {
  username = ''; /** The username. */
  password = ''; /** The password. */
  errorMessage = ''; /** The error message. */

  /** Constructor for the LoginComponent. */
  constructor(private http: HttpClient, private router: Router) {}
  
  /** Handles user login: sends credentials to backend and navigates on success. */
  onLogin() {
    /** Sends credentials to backend and navigates on success. */
    this.http.post<any>('http://localhost:3000/login', {
      username: this.username,
      password: this.password
    }).subscribe(
      /** If the login is successful, set the local storage and navigate to the home page. */
      (response) => {
        if (response.success) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', this.username);
          this.router.navigate(['/']);  /** Navigates to the home page. */
        } else {
          this.errorMessage = '❌ Invalid username or password.';
        }
      },
      /** If the login fails, set the error message and log the error. */
      (error) => {
        this.errorMessage = '❌ Login failed. Server error.';
        console.error(error);
      }
    );
  }
}
