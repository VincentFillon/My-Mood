import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * Refresh state is encapsulated in a closure to avoid module-level mutable state.
 * This prevents SSR state leaks and improves test isolation.
 */
function createRefreshState() {
  let isRefreshing = false;
  let refreshPromise: Promise<boolean> | null = null;

  return {
    getOrStartRefresh(authService: AuthService): Promise<boolean> {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = authService.refresh().finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
      }
      return refreshPromise!;
    },
  };
}

const refreshState = createRefreshState();

export const refreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !req.url.includes('/auth/refresh') &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/register')
      ) {
        const promise = refreshState.getOrStartRefresh(authService);

        return from(promise).pipe(
          switchMap((success) => {
            if (success) {
              // Replay the original request with new access token
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${authService.accessToken}`,
                },
              });
              return next(newReq);
            }
            // Refresh failed — let catchError handle logout
            return throwError(() => error);
          }),
          catchError(() => {
            return from(authService.logout()).pipe(
              switchMap(() => throwError(() => error)),
            );
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
