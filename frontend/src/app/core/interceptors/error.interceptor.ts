import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: { field: string; issue: string }[];
  timestamp?: string;
}

import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((httpError: HttpErrorResponse) => {
      // Global redirect for unauthorized or forbidden
      if (httpError.status === 401) {
        router.navigate(['/login']);
      } else if (httpError.status === 403) {
        // Only redirect to groups if not already on login/register pages
        if (!router.url.includes('/login') && !router.url.includes('/register') && !router.url.includes('/invite')) {
          router.navigate(['/groups']);
        }
      }

      // Extract structured API error from response body
      if (
        httpError.error &&
        typeof httpError.error === 'object' &&
        'message' in httpError.error
      ) {
        return throwError((): ApiError => ({
          statusCode: httpError.error.statusCode ?? httpError.status,
          error: httpError.error.error ?? 'UNKNOWN_ERROR',
          message: httpError.error.message,
          details: httpError.error.details,
          timestamp: httpError.error.timestamp,
        }));
      }

      // Fallback for network or non-structured errors
      return throwError((): ApiError => ({
        statusCode: httpError.status || 0,
        error: 'NETWORK_ERROR',
        message: 'Une erreur réseau est survenue',
      }));
    }),
  );
};
