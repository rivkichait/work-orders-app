import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-user-requests',
  templateUrl: './user-requests.component.html',
  styleUrls: ['./user-requests.component.css']
})
/** Handles the user requests page: displays the user's requests. */
export class UserRequestsComponent implements OnInit {
  requests: any[] = []; /** The user requests. */
  loading = true; /** Whether the user requests are loading. */
  error = ''; /** The error message. */

  /** Constructor for the UserRequestsComponent. */
  constructor(private http: HttpClient, private appComponent: AppComponent) {}
  
  /** Initializes the component. */
  ngOnInit(): void {
    const email = localStorage.getItem('username');
    /** If the user is not logged in, set the error message and loading state. */
    if (!email) {
      this.error = 'Not logged in.';
      this.loading = false;
      return;
    }
    /** Gets the user requests from the backend. */
    this.http.get<any>(`http://localhost:3000/user-requests?email=${encodeURIComponent(email)}`)
      .subscribe({
        /** If the user requests are loaded successfully, set the requests and loading state. */
        next: (res) => {
          this.requests = res.requests || [];
          this.loading = false;
        },
        /** If the user requests are not loaded successfully, set the error message and loading state. */
        error: () => {
          this.error = 'Failed to load requests.';
          this.loading = false;
        }
      });
    /** Sets the active section to null. */
    this.appComponent.activeSection = '';
  }
}
