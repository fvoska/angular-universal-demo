import { inject, TestBed } from '@angular/core/testing';
import { PlatformService } from '../platform/platform.service';
import { CookieService } from './cookie.service';

describe('CookieService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CookieService,
        PlatformService,
      ],
    });
  });

  it('should be created', inject([CookieService], (service: CookieService) => {
    expect(service).toBeTruthy();
  }));
});
