import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
/** Handles the services page: displays the services list. */
export class ServicesComponent implements OnInit {

  /** Constructor for the ServicesComponent. */
  constructor(private router: Router) { }
  
  /** Initializes the component. */
  ngOnInit(): void {
    // No redirect – allow opening Services page every time from the nav
  }
   
  /** Navigates to the section with the given ID. */
  navigateToSection(sectionId: string) {
    /** Navigates to the section with the given ID. */
    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        const headerOffset = 120; /** The header offset. */
        const section = document.getElementById(sectionId); /** The section. */
        if (section) {
          const elementPosition = section.getBoundingClientRect().top + window.pageYOffset; /** The element position. */
          /** Scrolls to the section with the given ID. */
          window.scrollTo({
            top: elementPosition - headerOffset,
            behavior: 'smooth'
          });
        }
      }, 100);
    });
  }

  /** Services array. */
  Services = [
    {
      icon: 'fa-tools',
      title: 'REPAIRS',
      description: 'Fixes for all typs of issues: doors and sliding doors, handles, shelvs, pergolas, damaged drywalls walls, and more.'
    },
    {
      icon: 'fa-wrench',
      title: 'MAINTENANCE',
      description: 'Replacement and installation of doors, fly screens, shelvs, picturs, curtains. paint touch-ups, timber paint and more.'
    },
    {
      icon: 'fa-border-all',
      title: 'FENCING',
      description: 'Installation and repairs of fences and gates - timber, colorbond, PVC.'
    },
    {
      icon: 'fa-hammer',
      title: 'CARPENTRY',
      description: 'Construction of decks, pergolas, timber, progects of both indoor and outdoor spaces.'
    },
    {
      icon: 'fa-paint-roller',
      title: 'LIGHT HOME RENOVATIONS',
      description: 'Painting, drywall work, flooring, installation, skirting boards and decorative walls.'
    },
    {
      icon: 'fa-couch',
      title: 'FURNITURE ASSEMBLY',
      description: 'Installation of furniture, custom carpentry and oudoor sheds.'
    }
  ];
}

