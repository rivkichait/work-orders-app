import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WorkOrder } from './work-order';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HandymanService {
  private workOrders: WorkOrder[] = [];
  private nextId = 1;
  private apiUrl = 'http://localhost:3000/request-quote';

  // Work type categories and their sub-types
  workTypes: { [key: string]: string[] } = {
    'Plumbing': [
      'Leaky Faucet',
      'Clogged Drain',
      'Water Heater Repair',
      'Pipe Installation',
      'Toilet Repair',
      'Shower Installation',
      'Other'
    ],
    'Electrical': [
      'Outlet Installation',
      'Light Fixture Installation',
      'Circuit Breaker Repair',
      'Wiring Installation',
      'Ceiling Fan Installation',
      'Electrical Panel Upgrade',
      'Other'
    ],
    'Carpentry': [
      'Door Installation',
      'Window Repair',
      'Cabinet Installation',
      'Deck Building',
      'Fence Repair',
      'Furniture Assembly',
      'Other'
    ],
    'HVAC': [
      'AC Repair',
      'Heating Repair',
      'Duct Cleaning',
      'Thermostat Installation',
      'Air Filter Replacement',
      'Ventilation System',
      'Other'
    ],
    'Painting': [
      'Interior Painting',
      'Exterior Painting',
      'Wallpaper Installation',
      'Deck Staining',
      'Cabinet Painting',
      'Fence Painting',
      'Other'
    ],
    'Cleaning': [
      'Deep Cleaning',
      'Carpet Cleaning',
      'Window Cleaning',
      'Gutter Cleaning',
      'Pressure Washing',
      'Post-Construction Cleanup',
      'Other'
    ],
    'Other': []
  };

  constructor(private http: HttpClient) {
    // Load existing work orders from localStorage if available
    const savedOrders = localStorage.getItem('workOrders');
    if (savedOrders) {
      this.workOrders = JSON.parse(savedOrders);
      this.nextId = Math.max(...this.workOrders.map(order => order.id || 0)) + 1;
    }
  }

  // Get all work orders
  getWorkOrders(): Observable<WorkOrder[]> {
    return of(this.workOrders);
  }

  // Get work order by ID
  getWorkOrder(id: number): Observable<WorkOrder | undefined> {
    const order = this.workOrders.find(order => order.id === id);
    return of(order);
  }

  // Create new work order
  createWorkOrder(workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'status'>): Observable<WorkOrder> {
    const newOrder: WorkOrder = {
      ...workOrder,
      id: this.nextId++,
      createdAt: new Date(),
      status: 'pending'
    };
    
    this.workOrders.push(newOrder);
    this.saveToLocalStorage();
    return of(newOrder);
  }

  // Update work order
  updateWorkOrder(id: number, updates: Partial<WorkOrder>): Observable<WorkOrder | undefined> {
    const index = this.workOrders.findIndex(order => order.id === id);
    if (index !== -1) {
      this.workOrders[index] = { ...this.workOrders[index], ...updates };
      this.saveToLocalStorage();
      return of(this.workOrders[index]);
    }
    return of(undefined);
  }

  // Delete work order
  deleteWorkOrder(id: number): Observable<boolean> {
    const index = this.workOrders.findIndex(order => order.id === id);
    if (index !== -1) {
      this.workOrders.splice(index, 1);
      this.saveToLocalStorage();
      return of(true);
    }
    return of(false);
  }

  // Get work type categories
  getWorkTypeCategories(): string[] {
    return Object.keys(this.workTypes);
  }

  // Get sub-types for a work type
  getWorkSubTypes(workType: string): string[] {
    return this.workTypes[workType] || [];
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    localStorage.setItem('workOrders', JSON.stringify(this.workOrders));
  }

  /** Sends the contact form. */
  sendContactForm(contact: any) {
    /** Sends the contact form to the backend. */
    return this.http.post('http://localhost:3000/request-quote', contact);
  }
} 