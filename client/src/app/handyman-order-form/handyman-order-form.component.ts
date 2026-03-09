import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HandymanService } from '../handyman.service';
import { WorkOrder } from '../work-order';

@Component({
  selector: 'app-handyman-order-form',
  templateUrl: './handyman-order-form.component.html',
  styleUrls: ['./handyman-order-form.component.css']
})
export class HandymanOrderFormComponent implements OnInit {
  workOrderForm: FormGroup; /** The form group for the work order. */
  workTypeCategories: string[] = []; /** The categories of work types. */ 
  workSubTypes: string[] = []; /** The sub-types of work types. */
  currentStep = 1; /** The current step of the form. */
  totalSteps = 3; /** The total number of steps in the form. */
  isSubmitting = false; /** Whether the form is being submitted. */
  showSuccess = false; /** Whether the success message is shown. */
  showCustomWorkType = false; /** Whether the custom work type is shown. */

  /** Constructor for the HandymanOrderFormComponent. */
  constructor(
    private fb: FormBuilder,
    private handymanService: HandymanService
  ) {
    this.workOrderForm = this.fb.group({
      workType: ['', Validators.required],
      workSubType: ['', Validators.required],
      customWorkType: [''],
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', [Validators.required, Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      customerAddress: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority: ['medium', Validators.required],
      scheduledDate: ['']
    });
  }

  /** Initializes the component. */
  ngOnInit(): void {
    this.workTypeCategories = this.handymanService.getWorkTypeCategories();
    
    /** Watches for work type changes. */
    this.workOrderForm.get('workType')?.valueChanges.subscribe(workType => {
      this.workSubTypes = this.handymanService.getWorkSubTypes(workType);
      this.workOrderForm.patchValue({ workSubType: '' });
      this.showCustomWorkType = false;
    });

    /** Watches for work sub-type changes. */
    this.workOrderForm.get('workSubType')?.valueChanges.subscribe(subType => {
      this.showCustomWorkType = subType === 'Other';
      if (this.showCustomWorkType) {
        this.workOrderForm.get('customWorkType')?.setValidators([Validators.required]);
      } else {
        this.workOrderForm.get('customWorkType')?.clearValidators();
      }
      this.workOrderForm.get('customWorkType')?.updateValueAndValidity();
    });
  }
  /** Advances to next step if current step is valid. */
  nextStep(): void {
    if (this.isStepValid()) {
      this.currentStep++;
    }
  }
  /** Returns to previous step (no validation required). */
  previousStep(): void {
    this.currentStep--;
  }

  /** Validates all required fields for the current step. */
  isStepValid(): boolean {
    switch (this.currentStep) {
      /** Validates the work type and sub-type. */
      case 1:
        return this.workOrderForm.get('workType')?.valid && 
               this.workOrderForm.get('workSubType')?.valid &&
               (!this.showCustomWorkType || this.workOrderForm.get('customWorkType')?.valid);
      /** Validates the customer name, email, phone and address. */
      case 2:
        return this.workOrderForm.get('customerName')?.valid &&
               this.workOrderForm.get('customerEmail')?.valid &&
               this.workOrderForm.get('customerPhone')?.valid &&
               this.workOrderForm.get('customerAddress')?.valid;
      /** Validates the description and priority. */
      case 3:
        return this.workOrderForm.get('description')?.valid &&
               this.workOrderForm.get('priority')?.valid;
      default:
        return false;
    }
  }

  /** Returns progress percentage (0-100) for the progress bar. */
  getStepProgress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  /** Returns the display title for the current step. */
  getStepTitle(): string {
    switch (this.currentStep) {
      case 1: return 'Select Work Type';
      case 2: return 'Contact Information';
      case 3: return 'Work Details';
      default: return '';
    }
  }

  /** Submits the form and creates a work order via the service. */
  onSubmit(): void {
    /** If the form is valid, submit the form and create a work order via the service. */
    if (this.workOrderForm.valid) {
      this.isSubmitting = true;
      
      const formValue = this.workOrderForm.value; 
      const workOrderData = {
        workType: formValue.workType,
        workSubType: formValue.workSubType === 'Other' ? formValue.customWorkType : formValue.workSubType,
        customWorkType: formValue.workSubType === 'Other' ? formValue.customWorkType : undefined,
        customerName: formValue.customerName,
        customerEmail: formValue.customerEmail,
        customerPhone: formValue.customerPhone,
        customerAddress: formValue.customerAddress,
        description: formValue.description,
        priority: formValue.priority,
        scheduledDate: formValue.scheduledDate ? new Date(formValue.scheduledDate) : undefined
      };
      /** Creates a work order via the service. */
      this.handymanService.createWorkOrder(workOrderData).subscribe({
        next: (workOrder) => {
          this.isSubmitting = false;
          /** Shows the success message. */
          this.showSuccess = true;
          this.workOrderForm.reset();
          this.currentStep = 1;
          this.showCustomWorkType = false;
          /** Hides the success message after 5 seconds. */
          setTimeout(() => {
            this.showSuccess = false;
          }, 5000);
        },
        /** If the work order is not created, show an error message. */
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating work order:', error);
          alert('There was an error creating your work order. Please try again.');
        }
      });
    } else {
      /** If the form is not valid, show an error message. */
      alert('Please fill in all required fields.');
    }
  }

  /** Resets form to initial state and returns to step 1. */
  resetForm(): void {
    this.workOrderForm.reset();
    this.currentStep = 1;
    this.showCustomWorkType = false;
    this.showSuccess = false;
  }

  /** Returns error message for a form field if validation fails. */
  getFieldError(fieldName: string): string {
    const field = this.workOrderForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return 'Please enter a valid phone number';
    }
    return '';
  }

  /** Handles work type selection from UI squares and updates sub-types. */
  selectWorkType(workType: string): void {
    this.workOrderForm.patchValue({ workType });
    this.workSubTypes = this.handymanService.getWorkSubTypes(workType);
    this.workOrderForm.patchValue({ workSubType: '' });
    this.showCustomWorkType = false;
  }
}
