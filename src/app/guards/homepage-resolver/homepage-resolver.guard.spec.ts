import { TestBed, async, inject } from '@angular/core/testing';

import { HomepageResolverGuard } from './homepage-resolver.guard';

describe('HomepageResolverGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HomepageResolverGuard]
    });
  });

  it('should ...', inject([HomepageResolverGuard], (guard: HomepageResolverGuard) => {
    expect(guard).toBeTruthy();
  }));
});
