import Dexie, { Table } from 'dexie';

export interface OfflineReport {
  id?: number;
  uuid: string; // UUID generated locally
  mode: string;
  lineId?: string;
  stationId?: string;
  direction?: string;
  vehicleContext: string;
  categoryId: string;
  subcategoryId: string;
  description?: string;
  photoUrl?: string; // We'll store base64 strings if offline, or object urls
  lat?: number;
  lng?: number;
  severity: string;
  isAnonymous: boolean;
  reporterToken: string;
  createdAt: Date;
  syncStatus: 'pending' | 'synced' | 'failed';
}

export class ReportDatabase extends Dexie {
  reports!: Table<OfflineReport, number>;

  constructor() {
    super('TransportReportDB');
    this.version(1).stores({
      reports: '++id, uuid, syncStatus, createdAt'
    });
  }
}

export const db = new ReportDatabase();

