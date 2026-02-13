import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { UpdateProfileInput } from '@shared/schemas/user.schema';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<{ data: UserProfile }> {
    return this.http.get<{ data: UserProfile }>('/api/v1/users/me', {
      withCredentials: true,
    });
  }

  updateProfile(dto: UpdateProfileInput): Observable<{ data: UserProfile }> {
    return this.http.put<{ data: UserProfile }>('/api/v1/users/me', dto, {
      withCredentials: true,
    });
  }

  uploadAvatar(file: File): Observable<HttpEvent<{ data: { avatarUrl: string } }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ data: { avatarUrl: string } }>(
      '/api/v1/users/me/avatar',
      formData,
      {
        withCredentials: true,
        reportProgress: true,
        observe: 'events',
      },
    );
  }
}
