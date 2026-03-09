import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { HandymanService } from '../../handyman.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeAnimation', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
/** Handles the home page: displays the carousel and reviews, and the contact form. */
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  /** Carousel properties */
  carouselImages: string[] = [
    'assets/pic1.jpg',
    'assets/pic2.jpg',
    'assets/pic3.png'
  ];
  currentCarouselIndex = 0; /** The current carousel index. */
  carouselInterval: any;

  /** Reviews carousel properties */
  showLeftArrow = false;
  showRightArrow = true;
  currentReviewIndex = 0; /** The current review index. */    
  reviewsPerView = 4; /** The number of reviews per view. */
  cardWidth = 210; // 200px card + 10px gap for mobile
  totalReviews = 5; /** The total number of review cards. */
  
  /** Resize handler for arrow visibility updates */
  private resizeHandler = () => {
    this.updateArrowVisibility();
  };

  /** Contact form model */
  contact = {
    name: '',
    phone: '',
    email: '',
    service: '',
    message: ''
  };

  /** Error tracking properties */
  showNameError = false;
  showPhoneError = false;
  showEmailError = false;
  showServiceError = false;
  showMessageError = false;
  

  /** Touched flags for real-time validation */
  nameTouched = false;
  phoneTouched = false;
  emailTouched = false;
  serviceTouched = false;
  messageTouched = false;

  showPopup = false; /** Whether the popup is shown. */
  successMessage = ''; /** The success message. */
  isError = false;

  /** Reasons to choose Chait Handyman and Carpenter */
  whyList = [
    {
      icon: 'fa-check-circle',
      title: 'Quality Workmanship',
      description: 'We deliver top-quality results that last.'
    },
    {
      icon: 'fa-user-shield',
      title: 'Trustworthy',
      description: 'Honest, reliable, and fully insured.'
    },
    {
      icon: 'fa-clock',
      title: 'On-Time Service',
      description: 'We respect your time and always show up as promised.'
    },
    {
      icon: 'fa-thumbs-up',
      title: 'Customer Satisfaction',
      description: "We're not happy until you are."
    }
  ];

  /** Services list */
  servicesList: string[] = [
    'Carpentry',
    'Handyman',
    'Painting',
    'Plumbing',
    'Electrical',
    'Renovation',
    'Furniture Assembly',
    'Other'
  ];

  /** Constructor for the HomeComponent. */
  constructor(private router: Router, private handymanService: HandymanService) { }

  // Initializes the component
  ngOnInit(): void {
    this.startCarousel();
  }

  /** Destroys the component. */
  ngOnDestroy(): void {
    /** Stop carousel and remove resize listener to prevent memory leaks. */
    this.stopCarousel();
    /** Remove resize listener to prevent memory leaks. */
    window.removeEventListener('resize', this.resizeHandler);
  }

  /** After view init. */
  ngAfterViewInit() {
    /** Update arrow visibility on initial load. */
    this.updateArrowVisibility();
    
    /** Add window resize listener to update arrow visibility when screen size changes. */
    window.addEventListener('resize', this.resizeHandler);
  }
  
  /** Starts the carousel timer. */
  startCarousel() {
    this.stopCarousel();
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 2500);
  }

  /** Stops the carousel timer. */
  stopCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  /** Function to go to specific image when clicking on dot. */
  goToImage(index: number) {
    if (index >= 0 && index < this.carouselImages.length) {
      this.currentCarouselIndex = index;
      this.startCarousel(); /** Restart the timer. */
    }
  }

  /** Function to go to previous image. */
  previousSlide() {
    this.currentCarouselIndex = this.currentCarouselIndex === 0 
      ? this.carouselImages.length - 1 
      : this.currentCarouselIndex - 1;
    this.startCarousel(); /** Restart the timer. */
  }

  /** Function to go to next image. */
  nextSlide() {
    this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.carouselImages.length;
    this.startCarousel(); /** Restart the timer. */
  }

  /** Reviews carousel methods. */
  scrollReviews(direction: 'left' | 'right') {
    const carousel = document.querySelector('.reviews-carousel') as HTMLElement;
    if (!carousel) return;

    /** Check if we're on mobile (screen width <= 480px). */
    const isMobile = window.innerWidth <= 480;
    
    if (isMobile) {
      /** Mobile logic: smooth scroll by one card. */
      if (direction === 'left' && this.currentReviewIndex > 0) {
        this.currentReviewIndex -= 1;
      } else if (direction === 'right' && this.currentReviewIndex < this.totalReviews - 1.5) {
        this.currentReviewIndex += 1;
      }
      carousel.scrollTo({
        left: this.currentReviewIndex * this.cardWidth,
        behavior: 'smooth'
      });
    } else {
      /** Desktop logic: smoothly scroll by a whole card width (300px), last review flush right. */
      const cardWidth = 300; /** Width of each review card including gap. */
      const maxIndex = this.totalReviews - this.reviewsPerView;
      if (direction === 'left' && this.currentReviewIndex > 0) {
        this.currentReviewIndex = Math.max(0, this.currentReviewIndex - 1);
      } else if (direction === 'right' && this.currentReviewIndex < maxIndex) {
        this.currentReviewIndex = Math.min(maxIndex, this.currentReviewIndex + 1);
      }
      carousel.scrollTo({
        left: this.currentReviewIndex * cardWidth,
        behavior: 'smooth'
      });
    }

    /** Update arrow visibility. */
    this.updateArrowVisibility();
  }

  /** Updates arrow visibility based on scroll position. */
  updateArrowVisibility() {
    const isMobile = window.innerWidth <= 480;
    
    if (isMobile) {
      this.showLeftArrow = this.currentReviewIndex > 0;
      this.showRightArrow = this.currentReviewIndex < this.totalReviews - 1.5;
    } else {
      /** Hardcoded for 5 reviews, 4 visible at a time. */
      const maxIndex = 1;
      this.showLeftArrow = this.currentReviewIndex > 0;
      this.showRightArrow = this.currentReviewIndex < maxIndex;
    }
  }

  /** Submits contact form. */
  onSubmit() { 
    /** Set error flags based on validation results. */
    this.showNameError = !this.contact.name.trim() || !this.isNameValid();
    this.showPhoneError = !this.contact.phone.trim() || !this.isPhoneValid();
    this.showEmailError = !this.contact.email.trim() || !this.isEmailValid();
    this.showServiceError = !this.contact.service;
    this.showMessageError = !this.contact.message.trim() || !this.isMessageValid();

    if (
      !this.showNameError &&
      !this.showPhoneError &&
      !this.showEmailError &&
      !this.showServiceError &&
      !this.showMessageError
    ) {
      this.handymanService.sendContactForm(this.contact).subscribe(
        (response: any) => {
          console.log('Backend response:', response); // This should log the object
          this.isError = false;
          this.successMessage = response.message; // Use the message property
          this.showPopup = true;
          this.contact = { name: '', phone: '', email: '', service: '', message: '' };
          this.nameTouched = false;
          this.phoneTouched = false;
          this.emailTouched = false;
          this.serviceTouched = false;
          this.messageTouched = false;
          setTimeout(() => {
            this.showPopup = false;
          }, 8000);
        },
        error => {
          this.isError = true;
          this.successMessage = "There was an error. Please try again.";
          this.showPopup = true;
          setTimeout(() => {
            this.showPopup = false;
          }, 8000);
        }
      );
    }
  }

    /** Validates name field: must be at least 2 characters and contain only letters. */
    isNameValid(): boolean {
      return /^[A-Za-z\u0590-\u05FF\s]{2,}$/.test(this.contact.name.trim());
    }

    /** Validates phone field: must be at least 7 digits and contain only numbers, spaces, dashes, and parentheses. */
    isPhoneValid(): boolean {
      return /^[0-9\s\-()]{7,}$/.test(this.contact.phone.trim());
    }

    /** Validates email field: must be a valid email address. */
    isEmailValid(): boolean {
      return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.contact.email.trim());
    }

    /** Validates message field: must be at least 10 characters. */
    isMessageValid(): boolean {
      return this.contact.message.trim().length >= 10;
    }

    /** Navigates to services page. */
    goToServices() {
      this.router.navigate(['/services']);
    }
}
