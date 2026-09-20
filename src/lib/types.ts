export type Mode = 'metro' | 'bus' | 'brt';
export type VehicleContext = 'in_station' | 'on_vehicle' | 'transfer_point';
export type Severity = 'low' | 'medium' | 'high';

export interface MetaSubcategory {
  id: string;
  categoryId: string;
  titleFa: string;
  allowsPhoto: boolean;
  isSensitive: boolean;
}
export interface MetaCategory {
  id: string;
  titleFa: string;
  subcategories: MetaSubcategory[];
}
export interface MetaLine {
  id: string;
  name: string;
  mode: Mode;
  color: string | null;
}
export interface MetaStation {
  id: string;
  name: string;
  lineIds: string[];
  lat: number | null;
  lng: number | null;
  isInterchange: boolean;
}
export interface Meta {
  categories: MetaCategory[];
  lines: MetaLine[];
  stations: MetaStation[];
}

export interface ReportPayload {
  id: string;
  mode: Mode;
  lineId?: string | null;
  stationId?: string | null;
  vehicleContext: VehicleContext;
  categoryId: string;
  subcategoryId: string;
  description?: string | null;
  severity: Severity;
  lat?: number | null;
  lng?: number | null;
  occurredAt?: string;
  reporterToken: string;
}

export interface SubmitResult {
  id: string;
  trackingCode: string;
  stationName: string | null;
  stationWeekCount: number | null;
}

export const MAX_DESCRIPTION = 300;
