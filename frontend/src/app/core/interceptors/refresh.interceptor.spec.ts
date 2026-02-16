import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { refreshInterceptor } from './refresh.interceptor';

function createMockAuthService() {
  return {
    accessToken: null as string | null,
    refresh: vi.fn<() => Promise<boolean>>(),
    logout: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };
}

describe('refreshInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(() => {
    mockAuthService = createMockAuthService();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([refreshInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should pass through successful requests without interception', () => {
    const expected = { data: 'ok' };

    httpClient.get('/api/test').subscribe((response) => {
      expect(response).toEqual(expected);
    });

    const req = httpTesting.expectOne('/api/test');
    req.flush(expected);

    expect(mockAuthService.refresh).not.toHaveBeenCalled();
  });

  it('should propagate non-401 errors directly', async () => {
    let caughtError: unknown;

    httpClient.get('/api/test').subscribe({
      error: (err) => {
        caughtError = err;
      },
    });

    const req = httpTesting.expectOne('/api/test');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(caughtError).toBeDefined();
    expect((caughtError as { status: number }).status).toBe(500);
    expect(mockAuthService.refresh).not.toHaveBeenCalled();
  });

  it('should refresh and replay on 401 for normal requests', async () => {
    mockAuthService.refresh.mockImplementation(async () => {
      mockAuthService.accessToken = 'new-access-token';
      return true;
    });

    let responseData: unknown;
    httpClient.get('/api/protected').subscribe({
      next: (data) => {
        responseData = data;
      },
    });

    // First request returns 401
    const firstReq = httpTesting.expectOne('/api/protected');
    firstReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Wait for refresh promise to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockAuthService.refresh).toHaveBeenCalledTimes(1);

    // Replayed request should have new Authorization header
    const retryReq = httpTesting.expectOne('/api/protected');
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-access-token');
    retryReq.flush({ data: 'success' });

    expect(responseData).toEqual({ data: 'success' });
  });

  it('should logout and propagate error when refresh fails', async () => {
    mockAuthService.refresh.mockResolvedValue(false);

    let caughtError: unknown;
    httpClient.get('/api/protected').subscribe({
      error: (err) => {
        caughtError = err;
      },
    });

    const req = httpTesting.expectOne('/api/protected');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Wait for refresh + logout promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockAuthService.refresh).toHaveBeenCalledTimes(1);
    expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    expect(caughtError).toBeDefined();
    expect((caughtError as { status: number }).status).toBe(401);
  });

  it('should NOT intercept 401 on /auth/login, /auth/register, /auth/refresh', async () => {
    const excludedUrls = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh'];

    for (const url of excludedUrls) {
      let caughtError: unknown;

      httpClient.post(url, {}).subscribe({
        error: (err) => {
          caughtError = err;
        },
      });

      const req = httpTesting.expectOne(url);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(caughtError).toBeDefined();
      expect((caughtError as { status: number }).status).toBe(401);
    }

    expect(mockAuthService.refresh).not.toHaveBeenCalled();
  });

  it('should deduplicate parallel refresh calls (only one refresh for multiple 401s)', async () => {
    let resolveRefresh!: (value: boolean) => void;
    mockAuthService.refresh.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    let response1: unknown;
    let response2: unknown;
    httpClient.get('/api/resource1').subscribe({ next: (data) => (response1 = data) });
    httpClient.get('/api/resource2').subscribe({ next: (data) => (response2 = data) });

    // Both requests return 401
    const req1 = httpTesting.expectOne('/api/resource1');
    const req2 = httpTesting.expectOne('/api/resource2');
    req1.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    req2.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Only ONE refresh call should have been made (dedup)
    expect(mockAuthService.refresh).toHaveBeenCalledTimes(1);

    // Resolve the single refresh
    mockAuthService.accessToken = 'shared-new-token';
    resolveRefresh(true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Both requests should be replayed with new token
    const retry1 = httpTesting.expectOne('/api/resource1');
    const retry2 = httpTesting.expectOne('/api/resource2');
    expect(retry1.request.headers.get('Authorization')).toBe('Bearer shared-new-token');
    expect(retry2.request.headers.get('Authorization')).toBe('Bearer shared-new-token');

    retry1.flush({ data: 'r1' });
    retry2.flush({ data: 'r2' });

    expect(response1).toEqual({ data: 'r1' });
    expect(response2).toEqual({ data: 'r2' });
  });
});
