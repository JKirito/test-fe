export interface PinData {
  projectId: string;
  projectName?: string;
  projectname?: string;
  projectdirector?: string;
  company?: string;
  industry?: string;
  latitude: number;
  longitude: number;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  initialPosition?: { x: number; y: number };
  isHighlighted?: boolean;
}

export interface ProjectDetails {
  customerName: string;
  projectName: string;
  city: string;
  industry: string;
  serviceOffering: string;
  plannedRevenue: number;
  projectId: string;
  projectDirector: string;
  projectManager: string;
  estimatedProjectValue: number;
  contactPerson: string;
  salesCurrency: string;
  projectAddress: string | null;
  profitCenter: string;
  totalRevenues: number;
  clientType: string;
  projectType: string;
  startDate: string | null;
  endDate: string | null;
  activeDate: string | null;
}

export interface ActivePinData extends PinData {
  isHighlighted: boolean;
  initialPosition: { x: number; y: number };
  details?: ProjectDetails;
}

export interface GeoJSONFeature {
  type: string;
  properties: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

export interface GeoJSONData {
  type: string;
  name: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: GeoJSONFeature[];
}

export interface Cluster {
  center: {
    lat: number;
    lng: number;
  };
  pins: PinData[];
  industry?: string;
}
