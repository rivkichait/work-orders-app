import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
/** Handles the app component: displays the app component and navigates to the home page if the user has already visited the app component. */
export class AppComponent implements OnInit, OnDestroy {
  showServices = false;
  successMessage = '';
  showPopup = false;
  showLoginBox = false;
  username = '';
  password = '';
  errorMessage = '';
  isLoggedIn = false;
  showAuthModal = false;
  authMode: 'login' | 'register' = 'login';
  rememberMe = false;
  showPassword = false;
  showRegisterPassword = false; // For the register form

  /** For registration */
  registerData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  };
  registerMessage = '';

  /** Opens the authentication modal. */
  openAuthModal() {
    /** Sets the showAuthModal flag to true. */
    this.showAuthModal = true;
    /** Sets the authMode to login. */
    this.authMode = 'login';
    /** Sets the error message to an empty string. */
    this.errorMessage = '';
    this.registerMessage = '';
  }
  
  /** Closes the authentication modal. */
  closeAuthModal() {
    /** Sets the showAuthModal flag to false. */
    this.showAuthModal = false;
    this.errorMessage = '';
    this.registerMessage = '';
  }
  
  /** Forgets the password. */
  forgotPassword(event: Event) {
    /** Prevents the default event. */
    event.preventDefault();

    /** If email is empty, set the forgot popup message and action. */
    if (!this.username || this.username.trim() === '') {
      this.forgotPopupMessage = 'Enter your email below and click "Forgot your password?" again';
      this.forgotPopupAction = 'ok';
      this.showForgotPopup = true;
      return;
    }

    /** Calls the backend to check if email exists and send reset link. */
    this.http.post<any>('http://localhost:3000/forgot-password', { email: this.username }).subscribe({
      next: (res) => {
        /** If the email exists, set the forgot popup message and action. */
        if (res.exists) {
          this.forgotPopupMessage = 'Please check your email.<br>We have just sent you an email with a link to reset your Password.';
          this.forgotPopupAction = 'ok';
        } else {
          /** If the email does not exist, set the forgot popup message and action to register. */
          this.forgotPopupMessage = 'Your email doesn\'t exist. Please register';
          this.forgotPopupAction = 'register';
        }
        this.showForgotPopup = true;
      },
      error: () => {
        this.forgotPopupMessage = 'Server error. Please try again later.';
        this.forgotPopupAction = 'ok';
        this.showForgotPopup = true;
      }
    });
  }

  /** Active section. */
  activeSection = 'home';
  isProgrammaticScroll = false;

  /** Carousel images. */
  carouselImages: string[] = [
    'assets/slide1.jpg',
    'assets/slide2.jpg',
    'assets/slide3.jpg'
  ];
  currentCarouselIndex = 0;
  carouselInterval: any;

  services: string[] = [
    'Painting',
    'Furniture Assembly',
    'Electrical Repairs',
    'Plumbing',
    'Wall Mounting',
    'Floor Installation',
    'Locksmith',
    'General Maintenance'
  ];

  /** Contact form model. */
  contact = {
    name: '',
    phone: '',
    email: '',
    message: ''
  };


  /** Error tracking properties. */
  showNameError = false;
  showPhoneError = false;
  showEmailError = false;
  showMessageError = false;

  /** Touched flags for real-time validation. */
  nameTouched = false;
  phoneTouched = false;
  emailTouched = false;
  messageTouched = false;

  lastScrollPosition = 0;

  forgotPopupMessage = '';
  showForgotPopup = false;
  forgotPopupAction: 'ok' | 'register' = 'ok';

  loginMessage = '';
  name: string = ''; // Added for displaying the user's name in the header
  fullName: string = '';
  showUserMenu = false;

  /** Constructor for the AppComponent. */
  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) {
    /** Listen for route changes to update activeSection for nav highlighting. */
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        /** Always jump to the top instantly on route change (no animation). */
        window.scrollTo(0, 100); // 100 = header height
        if (event.urlAfterRedirects.startsWith('/services')) {
          this.activeSection = 'services';
        } else if (event.urlAfterRedirects.startsWith('/gallery')) {
          this.activeSection = 'gallery';
        } else {
          /** Only set to home if not programmatically scrolling to a section. */
          if (!this.isProgrammaticScroll) {
            this.activeSection = 'home';
          }
        }
      }
    });
    /** Gets the logged in status from localStorage. */
    const stored = localStorage.getItem('isLoggedIn');
    this.isLoggedIn = stored === 'true';
    const savedUsername = localStorage.getItem('username');
    /** If the username is saved, set the username. */
    if (savedUsername) {
      this.username = savedUsername;
    }
    /** Gets the name from localStorage. */
    this.name = localStorage.getItem('name') || ''; // Initialize name from localStorage
    /** Gets the full name from localStorage. */
    this.fullName = localStorage.getItem('fullName') || this.name;
  }

  /** Initializes the component. */
  ngOnInit() {
    this.startCarousel();
    
    /** Checks if user has been away for a reasonable time (1 minute). */
    const lastActivity = localStorage.getItem('lastActivity');
    const currentTime = Date.now();
    const reasonableTime = 60 * 1000; /** 1 minute in milliseconds. */
    
    
    console.log('Last activity:', lastActivity ? new Date(parseInt(lastActivity)).toLocaleTimeString() : 'None');
    console.log('Current time:', new Date(currentTime).toLocaleTimeString());
    console.log('Time difference:', lastActivity ? (currentTime - parseInt(lastActivity)) / 1000 : 'N/A', 'seconds');
    console.log('Should scroll to home:', !lastActivity || (currentTime - parseInt(lastActivity)) > reasonableTime);
    
    let shouldScrollToHome = false;
    
    if (window.pageYOffset === 0) {
      // Always scroll to home on actual reload
      shouldScrollToHome = true;
      console.log('Scrolling to home: Page is at top (reload)');
    } else if (lastActivity && (currentTime - parseInt(lastActivity)) > reasonableTime) {
      // User has been away for more than 1 minute
      shouldScrollToHome = true;
      console.log('Scrolling to home: User was away for more than 1 minute');
    }
    /** If the user should scroll to home, scroll to home. */
    if (shouldScrollToHome) {
      setTimeout(() => {
        const homeSection = document.getElementById('home');
        const headerOffset = 120; // Same as header height
        if (homeSection) {
          const elementPosition = homeSection.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - headerOffset,
            behavior: 'smooth'
          });
          this.activeSection = 'home';
          this.isProgrammaticScroll = true;
        }
      }, 0);
    }
    
    /** Update last activity timestamp only if we're not scrolling to home. */
    if (!shouldScrollToHome) {
      localStorage.setItem('lastActivity', currentTime.toString());
    }
    
    /** Listen for manual scroll interactions to cancel programmatic scroll. */
    window.addEventListener('wheel', () => { 
      this.isProgrammaticScroll = false; 
      /** Only update activity on significant scroll (not tiny movements). */
      if (Math.abs(window.pageYOffset - this.lastScrollPosition) > 50) {
        localStorage.setItem('lastActivity', Date.now().toString());
        this.lastScrollPosition = window.pageYOffset;
      }
    }, { passive: true });
    window.addEventListener('touchstart', () => { 
      this.isProgrammaticScroll = false; 
      localStorage.setItem('lastActivity', Date.now().toString());
    }, { passive: true });
    window.addEventListener('keydown', (e) => {
      if ([32, 33, 34, 35, 36, 38, 40].includes(e.keyCode)) {
        this.isProgrammaticScroll = false;
        localStorage.setItem('lastActivity', Date.now().toString());
      }
    });

    /** Checks if the user is logged in. */
    this.http.get<any>('http://localhost:3000/api/user', { withCredentials: true }).subscribe(res => {
      this.isLoggedIn = res.loggedIn;
      this.username = res.username;
      this.name = res.name || ''; // Update name from backend response
      this.fullName = res.fullName || res.name; // Update fullName from backend response
    });

  }

  /** Logs out the user. */
  logout() {
    this.http.get('http://localhost:3000/logout', { withCredentials: true }).subscribe({
      next: () => {
        this.isLoggedIn = false;
        this.username = '';
        this.name = '';
        this.fullName = '';
        this.router.navigate(['/']);
      },
      error: () => {
        // Still clear state and navigate home on error
        this.isLoggedIn = false;
        this.username = '';
        this.name = '';
        this.fullName = '';
        this.router.navigate(['/']);
      }
    });
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    localStorage.removeItem('fullName');
    this.isLoggedIn = false;
    this.username = '';
    this.password = '';
    this.showLoginBox = false;
    this.showUserMenu = false;
  }
  

  /** Destroys the component. */
  ngOnDestroy() {
    /** Stops the carousel. */
    this.stopCarousel();
  }

  /** Starts the carousel. */
  startCarousel() {
    /** Stops the carousel. */
    this.stopCarousel();
    this.carouselInterval = setInterval(() => {
      this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.carouselImages.length;
    }, 2500);
  }

  /** Stops the carousel. */
  stopCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  /** Restores ScrollSpy logic. */
  @HostListener('window:scroll', [])
  onScroll(): void {
    /** Only run scroll spy on the home page. */
    if (this.router.url !== '/') return;
    if (this.isProgrammaticScroll) return;
    const sections = ['home', 'about', 'services', 'reviews', 'contact', 'gallery'];
    const headerOffset = 120; // Height of the fixed header
    const viewportHeight = window.innerHeight;
    let mostVisibleSection = 'home';
    let maxVisibleArea = 0;
    for (let section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(viewportHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibleArea = visibleHeight * rect.width;
        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea;
          mostVisibleSection = section;
        }
      }
    }
    this.activeSection = mostVisibleSection;
  }

  /** Custom smooth scroll with controllable duration. */
  smoothScrollTo(targetY: number, duration: number, sectionId?: string) {
    const startY = window.pageYOffset;
    const diff = targetY - startY;
    let start: number | null = null;
    if (diff === 0) {
      this.isProgrammaticScroll = false;
      return;
    }
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const time = timestamp - start;
      const percent = Math.min(time / duration, 1);
      window.scrollTo(0, startY + diff * percent);
      if (percent < 1) {
        window.requestAnimationFrame(step);
      } else {
        // Do not reset isProgrammaticScroll here; only reset on manual scroll
      }
    };
    window.requestAnimationFrame(step);
  }

  /** Generic handler for all nav links. */
  onNavClick(event: Event, sectionId: string) {
    event.preventDefault();
    const headerOffset = 100;
    const section = document.getElementById(sectionId);
    if (section) {
      const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
      this.isProgrammaticScroll = true;
      this.activeSection = sectionId; // Immediately highlight the pressed button
      this.smoothScrollTo(elementPosition - headerOffset, 350, sectionId);
    }
  }

  /** Submits the contact form. */
  onSubmit() {
    /** Sets all touched flags to true on submit. */
    this.nameTouched = true;
    this.phoneTouched = true;
    this.emailTouched = true;
    this.messageTouched = true;
    // Reset all error flags
    this.showNameError = false;
    this.showPhoneError = false;
    this.showEmailError = false;
    this.showMessageError = false;
    this.successMessage = '';

    let hasErrors = false;

    /** Check each field and set error flags. */
    if (!this.contact.name.trim()) {
      this.showNameError = true;
      hasErrors = true;
    } else if (!this.isNameValid()) {
      this.showNameError = true;
      hasErrors = true;
    }

    if (!this.contact.phone.trim()) {
      this.showPhoneError = true;
      hasErrors = true;
    } else if (!this.isPhoneValid()) {
      this.showPhoneError = true;
      hasErrors = true;
    }

    if (!this.contact.email.trim()) {
      this.showEmailError = true;
      hasErrors = true;
    } else if (!this.isEmailValid()) {
      this.showEmailError = true;
      hasErrors = true;
    }

    if (!this.contact.message.trim()) {
      this.showMessageError = true;
      hasErrors = true;
    } else if (!this.isMessageValid()) {
      this.showMessageError = true;
      hasErrors = true;
    }

    if (!hasErrors) {
      // All fields are valid
      this.successMessage = '✅ Thanks! We\'ll be in touch soon.';
      this.showPopup = true;

      setTimeout(() => {
        this.showPopup = false;
        this.successMessage = '';
        // Reset form and flags AFTER popup is hidden
        this.contact = {
          name: '',
          phone: '',
          email: '',
          message: ''
        };
        this.showNameError = false;
        this.showPhoneError = false;
        this.showEmailError = false;
        this.showMessageError = false;
        this.nameTouched = false;
        this.phoneTouched = false;
        this.emailTouched = false;
        this.messageTouched = false;
      }, 6000); // Show for 6 seconds
    }
  }

  /** Scrolls to the bottom of the current viewport. */
  scrollToBottom() {
    const currentScrollPosition = window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Calculate the bottom of current viewport
    const bottomOfViewport = currentScrollPosition + viewportHeight;
    
    // If we're not at the very bottom of the page, scroll to bottom of current viewport
    if (bottomOfViewport < documentHeight) {
      this.isProgrammaticScroll = true;
      this.smoothScrollTo(bottomOfViewport, 500);
    } else {
      // If we're at the bottom, scroll to the very end of the page
      this.isProgrammaticScroll = true;
      this.smoothScrollTo(documentHeight - viewportHeight, 500);
    }
  }

  /** Scrolls to the top of the page. */
  scrollToTop() {
    this.isProgrammaticScroll = true;
    this.smoothScrollTo(0, 500);
  }

  /** Checks if all contact form fields are filled. */
  isFormComplete(): boolean {
    return this.contact.name.trim() !== '' && 
           this.contact.phone.trim() !== '' && 
           this.contact.email.trim() !== '' && 
           this.contact.message.trim() !== '';
  }

  /** Checks if the name is valid. */
  isNameValid(): boolean {
    const name = this.contact.name.trim();
    return name.length >= 2 && /^[A-Za-z\s]+$/.test(name);
  }

  /** Checks if the phone is valid. */
  isPhoneValid(): boolean {
    const phone = this.contact.phone.trim();
    return phone.length >= 7 && /^[0-9\-\s\(\)]+$/.test(phone);
  }

  /** Checks if the email is valid. */
  isEmailValid(): boolean {
    const email = this.contact.email.trim();
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }

  /** Checks if the message is valid. */
  isMessageValid(): boolean {
    const message = this.contact.message.trim();
    return message.length >= 10;
  }

  /** Checks if all fields are filled correctly and legally. */
  isFormCompleteAndValid(): boolean {
    return this.isNameValid() && 
           this.isPhoneValid() && 
           this.isEmailValid() && 
           this.isMessageValid();
  }

  /** Navigates to the section with the given ID. */
  navigateToSection(sectionId: string) {
    /** Sets the programmatic scroll flag to true. */
    this.isProgrammaticScroll = true;
    this.activeSection = sectionId;
    if (window.location.pathname !== '/') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.scrollToSection(sectionId), 100);
      });
    } else {
      this.scrollToSection(sectionId);
    }
    // Set activeSection immediately to prevent 'home' from flashing
  }

  /** Scrolls to the section with the given ID. */
  scrollToSection(sectionId: string) {
    /** Gets the section with the given ID. */
    const section = document.getElementById(sectionId);
    if (section) {
      const isMobile = window.innerWidth <= 480;
      const headerOffset = isMobile ? 38 : 100; // 38px for mobile, 100px for desktop
      const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
      this.isProgrammaticScroll = true;
      this.activeSection = sectionId;
      this.smoothScrollTo(elementPosition - headerOffset, 350, sectionId);
    }
  }

  /** Jumps to the top of the page if on the given route. */
  jumpToTopIfOnPage(route: string) {
    if (this.router.url === route) {
      window.scrollTo(0, 0); // Jump to the very top of the page
    }
  }

  /** Toggles the login box. */
  toggleLoginBox() {
    this.showLoginBox = !this.showLoginBox;
  }

  /** Logs in the user. */
  onLogin() {
    this.loginMessage = '';
    this.http.post<any>('http://localhost:3000/login', {
      email: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        if (res.success) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', this.username);
          localStorage.setItem('name', res.name);
          // If you return full name from backend, set it here:
          localStorage.setItem('fullName', res.fullName || res.name);
          this.isLoggedIn = true;
          this.name = res.name;
          this.fullName = res.fullName || res.name;
          this.showAuthModal = false;
        } else {
          this.loginMessage = res.message || 'Login failed.';
        }
      },
      error: (err) => {
        this.loginMessage = err?.error?.message || 'Login failed.';
      }
    });
  }

  /** Registers the user. */
  register() {
    this.http.post('http://localhost:3000/register', this.registerData).subscribe({
      next: (res: any) => this.registerMessage = res.message,
      error: (err) => this.registerMessage = err.error.message
    });
  }

  /** Switches to the register form. */
  switchToRegister() {
    this.showForgotPopup = false;
    this.authMode = 'register';
  }

  /** Toggles the user menu. */
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  /** Views the user requests. */
  viewRequests() {
    this.showUserMenu = false;
    this.router.navigate(['/user-requests']);
  }

  /** Closes the user menu when clicking outside. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-name') && !target.closest('.user-menu-popup')) {
      this.showUserMenu = false;
    }
  }
}


