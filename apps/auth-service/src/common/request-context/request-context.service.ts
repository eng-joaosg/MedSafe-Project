import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

@Injectable()
export class RequestContextService {
  private storage = new AsyncLocalStorage<Map<string, any>>();

  run<T>(callback: () => T, initialData?: Map<string, any>): T {
    let result: T;
    this.storage.run(initialData || new Map<string, any>(), () => {
      result = callback();
      return result;
    });
    return result!;
  }

  set(key: string, value: any) {
    this.storage.getStore()?.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.storage.getStore()?.get(key);
  }
}
