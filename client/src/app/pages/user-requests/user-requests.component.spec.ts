import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRequestsComponent } from './user-requests.component';

// Tests the UserRequestsComponent
describe('UserRequestsComponent', () => {
  let component: UserRequestsComponent;
  let fixture: ComponentFixture<UserRequestsComponent>;

  // Configures the testing module
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserRequestsComponent ]
    })
    .compileComponents();
  });

  // Creates the component instance
  beforeEach(() => {
    fixture = TestBed.createComponent(UserRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Tests that the component is created
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
