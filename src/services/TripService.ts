import { STORAGE_KEYS } from '@/lib/storageKeys';
import { TripChecklist, TripSyncStatus } from '@/lib/mockData';

export interface TripReportInput {
  id: string;
  bookingId: string;
  date: string;
  sourceRef: string;
  bookingSource: string;
  supplier: string;
  clientName: string;
  driverName: string;
  carType: string;
  parkingLocation: string;
  pickupPoint: string;
  dropoffPoint: string;
  supervisorName: string;
  supervisorRating: number;
  supervisorNotes?: string;
  passengerFeedback?: string;
  checklist: TripChecklist;
  status: 'approved' | 'warning';
  createdBy?: string;
  syncSource?: string;
  offline?: boolean;
}

export interface TripPhotoAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  base64: string;
}

export interface OfflineTripRecord {
  id: string;
  payload: TripReportInput;
  attachments: TripPhotoAttachment[];
  createdAt: string;
  status: TripSyncStatus;
  error?: string;
  lastSyncAttempt?: string;
}

export interface TripSyncResponse {
  success: boolean;
  tripId: string;
  photosUploaded: number;
  photos?: Array<{
    trip_id: string;
    storage_path: string;
    file_name: string;
    file_size: number;
    mime_type: string;
  }>;
}

const TRIP_API_URL = import.meta.env.VITE_TRIPS_API_URL || '/api/trips/sync';

const isBrowser = typeof window !== 'undefined';

export class TripService {
  static loadQueue(): OfflineTripRecord[] {
    if (!isBrowser) return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.TRIPS_QUEUE);
      return raw ? (JSON.parse(raw) as OfflineTripRecord[]) : [];
    } catch (error) {
      console.warn('[TripService] Failed to parse offline queue:', error);
      return [];
    }
  }

  static saveQueue(queue: OfflineTripRecord[]) {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.TRIPS_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.warn('[TripService] Failed to persist offline queue:', error);
    }
  }

  static enqueue(record: OfflineTripRecord): OfflineTripRecord[] {
    const queue = this.loadQueue();
    queue.push(record);
    this.saveQueue(queue);
    return queue;
  }

  static removeFromQueue(id: string): OfflineTripRecord[] {
    const queue = this.loadQueue().filter((item) => item.id !== id);
    this.saveQueue(queue);
    return queue;
  }

  static upsertRecord(record: OfflineTripRecord): OfflineTripRecord[] {
    const queue = this.loadQueue();
    const idx = queue.findIndex((item) => item.id === record.id);
    if (idx === -1) {
      queue.push(record);
    } else {
      queue[idx] = record;
    }
    this.saveQueue(queue);
    return queue;
  }

  static async syncRecord(record: OfflineTripRecord): Promise<TripSyncResponse> {
    const response = await fetch(TRIP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trip: record.payload,
        attachments: record.attachments,
      }),
    });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const errorJson = await response.json();
        detail = errorJson?.detail || errorJson?.message || detail;
      } catch {
        // ignore parse error
      }
      throw new Error(detail);
    }

    return response.json() as Promise<TripSyncResponse>;
  }

  static async syncQueue(
    onProgress?: (record: OfflineTripRecord, status: TripSyncStatus, error?: string) => void
  ): Promise<{ success: number; failed: number }> {
    const queue = this.loadQueue();
    if (!queue.length) {
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;
    const remaining: OfflineTripRecord[] = [];

    for (const record of queue) {
      try {
        const result = await this.syncRecord(record);
        success += 1;
        onProgress?.(record, 'synced');
        // no need to keep in queue
      } catch (error) {
        failed += 1;
        const updated = {
          ...record,
          status: 'failed' as TripSyncStatus,
          error: error instanceof Error ? error.message : 'unknown_error',
          lastSyncAttempt: new Date().toISOString(),
        };
        remaining.push(updated);
        onProgress?.(updated, 'failed', updated.error);
      }
    }

    this.saveQueue(remaining);
    return { success, failed };
  }
}

