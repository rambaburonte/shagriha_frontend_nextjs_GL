import * as z from "zod";
import { AmenityEnum, PropertyTypeEnum } from "@/lib/constants";

const browserFileSchema =
  typeof File === "undefined" ? z.any() : z.instanceof(File);

export const propertySchema = z
  .object({
    name: z.string().trim(),
    description: z.string().trim(),
    stayType: z.enum(["PayingGuest", "WholeUnit"]),
    pricePerMonth: z.coerce
      .number()
      .nonnegative("Monthly rent cannot be negative")
      .int("Monthly rent must be a whole number"),
    securityDeposit: z.coerce
      .number()
      .nonnegative("Security deposit cannot be negative")
      .int("Security deposit must be a whole number"),
    isPetsAllowed: z.boolean(),
    isParkingIncluded: z.boolean(),
    photoUrls: z.array(browserFileSchema).default([]),
    existingPhotoUrls: z.array(z.string()).default([]),
    amenities: z
      .array(z.nativeEnum(AmenityEnum))
      .min(1, "Select at least one amenity"),
    bathType: z.enum(["Private", "SharedBath"]),
    genderPreference: z
      .array(z.enum(["Male", "Female", "NoPreference"]))
      .length(1, "Select one gender preference"),
    beds: z.coerce
      .number()
      .nonnegative("Beds cannot be negative")
      .max(10)
      .int(),
    baths: z.coerce
      .number()
      .nonnegative("Baths cannot be negative")
      .max(10)
      .int(),
    squareFeet: z.coerce
      .number()
      .positive("Square feet must be greater than zero")
      .int(),
    propertyType: z.nativeEnum(PropertyTypeEnum),
    addressLine1: z.string().trim().min(1, "Property address is required"),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(1, "City is required"),
    stateName: z.string().trim().min(1, "State / Province is required"),
    stateCode: z.string().trim().optional(),
    countryName: z.string().trim().min(1, "Country is required"),
    countryCode: z.string().trim().length(2, "Select a valid country"),
    postalCode: z.string().trim().min(1, "Postal code is required"),
    formattedAddress: z.string().trim().optional(),
    latitude: z.number().finite("Select an address from the suggestions"),
    longitude: z.number().finite("Select an address from the suggestions"),
    mapboxFeatureId: z.string().trim().optional(),
    addressConfirmed: z.boolean(),
  })
  .superRefine((data, context) => {
    if (!data.addressConfirmed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["addressLine1"],
        message: "Please select an address from the suggestions.",
      });
    }
    if (data.photoUrls.length === 0 && data.existingPhotoUrls.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["photoUrls"],
        message: "At least one property photo is required",
      });
    }

    if (data.photoUrls.length + data.existingPhotoUrls.length > 5) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["photoUrls"],
        message: "You can upload a maximum of 5 property photos",
      });
    }

    data.photoUrls.forEach((file) => {
      if (
        typeof File !== "undefined" &&
        file instanceof File &&
        file.size > 10 * 1024 * 1024
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["photoUrls"],
          message: "Each property photo must be smaller than 10 MB",
        });
      }
    });
  });

export type PropertyFormData = z.infer<typeof propertySchema>;

export const applicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  message: z.string().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export const settingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

const isValidExpiryDate = (value: string) => {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  return year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1);
};

const paymentMethodFields = {
  cardholderName: z.string().trim().min(2, "Name on card is required"),
  cardNumber: z.string(),
  expiryDate: z
    .string()
    .trim()
    .refine(isValidExpiryDate, "Enter a valid future date in MM/YY format"),
  securityCode: z.string(),
  isDefault: z.boolean().default(true),
  billingAddress: z.string().trim().min(5, "Billing address is required"),
  country: z.string().trim().min(2, "Country is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  postalCode: z.string().trim().min(3, "Pincode is required").max(12),
};

export const addPaymentMethodSchema = z.object(paymentMethodFields).superRefine(
  (data, context) => {
    const cardNumber = data.cardNumber.replace(/\s/g, "");
    if (!/^\d{13,19}$/.test(cardNumber)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cardNumber"],
        message: "Enter a valid card number",
      });
    }
    if (!/^\d{3,4}$/.test(data.securityCode)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["securityCode"],
        message: "Enter a valid 3 or 4 digit secure code",
      });
    }
  }
);

export const editPaymentMethodSchema = z.object(paymentMethodFields).superRefine(
  (data, context) => {
    const cardNumber = data.cardNumber.replace(/\s/g, "");
    if (cardNumber && !/^\d{13,19}$/.test(cardNumber)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cardNumber"],
        message: "Enter a valid card number or leave it blank",
      });
    }
    if (data.securityCode && !/^\d{3,4}$/.test(data.securityCode)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["securityCode"],
        message: "Enter a valid 3 or 4 digit secure code",
      });
    }
  }
);

export type PaymentMethodFormData = z.infer<typeof addPaymentMethodSchema>;
