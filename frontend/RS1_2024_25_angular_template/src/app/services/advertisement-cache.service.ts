import { Injectable } from '@angular/core';
import { PagedAdvertResponse } from '../endpoints/advertisement-endpoints/advertisement-get-by-user-endpoint.service';
import { BehaviorSubject, Observable } from 'rxjs';

interface CacheEntry {
  data: PagedAdvertResponse;
  timestamp: number;
  key: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private cacheInvalidations = new BehaviorSubject<string | null>(null);

  constructor() {
    setInterval(() => this.clearExpiredCache(), this.CACHE_DURATION);
  }

  getCacheKey(userId: number, statusId?: number, pageNumber: number = 1): string {
    return `user_${userId}_status_${statusId}_page_${pageNumber}`;
  }

  get(key: string): PagedAdvertResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache is expired
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: PagedAdvertResponse, notify: boolean = false): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
    if (notify) {
      this.cacheInvalidations.next(key);
    }
  }

  invalidateUserCache(userId: number): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((entry, key) => {
      if (key.startsWith(`user_${userId}`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    this.cacheInvalidations.next(`user_${userId}`);
  }

  getCacheInvalidations(): Observable<string | null> {
    return this.cacheInvalidations.asObservable();
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    });
  }
}
