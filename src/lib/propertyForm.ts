import { AmenityEnum, PropertyTypeEnum } from "@/lib/constants";
import type { PropertyFormData } from "@/lib/schemas";
import type { Property } from "@/types/prismaTypes";

export const DEFAULT_PROPERTY_FORM_VALUES: PropertyFormData = {
  name: "",
  description: "",
  stayType: "WholeUnit",
  pricePerMonth: 1000,
  securityDeposit: 500,
  isPetsAllowed: false,
  isParkingIncluded: false,
  photoUrls: [],
  existingPhotoUrls: [],
  amenities: [],
  bathType: "Private",
  genderPreference: ["NoPreference"],
  propertyType: PropertyTypeEnum.Apartment,
  beds: 1,
  baths: 1,
  squareFeet: 1000,
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateName: "",
  stateCode: "",
  countryName: "United States",
  countryCode: "US",
  postalCode: "",
  formattedAddress: "",
  latitude: Number.NaN,
  longitude: Number.NaN,
  mapboxFeatureId: "",
  addressConfirmed: false,
};

export function propertyToFormValues(property: Property): PropertyFormData {
  return {
    ...DEFAULT_PROPERTY_FORM_VALUES,
    name: property.name ?? "",
    description: property.description ?? "",
    pricePerMonth: property.pricePerMonth ?? 0,
    securityDeposit: property.securityDeposit ?? 0,
    isPetsAllowed: property.isPetsAllowed ?? false,
    isParkingIncluded: property.isParkingIncluded ?? false,
    photoUrls: [],
    existingPhotoUrls: property.photoUrls ?? [],
    amenities: property.amenities ?? [],
    propertyType:
      property.propertyType === PropertyTypeEnum.Townhouse
        ? PropertyTypeEnum.Townhouse
        : property.propertyType === PropertyTypeEnum.SingleFamilyHome
          ? PropertyTypeEnum.SingleFamilyHome
          : PropertyTypeEnum.Apartment,
    beds: property.beds ?? 0,
    baths: property.baths ?? 0,
    squareFeet: property.squareFeet ?? 0,
    addressLine1: property.location?.addressLine1 ?? property.location?.address ?? "",
    addressLine2: property.location?.addressLine2 ?? "",
    city: property.location?.city ?? "",
    stateName: property.location?.stateName ?? property.location?.state ?? "",
    stateCode: property.location?.stateCode ?? "",
    countryName: property.location?.countryName ?? property.location?.country ?? "United States",
    countryCode: property.location?.countryCode ?? "US",
    postalCode: property.location?.postalCode ?? "",
    formattedAddress: property.location?.formattedAddress ?? "",
    latitude: property.location?.coordinates.latitude ?? Number.NaN,
    longitude: property.location?.coordinates.longitude ?? Number.NaN,
    mapboxFeatureId: property.location?.mapboxFeatureId ?? "",
    addressConfirmed: Number.isFinite(property.location?.coordinates.latitude),
  };
}

export function buildPropertyFormData(values: PropertyFormData): FormData {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (key === "photoUrls") {
      (value as File[]).forEach((file) => formData.append("photos", file));
      return;
    }

    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

export async function filesToDataUrls(files: File[]): Promise<string[]> {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    )
  );
}

export function buildDemoProperty(
  values: PropertyFormData,
  options: {
    id: number;
    managerUserId: string;
    photoUrls: string[];
    existingProperty?: Property;
  }
): Property {
  const existing = options.existingProperty;

  return {
    id: options.id,
    name: values.name,
    description: values.description,
    pricePerMonth: Number(values.pricePerMonth),
    securityDeposit: Number(values.securityDeposit),
    applicationFee: existing?.applicationFee ?? 0,
    photoUrls: options.photoUrls,
    amenities: values.amenities,
    highlights: existing?.highlights ?? [],
    isPetsAllowed: values.isPetsAllowed,
    isParkingIncluded: values.isParkingIncluded,
    beds: Number(values.beds),
    baths: Number(values.baths),
    squareFeet: Number(values.squareFeet),
    propertyType: values.propertyType,
    postedDate: existing?.postedDate ?? new Date().toISOString(),
    averageRating: existing?.averageRating ?? 0,
    numberOfReviews: existing?.numberOfReviews ?? 0,
    locationId: existing?.locationId ?? options.id,
    managerUserId: options.managerUserId,
    location: {
      id: existing?.location?.id ?? options.id,
      address: values.addressLine1,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      city: values.city,
      state: values.stateName,
      stateName: values.stateName,
      stateCode: values.stateCode,
      country: values.countryName,
      countryName: values.countryName,
      countryCode: values.countryCode,
      postalCode: values.postalCode,
      formattedAddress: values.formattedAddress,
      mapboxFeatureId: values.mapboxFeatureId,
      coordinates: { longitude: values.longitude, latitude: values.latitude },
    },
    manager: existing?.manager,
  };
}

export const PROPERTY_AMENITY_OPTIONS = [
  { value: AmenityEnum.WasherDryer, label: "Washer / Dryer" },
  { value: AmenityEnum.Dishwasher, label: "Dishwasher" },
  { value: AmenityEnum.HighSpeedInternet, label: "High-Speed Internet" },
  { value: AmenityEnum.AirConditioning, label: "Air Conditioning" },
  { value: AmenityEnum.Parking, label: "Parking" },
  { value: AmenityEnum.Refrigerator, label: "Refrigerator" },
  { value: AmenityEnum.PetsAllowed, label: "Pets Allowed" },
  { value: AmenityEnum.SmokeFree, label: "Smoke Free" },
  { value: AmenityEnum.Pool, label: "Pool" },
  { value: AmenityEnum.Gym, label: "Gym" },
];
