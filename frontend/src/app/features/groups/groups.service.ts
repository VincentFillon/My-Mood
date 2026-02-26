import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.js';
import { CreateGroupDto, GroupResponse, InviteUrlResponse } from '@shared/schemas/group.schema.js';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GroupsService {
    #http = inject(HttpClient);

    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly groups = signal<GroupResponse[]>([]);
    readonly currentGroup = signal<GroupResponse | null>(null);

    async createGroup(data: CreateGroupDto): Promise<GroupResponse> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const response = await firstValueFrom(
                this.#http.post<{ data: GroupResponse }>(`${environment.apiUrl}/v1/groups`, data)
            );
            const newGroup = response.data;
            this.groups.update(groups => [...groups, newGroup]);
            this.currentGroup.set(newGroup);
            return newGroup;
        } catch (err: any) {
            this.error.set(err.error?.message || 'Erreur lors de la création du groupe');
            throw err;
        } finally {
            this.loading.set(false);
        }
    }

    async fetchGroups(): Promise<void> {
        this.loading.set(true);
        this.error.set(null);
        try {
            const response = await firstValueFrom(
                this.#http.get<{ data: GroupResponse[] }>(`${environment.apiUrl}/v1/groups/me`)
            );
            this.groups.set(response.data);
            if (response.data.length > 0) {
                this.currentGroup.set(response.data[0]);
            }
        } catch (err: any) {
            this.error.set(err.error?.message || 'Erreur lors du chargement des groupes');
        } finally {
            this.loading.set(false);
        }
    }

    async generateInvite(groupId: string): Promise<InviteUrlResponse> {
        try {
            const response = await firstValueFrom(
                this.#http.post<{ data: InviteUrlResponse }>(`${environment.apiUrl}/v1/groups/${groupId}/invite`, {})
            );
            return response.data;
        } catch (err: any) {
            throw err?.error?.message || 'Erreur lors de la génération du lien d\'invitation';
        }
    }

    async joinGroup(token: string): Promise<{ message: string, groupId: string }> {
        try {
            const response = await firstValueFrom(
                this.#http.post<{ data: { message: string, groupId: string } }>(`${environment.apiUrl}/v1/groups/join/${token}`, {})
            );
            return response.data;
        } catch (err: any) {
            throw err;
        }
    }
}
