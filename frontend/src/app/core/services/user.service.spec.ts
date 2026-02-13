import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET /api/v1/users/me', () => {
    const mockData = {
      data: { id: '1', name: 'Test', email: 'test@test.com', avatarUrl: null },
    };

    service.getProfile().subscribe((res) => {
      expect(res.data.name).toBe('Test');
    });

    const req = httpMock.expectOne('/api/v1/users/me');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should PUT /api/v1/users/me', () => {
    const dto = { name: 'New Name', email: 'new@test.com' };
    const mockData = {
      data: { id: '1', name: 'New Name', email: 'new@test.com', avatarUrl: null },
    };

    service.updateProfile(dto).subscribe((res) => {
      expect(res.data.name).toBe('New Name');
    });

    const req = httpMock.expectOne('/api/v1/users/me');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);
    req.flush(mockData);
  });

  it('should POST /api/v1/users/me/avatar with FormData', () => {
    const file = new File(['img'], 'avatar.png', { type: 'image/png' });

    service.uploadAvatar(file).subscribe();

    const req = httpMock.expectOne('/api/v1/users/me/avatar');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush({ data: { avatarUrl: 'https://url.com/avatar.png' } });
  });
});
