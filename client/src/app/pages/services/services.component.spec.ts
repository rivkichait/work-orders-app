import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesComponent } from './services.component';

// Tests the ServicesComponent
describe('ServicesComponent', () => {
  let component: ServicesComponent;
  let fixture: ComponentFixture<ServicesComponent>;

  // Configures the testing module
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicesComponent ]
    })
    .compileComponents();
  });

  // Creates the component instance
  beforeEach(() => {
    fixture = TestBed.createComponent(ServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Tests that the component is created
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
