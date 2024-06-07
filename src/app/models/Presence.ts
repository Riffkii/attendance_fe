import { PresenceType } from './PresenceType';

export interface Presence {
  id: number;
  nik: string;
  name: string;
  PresenceType: PresenceType;
  checkIn: Date;
  checkOut: Date;
  pict: string;
  geometry: GeoJSONGeometry;
}

interface GeoJSONGeometry {
  type: string;
  coordinates: number[];
}
