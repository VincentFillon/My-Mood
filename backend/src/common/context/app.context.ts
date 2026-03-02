import { AsyncLocalStorage } from 'node:async_hooks';

export interface AppContext {
  userId?: string;
  groupId?: string;
}

export const appContext = new AsyncLocalStorage<AppContext>();
