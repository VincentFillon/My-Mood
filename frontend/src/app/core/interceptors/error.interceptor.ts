import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: { field: string; issue: string }[];
  timestamp?: string;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((httpError: HttpErrorResponse) => {
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
