import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../../app.component'; // adjust path as needed

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
/** Handles the reset password page: displays the reset password form and the success popup. */
export class ResetPasswordComponent {
  token = ''; /** The token. */
  email = ''; /** The email. */
  newPassword = ''; /** The new password. */
  message = ''; /** The message. */
  submitted = false; /** Whether the form has been submitted. */
  showPassword = false; /** Whether the password is shown. */
  showSuccessPopup = false; /** Whether the success popup is shown. */

  
  /** Constructor for the ResetPasswordComponent. */
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private appComponent: AppComponent
  ) {
    /** Subscribes to the query params. */
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
    });
    this.appComponent.activeSection = null; /** or '', or 'reset-password' */
  }

  /** Initializes the component. */
  ngOnInit() {
    /** Sets the active section to null. */
    this.appComponent.activeSection = null; // or '', or 'reset-password'
  }

  /** Checks if the password is legal. */
  isPasswordLegal(password: string): boolean {
    /** At least 8 chars, one letter, one number. */
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  }

  /** Sends a POST request with email, token, and new password. Shows success popup on success, or error message on failure. */
  resetPassword() {
    /** Sets the submitted flag to true. */
    this.submitted = true;
    /** Sets the message to an empty string. */
    this.message = '';
    this.http.post<any>('http://localhost:3000/reset-password', {
      email: this.email,
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: (res) => {
        /** Logs the reset response. */
        console.log('Reset response:', res);
        /** If the reset is successful, sets the new password to an empty string, sets the submitted flag to false, sets the success popup to true, and logs the success popup. */
        if (res.success && res.message === 'Password reset successful.') {
          this.newPassword = '';
          this.submitted = false;
          this.showSuccessPopup = true;
          /** Logs the success popup. */
          console.log('Showing success popup');
          /** If the reset is not successful, sets the message to the error message. */
        } else {
          this.message = res.message;
        }
      },
      error: (err) => {
        this.message = err?.error?.message || 'Error resetting password.';
      }
    });
  }

  /** Closes the success popup and navigates to the login page. */
  onSuccessOk() {
    /** Sets the success popup to false. */
    this.showSuccessPopup = false;
    /** Navigates to the login page. */
    this.router.navigate(['/']); // or your login route
  }
}
