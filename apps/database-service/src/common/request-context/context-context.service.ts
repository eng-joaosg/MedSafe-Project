import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

@Injectable()
export class RequestContextService {
  private storage = new AsyncLocalStorage<Map<string, any>>();
  run(callback: () => any, initialData?: Map<string, any>) {
    this.storage.run(initialData || new Map<string, any>(), callback);
  }
  set(key: string, value: any) {
    this.storage.getStore()?.set(key, value);
  }
  get<T>(key: string): T | undefined {
    return this.storage.getStore()?.get(key);
  }
}
