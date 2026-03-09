import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
/** Handles the gallery page: displays the gallery images. */
export class GalleryComponent implements OnInit {
  imageCount = 10; /** The number of images in the gallery. */
  galleryImages: string[] = []; /** The array of gallery images. */

  /** Constructor for the GalleryComponent. */
  constructor() { }

  /** Initializes the component. */
  ngOnInit(): void {
    // No redirect – allow opening Gallery page every time from the nav

    /** Adds the images to the galleryImages array. */
    for (let i = 1; i <= this.imageCount; i++) {
      this.galleryImages.push(`assets/${i}.jpg`);
    }
  }  
}
