import { TestBed } from '@angular/core/testing';

import { RedirectOnRefreshGuard } from './redirect-on-refresh.guard';

describe('RedirectOnRefreshGuard', () => {
  let guard: RedirectOnRefreshGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RedirectOnRefreshGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
