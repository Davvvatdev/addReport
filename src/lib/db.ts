import Dexie, { Table } from 'dexie';

export interface OfflineReport {
  id?: number;
  uuid: string; // UUID generated locally; becomes the server id
  mode: string;
  lineId?: string;
  stationId?: string;
  direction?: string;
  vehicleContext: string;
  categoryId: string;
  subcategoryId: string;
  description?: string;
  photoData?: string; // compressed data URL, uploaded after the text report
  lat?: number;
  lng?: number;
  severity: string;
  isAnonymous: boolean;
  reporterToken: string;
  occurredAt: Date;
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
