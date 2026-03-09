import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

// Tests the AppComponent
describe('AppComponent', () => {
  // Configures the testing module
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  // Creates the component instance
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Tests that the component is created
  it(`should have as title 'work-orders-app'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('work-orders-app');
  });

  // Tests that the component is created
  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('work-orders-app app is running!');
  });
});
