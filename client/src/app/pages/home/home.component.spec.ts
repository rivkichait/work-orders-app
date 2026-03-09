import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';

// Tests the HomeComponent
describe('HomeComponent', () => { 
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  // Configures the testing module
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeComponent ]
    })
    .compileComponents();
  });

  // Creates the component instance
  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


