import type { AmenityEnum, HighlightEnum } from "@/lib/constants";

// Browser-safe API response types. Do not copy Prisma's generated server client
// into the Next.js application: it contains server runtime declarations.
export type Amenity =
  | "WasherDryer" | "AirConditioning" | "Dishwasher" | "HighSpeedInternet"
  | "HardwoodFloors" | "WalkInClosets" | "Microwave" | "Refrigerator"
  | "Pool" | "Gym" | "Parking" | "PetsAllowed" | "WiFi";

export type Highlight =
  | "HighSpeedInternetAccess" | "WasherDryer" | "AirConditioning" | "Heating"
  | "SmokeFree" | "CableReady" | "SatelliteTV" | "DoubleVanities"
  | "TubShower" | "Intercom" | "SprinklerSystem" | "RecentlyRenovated"
  | "CloseToTransit" | "GreatView" | "QuietNeighborhood";

export type PropertyType =
  | "Rooms"
  | "Tinyhouse"
  | "Apartment"
  | "Villa"
  | "Townhouse"
  | "SingleFamilyHome"
  | "Cottage";
export type ApplicationStatus = "Pending" | "Denied" | "Approved";
export type PaymentStatus = "Pending" | "Paid" | "PartiallyPaid" | "Overdue";

export interface Coordinates {
  longitude: number;
  latitude: number;
}

export interface Location {
  id: number;
  /** @deprecated use addressLine1 */
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  /** @deprecated use stateName */
  state: string;
  stateName?: string;
  stateCode?: string;
  /** @deprecated use countryName */
  country: string;
  countryName?: string;
  countryCode?: string;
  postalCode: string;
  formattedAddress?: string;
  mapboxFeatureId?: string;
  coordinates: Coordinates;
}

export interface Property {
  id: number;
  name: string;
  description: string;
  pricePerMonth: number;
  securityDeposit: number;
  applicationFee: number;
  photoUrls: string[];
  amenities: AmenityEnum[];
  highlights: HighlightEnum[];
  isPetsAllowed: boolean;
  isParkingIncluded: boolean;
  beds: number;
  baths: number;
  squareFeet: number;
  propertyType: PropertyType;
  postedDate: string | Date;
  averageRating: number;
  numberOfReviews: number;
  locationId: number;
  managerUserId: string;
  location: Location;
  manager?: Manager;
}

export interface NearbyPlace {
  name: string;
  category: "GROCERY" | "RESTAURANT" | "PHARMACY" | "GAS_STATION" | "TRANSIT";
  latitude: number;
  longitude: number;
  distanceMeters: number;
}

export interface NearbyPlacesResponse {
  groceries: NearbyPlace[];
  restaurants: NearbyPlace[];
  pharmacies: NearbyPlace[];
  gasStations: NearbyPlace[];
  transit: NearbyPlace[];
}

export interface Manager {
  id: number;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  image?: string;
  managedProperties?: Property[];
}

export interface Tenant {
  id: number;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  image?: string;
  properties?: Property[];
  favorites: Property[];
  applications?: Application[];
  leases?: Lease[];
}

export interface Application {
  id: number;
  applicationDate: string | Date;
  status: ApplicationStatus;
  propertyId: number;
  tenantUserId: string;
  name: string;
  email: string;
  phoneNumber: string;
  message: string | null;
  leaseId: number | null;
  property: Property;
  tenant: Tenant;
  lease: Lease | null;
}

export interface Lease {
  id: number;
  startDate: string | Date;
  endDate: string | Date;
  rent: number;
  deposit: number;
  propertyId: number;
  tenantUserId: string;
  property?: Property;
  tenant: Tenant;
  payments?: Payment[];
}

export interface Payment {
  id: number;
  amountDue: number;
  amountPaid: number;
  dueDate: string | Date;
  paymentDate: string | Date | null;
  paymentStatus: PaymentStatus;
  leaseId: number;
}

export interface PaymentMethod {
  id: number;
  cardholderName: string;
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  billingAddress: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface SavePaymentMethodRequest {
  cardholderName: string;
  cardNumber?: string;
  expiryDate: string;
  securityCode?: string;
  isDefault: boolean;
  billingAddress: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
}
